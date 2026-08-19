from fastapi import FastAPI, Depends, HTTPException, Query
import hashlib
import hmac
import pandas as pd
from pydantic import BaseModel
from xgboost import XGBClassifier
import numpy as np
from pathlib import Path
import secrets
import sqlite3
import os
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


app = FastAPI(
    title="AI Powered Organ Donation Matching Platform",
    version="2.0"
)

def _cors_origins() -> list[str]:
    """Return explicit browser origins, including optionally configured LAN hosts."""
    defaults = {
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8443",
        "http://127.0.0.1:8443",
        "http://192.168.137.220:8443",
        "http://10.113.155.14:8443",
    }
    
    configured = os.getenv("CORS_ALLOWED_ORIGINS", "")
    return sorted(defaults | {origin.strip() for origin in configured.split(",") if origin.strip()})


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
BASE_DIR = Path(__file__).resolve().parent
model = XGBClassifier()
model.load_model(BASE_DIR / "xgboost_model.json")

# JWT Authentication Configuration
# Set ORGAN_API_SECRET_KEY in every deployed environment. The development fallback
# keeps local setup usable, but must never be used to sign production sessions.
SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("ORGAN_API_SECRET_KEY", "dev-secret-key-please-change")
if os.getenv("ENVIRONMENT", "development").lower() in {"production", "prod"} and SECRET_KEY == "dev-secret-key-please-change":
    raise RuntimeError("JWT_SECRET_KEY must be set in production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
security = HTTPBearer(auto_error=False)

class AuthUser(BaseModel):
    email: str
    role: str

class DoctorCreateRequest(BaseModel):
    email: str
    password: str
    name: str
    hospital: str
    specialization: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    created_at: str
    is_active: bool
    name: Optional[str] = None
    hospital: Optional[str] = None
    specialization: Optional[str] = None

class MetadataOptionsResponse(BaseModel):
    hospitals: list[str]
    cities: list[str]
    blood_groups: list[str]
    organs_available: list[str]
    organs_needed: list[str]
    hla_types: list[str]
    donor_types: list[str]
    infection_statuses: list[str]
    organ_conditions: list[str]
    urgencies: list[str]
    doctor_verified: list[str]

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class LoginResponse(BaseModel):
    message: str
    email: str
    role: str
    access_token: str

class PasswordResetRequest(BaseModel):
    password: str

class DonorRegistrationRequest(BaseModel):
    donor_id: Optional[str] = None
    donor_type: str
    age: int
    gender: str
    blood_group: str
    organ_available: str
    hla_type: str
    infection_status: str
    organ_condition: str
    city: str
    hospital: str
    donation_date: Optional[str] = None

class RecipientRegistrationRequest(BaseModel):
    recipient_id: Optional[str] = None
    age: int
    gender: str
    blood_group: str
    organ_needed: str
    hla_type: str
    urgency: str
    waiting_days: int
    hospital: str
    city: str
    diagnosis: Optional[str] = ""

DATABASE_PATH = BASE_DIR / "auth_users.sqlite3"
PASSWORD_HASH_ITERATIONS = 260_000


def _connect_users_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PASSWORD_HASH_ITERATIONS,
    ).hex()
    return f"pbkdf2_sha256${PASSWORD_HASH_ITERATIONS}${salt}${password_hash}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_text, salt, expected_hash = stored_hash.split("$", 3)
        iterations = int(iterations_text)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    actual_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations,
    ).hex()
    return hmac.compare_digest(actual_hash, expected_hash)


def _create_users_table() -> None:
    with _connect_users_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('admin', 'doctor')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                is_active INTEGER NOT NULL DEFAULT 1
            )
            """
        )
        existing_columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
        for column in ("name", "hospital", "specialization"):
            if column not in existing_columns:
                conn.execute(f"ALTER TABLE users ADD COLUMN {column} TEXT")


def _get_user_by_email(email: str) -> Optional[sqlite3.Row]:
    with _connect_users_db() as conn:
        return conn.execute(
            "SELECT id, email, password_hash, role, created_at, is_active, name, hospital, specialization FROM users WHERE email = ?",
            (email,),
        ).fetchone()


def _create_user(email: str, password: str, role: str, name: Optional[str] = None, hospital: Optional[str] = None, specialization: Optional[str] = None) -> sqlite3.Row:
    try:
        with _connect_users_db() as conn:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, role, is_active, name, hospital, specialization) VALUES (?, ?, ?, 1, ?, ?, ?)",
                (email, _hash_password(password), role, name, hospital, specialization),
            )
            return conn.execute(
                "SELECT id, email, role, created_at, is_active, name, hospital, specialization FROM users WHERE id = ?",
                (cursor.lastrowid,),
            ).fetchone()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="User with this email already exists")


def _user_response(user: sqlite3.Row) -> dict:
    return {
        "id": user["id"], "email": user["email"], "role": user["role"],
        "created_at": user["created_at"], "is_active": bool(user["is_active"]),
        "name": user["name"], "hospital": user["hospital"], "specialization": user["specialization"],
    }


def _seed_default_users() -> None:
    default_users = [
        ("admin@example.com", "Admin@123", "admin", "Administrator", None, None),
        ("doctor@example.com", "Doctor@123", "doctor", "Existing Doctor", "Not available", "Not available"),
    ]
    for email, password, role, name, hospital, specialization in default_users:
        user = _get_user_by_email(email)
        if user is None:
            _create_user(email, password, role, name, hospital, specialization)
        elif not user["name"]:
            with _connect_users_db() as conn:
                conn.execute("UPDATE users SET name = ?, hospital = ?, specialization = ? WHERE email = ?", (name, hospital, specialization, email))


def initialize_user_database() -> None:
    _create_users_table()
    _seed_default_users()


initialize_user_database()


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> AuthUser:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        role: str = payload.get("role")
        if email is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = _get_user_by_email(email)
    if user is None or not user["is_active"] or user["role"] != role:
        raise credentials_exception
    return AuthUser(email=user["email"], role=user["role"])


def require_role(required_role: str):
    def role_checker(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if current_user.role != required_role:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return current_user
    return role_checker


def require_any_role(*allowed_roles: str):
    """Authorize a request for one of the predefined application roles."""
    def role_checker(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return current_user
    return role_checker


def _ensure_csv_has_columns(path: Path, required_columns: set[str]):
    if not path.exists():
        raise HTTPException(status_code=500, detail=f"Data file not found: {path.name}")
    try:
        df = pd.read_csv(path, dtype=str)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to read data file {path.name}: {e}")
    if not required_columns.issubset(set(df.columns)):
        raise HTTPException(status_code=500, detail=f"{path.name} is missing required columns")
    return df


def _append_record_to_csv(path: Path, record: dict, columns: list[str]):
    try:
        df = pd.read_csv(path, dtype=str)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Data file not found: {path.name}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to read data file {path.name}: {e}")

    missing_cols = [col for col in columns if col not in df.columns]
    if missing_cols:
        raise HTTPException(status_code=500, detail=f"{path.name} is missing required columns: {', '.join(missing_cols)}")

    record_row = {col: str(record.get(col, "")) for col in columns}
    df_to_append = pd.DataFrame([record_row], columns=columns)
    try:
        df = pd.concat([df, df_to_append], ignore_index=True)
        df.to_csv(path, index=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to append record to {path.name}: {e}")
    return record_row


def _ensure_id_is_unique(df: pd.DataFrame, column: str, record_id: str, file_name: str):
    if record_id in set(df[column].fillna("").astype(str)):
        raise HTTPException(status_code=409, detail=f"{file_name} already contains {column} {record_id}")


def _generate_donor_id() -> str:
    existing = set()
    donors_path = BASE_DIR / "donors.csv"
    if donors_path.exists():
        try:
            existing = set(pd.read_csv(donors_path, dtype=str)["donor_id"].fillna(""))
        except Exception:
            existing = set()
    while True:
        candidate = "D" + str(np.random.randint(100, 1000))
        if candidate not in existing:
            return candidate


def _generate_recipient_id() -> str:
    existing = set()
    recipients_path = BASE_DIR / "recipients.csv"
    if recipients_path.exists():
        try:
            existing = set(pd.read_csv(recipients_path, dtype=str)["recipient_id"].fillna(""))
        except Exception:
            existing = set()
    while True:
        candidate = "R" + str(np.random.randint(100, 1000))
        if candidate not in existing:
            return candidate


def _unique_values(df: pd.DataFrame, column: str) -> list[str]:
    if column not in df.columns:
        return []
    values = df[column].dropna().astype(str).map(str.strip)
    return sorted(value for value in values.unique() if value)


def _read_dataset(name: str, required_columns: set[str]) -> pd.DataFrame:
    """Load a project dataset from its canonical backend-relative path."""
    return _ensure_csv_has_columns(BASE_DIR / name, required_columns)


def _records_for_response(df: pd.DataFrame, columns: list[str]) -> list[dict]:
    """Return JSON-safe dataset rows without turning missing values into fake labels."""
    normalized = df.fillna("").astype(str)
    return [{column: row.get(column, "") for column in columns} for _, row in normalized.iterrows()]


@app.post("/auth/login", response_model=LoginResponse)
def login(data: LoginRequest):
    user = _get_user_by_email(data.email)
    if not user or not user["is_active"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user["role"] != data.role or not _verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"email": user["email"], "role": user["role"]})
    return {
        "message": "Login successful",
        "email": user["email"],
        "role": user["role"],
        "access_token": access_token,
    }


@app.get("/auth/me", response_model=UserResponse)
def get_authenticated_profile(current_user: AuthUser = Depends(get_current_user)):
    """Return the persisted profile for the JWT owner, never a client-supplied profile."""
    user = _get_user_by_email(current_user.email)
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return _user_response(user)


@app.post("/admin/doctors", response_model=UserResponse)
def create_doctor(data: DoctorCreateRequest, current_user: AuthUser = Depends(require_role("admin"))):
    email = data.email.strip().lower()
    if not email or "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        raise HTTPException(status_code=422, detail="A valid email is required")
    if not data.password or len(data.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    name, hospital, specialization = data.name.strip(), data.hospital.strip(), data.specialization.strip()
    if not name or not hospital or not specialization:
        raise HTTPException(status_code=422, detail="Doctor name, hospital, and specialization are required")
    user = _create_user(email=email, password=data.password, role="doctor", name=name, hospital=hospital, specialization=specialization)
    return _user_response(user)


@app.post("/admin/doctors/{doctor_id}/reset-password", status_code=204)
def reset_doctor_password(doctor_id: int, data: PasswordResetRequest, current_user: AuthUser = Depends(require_role("admin"))):
    if len(data.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    with _connect_users_db() as conn:
        doctor = conn.execute("SELECT id FROM users WHERE id = ? AND role = 'doctor'", (doctor_id,)).fetchone()
        if doctor is None:
            raise HTTPException(status_code=404, detail="Doctor not found")
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (_hash_password(data.password), doctor_id))


@app.get("/metadata/options", response_model=MetadataOptionsResponse)
def get_metadata_options(current_user: AuthUser = Depends(require_any_role("admin", "doctor"))):
    donors_df = _ensure_csv_has_columns(
        BASE_DIR / "donors.csv",
        {"hospital", "city", "blood_group", "organ_available", "hla_type", "donor_type", "infection_status", "organ_condition"},
    )
    recipients_df = _ensure_csv_has_columns(
        BASE_DIR / "recipients.csv",
        {"hospital", "city", "blood_group", "organ_needed", "hla_type", "urgency", "doctor_verified"},
    )

    return {
        "hospitals": sorted(set(_unique_values(donors_df, "hospital")) | set(_unique_values(recipients_df, "hospital"))),
        "cities": sorted(set(_unique_values(donors_df, "city")) | set(_unique_values(recipients_df, "city"))),
        "blood_groups": sorted(set(_unique_values(donors_df, "blood_group")) | set(_unique_values(recipients_df, "blood_group"))),
        "organs_available": _unique_values(donors_df, "organ_available"),
        "organs_needed": _unique_values(recipients_df, "organ_needed"),
        "hla_types": sorted(set(_unique_values(donors_df, "hla_type")) | set(_unique_values(recipients_df, "hla_type"))),
        "donor_types": _unique_values(donors_df, "donor_type"),
        "infection_statuses": _unique_values(donors_df, "infection_status"),
        "organ_conditions": _unique_values(donors_df, "organ_condition"),
        "urgencies": _unique_values(recipients_df, "urgency"),
        "doctor_verified": _unique_values(recipients_df, "doctor_verified"),
    }


@app.post("/register/donor")
def register_donor(data: DonorRegistrationRequest, current_user: AuthUser = Depends(require_role("admin"))):
    donors_path = BASE_DIR / "donors.csv"
    required_columns = [
        "donor_id",
        "donor_type",
        "age",
        "gender",
        "blood_group",
        "organ_available",
        "hla_type",
        "infection_status",
        "organ_condition",
        "city",
        "hospital",
        "donation_date",
    ]
    donors_df = _ensure_csv_has_columns(donors_path, set(required_columns))

    donor_id = data.donor_id or _generate_donor_id()
    _ensure_id_is_unique(donors_df, "donor_id", donor_id, "donors.csv")
    donation_date = data.donation_date or datetime.utcnow().strftime("%Y-%m-%d")

    record = {
        "donor_id": donor_id,
        "donor_type": data.donor_type,
        "age": str(data.age),
        "gender": data.gender,
        "blood_group": data.blood_group,
        "organ_available": data.organ_available,
        "hla_type": data.hla_type,
        "infection_status": data.infection_status,
        "organ_condition": data.organ_condition,
        "city": data.city,
        "hospital": data.hospital,
        "donation_date": donation_date,
    }

    saved_record = _append_record_to_csv(donors_path, record, required_columns)
    return {
        "message": "Donor registered successfully",
        "donor_id": donor_id,
        "record": saved_record,
    }


@app.post("/register/recipient")
def register_recipient(data: RecipientRegistrationRequest, current_user: AuthUser = Depends(require_role("admin"))):
    recipients_path = BASE_DIR / "recipients.csv"
    required_columns = [
        "recipient_id",
        "age",
        "gender",
        "blood_group",
        "organ_needed",
        "hla_type",
        "diagnosis",
        "urgency",
        "waiting_days",
        "hospital",
        "city",
        "doctor_verified",
    ]
    recipients_df = _ensure_csv_has_columns(recipients_path, set(required_columns))

    recipient_id = data.recipient_id or _generate_recipient_id()
    _ensure_id_is_unique(recipients_df, "recipient_id", recipient_id, "recipients.csv")

    record = {
        "recipient_id": recipient_id,
        "age": str(data.age),
        "gender": data.gender,
        "blood_group": data.blood_group,
        "organ_needed": data.organ_needed,
        "hla_type": data.hla_type,
        "diagnosis": data.diagnosis or "",
        "urgency": data.urgency,
        "waiting_days": str(data.waiting_days),
        "hospital": data.hospital,
        "city": data.city,
        "doctor_verified": "False",
    }

    saved_record = _append_record_to_csv(recipients_path, record, required_columns)
    return {
        "message": "Recipient registered successfully",
        "recipient_id": recipient_id,
        "record": saved_record,
    }


# Blood Compatibility Dictionary
blood_compatibility = {
    "O-": ["O-"],
    "O+": ["O+", "O-"],
    "A-": ["A-", "O-"],
    "A+": ["A+", "A-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "AB-": ["AB-", "A-", "B-", "O-"],
    "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"]
}

# Urgency Scores
urgency_score = {
    "Low": 2,
    "Medium": 5,
    "High": 8,
    "Critical": 10
}

# Organ Condition Scores
organ_condition_score = {
    "Average": 4,
    "Good": 7,
    "Excellent": 10
}


class MatchInput(BaseModel):
    donor_age: int
    recipient_age: int

    donor_blood_group: str
    recipient_blood_group: str

    organ_available: str
    organ_needed: str

    donor_hla: str
    recipient_hla: str

    donor_city: str
    recipient_city: str

    donor_hospital: str
    recipient_hospital: str

    donor_type: str

    doctor_verified: str

    urgency: str

    waiting_days: int

    organ_condition: str

    infection_status: str

@app.get("/data/overview")
def get_data_overview(current_user: AuthUser = Depends(require_any_role("admin", "doctor"))):
    """Dataset-derived dashboard metrics; prediction-history fields are intentionally absent."""
    donors_df = _read_dataset("donors.csv", {"donor_id", "organ_available"})
    recipients_df = _read_dataset("recipients.csv", {"recipient_id", "organ_needed", "urgency"})
    matches_df = _read_dataset("matches.csv", set())

    def organ_counts(df: pd.DataFrame, column: str) -> list[dict]:
        return [{"organ": organ, "count": int(count)} for organ, count in df[column].fillna("").astype(str).value_counts().sort_index().items() if organ]

    urgency_counts = [
        {"urgency": urgency, "count": int(count)}
        for urgency, count in recipients_df["urgency"].fillna("").astype(str).value_counts().sort_index().items()
        if urgency
    ]
    return {
        "total_donors": int(len(donors_df)),
        "total_recipients": int(len(recipients_df)),
        "total_matches": int(len(matches_df)),
        "donors_by_organ": organ_counts(donors_df, "organ_available"),
        "recipients_by_organ": organ_counts(recipients_df, "organ_needed"),
        "recipients_by_urgency": urgency_counts,
        "prediction_history_available": False,
    }


@app.get("/data/donors")
def list_donors(
    search: str = "",
    organ: str = "",
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    current_user: AuthUser = Depends(require_any_role("admin", "doctor")),
):
    df = _read_dataset("donors.csv", {"donor_id", "age", "gender", "blood_group", "organ_available", "hla_type", "infection_status", "organ_condition", "city", "hospital"})
    query = search.strip().lower()
    if query:
        searchable = df[["donor_id", "hospital", "city", "organ_available", "blood_group"]].fillna("").astype(str).apply(lambda column: column.str.lower().str.contains(query, regex=False))
        df = df[searchable.any(axis=1)]
    if organ.strip():
        df = df[df["organ_available"].fillna("").astype(str).str.lower() == organ.strip().lower()]
    total = int(len(df))
    columns = ["donor_id", "donor_type", "age", "gender", "blood_group", "organ_available", "hla_type", "infection_status", "organ_condition", "city", "hospital", "donation_date"]
    start = (page - 1) * page_size
    return {"items": _records_for_response(df.iloc[start:start + page_size], columns), "total": total, "page": page, "page_size": page_size}


@app.get("/data/recipients")
def list_recipients(
    search: str = "",
    organ: str = "",
    urgency: str = "",
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    current_user: AuthUser = Depends(require_any_role("admin", "doctor")),
):
    df = _read_dataset("recipients.csv", {"recipient_id", "age", "gender", "blood_group", "organ_needed", "hla_type", "urgency", "waiting_days", "hospital", "city"})
    query = search.strip().lower()
    if query:
        searchable = df[["recipient_id", "hospital", "city", "organ_needed", "blood_group", "diagnosis"]].fillna("").astype(str).apply(lambda column: column.str.lower().str.contains(query, regex=False))
        df = df[searchable.any(axis=1)]
    if organ.strip():
        df = df[df["organ_needed"].fillna("").astype(str).str.lower() == organ.strip().lower()]
    if urgency.strip():
        df = df[df["urgency"].fillna("").astype(str).str.lower() == urgency.strip().lower()]
    total = int(len(df))
    columns = ["recipient_id", "age", "gender", "blood_group", "organ_needed", "hla_type", "diagnosis", "urgency", "waiting_days", "hospital", "city", "doctor_verified"]
    start = (page - 1) * page_size
    return {"items": _records_for_response(df.iloc[start:start + page_size], columns), "total": total, "page": page, "page_size": page_size}


@app.get("/")
def home():
    return {
        "message": "AI Powered Organ Donation Matching API is Running Successfully"
    }

@app.post("/predict")
def predict(data: MatchInput, current_user: AuthUser = Depends(require_any_role("admin", "doctor"))):

    # Feature Engineering

    blood_match = 1 if data.donor_blood_group == data.recipient_blood_group else 0

    blood_compatible = 1 if data.donor_blood_group in blood_compatibility.get(data.recipient_blood_group, []) else 0

    organ_match = 1 if data.organ_available == data.organ_needed else 0

    hla_match = 1 if data.donor_hla == data.recipient_hla else 0

    same_city = 1 if data.donor_city == data.recipient_city else 0

    same_hospital = 1 if data.donor_hospital == data.recipient_hospital else 0

    donor_type = 1 if data.donor_type == "Living" else 0

    doctor_verified = 1 if data.doctor_verified == "Yes" else 0

    urgency = urgency_score[data.urgency]

    waiting_score = min(data.waiting_days / 1500 * 10, 10)

    organ_condition = organ_condition_score[data.organ_condition]

    infection_score = 0 if data.infection_status == "Yes" else 5

    age_difference = abs(data.donor_age - data.recipient_age)

    age_score = max(0, 10 - age_difference / 5)

    features = np.array([[
        blood_match,
        blood_compatible,
        organ_match,
        hla_match,
        same_city,
        same_hospital,
        donor_type,
        doctor_verified,
        urgency,
        waiting_score,
        organ_condition,
        infection_score,
        age_difference,
        age_score
    ]])

    prediction = model.predict(features)[0]
    prediction_text = (
        "Suitable Match"
        if prediction == 1
        else "Not Suitable Match"
    )

    return {
        "prediction": prediction_text,
        "model_prediction": int(prediction),

        "generated_features": {
            "blood_match": blood_match,
            "blood_compatible": blood_compatible,
            "organ_match": organ_match,
            "hla_match": hla_match,
            "same_city": same_city,
            "same_hospital": same_hospital,
            "donor_type": donor_type,
            "doctor_verified": doctor_verified,
            "urgency_score": urgency,
            "waiting_score": round(waiting_score, 2),
            "organ_condition_score": organ_condition,
            "infection_score": infection_score,
            "age_difference": age_difference,
            "age_score": round(age_score, 2)
        }
    }


# Request model for finding matches by recipient id
class RecipientLookup(BaseModel):
    recipient_id: str


# Request model for finding matches by donor id
class DonorLookup(BaseModel):
    donor_id: str


@app.post("/find-matching-recipients")
def find_matching_recipients(data: DonorLookup, current_user: AuthUser = Depends(require_any_role("admin", "doctor"))):
    """
    Find matching recipients for a given donor_id.
    """

    donor_id = data.donor_id

    # Load CSV files
    try:
        recipients_df = pd.read_csv(BASE_DIR / "recipients.csv", dtype=str)
        donors_df = pd.read_csv(BASE_DIR / "donors.csv", dtype=str)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Data file not found: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to read data files: {e}")

    required_recipient_cols = {"recipient_id", "age", "gender", "blood_group", "organ_needed", "hla_type", "urgency", "waiting_days", "hospital", "city", "doctor_verified", "diagnosis"}
    required_donor_cols = {"donor_id", "donor_type", "age", "gender", "blood_group", "organ_available", "hla_type", "infection_status", "organ_condition", "city", "hospital", "donation_date"}

    if not required_recipient_cols.issubset(set(recipients_df.columns)):
        raise HTTPException(status_code=500, detail="recipients.csv is missing required columns")
    if not required_donor_cols.issubset(set(donors_df.columns)):
        raise HTTPException(status_code=500, detail="donors.csv is missing required columns")

    donor_row = donors_df[donors_df["donor_id"] == donor_id]
    if donor_row.empty:
        raise HTTPException(status_code=404, detail=f"Donor with id {donor_id} not found")

    donor_rec = donor_row.iloc[0].to_dict()
    try:
        donor_info = {
            "donor_id": donor_rec.get("donor_id"),
            "donor_type": donor_rec.get("donor_type"),
            "age": int(donor_rec.get("age", 0)) if str(donor_rec.get("age", "")).isdigit() else donor_rec.get("age"),
            "gender": donor_rec.get("gender"),
            "blood_group": donor_rec.get("blood_group"),
            "organ_available": donor_rec.get("organ_available"),
            "hla_type": donor_rec.get("hla_type"),
            "infection_status": donor_rec.get("infection_status"),
            "organ_condition": donor_rec.get("organ_condition"),
            "city": donor_rec.get("city"),
            "hospital": donor_rec.get("hospital"),
            "donation_date": donor_rec.get("donation_date"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invalid donor data: {e}")

    recipients_df = recipients_df.fillna("")

    def donor_compatible(donor_bg: str, recipient_bg: str) -> bool:
        donor_bg = str(donor_bg).strip()
        recipient_bg = str(recipient_bg).strip()
        return donor_bg in blood_compatibility.get(recipient_bg, [])

    try:
        recipients_filtered = recipients_df[recipients_df["organ_needed"].str.strip().str.lower() == str(donor_info["organ_available"]).strip().lower()]
        recipients_filtered = recipients_filtered[recipients_filtered.apply(lambda r: donor_compatible(donor_info["blood_group"], r.get("blood_group")), axis=1)]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filtering recipients: {e}")

    matches = []
    try:
        for _, r in recipients_filtered.iterrows():
            recipient = r.to_dict()

            organ_match_pts = 30 if str(recipient.get("organ_needed", "")).strip().lower() == str(donor_info["organ_available"]).strip().lower() else 0
            blood_compat_pts = 25 if donor_compatible(donor_info["blood_group"], recipient.get("blood_group")) else 0
            hla_pts = 20 if str(recipient.get("hla_type", "")).strip() == str(donor_info.get("hla_type", "")).strip() else 0
            same_city_pts = 10 if str(recipient.get("city", "")).strip().lower() == str(donor_info.get("city", "")).strip().lower() else 0
            same_hospital_pts = 5 if str(recipient.get("hospital", "")).strip().lower() == str(donor_info.get("hospital", "")).strip().lower() else 0

            total_score = organ_match_pts + blood_compat_pts + hla_pts + same_city_pts + same_hospital_pts
            match_details = {
                "organ_match": organ_match_pts,
                "blood_compatibility": blood_compat_pts,
                "hla_match": hla_pts,
                "same_city": same_city_pts,
                "same_hospital": same_hospital_pts,
            }

            matches.append({
                "recipient_id": recipient.get("recipient_id"),
                "age": int(recipient.get("age", 0)) if str(recipient.get("age", "")).isdigit() else recipient.get("age"),
                "gender": recipient.get("gender"),
                "blood_group": recipient.get("blood_group"),
                "organ_needed": recipient.get("organ_needed"),
                "hla_type": recipient.get("hla_type"),
                "diagnosis": recipient.get("diagnosis"),
                "urgency": recipient.get("urgency"),
                "waiting_days": int(recipient.get("waiting_days", 0)) if str(recipient.get("waiting_days", "")).isdigit() else recipient.get("waiting_days"),
                "hospital": recipient.get("hospital"),
                "city": recipient.get("city"),
                "doctor_verified": recipient.get("doctor_verified"),
                "match_score": int(total_score),
                "match_details": match_details,
            })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scoring recipients: {e}")

    matches_sorted = sorted(matches, key=lambda x: x["match_score"], reverse=True)

    return {
        "donor": donor_info,
        "matching_recipients": matches_sorted,
        "total_matches": len(matches_sorted)
    }


@app.post("/find-matching-donors")
def find_matching_donors(payload: RecipientLookup, current_user: AuthUser = Depends(require_any_role("admin", "doctor"))):
    """
    Find matching donors for a given recipient_id.

    Steps:
    - Load recipients.csv and donors.csv using pandas.
    - Locate the recipient by recipient_id.
    - Filter donors by infection_status == 'No', organ_available matching recipient.organ_needed,
      and blood compatibility using the existing blood_compatibility dictionary.
    - Score each compatible donor according to the specified weights and return the top 10.

    Errors are handled gracefully with appropriate HTTP status codes.
    """

    recipient_id = payload.recipient_id

    # Load CSV files
    try:
        recipients_df = pd.read_csv(BASE_DIR / "recipients.csv", dtype=str)
        donors_df = pd.read_csv(BASE_DIR / "donors.csv", dtype=str)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Data file not found: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to read data files: {e}")

    # Ensure required columns exist
    required_recipient_cols = {"recipient_id", "age", "gender", "blood_group", "organ_needed", "hla_type", "urgency", "waiting_days", "hospital", "city"}
    required_donor_cols = {"donor_id", "donor_type", "age", "gender", "blood_group", "organ_available", "hla_type", "infection_status", "organ_condition", "city", "hospital", "donation_date"}

    if not required_recipient_cols.issubset(set(recipients_df.columns)):
        raise HTTPException(status_code=500, detail="recipients.csv is missing required columns")
    if not required_donor_cols.issubset(set(donors_df.columns)):
        raise HTTPException(status_code=500, detail="donors.csv is missing required columns")

    # Find recipient
    recipient_row = recipients_df[recipients_df["recipient_id"] == recipient_id]
    if recipient_row.empty:
        raise HTTPException(status_code=404, detail=f"Recipient with id {recipient_id} not found")

    # Use the first matching recipient (ids expected to be unique)
    recipient_rec = recipient_row.iloc[0].to_dict()

    # Normalize recipient fields
    try:
        recipient_info = {
            "recipient_id": recipient_rec.get("recipient_id"),
            "age": int(recipient_rec.get("age", 0)),
            "gender": recipient_rec.get("gender"),
            "blood_group": recipient_rec.get("blood_group"),
            "organ_needed": recipient_rec.get("organ_needed"),
            "hla_type": recipient_rec.get("hla_type"),
            "urgency": recipient_rec.get("urgency"),
            "waiting_days": int(recipient_rec.get("waiting_days", 0)),
            "hospital": recipient_rec.get("hospital"),
            "city": recipient_rec.get("city"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invalid recipient data: {e}")

    def donor_compatible(donor_bg: str, recipient_bg: str) -> bool:
        donor_bg = str(donor_bg).strip()
        recipient_bg = str(recipient_bg).strip()
        return donor_bg in blood_compatibility.get(recipient_bg, [])

    # Prepare donors: filter by infection_status == 'No', organ match, and blood compatibility
    try:
        # Normalize donor fields for comparison
        donors_df = donors_df.fillna("")

        # Filter infection_status == 'No'
        donors_filtered = donors_df[donors_df["infection_status"].str.strip().str.lower() == "no"]

        # Filter organ_available equals recipient organ_needed
        donors_filtered = donors_filtered[donors_filtered["organ_available"].str.strip().str.lower() == str(recipient_info["organ_needed"]).strip().lower()]

        # Filter blood compatibility using the recipient-to-acceptable-donor mapping.
        donors_filtered = donors_filtered[donors_filtered.apply(lambda r: donor_compatible(r.get("blood_group"), recipient_info["blood_group"]), axis=1)]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error filtering donors: {e}")

    # Scoring donors
    matches = []
    try:
        for _, d in donors_filtered.iterrows():
            donor = d.to_dict()

            # Calculate component scores
            organ_match_pts = 30 if str(donor.get("organ_available", "")).strip().lower() == str(recipient_info["organ_needed"]).strip().lower() else 0

            donor_bg = donor.get("blood_group", "")
            blood_compat_pts = 25 if donor_compatible(donor_bg, recipient_info["blood_group"]) else 0

            hla_pts = 20 if str(donor.get("hla_type", "")).strip() == str(recipient_info.get("hla_type", "")).strip() else 0

            same_city_pts = 10 if str(donor.get("city", "")).strip().lower() == str(recipient_info.get("city", "")).strip().lower() else 0

            same_hospital_pts = 5 if str(donor.get("hospital", "")).strip().lower() == str(recipient_info.get("hospital", "")).strip().lower() else 0

            oc = str(donor.get("organ_condition", "")).strip()
            organ_condition_pts = organ_condition_score.get(oc if oc in organ_condition_score else oc.capitalize(), organ_condition_score.get(oc.capitalize(), 0))

            total = organ_match_pts + blood_compat_pts + hla_pts + same_city_pts + same_hospital_pts + organ_condition_pts

            match_details = {
                "organ_match": organ_match_pts,
                "blood_compatibility": blood_compat_pts,
                "hla_match": hla_pts,
                "same_city": same_city_pts,
                "same_hospital": same_hospital_pts,
                "organ_condition": organ_condition_pts
            }

            matches.append({
                "donor_id": donor.get("donor_id"),
                "donor_type": donor.get("donor_type"),
                "age": int(donor.get("age")) if str(donor.get("age")).isdigit() else donor.get("age"),
                "gender": donor.get("gender"),
                "blood_group": donor.get("blood_group"),
                "organ_available": donor.get("organ_available"),
                "hla_type": donor.get("hla_type"),
                "infection_status": donor.get("infection_status"),
                "organ_condition": donor.get("organ_condition"),
                "city": donor.get("city"),
                "hospital": donor.get("hospital"),
                "donation_date": donor.get("donation_date"),
                "match_score": int(total),
                "match_details": match_details
            })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scoring donors: {e}")

    # Sort by match_score descending and take top 10
    matches_sorted = sorted(matches, key=lambda x: x["match_score"], reverse=True)
    top_matches = matches_sorted[:10]

    return {
        "recipient": recipient_info,
        "matching_donors": top_matches,
        "total_matches": len(matches_sorted)
    }

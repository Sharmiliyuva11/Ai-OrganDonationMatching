from fastapi import FastAPI, Depends, HTTPException
import pandas as pd
from pydantic import BaseModel
from xgboost import XGBClassifier
import numpy as np
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Dict, Optional
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


app = FastAPI(
    title="AI Powered Organ Donation Matching Platform",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8443",
        "http://127.0.0.1:8443",
        "http://10.10.238.67:8443",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model
BASE_DIR = Path(__file__).resolve().parent
model = XGBClassifier()
model.load_model(BASE_DIR / "xgboost_model.json")

# JWT Authentication Configuration
SECRET_KEY = "dev-secret-key-please-change"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
security = HTTPBearer(auto_error=False)

class AuthUser(BaseModel):
    email: str
    password: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class LoginResponse(BaseModel):
    message: str
    email: str
    role: str
    access_token: str

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

users: Dict[str, AuthUser] = {
    "admin@example.com": AuthUser(email="admin@example.com", password="Admin@123", role="admin"),
    "doctor@example.com": AuthUser(email="doctor@example.com", password="Doctor@123", role="doctor"),
}


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
    user = users.get(email)
    if user is None or user.role != role:
        raise credentials_exception
    return AuthUser(email=user.email, password="", role=user.role)


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


@app.post("/auth/login", response_model=LoginResponse)
def login(data: LoginRequest):
    user = users.get(data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if user.password != data.password or user.role != data.role:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"email": user.email, "role": user.role})
    return {
        "message": "Login successful",
        "email": user.email,
        "role": user.role,
        "access_token": access_token,
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

@app.get("/")
def home():
    return {
        "message": "AI Powered Organ Donation Matching API is Running Successfully"
    }

@app.post("/predict")
def predict(data: MatchInput, current_user: AuthUser = Depends(require_any_role("admin", "doctor"))):

    # Feature Engineering

    blood_match = 1 if data.donor_blood_group == data.recipient_blood_group else 0

    blood_compatible = 1 if (
        data.recipient_blood_group in blood_compatibility[data.donor_blood_group]
    ) else 0

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
        if donor_bg not in blood_compatibility:
            return False
        return recipient_bg in blood_compatibility[donor_bg]

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

    # Prepare donors: filter by infection_status == 'No', organ match, and blood compatibility
    try:
        # Normalize donor fields for comparison
        donors_df = donors_df.fillna("")

        # Filter infection_status == 'No'
        donors_filtered = donors_df[donors_df["infection_status"].str.strip().str.lower() == "no"]

        # Filter organ_available equals recipient organ_needed
        donors_filtered = donors_filtered[donors_filtered["organ_available"].str.strip().str.lower() == str(recipient_info["organ_needed"]).strip().lower()]

        # Filter blood compatibility using existing blood_compatibility dict
        def donor_compatible(donor_bg: str, recipient_bg: str) -> bool:
            donor_bg = str(donor_bg).strip()
            recipient_bg = str(recipient_bg).strip()
            if donor_bg not in blood_compatibility:
                return False
            return recipient_bg in blood_compatibility[donor_bg]

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

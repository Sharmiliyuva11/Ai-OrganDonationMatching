from fastapi import FastAPI
from pydantic import BaseModel
from xgboost import XGBClassifier
import numpy as np

app = FastAPI(
    title="AI Powered Organ Donation Matching Platform",
    version="2.0"
)

# Load trained model
model = XGBClassifier()
model.load_model("xgboost_model.json")

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
def predict(data: MatchInput):

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
import joblib

print("Loading model...")

model = joblib.load("xgboost_model.pkl")

print("Model loaded successfully!")
print(type(model))
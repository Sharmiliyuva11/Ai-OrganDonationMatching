import os
import joblib
import mlflow
import mlflow.sklearn
import pandas as pd
import mlflow.xgboost

from xgboost import XGBClassifier

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

mlflow.set_experiment("Organ Donation Matching")

# Load dataset
data = pd.read_csv("../backend/matches.csv")

print("Dataset Loaded Successfully!")
print(data.head())

# -----------------------------
# Prepare Features and Target
# -----------------------------

X = data.drop(columns=["donor_id", "recipient_id", "match"])
y = data["match"]

print("\nFeatures Shape :", X.shape)
print("Target Shape   :", y.shape)

print("\nFeature Columns:")
print(X.columns.tolist())

# -----------------------------
# Split Dataset
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\nDataset Split Successfully!")

print(f"Training Samples : {X_train.shape[0]}")
print(f"Testing Samples  : {X_test.shape[0]}")

# -----------------------------
# Train XGBoost Model
# -----------------------------

model = XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric="logloss"
)

print("\nTraining XGBoost Model...")

model.fit(X_train, y_train)

print("Model Trained Successfully!")

# -----------------------------
# Make Predictions
# -----------------------------

y_pred = model.predict(X_test)

print("\nPredictions Generated Successfully!")

# -----------------------------
# Evaluate Model
# -----------------------------

# -----------------------------
# MLflow Experiment Tracking
# -----------------------------

with mlflow.start_run():

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    # Log Hyperparameters
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 6)
    mlflow.log_param("learning_rate", 0.1)

    # Log Metrics
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("precision", precision)
    mlflow.log_metric("recall", recall)
    mlflow.log_metric("f1_score", f1)

    # Log Model
    mlflow.xgboost.log_model(model, name="xgboost_model")

    print("\n========== MODEL PERFORMANCE ==========")
    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")

    print("\nExperiment Logged Successfully in MLflow!")
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error
import joblib
import os
from datetime import datetime

def load_and_preprocess_data(csv_path):
    """Load and preprocess data from CSV file"""
    # Load data
    df = pd.read_csv(csv_path)
    
    # Convert date columns to datetime
    date_columns = ['last_service_date', 'next_service_date']  # Adjust based on your CSV
    for col in date_columns:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col])
    
    # Calculate days until next service
    if 'next_service_date' in df.columns and 'last_service_date' in df.columns:
        df['days_until_next_service'] = (df['next_service_date'] - df['last_service_date']).dt.days
    elif 'next_service_mileage' in df.columns and 'mileage' in df.columns:
        # Fallback: estimate days based on average daily mileage
        avg_daily_mileage = 50  # Adjust based on your data
        df['days_until_next_service'] = (df['next_service_mileage'] - df['mileage']) / avg_daily_mileage
    
    # Ensure we have positive values
    df = df[df['days_until_next_service'] > 0]
    
    return df

def train_model_from_csv(csv_path):
    """Train model using data from CSV file"""
    # Load and preprocess data
    print(f"Loading data from {csv_path}...")
    df = load_and_preprocess_data(csv_path)
    
    # Check required columns
    required_columns = ['make', 'year', 'mileage', 'last_service_mileage', 'service_type', 'days_until_next_service']
    missing_cols = [col for col in required_columns if col not in df.columns]
    
    if missing_cols:
        raise ValueError(f"CSV file is missing required columns: {missing_cols}")
    
    # Features and target
    X = df[['make', 'year', 'mileage', 'last_service_mileage', 'service_type']]
    y = df['days_until_next_service']
    
    # Preprocessing for categorical data
    categorical_features = ['make', 'service_type']
    numerical_features = ['year', 'mileage', 'last_service_mileage']
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    # Create pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            min_samples_leaf=5,  # Prevent overfitting
            max_depth=10
        ))
    ])
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training model...")
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"Model trained. Mean Absolute Error: {mae:.2f} days")
    
    # Analyze predictions
    results = pd.DataFrame({
        'Actual': y_test,
        'Predicted': y_pred,
        'Difference': y_pred - y_test
    })
    print("\nPrediction Analysis:")
    print(results.describe())
    
    # Save model
    model_path = 'service_date_model.pkl'
    joblib.dump(model, model_path)
    print(f"\nModel saved as {model_path}")
    
    return model

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', type=str, required=True, help='Path to CSV file containing service data')
    args = parser.parse_args()
    
    if not os.path.exists(args.csv):
        raise FileNotFoundError(f"CSV file not found: {args.csv}")
    
    train_model_from_csv(args.csv)
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import pickle

# Load the dataset
data = pd.read_csv('vehicle_service_data.csv')

# Define features (X) and target (y)
X = data[['mileage', 'last_service_mileage', 'make', 'model', 'year', 'fuelType', 'vehicleType', 'color']]
y = data['next_service_mileage']

# Define feature types
categorical_features = ['make', 'model', 'fuelType', 'vehicleType', 'color']
numerical_features = ['mileage', 'last_service_mileage', 'year']

# Create preprocessor
preprocessor = ColumnTransformer(
    transformers=[
        ('num', 'passthrough', numerical_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])

# Create and train the pipeline
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
])

# Train the model
model.fit(X, y)

# Save the model and preprocessor separately
with open('next_service_model.pkl', 'wb') as f:
    pickle.dump(model, f, protocol=4)  # Use protocol 4 for better compatibility
import sys
import pandas as pd
import pickle
import numpy as np

try:
    # Load the model
    model_path = sys.argv[1]
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    # Get the input values
    mileage = float(sys.argv[2])
    last_service_mileage = float(sys.argv[3])
    make = sys.argv[4]
    model_name = sys.argv[5]
    year = int(sys.argv[6])
    fuelType = sys.argv[7]
    vehicleType = sys.argv[8]
    color = sys.argv[9]
    
    # Create a DataFrame with the input data
    input_data = pd.DataFrame([{
        'mileage': mileage,
        'last_service_mileage': last_service_mileage,
        'make': make,
        'model': model_name,
        'year': year,
        'fuelType': fuelType,
        'vehicleType': vehicleType,
        'color': color
    }])
    
    # Predict the next service mileage
    prediction = model.predict(input_data)
    
    # Output the prediction
    print(int(prediction[0]))
    
except Exception as e:
    # Fallback prediction that accounts for vehicle type
    print(f"Error: {str(e)}, using intelligent fallback...", file=sys.stderr)
    
    # Intelligent fallback based on vehicle type and fuel type
    service_interval = 5000  # Default
    
    # Adjust based on vehicle type
    if vehicleType.lower() == 'truck':
        service_interval = 7500
    elif vehicleType.lower() == 'suv':
        service_interval = 6000
    elif vehicleType.lower() == 'sedan':
        service_interval = 5000
    elif vehicleType.lower() == 'hatchback':
        service_interval = 4500
    
    # Adjust based on fuel type
    if fuelType.lower() == 'diesel':
        service_interval += 1500
    elif fuelType.lower() == 'electric':
        service_interval += 2500
    elif fuelType.lower() == 'hybrid':
        service_interval += 1000
    
    # Year adjustment (newer cars have longer intervals)
    year_factor = max(0.8, min(1.2, (year - 2015) / 10 + 1))
    service_interval *= year_factor
    
    # Calculate next service based on current mileage and smart interval
    next_service = mileage + service_interval
    
    # Output the fallback prediction
    print(int(next_service))
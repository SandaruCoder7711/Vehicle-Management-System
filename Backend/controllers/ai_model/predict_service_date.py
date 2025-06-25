import sys
import joblib
import pandas as pd
from datetime import datetime, timedelta

def predict_service_date(model_path, current_mileage, last_service_mileage, service_type, make, year):
    try:
        model = joblib.load(model_path)
        
        input_data = pd.DataFrame({
            'make': [make],
            'year': [int(year)],
            'mileage': [int(current_mileage)],
            'last_service_mileage': [int(last_service_mileage)],
            'service_type': [service_type]
        })
        
        # Add engineered features
        input_data['miles_since_last'] = input_data['mileage'] - input_data['last_service_mileage']
        input_data['vehicle_age'] = datetime.now().year - input_data['year']
        
        # Get prediction
        days = model.predict(input_data)[0]
        
        # Return ONLY the number of days (no date conversion)
        print(f"{days}")  # Critical change - just print the number
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        print("180")  # Fallback: 6 months

if __name__ == "__main__":
    if len(sys.argv) != 7:
        print("Usage: python predict_service_date.py <model_path> <current_mileage> <last_service_mileage> <service_type> <make> <year>")
        sys.exit(1)
    
    # Get arguments
    model_path = sys.argv[1]
    current_mileage = sys.argv[2]
    last_service_mileage = sys.argv[3]
    service_type = sys.argv[4]
    make = sys.argv[5]
    year = sys.argv[6]
    
    predicted_date = predict_service_date(
        model_path, current_mileage, last_service_mileage, 
        service_type, make, year
    )
    
    print(predicted_date)
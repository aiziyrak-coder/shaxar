# Test configuration
print("Testing configuration...")

# Import required modules
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if required environment variables are set
print("Checking environment variables...")
api_id = os.getenv('TELEGRAM_API_ID')
api_hash = os.getenv('TELEGRAM_API_HASH')
phone = os.getenv('TELEGRAM_PHONE')
gemini_key = os.getenv('GEMINI_API_KEY')

print(f"TELEGRAM_API_ID: {'SET' if api_id else 'NOT SET'}")
print(f"TELEGRAM_API_HASH: {'SET' if api_hash else 'NOT SET'}")
print(f"TELEGRAM_PHONE: {'SET' if phone else 'NOT SET'}")
print(f"GEMINI_API_KEY: {'SET' if gemini_key and gemini_key != 'your_actual_gemini_api_key_here' else 'NOT SET'}")

# Check if RESULTS_GROUP is properly configured
from telegram_monitor import RESULTS_GROUP
print(f"RESULTS_GROUP: {RESULTS_GROUP}")

print("Configuration test completed.")
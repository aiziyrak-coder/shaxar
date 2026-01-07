import os
import asyncio
from dotenv import load_dotenv
from telethon import TelegramClient

# Load environment variables
load_dotenv()

# Telegram API credentials
API_ID = int(os.getenv('TELEGRAM_API_ID', '0'))
API_HASH = os.getenv('TELEGRAM_API_HASH', '')
PHONE = os.getenv('TELEGRAM_PHONE', '')

print(f"API_ID: {API_ID}")
print(f"API_HASH: {API_HASH}")
print(f"PHONE: {PHONE}")

# Create Telegram client
client = TelegramClient('test_session', API_ID, API_HASH)

async def main():
    await client.start(phone=PHONE)
    print("Client started successfully!")
    await client.disconnect()

# Run the async function
asyncio.run(main())
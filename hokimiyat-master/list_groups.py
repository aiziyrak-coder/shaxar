import asyncio
from telethon import TelegramClient
from dotenv import load_dotenv
import os

async def main():
    # Load environment variables
    load_dotenv()
    
    # Initialize the client
    client = TelegramClient('test_session', 
                          int(os.getenv('TELEGRAM_API_ID')), 
                          os.getenv('TELEGRAM_API_HASH'))
    
    # Start the client
    await client.start(phone=os.getenv('TELEGRAM_PHONE'))
    print("Successfully logged in as:", (await client.get_me()).username)
    
    # Get all dialogs
    dialogs = await client.get_dialogs()
    
    print("\nAvailable groups/channels:")
    for i, dialog in enumerate(dialogs):
        if dialog.is_group or dialog.is_channel:
            name = getattr(dialog.entity, 'title', 'No Title')
            print(f"{i+1}. {name} (ID: {dialog.id})")
    
    # Close the client
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())

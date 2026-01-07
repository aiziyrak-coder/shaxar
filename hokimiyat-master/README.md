# Telegram Group Monitoring and AI Analysis System

This system monitors Telegram groups and performs AI analysis on group messages. When a user sends "@get_info" in any group, the system generates and sends a detailed analysis report.

## Features

- Monitors all Telegram groups the account is a member of
- Collects and stores recent messages from each group
- Performs AI analysis on group conversations
- Generates detailed reports on:
  - Group sentiment
  - Main discussion topics
  - Complaints and issues
  - Social dynamics
  - Recommendations for administrators
- Responds to "@get_info" command with analysis report

## Setup

1. Install required packages:
   ```
   pip install -r requirements.txt
   ```

2. Update the `.env` file with your Telegram API credentials:
   ```
   TELEGRAM_API_ID=your_api_id
   TELEGRAM_API_HASH=your_api_hash
   TELEGRAM_PHONE=your_phone_number
   ```

## Usage

Run the monitoring system:
```
python telegram_monitor.py
```

In any Telegram group where the account is a member, send "@get_info" to receive an analysis report.

## How It Works

1. The system connects to Telegram using the Telethon library
2. It listens for new messages in all groups
3. Messages are stored in memory (last 100 messages per group)
4. When "@get_info" is detected, the system analyzes recent messages
5. An AI-powered analysis report is generated and sent back to the group

## Customization

You can customize the analysis by modifying the `analyze_group_messages()` function in `telegram_monitor.py`.
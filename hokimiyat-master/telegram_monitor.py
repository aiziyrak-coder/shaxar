import os
import asyncio
import logging
from dotenv import load_dotenv
from telethon import TelegramClient, events
from collections import defaultdict, deque
from datetime import datetime, timedelta
import re
import json
from group_analyzer import analyzer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("telegram_monitor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Telegram API credentials
API_ID = int(os.getenv('TELEGRAM_API_ID', '0'))  # Default to 0 if not found
API_HASH = os.getenv('TELEGRAM_API_HASH', '')    # Default to empty string if not found
PHONE = os.getenv('TELEGRAM_PHONE', '')          # Default to empty string if not found

# Results group name (where all analysis will be sent)
RESULTS_GROUP = "MFY Info Fergana Sh"  # Change this to your actual results group name

# Create Telegram client
client = TelegramClient('session_name', API_ID, API_HASH)

# Store messages for each group (last 200 messages for better analysis)
group_messages = defaultdict(lambda: deque(maxlen=200))
group_stats = defaultdict(lambda: {
    'total_messages': 0,
    'today_messages': 0,
    'active_users': set(),
    'last_updated': None
})

# Track overall statistics
overall_stats = {
    'total_groups': 0,
    'total_messages': 0,
    'today_messages': 0,
    'active_groups_today': 0
}

async def get_group_invite_link(chat):
    """Generate an invite link for the group"""
    try:
        from telethon.tl.functions.messages import ExportChatInviteRequest
        # Try to get existing invite links first
        invites = await client.get_admin_log(chat, limit=1)
        if invites and hasattr(invites[0], 'invite'):
            return invites[0].invite.link
            
        # If no existing invite, create a new one
        invite = await client(ExportChatInviteRequest(chat))
        return invite.link
    except Exception as e:
        logger.warning(f"Could not get invite link for chat {chat.id}: {str(e)}")
        return f"https://t.me/c/{str(chat.id).replace('-100', '')}"  # Fallback to t.me link

async def handler(event):
    """
    Handle new messages in groups - Continuous monitoring
    """
    try:
        # Get chat information
        chat = await event.get_chat()
        sender = await event.get_sender()
        
        # Only process group messages
        if hasattr(chat, 'title'):
            group_name = chat.title
            sender_name = sender.first_name if sender.first_name else sender.username if sender.username else "Unknown"
            
            # Update overall stats
            overall_stats['total_groups'] = len(group_messages)
            overall_stats['total_messages'] += 1
            
            # Check if message is from today
            message_date = datetime.now().date()
            if group_stats[group_name]['last_updated'] is None or \
               group_stats[group_name]['last_updated'].date() != message_date:
                group_stats[group_name]['today_messages'] = 0
                group_stats[group_name]['last_updated'] = datetime.now()
            
            # Update group stats
            group_stats[group_name]['total_messages'] += 1
            group_stats[group_name]['today_messages'] += 1
            group_stats[group_name]['active_users'].add(sender_name)
            group_stats[group_name]['last_updated'] = datetime.now()
            
            # Get or create group invite link
            group_link = await get_group_invite_link(chat)
            
            # Store message with comprehensive information
            message_data = {
                'text': event.text,
                'sender': sender_name,
                'sender_id': sender.id if hasattr(sender, 'id') else None,
                'group_name': group_name,
                'group_id': chat.id if hasattr(chat, 'id') else None,
                'group_link': group_link,
                'timestamp': datetime.now().isoformat(),
                'id': event.id,
                'is_forwarded': event.forward is not None,
                'reply_to_msg_id': event.reply_to_msg_id if hasattr(event, 'reply_to_msg_id') else None
            }
            
            group_messages[group_name].append(message_data)
            
            logger.info(f"New message in '{group_name}' from '{sender_name}': {event.text[:50]}...")
            
            # Check if someone is requesting analysis
            if event.text and '@get_info' in event.text.lower():
                try:
                    # Generate comprehensive government-level report
                    gov_report = await generate_government_report()
                    
                    if not gov_report:
                        gov_report = "Hech qanday ma'lumot topilmadi. Iltimos, bir muncha vaqt kuting va qayta urinib ko'ring."
                    
                    # Send the report to the results group
                    # Split long messages into chunks
                    if len(gov_report) > 4000:
                        chunks = [gov_report[i:i+4000] for i in range(0, len(gov_report), 4000)]
                        for chunk in chunks:
                            await send_to_results_group(chunk)
                    else:
                        await send_to_results_group(gov_report)
                    logger.info("Sent government report to results group")
                except Exception as e:
                    error_msg = f"Xatolik yuz berdi: {str(e)}"
                    logger.error(f"Error generating/sending report: {str(e)}")
                    await send_to_results_group(error_msg)
                
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")

def analyze_group_messages(group_name, messages):
    """
    Analyze messages in a group and generate a detailed report with issue tracking.
    """
    # Try to use AI analysis first
    ai_analysis = analyzer.analyze_with_ai(group_name, messages)
    
    # Combine recent messages for analysis
    all_text = " ".join([msg['text'] for msg in messages if msg['text']])
    
    # Use the fallback analyzer
    sentiment_score = analyzer.analyze_sentiment(all_text)
    topics = analyzer.extract_topics(all_text)
    complaints = analyzer.detect_complaints(messages)
    activity = analyzer.analyze_group_activity(messages)
    
    # Generate detailed recommendations
    recommendations = analyzer.generate_detailed_recommendations(topics, complaints, activity)
    
    # Process complaints to include detailed information
    detailed_complaints = []
    for complaint in complaints:
        detailed_complaint = {
            'text': complaint.get('text', ''),
            'sender': complaint.get('sender', 'Noma\'lum'),
            'sender_id': complaint.get('sender_id'),
            'timestamp': complaint.get('timestamp', ''),
            'group_name': complaint.get('group_name', group_name),
            'group_link': complaint.get('group_link', 'Havola mavjud emas'),
            'message_id': complaint.get('id'),
            'is_forwarded': complaint.get('is_forwarded', False),
            'category': complaint.get('category', 'Boshqa'),
            'priority': complaint.get('priority', 2),  # Default to medium priority
            'status': 'Yangi',
            'matched_terms': complaint.get('matched_terms', [])
        }
        detailed_complaints.append(detailed_complaint)
    
    # Generate report
    report = {
        "group_name": group_name,
        "analysis_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_messages": len(messages),
        "unique_senders": len(set(msg.get('sender_id', '') for msg in messages if 'sender_id' in msg)),
        "sentiment_score": sentiment_score,
        "topics": topics,
        "total_complaints": len(complaints),
        "complaints": detailed_complaints,
        "activity": activity,
        "recommendations": recommendations,
        "ai_analysis_available": bool(ai_analysis)
    }
    
    # If AI analysis is available, include it in the report
    if ai_analysis:
        report['ai_analysis'] = ai_analysis
    
    return report

def format_complaint_details(complaints):
    """Format detailed complaint information"""
    if not complaints:
        return "❌ Hech qanday shikoyat topilmadi.\n"
    
    complaint_text = "🚨 TOPSHIRIQLAR VA SHIKOYATLAR:\n"
    
    # Sort by priority
    sorted_complaints = sorted(complaints, key=lambda x: x.get('priority', 0), reverse=True)
    
    # Group by category
    by_category = {}
    for complaint in sorted_complaints:
        category = complaint.get('category', 'Boshqa')
        if category not in by_category:
            by_category[category] = []
        by_category[category].append(complaint)
    
    # Display top complaints by category
    for category, items in by_category.items():
        complaint_text += f"\n📝 {category.upper()} BO'YICHA MUAMMOLAR ({len(items)} ta):\n"
        for i, complaint in enumerate(items[:3], 1):  # Show top 3 per category
            priority_symbols = "🔴" * complaint.get('priority', 1)  # Visual priority indicator
            complaint_text += (
                f"{priority_symbols} {complaint.get('text', '')[:150]}...\n"
                f"   👤 {complaint.get('sender', 'Noma\'lum')} • "
                f"⏰ {complaint.get('timestamp', '')[:16]}\n"
                f"   🔗 Guruh: {complaint.get('group_name', 'Noma\'lum')}\n\n"
            )
    
    return complaint_text

async def generate_government_report():
    """
    Generate a comprehensive government-level report with all required information
    """
    try:
        if not group_messages:
            return "📊 HOZIRCHA GURUHLARDAN MA'LUMOT TO'PLAMADI\n\n" \
                   "🔄 Iltimos, bir muncha vaqt kuting va qayta urinib ko'ring."
        
        # Header
        report = "🏛️ DAVLAT HOLOATI MONITORING MARKAZI\n"
        report += "=====================================\n"
        report += f"📅 Hisobot sanasi: {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n"
        
        # Overall Statistics
        report += "📈 UMUMIY STATISTIKA:\n"
        report += f"🏢 Monitoring qilinayotgan MFY guruhlari: {len(group_messages)} ta\n"
        report += f"💬 Bugun qabul qilingan xabarlar: {sum(stats['today_messages'] for stats in group_stats.values())} ta\n"
        report += f"📊 Jami to'plangan xabarlar: {sum(stats['total_messages'] for stats in group_stats.values())} ta\n"
        report += f"👥 Bugun faol bo'lgan foydalanuvchilar: {sum(len(stats['active_users']) for stats in group_stats.values())} ta\n\n"
        
        # Top 3 Most Active Groups
        report += "🏆 ENG FAOL 3 TA MFY GURUHI:\n"
        sorted_groups = sorted(
            [(name, stats) for name, stats in group_stats.items()], 
            key=lambda x: x[1]['today_messages'], 
            reverse=True
        )[:3]
        
        for i, (group_name, stats) in enumerate(sorted_groups, 1):
            report += (
                f"{i}. 🏘️ {group_name}\n"
                f"   💬 Bugun: {stats['today_messages']} xabar\n"
                f"   👥 Faol foydalanuvchilar: {len(stats['active_users'])} ta\n\n"
            )
        
        # Sentiment Analysis
        report += "📊 MAHALLA KAYFIYATI ANALIZI:\n"
        positive_groups = 0
        negative_groups = 0
        neutral_groups = 0
        
        for group_name, messages in group_messages.items():
            if messages:
                all_text = " ".join([msg['text'] for msg in messages if msg['text']])
                sentiment = analyzer.analyze_sentiment(all_text)
                if sentiment > 0.2:
                    positive_groups += 1
                elif sentiment < -0.2:
                    negative_groups += 1
                else:
                    neutral_groups += 1
        
        report += f"😊 Ijobiy kayfiyat: {positive_groups} ta MFY\n"
        report += f"😞 Salbiy kayfiyat: {negative_groups} ta MFY\n"
        report += f"😐 Neytral kayfiyat: {neutral_groups} ta MFY\n\n"
        
        # Critical Issues Section
        report += "⚠️ DOLZARB MUAMMOLAR:\n"
        all_complaints = []
        
        for group_name, messages in group_messages.items():
            if messages:
                complaints = analyzer.detect_complaints(list(messages))
                for complaint in complaints:
                    complaint['group_name'] = group_name
                    all_complaints.append(complaint)
        
        # Sort complaints by recency and priority
        sorted_complaints = sorted(
            all_complaints, 
            key=lambda x: (datetime.fromisoformat(x.get('timestamp', datetime.now().isoformat())), 
                          analyzer.analyze_sentiment(x.get('text', '')))
        )
        
        # Show top critical issues
        if sorted_complaints:
            for i, complaint in enumerate(sorted_complaints[:10], 1):  # Top 10 issues
                # Determine priority visually
                text = complaint.get('text', '')
                priority_level = 1
                if any(word in text.lower() for word in ['zudlik', 'zarur', 'shoshilinch', 'xavfli']):
                    priority_level = 3
                elif any(word in text.lower() for word in ['muhim', 'tezda', 'hal qilish']):
                    priority_level = 2
                
                priority_symbols = "🔴" * priority_level
                report += (
                    f"{priority_symbols} {text[:100]}...\n"
                    f"   📍 MFY: {complaint.get('group_name', 'Noma\'lum')}\n"
                    f"   👤 Muallif: {complaint.get('sender', 'Noma\'lum')}\n"
                    f"   ⏰ Vaqt: {complaint.get('timestamp', '')[:16]}\n\n"
                )
        else:
            report += "✅ Dolzarb muammo topilmadi.\n\n"
        
        # Aggressive Behavior Detection
        report += "💢 AGRESSIV XULOSALAR:\n"
        aggressive_keywords = ['jinni', 'xun', 'o\'ldir', 'ur', 'tajovuz', 'hujum', 'tirnamay', 'soqov', 'g\'azab']
        aggressive_messages = []
        
        for group_name, messages in group_messages.items():
            for msg in messages:
                text = msg.get('text', '').lower()
                if any(keyword in text for keyword in aggressive_keywords):
                    aggressive_messages.append({
                        'text': msg.get('text', ''),
                        'sender': msg.get('sender', 'Noma\'lum'),
                        'group_name': group_name,
                        'timestamp': msg.get('timestamp', '')
                    })
        
        if aggressive_messages:
            report += f"🚨 Aniqlangan agressiv xulosalar: {len(aggressive_messages)} ta\n"
            for i, msg in enumerate(aggressive_messages[:5], 1):  # Top 5 aggressive messages
                report += (
                    f"{i}. \"{msg.get('text', '')[:80]}...\"\n"
                    f"   📍 MFY: {msg.get('group_name', 'Noma\'lum')}\n"
                    f"   👤 Muallif: {msg.get('sender', 'Noma\'lum')}\n"
                    f"   ⏰ Vaqt: {msg.get('timestamp', '')[:16]}\n\n"
                )
        else:
            report += "✅ Agressiv xulosalar aniqlanmadi.\n\n"
        
        # Recommendations Section
        report += "📋 TAVSIYALAR:\n"
        report += "1. Yuqorida ko'rsatilgan dolzarb muammolarni tezda hal etish\n"
        report += "2. Agressiv xulosalar aniqlangan MFY guruhlariga e'tiborni qaratish\n"
        report += "3. Ijobiy kayfiyatdagi MFY guruhlaridagi tajribalarni boshqalarga tarqatish\n"
        report += "4. Kunlik monitoringni davom ettirish\n"
        
        report += "\n" + "="*50 + "\n"
        report += "📊 BU HISOBOT SUN'IY INTELLEKT TOMONIDAN TAYYORLANDI\n"
        report += "🔄 Hisobot yangilanish chastotasi: Real vaqt\n"
        
        return report
        
    except Exception as e:
        logger.error(f"Error in generate_government_report: {str(e)}")
        return f"Hisobot yaratishda xatolik yuz berdi: {str(e)}"

async def send_to_results_group(message):
    """
    Send a message to the results group
    """
    # First try to find the group by username
    try:
        entity = await client.get_entity(RESULTS_GROUP)
        await client.send_message(entity=entity, message=message)
        return
    except Exception as e:
        logger.warning(f"Could not find group by username, trying by title: {str(e)}")
    
    # If that fails, try to find by title in dialogs
    try:
        dialogs = await client.get_dialogs()
        for dialog in dialogs:
            if hasattr(dialog.entity, 'title') and dialog.entity.title == RESULTS_GROUP:
                await client.send_message(dialog.entity, message)
                return
        
        # If still not found, try to send to the first available group
        for dialog in dialogs:
            if hasattr(dialog.entity, 'title'):
                await client.send_message(dialog.entity, f"[Test] Sending to {dialog.entity.title}:\n{message}")
                logger.info(f"Sent test message to {dialog.entity.title}")
                break
                
    except Exception as e:
        logger.error(f"Error sending message to any group: {str(e)}")
        # Print to console as last resort
        print("\n" + "="*50)
        print("COULD NOT SEND TO TELEGRAM GROUP. MESSAGE CONTENT:")
        print("="*50)
        print(message)
        print("="*50 + "\n")

# Register event handler
client.add_event_handler(handler, events.NewMessage())

async def main():
    """
    Main function to start the Telegram client
    """
    # Start the client
    await client.start(phone=PHONE)
    logger.info("Telegram client started")
    
    # Print instructions
    print("🏛️ DAVLAT HOLOATI MONITORING MARKAZI")
    print("="*40)
    print("✅ Telegram monitoring started!")
    print("📱 To get comprehensive government report, send '@get_info' in any group.")
    print(f"📊 Reports will be sent to the '{RESULTS_GROUP}' group.")
    print("⏱️  System continuously monitors all MFY groups in real-time.")
    print("🛑 Press Ctrl+C to stop.")
    
    # Run the client until disconnected
    await client.run_until_disconnected()

if __name__ == "__main__":
    try:
        # Use asyncio.run for Python 3.7+
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Monitoring stopped by user")
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
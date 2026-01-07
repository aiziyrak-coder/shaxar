import os
from dotenv import load_dotenv
from group_analyzer import analyzer

# Load environment variables
load_dotenv()

# Test the enhanced analyzer with more detailed messages
test_messages = [
    {'sender': 'User1', 'text': 'Shahar transporti juda yomon, taksi kutish vaqti uzun. Ko\'plab fuqarolar shikoyat qilmoqda.', 'timestamp': '2023-01-01T10:00:00'},
    {'sender': 'User2', 'text': 'Maktabdagi o\'qituvchilar juda yaxshi, bolalar quvonchli. Bu yerda ajoyib hamkorlik mavjud.', 'timestamp': '2023-01-01T11:00:00'},
    {'sender': 'User3', 'text': 'Suv yetishmasligi haqida shikoyat bor. Bu muammoni hal qilish zarur.', 'timestamp': '2023-01-01T12:00:00'},
    {'sender': 'User4', 'text': 'Mahallamizdagi xavfsizlik yaxshi. Politsiya doim tayyor.', 'timestamp': '2023-01-01T13:00:00'},
    {'sender': 'User5', 'text': 'Atrof-muhit ifloslanmoqda. Chiqindilarni olib yurish kerak.', 'timestamp': '2023-01-01T14:00:00'},
]

# Test the new detailed recommendations function
all_text = " ".join([msg['text'] for msg in test_messages])
topics = analyzer.extract_topics(all_text)
complaints = analyzer.detect_complaints(test_messages)
activity = analyzer.analyze_group_activity(test_messages)

print("=== TESTING ENHANCED ANALYSIS ===")
print(f"Topics detected: {topics}")
print(f"Complaints found: {len(complaints)}")
print(f"Activity analysis: {activity}")

# Test the new detailed recommendations
recommendations = analyzer.generate_detailed_recommendations(topics, complaints, activity)
print("\n=== DETAILED RECOMMENDATIONS ===")
for i, rec in enumerate(recommendations, 1):
    print(f"{i}. {rec}")

print("\n=== FORMATTED REPORT TEST ===")
# Test the report formatting
report = {
    "group_name": "Toshkent Community",
    "analysis_time": "2023-01-01 15:00:00",
    "total_messages": len(test_messages),
    "sentiment_score": 0.2,
    "topics": topics,
    "complaints": len(complaints),
    "activity": activity,
    "recommendations": recommendations
}

# Import format_report from telegram_monitor
import sys
sys.path.append('.')
from telegram_monitor import format_report

formatted_report = format_report(report)
print(formatted_report)
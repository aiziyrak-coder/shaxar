import os
from dotenv import load_dotenv
from group_analyzer import analyzer
from datetime import datetime

# Load environment variables
load_dotenv()

# Test the enhanced analyzer with sample MFY group data
print("🏛️ DAVLAT HOLOATI MONITORING MARKAZI - TEST")
print("="*50)

# Simulate sample MFY group messages
sample_messages = [
    {'sender': 'User1', 'text': 'Shahar transporti juda yomon, taksi kutish vaqti uzun. Ko\'plab fuqarolar shikoyat qilmoqda. Zudlik bilan hal etish zarur!', 'timestamp': datetime.now().isoformat()},
    {'sender': 'User2', 'text': 'Maktabdagi o\'qituvchilar juda yaxshi, bolalar quvonchli. Bu yerda ajoyib hamkorlik mavjud.', 'timestamp': datetime.now().isoformat()},
    {'sender': 'User3', 'text': 'Suv yetishmasligi haqida shikoyat bor. Bu muammoni hal qilish zarur. Shoshilinch!', 'timestamp': datetime.now().isoformat()},
    {'sender': 'User4', 'text': 'Mahallamizdagi xavfsizlik yaxshi. Politsiya doim tayyor.', 'timestamp': datetime.now().isoformat()},
    {'sender': 'User5', 'text': 'Atrof-muhit ifloslanmoqda. Chiqindilarni olib yurish kerak. Juda xavfli!', 'timestamp': datetime.now().isoformat()},
]

print("📊 SAMPLE DATA ANALYSIS:")
print(f"   📨 Total messages: {len(sample_messages)}")
print(f"   👥 Unique senders: {len(set(msg['sender'] for msg in sample_messages))}")

# Test complaint detection
print(f"\n🚨 COMPLAINT DETECTION TEST:")
complaints = analyzer.detect_complaints(sample_messages)
print(f"   📋 Complaints detected: {len(complaints)}")
for i, complaint in enumerate(complaints, 1):
    print(f"      {i}. {complaint['sender']}: {complaint['text'][:50]}...")

# Test sentiment analysis
print(f"\n😊 SENTIMENT ANALYSIS TEST:")
all_text = " ".join([msg['text'] for msg in sample_messages])
sentiment = analyzer.analyze_sentiment(all_text)
sentiment_desc = "Positive" if sentiment > 0.2 else "Negative" if sentiment < -0.2 else "Neutral"
print(f"   📊 Overall sentiment: {sentiment_desc} (score: {sentiment:.2f})")

# Test topic extraction
print(f"\n🏷️ TOPIC EXTRACTION TEST:")
topics = analyzer.extract_topics(all_text)
print(f"   📚 Topics found:")
for topic, count in topics.items():
    if count > 0:
        print(f"      - {topic}: {count} mentions")

# Test aggressive behavior detection
print(f"\n💢 AGGRESSIVE BEHAVIOR DETECTION TEST:")
aggressive_keywords = ['jinni', 'xun', 'o\'ldir', 'ur', 'tajovuz', 'hujum', 'tirnamay', 'soqov', 'g\'azab']
aggressive_found = False
for msg in sample_messages:
    text = msg.get('text', '').lower()
    if any(keyword in text for keyword in aggressive_keywords):
        print(f"   🚨 Aggressive content: {msg['text'][:50]}...")
        aggressive_found = True

if not aggressive_found:
    print("   ✅ No aggressive content detected")

print(f"\n{'='*50}")
print("✅ Enhanced monitoring system test completed successfully!")
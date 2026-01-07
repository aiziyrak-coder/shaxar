import os
from dotenv import load_dotenv
from group_analyzer import analyzer

# Load environment variables
load_dotenv()

# Test if Gemini API key is loaded
api_key = os.getenv('GEMINI_API_KEY')
print(f"GEMINI_API_KEY loaded: {api_key is not None and api_key != 'your_actual_gemini_api_key_here'}")

# Test the analyzer
test_messages = [
    {'sender': 'User1', 'text': 'Shahar transporti juda yomon, taksi kutish vaqti uzun', 'timestamp': '2023-01-01T10:00:00'},
    {'sender': 'User2', 'text': 'Maktabdagi o\'qituvchilar juda yaxshi, bolalar quvonchli', 'timestamp': '2023-01-01T11:00:00'},
    {'sender': 'User3', 'text': 'Suv yetishmasligi haqida shikoyat bor', 'timestamp': '2023-01-01T12:00:00'},
]

result = analyzer.analyze_with_ai("Test Guruh", test_messages)
print("AI Analysis Result:")
print(result if result else "AI analysis not available, using fallback method")

# Test fallback method
if not result:
    print("\nTesting fallback method:")
    all_text = " ".join([msg['text'] for msg in test_messages])
    sentiment = analyzer.analyze_sentiment(all_text)
    topics = analyzer.extract_topics(all_text)
    complaints = analyzer.detect_complaints(test_messages)
    
    print(f"Sentiment: {sentiment}")
    print(f"Topics: {topics}")
    print(f"Complaints found: {len(complaints)}")
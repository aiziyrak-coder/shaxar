import os
from collections import defaultdict
import datetime
import google.generativeai as genai

class GroupAnalyzer:
    """
    Advanced group analyzer that uses Google's Gemini AI for analysis
    """
    
    def __init__(self):
        # Configure Gemini AI
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            print("Warning: GEMINI_API_KEY not found. Using fallback analysis.")
        
        # Topic keywords for different categories (fallback method)
        self.topic_keywords = {
            'transport': ['taxi', 'transport', 'автобус', 'маршрутка', 'такси', 'транспорт', 'bus', 'car', 'vehicle', 'taksi', 'marshrutka', 'avtobus', 'poyezd', 'samolyot', 'avtotransport'],
            'utilities': ['water', 'electricity', 'gas', 'свет', 'вода', 'газ', 'электричество', 'utility', 'kommunal', 'svet', 'voda', 'gaz', 'elektr', 'issiq suv', 'sovuq suv', 'kanalizatsiya'],
            'education': ['school', 'maktab', 'училище', 'мактаб', 'education', 'ta\'lim', 'o\'qish', 'universitet', 'kollej', 'litsey', 'akademiyа', 'dars', 'o\'qituvchi', 'talaba'],
            'health': ['doctor', 'hospital', 'doktor', 'больница', 'дармон', 'health', 'salomat', 'dori', 'shifokor', 'klinika', 'davolash', 'tibbiyot', 'dori-darmon'],
            'finance': ['money', 'pul', 'денги', 'bank', 'kredit', 'loan', 'finance', 'valyuta', 'kurs', 'investitsiya', 'byudjet', 'solik', 'moliya'],
            'security': ['police', 'militsiya', 'полиция', 'security', 'xavfsizlik', 'havf', 'qo\'riq', 'himoya', 'uy xavfsizligi', 'kriminal', 'xavfsizlik kuchi'],
            'environment': ['nature', 'park', 'tree', 'atmosphere', 'tabiat', 'park', 'daraxt', 'havo', 'ekologiya', 'chuqur', 'iflos', 'tazarrurat', 'recycling', 'atmosfera'],
            'infrastructure': ['yo\'l', 'ko\'cha', 'tamirlash', 'qurilish', 'infratuzilma', 'infrastructure', 'road', 'street', 'repair', 'construction'],
            'social': ['yordam', 'help', 'qo\'llab-quvvatlash', 'support', 'nopul', 'pul', 'pul yordami', 'social', 'ijtimoiy', 'muhtoj', 'yetim', 'nogiron']
        }
        
        # Sentiment words (fallback method)
        self.positive_words = ['good', 'great', 'yaxshi', 'zo\'r', 'отлично', 'хорошо', 'happy', 'joy', 'quvonch', 'yengillik', 'mamnuniyat', 'qoniqish', 'muvaffaqiyat', 'yutuq', 'tabriklayman', 'mukammal']
        self.negative_words = ['bad', 'terrible', 'yomon', 'ужасно', 'плохо', 'sad', 'grief', 'hafa', 'g\'am', 'problem', 'muammo', 'shikoyat', 'norozilik', 'xato', 'kamchilik', 'nosoz', 'halokat']
        
        # Enhanced complaint indicators with more specific keywords
        self.complaint_keywords = [
            'shikoyat', 'жалоба', 'шикоят', 'muammo', 'проблема', 'issue', 'problem',
            'yomon', 'yomonlashgan', 'buzilgan', 'ishlamayapti', 'ishlamayapti', 'yaxshi emas',
            'qoniqarsiz', 'qoniqarmiz', 'noroziman', 'norozilik', 'shikoyat qilmoq',
            'yordam bering', 'yordam kerak', 'muammo bor', 'muammo yuz berdi',
            'xatolik', 'xato', 'kamchilik', 'kamchilik bor', 'yaxshilash kerak',
            'tuzatish kerak', 'tuzatish bajarilsin', 'e\'tibor bering', 'diqqat',
            'ogohlantirish', 'ogohlantiring', 'qayta ishlash kerak', 'qayta ko\'rib chiqish',
            'ta\'mirlash kerak', 'ta\'mirlashni so\'rayman', 'ta\'mirlash zarur', 'ta\'mirlanmagan',
            'qurilish kerak', 'qurilishni so\'rayman', 'qurilish zarur', 'qurilish ishlari olib borilmagan'
        ]
        
        # Track issues and their details
        self.issues = []
        self.issue_categories = set()
    
    def analyze_with_ai(self, group_name, messages):
        """
        Use Gemini AI to analyze group messages with focus on issues and complaints
        """
        if not self.model:
            return self.generate_fallback_report(group_name, messages)
            
        try:
            # Prepare the messages for AI analysis with more context
            message_texts = []
            for msg in messages[-100:]:  # Last 100 messages for better context
                timestamp = datetime.datetime.fromisoformat(msg['timestamp']).strftime('%Y-%m-%d %H:%M')
                message_texts.append(f"[{timestamp}] {msg['sender']}: {msg['text']}")
            
            conversation = "\n".join(message_texts)
            
            # Create the prompt for AI analysis
            prompt = f"""
            Quyidagi Telegram guruhidagi muammolar va shikoyatlar haqida batafsil hisobot tayyorlang. 
            Guruh nomi: {group_name}
            
            Suhbat:
            {conversation}
            
            Iltimos, quyidagi formatda aniq va tushunarli javob bering:
            
            🔍 MUAMMOLAR VA SHIKOYATLAR HISOBOTI
            📅 Sana: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}
            
            📌 UMUMIY MA'LUMOT:
            - Jami xabarlar soni: {len(messages)}
            - Faol foydalanuvchilar soni: {len(set(msg['sender'] for msg in messages))}
            
            🚨 ANIQLANGAN MUAMMOLAR:
            
            [Har bir muammo uchun alohida bo'lim ochib, quyidagi ma'lumotlarni kiriting]
            
            🔹 MUAMMO #1:
            - Muammo mazmuni: [Qisqacha tavsifi]
            - Muammo turi: [Transport, Kommunal, Ta'lim, Tibbiyot, Xavfsizlik, Atrof-muhit, Infratuzilma, Ijtimoiy]
            - Muallif: [Ismi]
            - Vaqt: [Sana va vaxt]
            - Batafsil: [To'liq matn]
            - Muhimlik darajasi: [Yuqori/O'rtacha/Past]
            - Holati: [Yangi/Ko'rib chiqilmoqda/Hal qilindi]
            
            📊 STATISTIKA:
            - Jami muammolar soni: [soni]
            - Muammolar bo'yicha taqsimot:
              * Transport: X ta
              * Kommunal: X ta
              * Ta'lim: X ta
              * Tibbiyot: X ta
              * Xavfsizlik: X ta
              * Atrof-muhit: X ta
              * Infratuzilma: X ta
              * Ijtimoiy: X ta
            
            🔝 ENG MUHIM 5 TA MUAMMO:
            1. [Muammo tavsifi] - [Muallif] - [Vaqt]
            2. [Muammo tavsifi] - [Muallif] - [Vaqt]
            3. [Muammo tavsifi] - [Muallif] - [Vaqt]
            4. [Muammo tavsifi] - [Muallif] - [Vaqt]
            5. [Muammo tavsifi] - [Muallif] - [Vaqt]
            
            📋 TAVSIYALAR:
            - [Tavsiya 1]
            - [Tavsiya 2]
            - [Tavsiya 3]
            
            Iltimos, har bir muammoni alohida va tushunarli qilib yozing. Muallif va vaxtni aniq ko'rsating.
            """
            
            # Generate response using Gemini
            response = self.model.generate_content(prompt)
            
            # Process and store the issues
            self.process_issues_from_ai(response.text, messages)
            
            return response.text.strip()
            
        except Exception as e:
            print(f"AI analysis failed: {str(e)}")
            return self.generate_fallback_report(group_name, messages)
    
    def process_issues_from_ai(self, ai_response, messages):
        """
        Process AI response to extract and store issues
        """
        try:
            # Clear previous issues
            self.issues = []
            
            # Split the response into sections
            sections = ai_response.split('🔹 MUAMMO #')
            
            for section in sections[1:]:  # Skip the first section (header)
                issue = {
                    'id': len(self.issues) + 1,
                    'type': self.extract_field(section, 'Muammo turi'),
                    'description': self.extract_field(section, 'Muammo mazmuni'),
                    'author': self.extract_field(section, 'Muallif'),
                    'timestamp': self.extract_field(section, 'Vaqt'),
                    'details': self.extract_field(section, 'Batafsil'),
                    'priority': self.extract_field(section, 'Muhimlik darajasi'),
                    'status': 'Yangi',
                    'source': 'AI Analysis'
                }
                
                # Try to find the original message
                for msg in messages:
                    if (issue['author'] in msg.get('sender', '') and 
                        issue['details'] and issue['details'] in msg.get('text', '')):
                        issue['message_id'] = msg.get('id')
                        issue['chat_id'] = msg.get('chat_id')
                        break
                
                self.issues.append(issue)
                if issue['type']:
                    self.issue_categories.add(issue['type'])
                    
        except Exception as e:
            print(f"Error processing AI issues: {str(e)}")
    
    def extract_field(self, text, field_name):
        """Extract field value from formatted text"""
        try:
            start = text.find(f"{field_name}:") + len(field_name) + 1
            end = text.find('\n-', start)
            if end == -1:
                end = len(text)
            return text[start:end].strip()
        except:
            return ""
    
    def generate_fallback_report(self, group_name, messages):
        """Generate a fallback report when AI is not available"""
        # This is a simplified version of the report
        issues = self.detect_issues(messages)
        
        report = f"🔍 MUAMMOLAR HISOBOTI (FALLBACK)\n"
        report += f"📅 Sana: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}\n"
        report += f"📌 Guruh: {group_name}\n\n"
        
        if issues:
            report += f"🚨 ANIQLANGAN MUAMMOLAR ({len(issues)} ta):\n\n"
            
            # Group issues by category
            by_category = {}
            for issue in issues:
                cat = issue.get('category', 'Boshqa')
                if cat not in by_category:
                    by_category[cat] = []
                by_category[cat].append(issue)
            
            # Add issues by category
            for category, items in by_category.items():
                report += f"📌 {category.upper()} ({len(items)} ta):\n"
                for i, issue in enumerate(items, 1):
                    report += (f"{i}. {issue['text'][:100]}..."
                              f"\n   👤 {issue.get('sender', 'Noma\'lum')} • "
                              f"{issue.get('timestamp', '')}\n\n")
            
            # Add statistics
            report += "\n📊 UMUMIY STATISTIKA:\n"
            for category, items in by_category.items():
                report += f"- {category}: {len(items)} ta ({len(items)/len(issues)*100:.1f}%)\n"
            
            # Add top issues
            report += "\n🔝 ENG MUHIM MUAMMOLAR:\n"
            top_issues = sorted(issues, key=lambda x: x.get('priority', 0), reverse=True)[:5]
            for i, issue in enumerate(top_issues, 1):
                report += (f"{i}. {issue.get('category', 'Boshqa')}: {issue['text'][:80]}..."
                          f"\n   👤 {issue.get('sender', 'Noma\'lum')} • "
                          f"{issue.get('timestamp', '')}\n")
        else:
            report += "✅ Hech qanday muammo topilmadi.\n"
        
        return report
    
    def detect_issues(self, messages):
        """Detect issues from messages with more detailed analysis"""
        issues = []
        
        for msg in messages:
            text = msg.get('text', '').lower()
            if not text:
                continue
                
            # Check for complaint keywords
            complaint_terms = [term for term in self.complaint_keywords if term in text]
            
            if complaint_terms:
                # Determine category based on keywords
                category = 'Boshqa'
                for cat, keywords in self.topic_keywords.items():
                    if any(keyword in text for keyword in keywords):
                        category = cat
                        break
                
                # Determine priority
                priority_terms = ['zudlik', 'zarur', 'hal qilish', 'tezda', 'shoshilinch', 'xavfli']
                priority = 2  # Medium by default
                if any(term in text for term in priority_terms):
                    priority = 3  # High
                elif 'iltimos' in text or 'iltoimos' in text:
                    priority = 1  # Low
                
                # Create issue
                issue = {
                    'id': len(issues) + 1,
                    'text': msg.get('text', ''),
                    'sender': msg.get('sender', 'Noma\'lum'),
                    'timestamp': msg.get('timestamp', ''),
                    'message_id': msg.get('id'),
                    'chat_id': msg.get('chat_id'),
                    'category': category,
                    'priority': priority,
                    'status': 'Yangi',
                    'source': 'Keyword Analysis',
                    'matched_terms': complaint_terms
                }
                
                issues.append(issue)
                
                # Update categories set
                self.issue_categories.add(category)
        
        return issues
    
    def analyze_sentiment(self, text):
        """
        Analyze sentiment of text (fallback method)
        Returns a score between -1 (very negative) and 1 (very positive)
        """
        text_lower = text.lower()
        positive_count = sum(1 for word in self.positive_words if word in text_lower)
        negative_count = sum(1 for word in self.negative_words if word in text_lower)
        
        total_sentiment_words = positive_count + negative_count
        if total_sentiment_words > 0:
            return (positive_count - negative_count) / total_sentiment_words
        else:
            return 0  # Neutral sentiment
    
    def detect_complaints(self, messages):
        """
        Detect complaints in messages (fallback method)
        """
        complaints = []
        for msg in messages:
            text_lower = msg['text'].lower()
            if any(keyword in text_lower for keyword in self.complaint_keywords):
                complaints.append(msg)
        return complaints
    
    def extract_topics(self, text):
        """
        Extract topics from text (fallback method)
        """
        topics = {}
        text_lower = text.lower()
        
        for topic, keywords in self.topic_keywords.items():
            count = sum(1 for keyword in keywords if keyword in text_lower)
            topics[topic] = count
            
        return topics
    
    def analyze_group_activity(self, messages):
        """
        Analyze group activity patterns with more details
        """
        # Activity by hour of day
        hourly_activity = defaultdict(int)
        
        # Active participants
        participants = defaultdict(int)
        
        # Message lengths for engagement analysis
        message_lengths = []
        
        for msg in messages:
            # Parse timestamp (assuming ISO format)
            try:
                timestamp = datetime.datetime.fromisoformat(msg['timestamp'])
                hourly_activity[timestamp.hour] += 1
                participants[msg['sender']] += 1
                message_lengths.append(len(msg['text']))
            except ValueError:
                # Handle case where timestamp is not in ISO format
                pass
        
        # Find most active hour
        most_active_hour = max(hourly_activity.items(), key=lambda x: x[1])[0] if hourly_activity else 0
        
        # Find top participants
        top_participants = sorted(participants.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Calculate average message length
        avg_message_length = sum(message_lengths) / len(message_lengths) if message_lengths else 0
        
        return {
            'most_active_hour': most_active_hour,
            'top_participants': top_participants,
            'total_participants': len(participants),
            'avg_message_length': avg_message_length
        }
    
    def generate_detailed_recommendations(self, topics, complaints, activity):
        """
        Generate more detailed recommendations based on analysis
        """
        recommendations = []
        
        # Topic-based recommendations with more details
        if topics.get('transport', 0) > 5:
            recommendations.append("- Transport xizmatlarini yaxshilash zarurati: Transportga oid murojaatlar ko'payib borishini nazorat qiling")
            
        if topics.get('utilities', 0) > 5:
            recommendations.append("- Kommunal xizmatlarni monitoring qilish: Foydalanuvchilarning ehtiyojlari tez va sifatli bajarilyapti-yo'qligini tekshiring")
            
        if topics.get('news', 0) > 5:
            recommendations.append("- Fuqarolar bilan muntazam aloqada bo'lish: Aholining qiziqtirgan yangiliklarni vaqti bilan ulashing")
            
        if topics.get('education', 0) > 5:
            recommendations.append("- Ta'lim sohasiga e'tiborni qaratish: O'quv yilining turli bosqichlarida ota-onalar bilan muloqotni kuchaytiring")
            
        if topics.get('health', 0) > 3:
            recommendations.append("- Salomatlik sohasini rivojlantirish: Tashxislash uskunalarini yangilash va mutaxassislarni qo'shish zarur")
            
        if topics.get('finance', 0) > 3:
            recommendations.append("- Iqtisodiy masalalarga e'tibor qaratish: Byudjet sarflarini shaffoflashtirish va aholi bilan baham ko'rish")
            
        if topics.get('security', 0) > 3:
            recommendations.append("- Xavfsizlikni ta'minlash choralari: Kunning soatlariga qarab patrullarni kuchaytirish lozim")
            
        if topics.get('environment', 0) > 3:
            recommendations.append("- Atrof-muhitni muhofaza qilish: Chiqindi yig'ish va recycling dasturlarini amalga oshirish")
        
        # Complaint-based recommendations
        if len(complaints) > 5:
            recommendations.append(f"- Foydalanuvchilarning {len(complaints)} ta shikoyatini hal qilish: Shikoyatlarni toifalab, ularning bartaraf etilish muddatini belgilang")
        elif len(complaints) > 0:
            recommendations.append(f"- Foydalanuvchilarning {len(complaints)} ta shikoyatini diqqat bilan ko'rib chiqing")
        
        # Activity-based recommendations
        if activity['total_participants'] > 0:
            recommendations.append(f"- Guruhdagi {activity['total_participants']} ta foydalanuvchilarni faollashtirish: Muhokama uchun dolzarb mavzularni taklif qiling")
            
        # Engagement-based recommendations
        if activity['avg_message_length'] < 50:
            recommendations.append("- Guruhdagi suhbat sifatini oshirish: Foydalanuvchilarni murakkabroq mulohazalar bildirishga undang")
        elif activity['avg_message_length'] > 200:
            recommendations.append("- Foydalanuvchilarning mulohazalarini qisqartirish: Mavzudan chetga chiqmasdan izoh berishni taklif qiling")
            
        return recommendations

# Export the analyzer
analyzer = GroupAnalyzer()
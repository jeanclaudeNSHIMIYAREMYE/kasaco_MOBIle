# ai/sentiment_analyzer.py
from textblob import TextBlob
import re

class SentimentAnalyzer:
    def analyze_review(self, review_text):
        """Analyse le sentiment d'un avis client"""
        
        # Nettoyer le texte
        clean_text = re.sub(r'[^\w\s]', '', review_text.lower())
        
        # Analyser avec TextBlob
        blob = TextBlob(clean_text)
        sentiment_score = blob.sentiment.polarity
        
        # Classifier le sentiment
        if sentiment_score > 0.3:
            sentiment = "positif"
            emoji = "😊"
        elif sentiment_score < -0.3:
            sentiment = "négatif"
            emoji = "😞"
        else:
            sentiment = "neutre"
            emoji = "😐"
            
        return {
            'sentiment': sentiment,
            'score': sentiment_score,
            'emoji': emoji,
            'keywords': self.extract_keywords(clean_text)
        }
        
    def extract_keywords(self, text):
        """Extrait les mots-clés importants"""
        words = text.split()
        # Filtrer les mots courants
        stop_words = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais']
        keywords = [w for w in words if len(w) > 3 and w not in stop_words]
        return keywords[:5]
        
    def aggregate_sentiments(self, reviews):
        """Agrège les sentiments de plusieurs avis"""
        if not reviews:
            return None
            
        scores = [self.analyze_review(r)['score'] for r in reviews]
        avg_score = sum(scores) / len(scores)
        
        return {
            'average_sentiment': avg_score,
            'total_reviews': len(reviews),
            'positive_percentage': len([s for s in scores if s > 0.3]) / len(scores) * 100,
            'negative_percentage': len([s for s in scores if s < -0.3]) / len(scores) * 100,
            'neutral_percentage': len([s for s in scores if -0.3 <= s <= 0.3]) / len(scores) * 100
        }
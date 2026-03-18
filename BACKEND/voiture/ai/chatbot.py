# ai/chatbot.py
import openai
from django.conf import settings

class KASACOChatbot:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        
    def get_response(self, user_message, user_context=None):
        """Génère une réponse intelligente du chatbot"""
        
        system_prompt = """
        Tu es un assistant virtuel de KASACO, un concessionnaire automobile au Burundi.
        Tu parles français et tu aides les clients avec :
        - Informations sur les véhicules disponibles
        - Conseils d'achat
        - Processus de réservation
        - Informations sur les marques et modèles
        - Questions sur le garage et l'entretien
        
        Sois amical, professionnel et précis.
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=300
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Désolé, je rencontre un problème technique. Veuillez réessayer plus tard."

    def get_car_recommendation_chat(self, budget=None, preferences=None):
        """Recommandation via chat"""
        if budget and preferences:
            cars = Voiture.objects.filter(
                prix__lte=budget,
                **preferences
            )[:3]
            return cars
        return None
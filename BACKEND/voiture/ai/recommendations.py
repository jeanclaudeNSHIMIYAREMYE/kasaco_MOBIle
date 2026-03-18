# ai/recommendations.py
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from django.db.models import Q
from voiture.models import Voiture, Reservation

class CarRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        
    def get_similar_cars(self, car_id, limit=5):
        """Recommandation basée sur les caractéristiques similaires"""
        current_car = Voiture.objects.get(id=car_id)
        
        # Construire les caractéristiques textuelles
        cars = Voiture.objects.filter(etat="Disponible").exclude(id=car_id)
        
        # Créer des vecteurs de caractéristiques
        features = []
        for car in cars:
            car_features = f"{car.marque.nom} {car.modele.nom} {car.transmission} {car.couleur} {car.cylindree_cc}"
            features.append(car_features)
        
        # Ajouter la voiture courante
        current_features = f"{current_car.marque.nom} {current_car.modele.nom} {current_car.transmission} {current_car.couleur} {current_car.cylindree_cc}"
        features.append(current_features)
        
        # Calculer la similarité
        tfidf_matrix = self.vectorizer.fit_transform(features)
        cosine_sim = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])
        
        # Trier par similarité
        similar_indices = cosine_sim[0].argsort()[-limit:][::-1]
        
        return [cars[int(i)] for i in similar_indices]

    def get_personalized_recommendations(self, user_id, limit=6):
        """Recommandations personnalisées basées sur l'historique"""
        user_reservations = Reservation.objects.filter(utilisateur_id=user_id)
        
        if not user_reservations.exists():
            return Voiture.objects.filter(etat="Disponible").order_by('-date_ajout')[:limit]
        
        # Extraire les préférences de l'utilisateur
        preferred_marques = user_reservations.values_list('voiture__marque', flat=True)
        preferred_transmissions = user_reservations.values_list('voiture__transmission', flat=True)
        
        # Recommander des voitures similaires
        recommendations = Voiture.objects.filter(
            Q(etat="Disponible"),
            Q(marque_id__in=preferred_marques) | Q(transmission__in=preferred_transmissions)
        ).exclude(
            id__in=user_reservations.values_list('voiture_id', flat=True)
        ).distinct().order_by('-date_ajout')[:limit]
        
        return recommendations
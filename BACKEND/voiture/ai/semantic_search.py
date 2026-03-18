# ai/semantic_search.py
from sentence_transformers import SentenceTransformer
import numpy as np
from django.db.models import Q
from voiture.models import *

class SemanticSearch:
    def __init__(self):
        self.model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        self.car_embeddings = None
        self.car_ids = None
        
    def index_cars(self):
        """Indexe toutes les voitures pour la recherche sémantique"""
        cars = Voiture.objects.filter(etat="Disponible")
        
        descriptions = []
        self.car_ids = []
        
        for car in cars:
            desc = f"{car.marque.nom} {car.modele.nom} {car.annee} {car.transmission} {car.couleur} {car.kilometrage}km {car.prix} {car.devise}"
            descriptions.append(desc)
            self.car_ids.append(car.id)
            
        self.car_embeddings = self.model.encode(descriptions)
        
    def search(self, query, top_k=10):
        """Recherche par similarité sémantique"""
        if self.car_embeddings is None:
            self.index_cars()
            
        query_embedding = self.model.encode([query])
        
        # Calculer les similarités
        similarities = np.dot(self.car_embeddings, query_embedding.T).flatten()
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.5:  # Seuil de similarité
                car = Voiture.objects.get(id=self.car_ids[idx])
                results.append({
                    'car': car,
                    'similarity': float(similarities[idx]),
                    'score': f"{similarities[idx]*100:.1f}%"
                })
                
        return results
# ai/price_predictor.py
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import joblib
from voiture.models import *
class CarPricePredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100)
        self.label_encoders = {}
        
    def train_model(self):
        """Entraîne le modèle sur les données existantes"""
        cars = Voiture.objects.filter(etat="Vendue")
        
        if cars.count() < 10:
            return False
            
        # Préparer les données
        X = []
        y = []
        
        for car in cars:
            features = [
                car.annee,
                car.kilometrage,
                car.cylindree_cc,
                self._encode_marque(car.marque.nom),
                self._encode_transmission(car.transmission)
            ]
            X.append(features)
            y.append(float(car.prix))
        
        self.model.fit(X, y)
        
        # Sauvegarder le modèle
        joblib.dump(self.model, 'models/price_predictor.pkl')
        joblib.dump(self.label_encoders, 'models/label_encoders.pkl')
        
        return True
        
    def predict_price(self, car_data):
        """Prédit le prix estimé d'une voiture"""
        features = [
            car_data['annee'],
            car_data['kilometrage'],
            car_data['cylindree_cc'],
            self._encode_marque(car_data['marque']),
            self._encode_transmission(car_data['transmission'])
        ]
        
        predicted_price = self.model.predict([features])[0]
        return round(predicted_price, 2)
        
    def _encode_marque(self, marque):
        if 'marque' not in self.label_encoders:
            self.label_encoders['marque'] = LabelEncoder()
            marques = Voiture.objects.values_list('marque__nom', flat=True).distinct()
            self.label_encoders['marque'].fit(marques)
        return self.label_encoders['marque'].transform([marque])[0]
        
    def _encode_transmission(self, transmission):
        if 'transmission' not in self.label_encoders:
            self.label_encoders['transmission'] = LabelEncoder()
            transmissions = Voiture.objects.values_list('transmission', flat=True).distinct()
            self.label_encoders['transmission'].fit(transmissions)
        return self.label_encoders['transmission'].transform([transmission])[0]
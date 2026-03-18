from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import *
import re

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'role', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        
        # Vérification de la complexité du mot de passe
        password = attrs['password']
        if len(password) < 8:
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins 8 caractères."})
        if not re.search(r"[A-Za-z]", password):
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins une lettre."})
        if not re.search(r"\d", password):
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins un chiffre."})
        if not re.search(r"[!@#$%^&*]", password):
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins un caractère spécial."})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        # Utiliser create_user pour que le mot de passe soit hashé correctement
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=password,
            role=validated_data.get('role', 'user'),
            is_active=True
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError("Email ou mot de passe incorrect.")
            if not user.is_active:
                raise serializers.ValidationError("Compte désactivé.")
        else:
            raise serializers.ValidationError("Email et mot de passe requis.")

        attrs['user'] = user
        return attrs

class PasswordChangeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cette adresse email ne correspond à aucun compte.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        
        password = attrs['password']
        if len(password) < 8:
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins 8 caractères."})
        if not re.search(r"[A-Za-z]", password):
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins une lettre."})
        if not re.search(r"\d", password):
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins un chiffre."})
        if not re.search(r"[!@#$%^&*]", password):
            raise serializers.ValidationError({"password": "Le mot de passe doit contenir au moins un caractère spécial."})
        
        return attrs

class MarqueSerializer(serializers.ModelSerializer):
    nb_modeles = serializers.IntegerField(read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Marque
        fields = ['id', 'nom', 'logo', 'logo_url', 'nb_modeles']

    def get_logo_url(self, obj):
        if obj.logo and hasattr(obj.logo, 'url'):
            return obj.logo.url
        return None

class ModeleSerializer(serializers.ModelSerializer):
    marque_nom = serializers.CharField(source='marque.nom', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Modele
        fields = ['id', 'marque', 'marque_nom', 'nom', 'image', 'image_url']

    def get_image_url(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None

class ImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ['id', 'image', 'image_url']

    def get_image_url(self, obj):
        if obj.image and hasattr(obj.image, 'url'):
            return obj.image.url
        return None

# Dans serializers.py

class VoitureListSerializer(serializers.ModelSerializer):
    marque_nom = serializers.CharField(source='marque.nom', read_only=True)
    modele_nom = serializers.CharField(source='modele.nom', read_only=True)
    photo_url = serializers.SerializerMethodField()
    images = ImageSerializer(many=True, read_only=True)
    prix_formate = serializers.SerializerMethodField()
    pays_display = serializers.CharField(source='get_pays_display', read_only=True)

    class Meta:
        model = Voiture
        fields = ['id', 'marque', 'marque_nom', 'modele', 'modele_nom', 'annee', 
                  'prix', 'devise', 'prix_formate', 'pays', 'pays_display',
                  'transmission', 'kilometrage', 'couleur', 'etat', 'photo', 
                  'photo_url', 'images', 'date_ajout']

    def get_photo_url(self, obj):
        if obj.photo and hasattr(obj.photo, 'url'):
            return obj.photo.url
        return None

    def get_prix_formate(self, obj):
        return obj.prix_formatte()


class VoitureDetailSerializer(serializers.ModelSerializer):
    marque = MarqueSerializer(read_only=True)
    modele = ModeleSerializer(read_only=True)
    images = ImageSerializer(many=True, read_only=True)
    photo_url = serializers.SerializerMethodField()
    prix_formate = serializers.SerializerMethodField()
    pays_display = serializers.CharField(source='get_pays_display', read_only=True)

    class Meta:
        model = Voiture
        fields = '__all__'

    def get_photo_url(self, obj):
        if obj.photo and hasattr(obj.photo, 'url'):
            return obj.photo.url
        return None

    def get_prix_formate(self, obj):
        return obj.prix_formatte()


class VoitureCreateUpdateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Voiture
        fields = '__all__'

    def validate(self, attrs):
        # Vérifier que le modèle appartient bien à la marque
        if 'marque' in attrs and 'modele' in attrs:
            if attrs['modele'].marque_id != attrs['marque'].id:
                raise serializers.ValidationError(
                    "Le modèle n'appartient pas à la marque sélectionnée."
                )
        return attrs

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        voiture = Voiture.objects.create(**validated_data)
        
        for image in images:
            Image.objects.create(voiture=voiture, image=image)
        
        return voiture


class ReservationSerializer(serializers.ModelSerializer):
    voiture_detail = VoitureListSerializer(source='voiture', read_only=True)
    utilisateur_detail = CustomUserSerializer(source='utilisateur', read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'voiture', 'voiture_detail', 'utilisateur', 'utilisateur_detail', 'date_reservation']
        read_only_fields = ['date_reservation']


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['voiture']

    def validate_voiture(self, value):
        """Vérification que la voiture est disponible"""
        if value.etat != "Disponible":
            raise serializers.ValidationError("Cette voiture n'est pas disponible.")
        return value

class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = '__all__'

class DashboardStatsSerializer(serializers.Serializer):
    utilisateurs_count = serializers.IntegerField()
    voitures_count = serializers.IntegerField()
    reservations_count = serializers.IntegerField()
    marques_count = serializers.IntegerField()
    marques_list = MarqueSerializer(many=True)
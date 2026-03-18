from rest_framework import status, generics, viewsets, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Count, Q
from django.core.mail import send_mail
from django.conf import settings
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
import os
from collections import defaultdict

from .models import *
from .serializers import *
from .permissions import IsAdminUser, IsAdminUserOrReadOnly

# ===================== AUTHENTIFICATION =====================

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': CustomUserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Inscription réussie'
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': CustomUserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Connexion réussie',
                'role': user.role
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                
                # Vérifier si l'application de blacklist est installée
                try:
                    token.blacklist()
                except AttributeError:
                    # Si blacklist n'est pas disponible, on ignore silencieusement
                    # car le frontend va supprimer les tokens localement
                    print("⚠️ Blacklist non disponible, token ignoré")
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
        except Exception as e:
            # Même en cas d'erreur, on retourne un succès car le frontend nettoiera localement
            print(f"❌ Erreur lors de la déconnexion: {e}")
            return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)

class PasswordChangeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                user = CustomUser.objects.get(email=email)
                user.set_password(password)
                user.save()
                
                return Response({'message': 'Mot de passe modifié avec succès'}, status=status.HTTP_200_OK)
            except CustomUser.DoesNotExist:
                return Response({'error': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RedirectByRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "admin" or request.user.role == "superadmin":
            return Response({'redirect_url': '/api/dashboard/admin/'})
        return Response({'redirect_url': '/api/dashboard/user/'})

# ===================== DASHBOARD =====================

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        stats = {
            'utilisateurs_count': CustomUser.objects.count(),
            'voitures_count': Voiture.objects.count(),
            'reservations_count': Reservation.objects.count(),
            'marques_count': Marque.objects.count(),
            'marques_list': Marque.objects.annotate(nb_modeles=Count('modeles')).order_by('nom')
        }
        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)

class UserHomeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "admin" or request.user.role == "superadmin":
            return Response({'error': 'Accès réservé aux utilisateurs'}, 
                          status=status.HTTP_403_FORBIDDEN)

        voitures_qs = Voiture.objects.filter(etat="Disponible").order_by("-date_ajout")
        
        page = int(request.GET.get('page', 1))
        paginator = Paginator(voitures_qs, 3)
        voitures_page = paginator.get_page(page)

        marques = Marque.objects.prefetch_related("modeles").all()
        voitures_populaires = Voiture.objects.filter(etat="Disponible").order_by("-date_ajout")[:6]

        return Response({
            'voitures': VoitureListSerializer(voitures_page, many=True).data,
            'marques': MarqueSerializer(marques, many=True).data,
            'voitures_populaires': VoitureListSerializer(voitures_populaires, many=True).data,
            'pagination': {
                'current_page': voitures_page.number,
                'total_pages': voitures_page.paginator.num_pages,
                'total_items': voitures_page.paginator.count,
                'has_next': voitures_page.has_next(),
                'has_previous': voitures_page.has_previous()
            }
        })

# ===================== VOITURES (ADMIN) =====================

class VoitureViewSet(viewsets.ModelViewSet):
    queryset = Voiture.objects.all().order_by('-date_ajout')
    permission_classes = [IsAdminUserOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'list':
            return VoitureListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return VoitureCreateUpdateSerializer
        return VoitureDetailSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def reserver(self, request, pk=None):
        voiture = self.get_object()
        if voiture.etat != "Disponible":
            return Response({'error': 'Cette voiture n\'est pas disponible'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        utilisateur_id = request.data.get('utilisateur_id', request.user.id)
        
        serializer = ReservationCreateSerializer(data={
            'voiture': voiture.id,
            'utilisateur': utilisateur_id
        })
        
        if serializer.is_valid():
            with transaction.atomic():
                reservation = serializer.save()
                voiture.reserver()
            
            if reservation.utilisateur.email:
                self._send_reservation_email(reservation)
            
            return Response(ReservationSerializer(reservation).data, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _send_reservation_email(self, reservation):
        sujet = "Confirmation de réservation - KASACO 🚗"
        message = f"""
Bonjour {reservation.utilisateur.username},

Votre réservation a été effectuée avec succès.

Détails de la réservation :
- Voiture : {reservation.voiture}
- Prix : {reservation.voiture.prix} BIF
- Date : {reservation.date_reservation.strftime('%d/%m/%Y %H:%M')}

Merci de faire confiance à KASACO.

Cordialement,
L’équipe KASACO 🚀
"""
        from_email = os.environ.get("DEFAULT_FROM_EMAIL", settings.DEFAULT_FROM_EMAIL)
        try:
            send_mail(sujet, message, from_email, [reservation.utilisateur.email])
        except Exception as e:
            print(f"Erreur d'envoi d'email: {e}")

# ===================== MARQUES (ADMIN) =====================

class MarqueViewSet(viewsets.ModelViewSet):
    queryset = Marque.objects.annotate(nb_modeles=Count('modeles')).order_by('nom')
    serializer_class = MarqueSerializer
    permission_classes = [IsAdminUserOrReadOnly]

# ===================== MODELES (ADMIN) =====================

class ModeleViewSet(viewsets.ModelViewSet):
    queryset = Modele.objects.select_related('marque').all().order_by('nom')
    serializer_class = ModeleSerializer
    permission_classes = [IsAdminUserOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        marque_id = self.request.query_params.get('marque')
        if marque_id:
            queryset = queryset.filter(marque_id=marque_id)
        return queryset

# ===================== RESERVATIONS =====================

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.select_related('voiture', 'utilisateur').all().order_by('-date_reservation')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ReservationCreateSerializer
        return ReservationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin" or user.role == "superadmin":
            return self.queryset
        return self.queryset.filter(utilisateur=user)

    def perform_create(self, serializer):
        """Création d'une réservation avec mise à jour automatique de l'état"""
        with transaction.atomic():
            # Récupérer la voiture
            voiture = serializer.validated_data['voiture']
            
            # Vérifier que la voiture est disponible
            if voiture.etat != "Disponible":
                raise serializers.ValidationError(
                    {"voiture": "Cette voiture n'est pas disponible."}
                )
            
            # Créer la réservation
            reservation = serializer.save(utilisateur=self.request.user)
            
            # Mettre à jour l'état de la voiture
            voiture.reserver()
            
            return reservation

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def annuler(self, request, pk=None):
        """Annuler une réservation et libérer la voiture"""
        reservation = self.get_object()
        
        # Vérifier que l'utilisateur est autorisé
        if request.user.role not in ["admin", "superadmin"] and reservation.utilisateur != request.user:
            return Response(
                {'error': 'Vous n\'êtes pas autorisé à annuler cette réservation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        with transaction.atomic():
            voiture = reservation.voiture
            
            # Libérer la voiture
            voiture.liberer()
            
            # Supprimer la réservation
            reservation.delete()
            
        return Response(
            {'message': 'Réservation annulée avec succès. La voiture est maintenant disponible.'},
            status=status.HTTP_200_OK
        )
    
# ===================== UTILISATEURS =====================

class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().order_by('-date_joined')
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    @action(detail=True, methods=['post'])
    def changer_role(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'Vous ne pouvez pas modifier votre propre rôle'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        user.role = "user" if user.role == "admin" else "admin"
        user.save()
        return Response({
            'message': f'Rôle changé avec succès',
            'user': CustomUserSerializer(user).data
        })

# ===================== CONTACT =====================

class ContactInfoView(generics.RetrieveAPIView):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        obj = ContactInfo.objects.first()
        if not obj:
            obj = ContactInfo.objects.create()
        return obj

class ContactInfoUpdateView(generics.UpdateAPIView):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self):
        obj = ContactInfo.objects.first()
        if not obj:
            obj = ContactInfo.objects.create()
        return obj

# ===================== STATISTIQUES =====================

class StatistiquesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response({
            'utilisateurs': CustomUser.objects.count(),
            'voitures': Voiture.objects.count(),
            'voitures_disponibles': Voiture.objects.filter(etat="Disponible").count(),
            'voitures_reservees': Voiture.objects.filter(etat="Réservée").count(),
            'voitures_vendues': Voiture.objects.filter(etat="Vendue").count(),
            'reservations': Reservation.objects.count(),
            'marques': Marque.objects.count(),
            'modeles': Modele.objects.count()
        })

# ===================== RECHERCHE =====================

class RechercheView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response({'results': []})

        voitures = Voiture.objects.filter(
            Q(marque__nom__icontains=query) |
            Q(modele__nom__icontains=query) |
            Q(numero_chassis__icontains=query)
        )[:10]

        marques = Marque.objects.filter(nom__icontains=query)[:5]
        modeles = Modele.objects.filter(nom__icontains=query)[:5]

        return Response({
            'voitures': VoitureListSerializer(voitures, many=True).data,
            'marques': MarqueSerializer(marques, many=True).data,
            'modeles': ModeleSerializer(modeles, many=True).data
        })

# ===================== PAGES PUBLIQUES =====================

class HomeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        voitures_qs = Voiture.objects.all().order_by("-date_ajout")
        
        page = int(request.GET.get('page', 1))
        paginator = Paginator(voitures_qs, 3)
        voitures_page = paginator.get_page(page)

        marques = Marque.objects.annotate(nb_modeles=Count("modeles"))
        voitures_populaires = Voiture.objects.order_by("-date_ajout")[:6]

        return Response({
            "voitures": VoitureListSerializer(voitures_page, many=True).data,
            "marques": MarqueSerializer(marques, many=True).data,
            "voitures_populaires": VoitureListSerializer(voitures_populaires, many=True).data,
            "pagination": {
                "current_page": voitures_page.number,
                "total_pages": voitures_page.paginator.num_pages,
                "total_items": voitures_page.paginator.count,
                "has_next": voitures_page.has_next(),
                "has_previous": voitures_page.has_previous()
            }
        })

class PourquoiKasacoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        features = [
            {
                "icon": "bi bi-building text-red-500",
                "title": "Vente et importation des véhicules locales",
                "description": "Nous proposons un large choix de véhicules locaux de qualité soigneusement inspectés et certifiés.",
            },
            {
                "icon": "bi bi-globe2 text-blue-500",
                "title": "Vente et importation des véhicules en ligne",
                "description": "Achetez facilement votre véhicule en ligne avec livraison rapide et sécurisée partout au Burundi.",
            },
            {
                "icon": "bi bi-car-front-fill text-green-500",
                "title": "Garage",
                "description": "Nos garages sont équipés pour l’entretien, la réparation et le service après-vente de votre véhicule.",
            },
        ]
        return Response({
            "title": "Pourquoi KASACO ?",
            "features": features
        })

# ===================== VIEWSETS PUBLICS POUR LE FRONTEND REACT =====================

class PublicMarqueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet public pour les marques (lecture seule)
    Correspond à l'endpoint /marquesuser/ utilisé par React
    """
    queryset = Marque.objects.annotate(nb_modeles=Count('modeles')).order_by('nom')
    serializer_class = MarqueSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def modeles(self, request, pk=None):
        """
        Endpoint: /marquesuser/{id}/modeles/
        """
        marque = self.get_object()
        modeles = marque.modeles.all().order_by('nom')
        
        result = []
        for modele in modeles:
            modele_data = ModeleSerializer(modele).data
            modele_data['nb_voitures'] = modele.voitures.count()
            first_voiture = modele.voitures.filter(photo__isnull=False).first()
            modele_data['photo_url'] = first_voiture.photo.url if first_voiture and first_voiture.photo else None
            result.append(modele_data)
        
        return Response(result)

class PublicModeleViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet public pour les modèles (lecture seule)
    Correspond à l'endpoint /modelesuser/ utilisé par React
    """
    queryset = Modele.objects.select_related('marque').all().order_by('nom')
    serializer_class = ModeleSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def voitures(self, request, pk=None):
        """
        Endpoint: /modelesuser/{id}/voitures/
        """
        modele = self.get_object()
        voitures = Voiture.objects.filter(modele=modele, etat="Disponible")
        
        # Filtres optionnels
        annee_min = request.query_params.get('annee_min')
        annee_max = request.query_params.get('annee_max')
        prix_min = request.query_params.get('prix_min')
        prix_max = request.query_params.get('prix_max')
        transmission = request.query_params.get('transmission')

        if annee_min:
            voitures = voitures.filter(annee__gte=annee_min)
        if annee_max:
            voitures = voitures.filter(annee__lte=annee_max)
        if prix_min:
            voitures = voitures.filter(prix__gte=prix_min)
        if prix_max:
            voitures = voitures.filter(prix__lte=prix_max)
        if transmission:
            voitures = voitures.filter(transmission=transmission)

        serializer = VoitureListSerializer(voitures, many=True)
        return Response(serializer.data)

class PublicVoitureViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet public pour les voitures (lecture seule)
    Correspond à l'endpoint /voituresuser/ utilisé par React
    """
    queryset = Voiture.objects.all().order_by('-date_ajout')
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VoitureDetailSerializer
        return VoitureListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        etat = self.request.query_params.get('etat')
        if etat:
            queryset = queryset.filter(etat=etat)
        
        limit = self.request.query_params.get('limit')
        if limit and self.action == 'list':
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
        
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def populaires(self, request):
        """
        Endpoint: /voituresuser/populaires/
        """
        limit = request.query_params.get('limit', 6)
        try:
            limit = int(limit)
        except ValueError:
            limit = 6
            
        voitures = self.get_queryset().filter(etat="Disponible")[:limit]
        serializer = self.get_serializer(voitures, many=True)
        return Response(serializer.data)
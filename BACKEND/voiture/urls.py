from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router pour les endpoints standards (admin + authentifié)
router = DefaultRouter()
router.register(r'voitures', views.VoitureViewSet, basename='voiture')
router.register(r'marques', views.MarqueViewSet, basename='marque')
router.register(r'modeles', views.ModeleViewSet, basename='modele')
router.register(r'reservations', views.ReservationViewSet, basename='reservation')
router.register(r'utilisateurs', views.UtilisateurViewSet, basename='utilisateur')

# Router pour les endpoints publics (frontend React)
router.register(r'voituresuser', views.PublicVoitureViewSet, basename='voiture-public')
router.register(r'marquesuser', views.PublicMarqueViewSet, basename='marque-public')
router.register(r'modelesuser', views.PublicModeleViewSet, basename='modele-public')

urlpatterns = [
    # Routes de l'API standards
    path('', include(router.urls)),
    
    # Authentification
    path('auth/register/', views.RegisterView.as_view(), name='auth-register'),
    path('auth/login/', views.LoginView.as_view(), name='auth-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('auth/change-password/', views.PasswordChangeView.as_view(), name='auth-change-password'),
    path('auth/redirect/', views.RedirectByRoleView.as_view(), name='auth-redirect'),
    
    # Dashboard
    path('dashboard/admin/', views.AdminDashboardView.as_view(), name='admin-dashboard'),
    path('dashboard/user/', views.UserHomeView.as_view(), name='user-home'),
    
    # Contact
    path('contact/', views.ContactInfoView.as_view(), name='contact-info'),
    path('contact/update/', views.ContactInfoUpdateView.as_view(), name='contact-update'),
    
    # Statistiques
    path('statistiques/', views.StatistiquesView.as_view(), name='statistiques'),
    
    # Recherche
    path('recherche/', views.RechercheView.as_view(), name='recherche'),
    
    # Pages publiques
    path('home/', views.HomeView.as_view(), name='api-home'),
    path('pourquoi-kasaco/', views.PourquoiKasacoView.as_view(), name='api-pourquoi-kasaco'),
]
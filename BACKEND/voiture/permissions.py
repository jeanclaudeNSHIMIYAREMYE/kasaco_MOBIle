from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Permission pour les administrateurs uniquement
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")

class IsRegularUser(permissions.BasePermission):
    """
    Permission pour les utilisateurs réguliers uniquement
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "user")

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Permission: admin peut tout faire, les autres en lecture seule
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission: seul le propriétaire ou l'admin peut modifier
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.role == "admin":
            return True
        
        # Vérifier si l'utilisateur est le propriétaire
        if hasattr(obj, 'utilisateur'):
            return obj.utilisateur == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
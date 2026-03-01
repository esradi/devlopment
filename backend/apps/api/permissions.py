from rest_framework import permissions

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')

class IsCompany(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'company')

class IsUniversityAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object (or admins) to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
            
        # Check if the object has a 'company' attribute and it matches the user's company profile
        if hasattr(obj, 'company'):
            return obj.company.user == request.user
            
        # Check if the object is the 'user' itself
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        return False

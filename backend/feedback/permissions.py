"""
Custom permissions for API endpoints.
"""
from rest_framework import permissions
from django.conf import settings


class IsAdminToken(permissions.BasePermission):
    """
    Permission class that checks for admin token in Authorization header.
    """
    def has_permission(self, request, view):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Token '):
            return False
        
        token = auth_header.replace('Token ', '').strip()
        return token == settings.ADMIN_TOKEN

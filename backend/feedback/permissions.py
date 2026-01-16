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
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            
            if not auth_header.startswith('Token '):
                return False
            
            token = auth_header.replace('Token ', '').strip()
            admin_token = getattr(settings, 'ADMIN_TOKEN', 'dev-token-change-in-production')
            return token == admin_token
        except Exception as e:
            # Log error but don't crash
            import logging
            logger = logging.getLogger('feedback')
            logger.error(f'Error in IsAdminToken permission: {e}')
            return False

"""
Request logging middleware.
"""
import time
import logging

logger = logging.getLogger('feedback')


class RequestLoggingMiddleware:
    """
    Middleware to log API requests, errors, and metrics.
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.path} - "
            f"IP: {self.get_client_ip(request)}"
        )
        
        response = self.get_response(request)
        
        # Calculate response time
        duration = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {request.method} {request.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {duration:.3f}s"
        )
        
        # Log errors
        if response.status_code >= 500:
            logger.error(
                f"Server Error: {request.method} {request.path} - "
                f"Status: {response.status_code}"
            )
        
        return response
    
    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

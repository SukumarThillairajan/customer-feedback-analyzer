# backend/feedback/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeedbackViewSet

router = DefaultRouter()
# register the viewset on the empty prefix so the router maps /feedback/...
router.register('', FeedbackViewSet, basename='feedback')

urlpatterns = [
    # router maps:
    #   GET  / -> FeedbackViewSet.list  (so project /api/feedback/ -> router)
    path('', include(router.urls)),
]

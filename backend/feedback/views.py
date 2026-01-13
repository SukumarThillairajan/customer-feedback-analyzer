"""
API views for Feedback endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Avg, Q
from django.conf import settings
from .models import Feedback
from .serializers import FeedbackSerializer, FeedbackCreateSerializer
from .permissions import IsAdminToken


class FeedbackViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Feedback model with custom actions.
    """
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    
    def get_permissions(self):
        """
        Allow anyone to submit feedback, but require token for viewing/aggregated data.
        """
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminToken()]
    
    def get_serializer_class(self):
        """Use different serializer for creation."""
        if self.action == 'create':
            return FeedbackCreateSerializer
        return FeedbackSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create new feedback. Public endpoint.
        """
        serializer = FeedbackCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        feedback = serializer.save()
        
        # Return created feedback with all derived fields
        response_serializer = FeedbackSerializer(feedback)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def all(self, request):
        """
        Get all feedback. Requires admin token.
        """
        feedbacks = self.get_queryset()
        serializer = self.get_serializer(feedbacks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='product/(?P<product_id>[^/.]+)')
    def product(self, request, product_id=None):
        """
        Get all feedback for a specific product. Requires admin token.
        """
        feedbacks = self.get_queryset().filter(product_id=product_id)
        serializer = self.get_serializer(feedbacks, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def aggregated_sentiment(self, request):
        """
        Get aggregated sentiment counts. Requires admin token.
        Returns: {positive: count, negative: count, neutral: count}
        """
        counts = self.get_queryset().values('sentiment_label').annotate(
            count=Count('id')
        )
        
        result = {'positive': 0, 'negative': 0, 'neutral': 0}
        for item in counts:
            label = item['sentiment_label'].lower()
            if label in result:
                result[label] = item['count']
        
        # Add average score and confidence
        avg_score = self.get_queryset().aggregate(avg=Avg('sentiment_score'))['avg'] or 0.0
        avg_confidence = self.get_queryset().aggregate(avg=Avg('sentiment_confidence'))['avg'] or 0.0
        
        result['average_score'] = round(avg_score, 3)
        result['average_confidence'] = round(avg_confidence, 3)
        result['total'] = sum(result.values())
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def aggregated_themes(self, request):
        """
        Get theme counts across all products. Requires admin token.
        Returns: {theme: count, ...}
        """
        # Get all feedbacks and count themes
        feedbacks = self.get_queryset()
        theme_counts = {}
        
        for feedback in feedbacks:
            for theme in feedback.themes:
                theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        return Response(theme_counts)
    
    @action(detail=False, methods=['get'], url_path='aggregated/themes/(?P<product_id>[^/.]+)')
    def aggregated_themes_product(self, request, product_id=None):
        """
        Get theme counts for a specific product. Requires admin token.
        Returns: {theme: count, ...}
        """
        feedbacks = self.get_queryset().filter(product_id=product_id)
        theme_counts = {}
        
        for feedback in feedbacks:
            for theme in feedback.themes:
                theme_counts[theme] = theme_counts.get(theme, 0) + 1
        
        return Response(theme_counts)

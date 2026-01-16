"""
API views for Feedback endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Avg, Q
from django.conf import settings
import logging
from .models import Feedback
from .serializers import FeedbackSerializer, FeedbackCreateSerializer
from .permissions import IsAdminToken

from typing import Any

logger = logging.getLogger('feedback')


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
    
    def get_serializer_class(self) -> Any:  # type: ignore[override]
        """
        Return the serializer class to use for the current action.

        Use `Any` + `type: ignore[override]` to satisfy Pylance typing rules.
        Runtime behaviour is unchanged: when action == 'create' we return
        FeedbackCreateSerializer, otherwise we return FeedbackSerializer.
        """
        if self.action == 'create':
            return FeedbackCreateSerializer
        return FeedbackSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Create new feedback. Public endpoint.
        """
        logger.info("Feedback create request: %s", request.data)
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
        try:
            feedbacks = self.get_queryset()
            serializer = self.get_serializer(feedbacks, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f'Error in all feedback endpoint: {e}', exc_info=True)
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'detail': 'Error fetching feedback'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
        try:
            queryset = self.get_queryset()
            counts = queryset.values('sentiment_label').annotate(
                count=Count('id')
            )
            
            result = {'positive': 0, 'negative': 0, 'neutral': 0}
            for item in counts:
                label = item['sentiment_label'].lower()
                if label in result:
                    result[label] = item['count']
            
            # Add average score and confidence
            avg_confidence = queryset.aggregate(avg=Avg('sentiment_confidence'))['avg']
            
            result['average_confidence'] = round(float(avg_confidence) if avg_confidence is not None else 0.0, 3)
            # Fix: Only sum the count values, not the averages
            result['total'] = result['positive'] + result['negative'] + result['neutral']
            
            return Response(result)
        except Exception as e:
            logger.error(f'Error in aggregated_sentiment: {e}', exc_info=True)
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'detail': 'Error calculating aggregated sentiment'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def aggregated_themes(self, request):
        """
        Get theme counts across all products. Requires admin token.
        Returns: {theme: count, ...}
        """
        try:
            # Get all feedbacks and count themes
            feedbacks = self.get_queryset()
            theme_counts = {}
            
            for feedback in feedbacks:
                # Ensure themes is a list (handle None, empty, or list)
                themes = feedback.themes if isinstance(feedback.themes, list) else ([] if feedback.themes is None else [])
                for theme in themes:
                    if theme:  # Skip empty strings
                        theme_counts[theme] = theme_counts.get(theme, 0) + 1
            
            return Response(theme_counts)
        except Exception as e:
            logger.error(f'Error in aggregated_themes: {e}', exc_info=True)
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'detail': 'Error calculating aggregated themes'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='aggregated/themes/(?P<product_id>[^/.]+)')
    def aggregated_themes_product(self, request, product_id=None):
        """
        Get theme counts for a specific product. Requires admin token.
        Returns: {theme: count, ...}
        """
        try:
            feedbacks = self.get_queryset().filter(product_id=product_id)
            theme_counts = {}
            
            for feedback in feedbacks:
                # Ensure themes is a list
                themes = feedback.themes if isinstance(feedback.themes, list) else ([] if feedback.themes is None else [])
                for theme in themes:
                    if theme:  # Skip empty strings
                        theme_counts[theme] = theme_counts.get(theme, 0) + 1
            
            return Response(theme_counts)
        except Exception as e:
            logger.error(f'Error in aggregated_themes_product: {e}', exc_info=True)
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e), 'detail': 'Error calculating aggregated themes for product'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def themes_by_product(self, request):
        """
        Get theme counts grouped by product.
        Returns: {
            "products": ["Rings", ...],
            "themes": ["Appearance", ...],
            "counts": [[1.0, 0.5, ...], ...]
        }
        """
        try:
            feedbacks = self.get_queryset()
            
            # Collect unique products and themes
            products = sorted(list(set(f.product_id for f in feedbacks if f.product_id)))
            # Hardcoded themes list to ensure consistency, or collect dynamically
            # Using dynamic collection for robustness but ensuring 'Other' is last if present
            all_themes = set()
            for f in feedbacks:
                themes = f.themes if isinstance(f.themes, list) else []
                for t in themes:
                    if t: all_themes.add(t)
            
            themes = sorted(list(all_themes))
            
            # Initialize matrix: rows=products, cols=themes
            # Using a dictionary for easier lookup during aggregation
            matrix = {p: {t: 0.0 for t in themes} for p in products}
            
            for f in feedbacks:
                p_id = f.product_id
                f_themes = [t for t in (f.themes if isinstance(f.themes, list) else []) if t]
                if not f_themes:
                    continue # Or attribute to 'Other' theme if desired, but skipping for now based on logic
                
                weight = 1.0 / len(f_themes)
                for t in f_themes:
                    if p_id in matrix and t in matrix[p_id]:
                        matrix[p_id][t] += weight
            
            # Convert matrix dictionary to list of lists
            counts = [[matrix[p][t] for t in themes] for p in products]
            
            return Response({
                "products": products,
                "themes": themes,
                "counts": counts
            })
        except Exception as e:
            logger.error(f'Error in themes_by_product: {e}', exc_info=True)
            return Response(
                {'error': str(e), 'detail': 'Error calculating themes by product'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

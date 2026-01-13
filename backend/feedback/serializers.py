"""
DRF serializers for Feedback model.
"""
from rest_framework import serializers
from .models import Feedback

# Valid product IDs
VALID_PRODUCTS = ['Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Pendants']


class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for Feedback model with validation.
    """
    sentiment = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = ['id', 'product_id', 'rating', 'review_text', 'created_at', 
                 'sentiment', 'themes', 'tokens', 'language', 'meta']
        read_only_fields = ['id', 'created_at', 'sentiment', 'themes', 'tokens']
    
    def get_sentiment(self, obj):
        """Return nested sentiment object."""
        return {
            'label': obj.sentiment_label,
            'score': obj.sentiment_score,
            'confidence': obj.sentiment_confidence
        }
    
    def validate_product_id(self, value):
        """Validate product_id is from predefined list."""
        if value not in VALID_PRODUCTS:
            raise serializers.ValidationError(
                f"product_id must be one of: {', '.join(VALID_PRODUCTS)}"
            )
        return value
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5."""
        if not (1 <= value <= 5):
            raise serializers.ValidationError("rating must be between 1 and 5")
        return value
    
    def validate_review_text(self, value):
        """Validate review_text is not empty and within length limit."""
        if not value or not value.strip():
            raise serializers.ValidationError("review_text cannot be empty")
        if len(value) > 5000:
            raise serializers.ValidationError("review_text cannot exceed 5000 characters")
        return value


class FeedbackCreateSerializer(serializers.Serializer):
    """
    Serializer for creating feedback (only requires product_id, rating, review_text).
    """
    product_id = serializers.CharField()
    rating = serializers.IntegerField()
    review_text = serializers.CharField()
    
    def validate_product_id(self, value):
        if value not in VALID_PRODUCTS:
            raise serializers.ValidationError(
                f"product_id must be one of: {', '.join(VALID_PRODUCTS)}"
            )
        return value
    
    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("rating must be between 1 and 5")
        return value
    
    def validate_review_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("review_text cannot be empty")
        if len(value) > 5000:
            raise serializers.ValidationError("review_text cannot exceed 5000 characters")
        return value
    
    def create(self, validated_data):
        """Create Feedback instance."""
        # Extract meta information from request if available
        request = self.context.get('request')
        meta = {}
        if request:
            meta['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            meta['source'] = 'web'
        
        validated_data['meta'] = meta
        return Feedback.objects.create(**validated_data)

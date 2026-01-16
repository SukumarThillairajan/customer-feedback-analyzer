"""
Feedback model with sentiment analysis and theme detection.
"""
import uuid
from django.db import models
from django.utils import timezone
from .sentiment_analyzer import analyze_sentiment, detect_themes
import logging

logger = logging.getLogger('feedback')


class Feedback(models.Model):
    """
    Customer feedback model storing both raw values and derived fields.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_id = models.CharField(max_length=100)
    product_name = models.CharField(max_length=255, blank=True, null=True)
    rating = models.IntegerField()  # 1-5
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Sentiment analysis fields
    sentiment_label = models.CharField(max_length=20, default='Neutral')  # Positive, Negative, Neutral
    sentiment_confidence = models.FloatField(default=0.0)  # 0.0 to 1.0
    
    # Theme detection
    themes = models.JSONField(default=list)  # Array of theme strings
    
    # Optional fields
    tokens = models.JSONField(default=list, blank=True, null=True)  # Extracted tokens for debugging
    language = models.CharField(max_length=10, default='en')
    meta = models.JSONField(default=dict, blank=True)  # user_agent, source, etc.
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product_id']),
            models.Index(fields=['sentiment_label']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.product_id} - {self.rating}/5 - {self.sentiment_label}"
    
    def save(self, *args, **kwargs):
        """
        Override save to automatically analyze sentiment and detect themes.
        """
        # Analyze sentiment
        sentiment_result = analyze_sentiment(self.review_text, debug=False)
        self.sentiment_label = sentiment_result['label']
        self.sentiment_confidence = sentiment_result['confidence']
        
        # Detect themes
        self.themes = detect_themes(self.review_text)
        
        # Extract tokens (optional, for debugging)
        if not self.tokens:
            from .sentiment_analyzer import preprocess_text
            self.tokens = preprocess_text(self.review_text)
        
        super().save(*args, **kwargs)
    
    def to_dict(self):
        """
        Convert model instance to dictionary matching the document structure.
        """
        return {
            '_id': str(self.id),
            'product_id': self.product_id,
            'product_name': self.product_name,
            'rating': self.rating,
            'review_text': self.review_text,
            'created_at': self.created_at.isoformat() + 'Z',
            'sentiment': {
                'label': self.sentiment_label,
                'confidence': self.sentiment_confidence
            },
            'themes': self.themes,
            'tokens': self.tokens or [],
            'language': self.language,
            'meta': self.meta
        }

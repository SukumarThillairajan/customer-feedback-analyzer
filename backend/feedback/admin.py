"""
Django admin configuration for Feedback model.
"""
from django.contrib import admin
from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'product_id', 'rating', 'sentiment_label', 'sentiment_score', 'created_at']
    list_filter = ['product_id', 'sentiment_label', 'rating', 'created_at']
    search_fields = ['review_text', 'product_id']
    readonly_fields = ['id', 'created_at', 'sentiment_label', 'sentiment_score', 'sentiment_confidence', 'themes', 'tokens']
    ordering = ['-created_at']

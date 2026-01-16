from django.contrib import admin
from .models import Feedback

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['product_id', 'rating', 'sentiment_label', 'created_at']
    list_filter = ['product_id', 'rating', 'sentiment_label']
    search_fields = ['review_text', 'product_id', 'product_name']
    readonly_fields = ['created_at', 'sentiment_label', 'sentiment_confidence', 'themes', 'tokens']
    
    fieldsets = (
        ('Product Details', {
            'fields': ('product_id', 'product_name', 'rating')
        }),
        ('Review', {
            'fields': ('review_text',)
        }),
        ('Analysis Results', {
            'fields': ('sentiment_label', 'sentiment_confidence', 'themes')
        }),
        ('Metadata', {
            'fields': ('created_at', 'language', 'tokens', 'meta'),
            'classes': ('collapse',)
        }),
    )
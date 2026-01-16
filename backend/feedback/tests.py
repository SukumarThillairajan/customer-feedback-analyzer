"""
Unit and integration tests for feedback app.
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Feedback
from .sentiment_analyzer import analyze_sentiment, detect_themes
from django.conf import settings


class SentimentAnalyzerTests(TestCase):
    """Test sentiment analyzer functionality."""
    
    def test_positive_sentiment(self):
        """Test positive sentiment detection."""
        result = analyze_sentiment("Love this ring! It's excellent and perfect.")
        self.assertEqual(result['label'], 'Positive')
        self.assertGreater(result['score'], 0.2)
        self.assertGreater(result['confidence'], 0)
    
    def test_negative_sentiment(self):
        """Test negative sentiment detection."""
        result = analyze_sentiment("Terrible product. It broke after one day. Worst purchase ever.")
        self.assertEqual(result['label'], 'Negative')
        self.assertLess(result['score'], -0.2)
    
    def test_neutral_sentiment(self):
        """Test neutral sentiment detection."""
        result = analyze_sentiment("The product is okay.")
        self.assertEqual(result['label'], 'Neutral')
        self.assertGreaterEqual(result['score'], -0.2)
        self.assertLessEqual(result['score'], 0.2)
    
    def test_negation_handling(self):
        """Test negation handling."""
        result = analyze_sentiment("The ring is not comfortable")
        # Should detect "comfortable" but negated, so negative
        self.assertIn(result['label'], ['Negative', 'Neutral'])
    
    def test_empty_text(self):
        """Test empty text handling."""
        result = analyze_sentiment("")
        self.assertEqual(result['label'], 'Neutral')
        self.assertEqual(result['score'], 0.0)
    
    def test_debug_mode(self):
        """Test debug mode returns additional information."""
        result = analyze_sentiment("Love this!", debug=True)
        self.assertIn('tokens', result)
        self.assertIn('matched_words', result)
        self.assertIn('negations', result)


class ThemeDetectionTests(TestCase):
    """Test theme detection functionality."""
    
    def test_comfort_theme(self):
        """Test comfort theme detection."""
        themes = detect_themes("The ring feels heavy and uncomfortable")
        self.assertIn('Comfort', themes)
    
    def test_durability_theme(self):
        """Test durability theme detection."""
        themes = detect_themes("The bracelet broke after a week. Poor quality.")
        self.assertIn('Durability', themes)
    
    def test_appearance_theme(self):
        """Test appearance theme detection."""
        themes = detect_themes("Beautiful design and shiny finish")
        self.assertIn('Appearance', themes)
    
    def test_multiple_themes(self):
        """Test multiple theme detection."""
        themes = detect_themes("Love the elegant design but it feels heavy and broke quickly")
        self.assertGreaterEqual(len(themes), 2)
    
    def test_fallback_theme(self):
        """Test fallback to 'Other' theme."""
        themes = detect_themes("This is a generic comment")
        self.assertIn('Other', themes)


class FeedbackModelTests(TestCase):
    """Test Feedback model."""
    
    def test_feedback_creation(self):
        """Test creating feedback automatically analyzes sentiment."""
        feedback = Feedback.objects.create(
            product_id='Rings',
            rating=5,
            review_text='Love this ring! It\'s excellent.'
        )
        self.assertIsNotNone(feedback.sentiment_label)
        self.assertIsNotNone(feedback.sentiment_score)
        self.assertIsNotNone(feedback.sentiment_confidence)
        self.assertGreater(len(feedback.themes), 0)
    
    def test_feedback_to_dict(self):
        """Test feedback to_dict method."""
        feedback = Feedback.objects.create(
            product_id='Earrings',
            rating=4,
            review_text='Nice earrings'
        )
        data = feedback.to_dict()
        self.assertEqual(data['product_id'], 'Earrings')
        self.assertIn('sentiment', data)
        self.assertIn('themes', data)


class FeedbackAPITests(TestCase):
    """Test API endpoints."""
    
    def setUp(self):
        self.client = APIClient()
        self.admin_token = settings.ADMIN_TOKEN
    
    def test_submit_feedback_public(self):
        """Test public feedback submission."""
        url = '/api/feedback/'
        data = {
            'product_id': 'Rings',
            'rating': 5,
            'review_text': 'Great product!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('sentiment', response.data)
        self.assertIn('themes', response.data)
    
    def test_submit_feedback_validation(self):
        """Test feedback validation."""
        url = '/api/feedback/'
        # Invalid rating
        data = {
            'product_id': 'Rings',
            'rating': 10,
            'review_text': 'Test'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_all_feedback_requires_auth(self):
        """Test that getting all feedback requires authentication."""
        url = '/api/feedback/all/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_get_all_feedback_with_auth(self):
        """Test getting all feedback with authentication."""
        # Create some feedback
        Feedback.objects.create(
            product_id='Rings',
            rating=5,
            review_text='Great!'
        )
        
        url = '/api/feedback/all/'
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_aggregated_sentiment(self):
        """Test aggregated sentiment endpoint."""
        # Create feedback with different sentiments
        Feedback.objects.create(
            product_id='Rings',
            rating=5,
            review_text='Love it! Excellent product.'
        )
        Feedback.objects.create(
            product_id='Rings',
            rating=1,
            review_text='Terrible! Worst product ever.'
        )
        
        url = '/api/feedback/aggregated_sentiment/'
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('positive', response.data)
        self.assertIn('negative', response.data)
        self.assertIn('total', response.data)
    
    def test_aggregated_themes(self):
        """Test aggregated themes endpoint."""
        Feedback.objects.create(
            product_id='Rings',
            rating=4,
            review_text='Beautiful design but feels heavy'
        )
        
        url = '/api/feedback/aggregated_themes/'
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.admin_token}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)

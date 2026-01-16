from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
import json

class FeedbackAPIDebugTest(APITestCase):
    def test_submit_and_echo(self):
        # Using the list endpoint for creation as per standard DRF ViewSet routing
        url = '/api/feedback/' 
        payload = {
            "product_id": "Rings",
            "rating": 4,
            "review_text": "I love this ring - very comfortable and shiny."
        }
        resp = self.client.post(url, data=payload, format='json')
        # Print output for debugging
        print("\n=== Feedback submit response ===")
        print("status:", resp.status_code)
        
        # Use getattr to avoid Pylance "Cannot access attribute" error and handle non-DRF responses
        data = getattr(resp, 'data', None)
        if data is not None:
            print("data:", json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print("content:", resp.content.decode('utf-8', errors='replace'))
            
        assert resp.status_code in (200, 201)
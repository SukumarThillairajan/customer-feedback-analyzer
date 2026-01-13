"""
Seed script to populate sample feedback data for dashboard demos.
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'feedback_hub.settings')
django.setup()

from feedback.models import Feedback

# Sample feedback data
SAMPLE_FEEDBACK = [
    {
        'product_id': 'Rings',
        'rating': 5,
        'review_text': 'Love this ring! It\'s so elegant and shiny. Perfect for special occasions.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Rings',
        'rating': 4,
        'review_text': 'Beautiful design but it feels a bit heavy when worn for long periods.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Rings',
        'rating': 2,
        'review_text': 'The ring broke after just a few weeks. Poor quality and fragile.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Earrings',
        'rating': 5,
        'review_text': 'Stunning earrings! They look gorgeous and are very comfortable to wear.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Earrings',
        'rating': 3,
        'review_text': 'The design is nice but they feel heavy and uncomfortable after a while.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Necklaces',
        'rating': 5,
        'review_text': 'Excellent quality! The necklace is elegant and the finish is perfect.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Necklaces',
        'rating': 1,
        'review_text': 'Terrible! The chain broke on the first day. Very disappointed with the durability.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Bracelets',
        'rating': 4,
        'review_text': 'Good bracelet, fits well and looks beautiful. The polish is nice.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Bracelets',
        'rating': 3,
        'review_text': 'It\'s okay but not as shiny as I expected. The design is average.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Pendants',
        'rating': 5,
        'review_text': 'Amazing pendant! Love the design and it\'s very well made. Highly recommend!',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Pendants',
        'rating': 2,
        'review_text': 'The pendant looks dull and the quality is poor. Not worth the price.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Rings',
        'rating': 4,
        'review_text': 'Great ring! It\'s comfortable and the appearance is elegant. No complaints.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Earrings',
        'rating': 5,
        'review_text': 'Perfect earrings! They are light, comfortable, and absolutely beautiful.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Necklaces',
        'rating': 3,
        'review_text': 'The necklace is fine but feels heavy. The design could be better.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
    {
        'product_id': 'Bracelets',
        'rating': 5,
        'review_text': 'Outstanding bracelet! Excellent quality, durable, and looks fantastic.',
        'meta': {'source': 'seed', 'user_agent': 'seed-script'}
    },
]


def seed_feedback():
    """Create sample feedback entries."""
    print("Seeding feedback data...")
    
    created_count = 0
    for data in SAMPLE_FEEDBACK:
        feedback, created = Feedback.objects.get_or_create(
            product_id=data['product_id'],
            rating=data['rating'],
            review_text=data['review_text'],
            defaults={'meta': data['meta']}
        )
        if created:
            created_count += 1
            print(f"Created feedback: {feedback.product_id} - {feedback.rating}/5")
    
    print(f"\nSeeding complete! Created {created_count} new feedback entries.")
    print(f"Total feedback in database: {Feedback.objects.count()}")


if __name__ == '__main__':
    seed_feedback()

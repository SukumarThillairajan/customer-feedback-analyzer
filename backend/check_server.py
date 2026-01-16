"""
Quick script to check if the Django server is running and accessible.
"""
import requests
import sys

def check_backend():
    """Check if backend is accessible."""
    try:
        # Try to access the admin endpoint (should return 200 or 302)
        response = requests.get('http://localhost:8000/admin/', timeout=5)
        print("✅ Backend server is running on http://localhost:8000")
        print(f"   Status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is NOT running!")
        print("   Please start it with: python manage.py runserver")
        return False
    except requests.exceptions.Timeout:
        print("⏱️  Backend server is not responding (timeout)")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

if __name__ == '__main__':
    print("Checking backend server...")
    if check_backend():
        sys.exit(0)
    else:
        sys.exit(1)

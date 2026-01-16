# Feedback Hub - Customer Feedback Analyzer with Sentiment Dashboard

A feedback analysis system for jewelry e-commerce retailers that collects customer reviews, performs rule-based sentiment analysis, detects thematic patterns, and delivers actionable business insights through an interactive dashboard.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Technical Implementation](#technical-implementation)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

Feedback Hub is a full-stack application designed to streamline customer feedback analysis for e-commerce jewelry products. The system employs a sophisticated rule-based sentiment analysis engine (no external ML libraries) with weighted scoring, negation handling, and confidence metrics. It processes customer reviews to identify sentiment polarity, detect thematic concerns, and generate prioritized business recommendations.

**Use Case**: Product managers and customer success teams can monitor product performance across categories (rings, earrings, necklaces), identify quality issues early, and make data-driven decisions about product improvements or discontinuation.

## Key Features

### Core Functionality
- **Feedback Collection**: RESTful API for programmatic feedback submission with product association
- **Advanced Sentiment Analysis**: Multi-tier weighted scoring system with negation detection and confidence scoring
- **Theme Detection**: Multi-label classification across predefined categories (Comfort, Durability, Appearance)
- **Aggregated Analytics**: Pre-computed metrics for dashboard performance optimization
- **Insight Generation**: Rule-based recommendation engine with priority scoring and actionability matrix

### Technical Features
- **Authentication**: Token-based authentication for protected endpoints
- **Request Logging**: Comprehensive middleware logging for debugging and audit trails
- **CORS Configuration**: Secure cross-origin resource sharing for frontend-backend communication
- **Auto-refresh**: Frontend dashboard auto-updates every 30 seconds with manual refresh capability
- **Responsive Design**: Mobile-first Tailwind CSS implementation
- **Error Handling**: User-friendly error messages with backend connection diagnostics

## Screenshots

### Feedback Form
![Feedback Form](screenshots/feedback-form.png)
### Feedback Dashboard
![Feedback Dashboard](screenshots/feedback-dashboard.png)
### Charts
![Charts](screenshots/charts.png)
### Insights Generator
![Insight Generator](screenshots/insights-generator.png)

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  React SPA (Vite) + Tailwind CSS + Chart.js                 │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
                     │ (JSON over HTTPS)
┌────────────────────▼────────────────────────────────────────┐
│                     API Gateway Layer                       │
│  Django REST Framework + CORS + Token Auth                  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Business Logic Layer                      │
│  - Feedback Views (DRF ViewSets)                            │
│  - Sentiment Analyzer (Rule-based Engine)                   │
│  - Theme Detector (Keyword/Phrase Matching)                 │
│  - Aggregation Service (Pre-computed Metrics)               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Data Persistence Layer                   │
│  SQLite (Development) / PostgreSQL (Production)             │
│  Schema: Feedback (id, product_id, rating, review_text,     │
│          sentiment_json, themes_json, created_at)           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Submission**: User submits feedback via React form
2. **Processing**: Django serializer validates and saves to database
3. **Analysis**: On save, sentiment_analyzer.py processes review text
4. **Storage**: Sentiment and themes stored as JSON fields in Feedback model
5. **Aggregation**: Dashboard fetches pre-aggregated counts for performance
6. **Visualization**: React components render charts using Chart.js
7. **Insights**: Frontend applies rule-based logic to generate recommendations

## Technology Stack

### Backend
- **Framework**: Django 5.2+ with Django REST Framework 3.16+
- **Language**: Python 3.11+
- **Database**: SQLite (dev), PostgreSQL-ready (production)
- **Authentication**: Token-based authentication
- **CORS**: django-cors-headers for cross-origin requests

### Frontend
- **Framework**: React 18.2+ with Vite 4+
- **Styling**: Tailwind CSS 3.3+
- **HTTP Client**: Axios 1.4+
- **Charts**: Chart.js 4.3+ via react-chartjs-2
- **Build Tool**: Vite (ES modules, hot module replacement)

### DevOps
- **Containerization**: Docker + Docker Compose
- **Version Control**: Git
- **Package Management**: pip (Python), npm (JavaScript)

## Project Structure

```
GIVA_Dashboard/
├── backend/
│   ├── feedback_hub/              # Django project root
│   │   ├── settings.py            # Django settings (DB, CORS, REST config)
│   │   ├── urls.py                # URL routing
│   │   └── wsgi.py                # WSGI application entry point
│   ├── feedback/                  # Main application
│   │   ├── models.py              # Feedback data model
│   │   ├── views.py               # API endpoints (ViewSets)
│   │   ├── serializers.py         # DRF serializers for validation
│   │   ├── sentiment_analyzer.py  # Rule-based sentiment engine
│   │   ├── permissions.py         # AdminTokenPermission class
│   │   ├── middleware.py          # Request/response logging
│   │   └── tests.py               # Unit and integration tests
│   ├── scripts/
│   │   └── seed_data.py           # Database seeding script
│   ├── db.sqlite3                 # SQLite database (dev)
│   ├── Dockerfile                 # Backend Docker configuration
│   ├── requirements.txt           # Python dependencies
│   └── manage.py                  # Django management CLI
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── Dashboard.jsx      # Main dashboard container
│   │   │   ├── FeedbackForm.jsx   # Submission form
│   │   │   ├── SentimentChart.jsx # Pie chart visualization
│   │   │   ├── ThemeChart.jsx     # Bar chart visualization
│   │   │   ├── InsightGenerator.jsx  # Actionable insights UI
│   │   │   └── StatsCards.jsx     # Key metrics display
│   │   ├── services/
│   │   │   └── api.js             # Axios instance + API methods
│   │   ├── utils/
│   │   │   └── insights.js        # Insight generation logic
│   │   ├── App.jsx                # Root component
│   │   └── main.jsx               # Application entry point
│   ├── public/                    # Static assets
│   ├── index.html                 # HTML template
│   ├── package.json               # npm dependencies
│   ├── vite.config.js             # Vite configuration
│   └── tailwind.config.js         # Tailwind CSS configuration
├── Dockerfile                     # Root Docker configuration
├── docker-compose.yml             # Multi-container orchestration
├── requirements.txt               # Root requirements
├── .gitignore                     # Git ignore patterns
└── README.md                      # Project documentation
```

## Installation

### Prerequisites

Ensure the following are installed on your system:
- Python 3.11 or higher
- Node.js 18 or higher with npm
- Git
- (Optional) Docker 20+ and Docker Compose 2+

### Method 1: Local Development Setup

#### Backend Setup

1. Clone the repository and navigate to backend directory:
   ```bash
   git clone https://github.com/SukumarThillairajan/customer-feedback-analyzer.git
   cd customer-feedback-analyzer/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   
   # On Unix/macOS:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   
   Create `backend/.env`:
   ```env
   SECRET_KEY=django-insecure-your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ADMIN_TOKEN=dev-token-change-in-production
   DATABASE_URL=sqlite:///db.sqlite3
   ```

5. Initialize database:
   ```bash
   python manage.py migrate
   ```

6. (Optional) Load sample data:
   ```bash
   python scripts/seed_data.py
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```
   
   Backend API available at: `http://localhost:8000`

#### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   
   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_ADMIN_TOKEN=dev-token-change-in-production
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   Frontend application available at: `http://localhost:5173`

### Method 2: Docker Deployment (Recommended)

1. Create `.env` file in project root:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=*
   ADMIN_TOKEN=dev-token-change-in-production
   ```

2. Build and start containers:
   ```bash
   docker compose up --build
   ```

3. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - Admin Panel: `http://localhost:8000/admin`

4. Stop containers:
   ```bash
   docker compose down
   ```

## API Reference

### Authentication

Protected endpoints require an `Authorization` header:
```
Authorization: Token <ADMIN_TOKEN>
```

### Public Endpoints

#### Submit Feedback
```http
POST /api/feedback/
Content-Type: application/json

{
  "product_id": "Rings",
  "rating": 4,
  "review_text": "Beautiful design but slightly heavy for daily wear"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "product_id": "Rings",
  "rating": 4,
  "review_text": "Beautiful design but slightly heavy for daily wear",
  "sentiment": {
    "label": "Positive",
    "score": 0.25,
    "confidence": 0.78
  },
  "themes": ["Appearance", "Comfort"],
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Protected Endpoints

#### Get All Feedback
```http
GET /api/feedback/all/
Authorization: Token <admin_token>
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "product_id": "Rings",
    "rating": 4,
    "review_text": "Beautiful design but slightly heavy",
    "sentiment": {...},
    "themes": ["Appearance", "Comfort"],
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Get Product-Specific Feedback
```http
GET /api/feedback/product/{product_id}/
Authorization: Token <admin_token>
```

#### Get Aggregated Sentiment Metrics
```http
GET /api/feedback/aggregated_sentiment/
Authorization: Token <admin_token>
```

**Response** (200 OK):
```json
{
  "positive": 12,
  "negative": 3,
  "neutral": 2,
  "average_score": 0.35,
  "average_confidence": 0.76,
  "total": 17
}
```

#### Get Aggregated Theme Metrics
```http
GET /api/feedback/aggregated_themes/
Authorization: Token <admin_token>
```

**Response** (200 OK):
```json
{
  "Comfort": 8,
  "Durability": 5,
  "Appearance": 12,
  "Other": 2
}
```

#### Get Product Theme Distribution
```http
GET /api/feedback/aggregated/themes/{product_id}/
Authorization: Token <admin_token>
```

## Technical Implementation

### Sentiment Analysis Algorithm

The sentiment analyzer implements a weighted bag-of-words approach with negation handling. It does not use external ML libraries or pre-trained models.

#### Weighted Lexicon

The system maintains four dictionaries with assigned weights:

```python
STRONG_POSITIVE = {
    'love': 2, 'excellent': 2, 'perfect': 2, 'amazing': 2,
    'stunning': 2, 'gorgeous': 2, 'outstanding': 2
}

MODERATE_POSITIVE = {
    'shiny': 1, 'elegant': 1, 'comfortable': 1, 'premium': 1,
    'beautiful': 1, 'great': 1, 'good': 1, 'nice': 1
}

MODERATE_NEGATIVE = {
    'tarnish': -1, 'dull': -1, 'uncomfortable': -1, 'heavy': -1,
    'cheap': -1, 'poor': -1, 'disappointed': -1, 'fragile': -1
}

STRONG_NEGATIVE = {
    'broke': -2, 'broken': -2, 'terrible': -2, 'awful': -2,
    'worst': -2, 'horrible': -2, 'disgusting': -2, 'hate': -2
}
```

#### Processing Pipeline

1. **Preprocessing**:
   - Convert text to lowercase
   - Tokenize on whitespace
   - Preserve Unicode characters (for emoji support)
   - Remove punctuation while maintaining word boundaries

2. **Negation Detection**:
   - Identify negation words: `['not', 'never', 'no', "n't", "cannot", "can't", "won't", "don't"]`
   - Track positions of negation words in token sequence
   - Apply negation scope: 3 tokens after negation word

3. **Word Matching**:
   - Use regex word boundary matching: `\bword\b`
   - Prevents false matches (e.g., "great" shouldn't match "greatest")
   - Match each token against lexicon

4. **Weight Calculation**:
   - For each matched word, retrieve base weight
   - If word is within negation scope, invert weight: `final_weight = -base_weight`
   - Sum all final weights: `total_weight = Σ(final_weights)`

5. **Normalization**:
   - Normalize to [-1.0, 1.0] range: `score = clamp(total_weight / MAX_WEIGHT, -1, 1)`
   - `MAX_WEIGHT = 20` (heuristic based on maximum expected strong positive words)

6. **Label Assignment**:
   ```python
   if score > 0.2:
       label = "Positive"
   elif score < -0.1:
       label = "Negative"
   else:
       label = "Neutral"
   ```

7. **Confidence Calculation**:
   ```python
   match_count = number_of_matched_words
   text_length = total_tokens
   confidence = min(1.0, abs(score) + (match_count / max(1, text_length / 10)))
   ```

#### Example Analysis

**Input**: "Love the design but it's not comfortable at all"

**Processing**:
1. Tokens: `['love', 'the', 'design', 'but', "it's", 'not', 'comfortable', 'at', 'all']`
2. Negation positions: `[5]` (index of "not")
3. Matches:
   - `'love'` at position 0 → weight +2 (not negated)
   - `'comfortable'` at position 6 → weight +1, but negated (within 3 tokens after position 5) → final weight -1
4. Total weight: 2 + (-1) = 1
5. Score: 1 / 20 = 0.05
6. Label: "Neutral" (close to positive threshold)
7. Confidence: 0.65 (two matches, moderate text length)

**Output**:
```json
{
  "label": "Neutral",
  "score": 0.05,
  "confidence": 0.65
}
```

### Theme Detection Algorithm

Theme detection uses keyword and phrase matching with multi-label classification support.

#### Theme Definitions

```python
THEMES = {
    'Comfort': {
        'keywords': [
            'light', 'heavy', 'fit', 'fits', 'wearable',
            'comfortable', 'uncomfortable', 'weight', 'tight', 'loose'
        ],
        'phrases': [
            'easy to wear', 'hard to wear', 'comfortable to wear',
            'too heavy', 'too light', 'fits well', 'does not fit'
        ]
    },
    'Durability': {
        'keywords': [
            'broke', 'broken', 'strong', 'quality', 'fragile',
            'durable', 'durability', 'lasts', 'lasting', 'sturdy'
        ],
        'phrases': [
            'lasts long', 'broke after', 'high quality', 'poor quality',
            'falls apart', 'well made', 'poorly made'
        ]
    },
    'Appearance': {
        'keywords': [
            'shiny', 'dull', 'design', 'polish', 'beautiful',
            'elegant', 'ugly', 'looks', 'appearance', 'sparkle'
        ],
        'phrases': [
            'looks good', 'looks bad', 'beautiful design',
            'nice finish', 'poor finish', 'elegant design'
        ]
    }
}
```

#### Detection Logic

1. **Phrase Matching** (priority):
   - Check if any phrase from theme definition appears in review text
   - Uses substring matching: `if phrase in text.lower()`
   - More specific than keyword matching

2. **Keyword Matching**:
   - Use word boundary regex: `\bkeyword\b`
   - Prevents partial word matches
   - Applied only if no phrase match found

3. **Multi-Label Assignment**:
   - A review can belong to multiple themes
   - Each theme is evaluated independently
   - If no themes detected, assign `['Other']`

#### Example Detection

**Input**: "Beautiful ring but broke after 2 weeks, very disappointed"

**Analysis**:
- **Appearance**: `'beautiful'` keyword match → ✓
- **Durability**: `'broke'` keyword match → ✓
- **Comfort**: No matches → ✗

**Output**: `['Appearance', 'Durability']`

### Insight Generation Rules

The insight generator applies confidence-aware business rules to generate prioritized recommendations.

#### Rule Categories

1. **Sentiment-Based Rules**:
   ```python
   if average_score < -0.3 and average_confidence > 0.6:
       priority = "CRITICAL"
       action = "Immediate product review required"
   ```

2. **Theme-Based Rules**:
   ```python
   negative_durability_pct = (negative_durability / total_durability) * 100
   if negative_durability_pct > 40:
       priority = "HIGH"
       action = "Investigate manufacturing quality issues"
   ```

3. **Rating-Based Rules**:
   ```python
   if average_rating < 3.0:
       priority = "CRITICAL"
       action = "Consider product discontinuation or redesign"
   ```

4. **Contradiction Detection**:
   ```python
   if rating >= 4 and sentiment.label == "Negative" and sentiment.confidence > 0.5:
       insight = "High rating but negative text detected"
       action = "Review for specific fixable issues"
   ```

#### Priority Scoring

- **Critical**: Immediate action required (average_score < -0.3, average_rating < 2.5)
- **High**: Significant issues detected (negative > positive, average_rating < 3.5)
- **Medium**: Moderate concerns (quick wins, theme issues 30-50%)
- **Low**: Positive insights or minor observations

## Configuration

### Backend Configuration

#### Database Settings (`settings.py`)

Development (default):
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

Production (PostgreSQL):
```python
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL')
    )
}
```

#### CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]
```

#### REST Framework Settings

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}
```

### Frontend Configuration

#### Vite Configuration (`vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

#### Axios Configuration (`api.js`)

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

## Testing

### Backend Testing

Run all tests:
```bash
cd backend
python manage.py test
```

Run specific test module:
```bash
python manage.py test feedback.tests.test_sentiment
```

Run with coverage:
```bash
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Testing

Run tests:
```bash
cd frontend
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

### Manual Testing

#### Test Sentiment Analysis
```bash
cd backend
python
>>> from feedback.sentiment_analyzer import analyze_sentiment
>>> analyze_sentiment("Love this product but too heavy", debug=True)
```

#### Test API Endpoints
```bash
# Submit feedback
curl -X POST http://localhost:8000/api/feedback/ \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "Rings",
    "rating": 5,
    "review_text": "Absolutely stunning design!"
  }'

# Get aggregated sentiment (requires token)
curl -X GET http://localhost:8000/api/feedback/aggregated_sentiment/ \
  -H "Authorization: Token dev-token-change-in-production"
```

## Troubleshooting

### Common Issues

#### Backend Server Won't Start

**Error**: `ModuleNotFoundError: No module named 'rest_framework'`

**Solution**:
```bash
pip install -r requirements.txt
```

#### Database Migration Errors

**Error**: `django.db.utils.OperationalError: no such table`

**Solution**:
```bash
python manage.py migrate --run-syncdb
```

#### CORS Errors in Browser Console

**Error**: `Access to XMLHttpRequest at 'http://localhost:8000/api/feedback/' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solution**: Verify `CORS_ALLOWED_ORIGINS` in `settings.py` includes your frontend URL.

#### Frontend Can't Connect to Backend

**Error**: `Network error: Cannot connect to backend server`

**Solution**:
1. Verify backend is running on port 8000
2. Check `VITE_API_URL` in `.env` matches backend URL
3. Check firewall settings

#### Authentication Errors

**Error**: `401 Unauthorized` on protected endpoints

**Solution**: Verify `VITE_ADMIN_TOKEN` in frontend `.env` matches `ADMIN_TOKEN` in backend `.env`.

### Logging

Backend logs all requests via middleware. Check console output for:
- Request method and path
- Response status code
- Processing time

## License

MIT License - See LICENSE file for details.

## Author

Sukumar Thillairajan

**Connect**:
- GitHub: [@SukumarThillairajan](https://github.com/SukumarThillairajan)
- LinkedIn: [T Sukumar](https://www.linkedin.com/in/t-sukumar-aa0931290/)

## Acknowledgments

- Django REST Framework documentation
- React and Vite communities
- Chart.js visualization library
- Tailwind CSS framework

---

**Project Status**: Active Development

This project demonstrates full-stack development capabilities, rule-based NLP implementation, and business intelligence visualization for e-commerce applications.

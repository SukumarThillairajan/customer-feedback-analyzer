# GIVA Feedback Hub - Customer Feedback Analyzer with Sentiment Dashboard

A comprehensive feedback analysis system for GIVA jewelry brand that collects customer reviews, analyzes sentiment using rule-based logic, detects themes, and provides actionable insights through an interactive dashboard.

## Features

- **Feedback Submission**: Simple form to submit product feedback (product ID, rating, review text)
- **Advanced Sentiment Analysis**: Rule-based sentiment analyzer with weighted scoring, negation handling, and confidence calculation
- **Theme Detection**: Multi-label theme detection (Comfort, Durability, Appearance) with phrase matching
- **Interactive Dashboard**: Real-time sentiment visualization with pie charts and theme distribution
- **Insight Generator**: Confidence-aware rules that generate actionable recommendations
- **RESTful API**: Django REST Framework backend with aggregated endpoints for efficient data loading
- **Modern Frontend**: React + Tailwind CSS with Chart.js visualizations

## Architecture

- **Backend**: Django REST Framework (Python)
- **Database**: SQLite
- **Frontend**: React + Vite + Tailwind CSS
- **Charts**: Chart.js (via react-chartjs-2)

## Project Structure

```
GIVA_Dashboard/
├── backend/
│   ├── feedback_hub/          # Django project settings
│   ├── feedback/              # Feedback app
│   │   ├── models.py          # Feedback model
│   │   ├── views.py           # API views
│   │   ├── serializers.py     # DRF serializers
│   │   ├── sentiment_analyzer.py  # Sentiment analysis engine
│   │   ├── permissions.py     # Authentication
│   │   └── middleware.py      # Request logging
│   ├── scripts/
│   │   └── seed_data.py       # Seed script for sample data
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API service layer
│   │   └── utils/             # Utility functions
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- (Optional) Docker and Docker Compose

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ADMIN_TOKEN=dev-token-change-in-production
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **(Optional) Seed sample data:**
   ```bash
   python scripts/seed_data.py
   ```

7. **Start development server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_ADMIN_TOKEN=dev-token-change-in-production
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Docker Setup (Alternative)

1. **Create `.env` file in project root:**
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=*
   ADMIN_TOKEN=dev-token-change-in-production
   ```

2. **Start services:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

## API Endpoints

### Public Endpoints

- `POST /api/feedback/` - Submit feedback
  ```json
  {
    "product_id": "Rings",
    "rating": 4,
    "review_text": "Love the design!"
  }
  ```

### Protected Endpoints (Require Admin Token)

All protected endpoints require `Authorization: Token <admin_token>` header.

- `GET /api/feedback/all/` - Get all feedback
- `GET /api/feedback/product/<product_id>/` - Get feedback for a product
- `GET /api/feedback/aggregated_sentiment/` - Get sentiment counts
  ```json
  {
    "positive": 10,
    "negative": 3,
    "neutral": 2,
    "average_score": 0.45,
    "average_confidence": 0.72,
    "total": 15
  }
  ```
- `GET /api/feedback/aggregated_themes/` - Get theme counts
  ```json
  {
    "Comfort": 5,
    "Durability": 3,
    "Appearance": 8,
    "Other": 1
  }
  ```
- `GET /api/feedback/aggregated/themes/<product_id>/` - Get theme counts for a product

## How Sentiment Analysis Works

The sentiment analyzer uses a rule-based approach with the following features:

### Weighted Word Lists

- **Strong Positive (+2)**: love, excellent, perfect, amazing, stunning, gorgeous
- **Moderate Positive (+1)**: shiny, elegant, comfortable, premium, beautiful, great
- **Moderate Negative (-1)**: tarnish, dull, uncomfortable, heavy, cheap, poor
- **Strong Negative (-2)**: broke, broken, terrible, awful, worst, horrible

### Scoring Logic

1. **Word Boundary Matching**: Uses regex `\bword\b` to avoid substring mistakes
2. **Negation Handling**: If a positive word appears within 3 tokens after "not", "never", "no", etc., its polarity is inverted
3. **Score Calculation**: 
   - Sum all weighted matches (accounting for negations)
   - Normalize to -1.0 to +1.0 range: `score = clamp(sum_weights / max_possible_weight, -1, 1)`
4. **Label Assignment**:
   - `score > 0.2` → "Positive"
   - `score < -0.2` → "Negative"
   - Otherwise → "Neutral"
5. **Confidence**: Based on number of matches and score magnitude

### Example

```
Review: "Love the design but it's not comfortable"
- "love" → +2
- "design" → no match
- "not comfortable" → "comfortable" negated → -1 (instead of +1)
- Total: +1
- Score: 0.05 → "Neutral" (close to positive)
```

## Theme Detection

Themes are detected using keyword and phrase matching:

- **Comfort**: light, heavy, fit, comfortable, wearable, weight, "easy to wear"
- **Durability**: broke, strong, quality, fragile, durable, "lasts long", "high quality"
- **Appearance**: shiny, dull, design, polish, beautiful, elegant, "looks good"

A review can belong to multiple themes. If no themes are detected, "Other" is assigned.

## Insight Generator Rules

The insight generator uses confidence-aware rules:

1. **Durability Issues**: If >40% negative durability reviews with confidence ≥ 0.6
2. **Comfort Issues**: If >50% comfort issues
3. **Appearance Issues**: If >60% negative appearance reviews with confidence ≥ 0.6
4. **Low Rating**: If average rating < 3.0
5. **Positive Sentiment**: If >70% positive reviews or average score > 0.5

## Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Development Notes

- The sentiment analyzer includes a debug mode (set `debug=True` in `analyze_sentiment()`)
- All API requests are logged via middleware
- Frontend uses optimistic updates for better UX
- Dashboard auto-refreshes every 30 seconds with manual refresh option

## Screenshots

(Add screenshots of the dashboard here)

## License

This project is created for GIVA internship assignment.

## Author

Created for GIVA Feedback Hub assignment.

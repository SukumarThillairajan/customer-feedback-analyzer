"""
Advanced rule-based sentiment analyzer with weighted scoring, negation handling, and debug mode.
"""
import re
import logging

logger = logging.getLogger(__name__)

# Weighted word dictionaries
STRONG_POSITIVE = {
    'love': 2, 'excellent': 2, 'perfect': 2, 'amazing': 2, 
    'stunning': 2, 'gorgeous': 2, 'outstanding': 2, 'brilliant': 2,
    'fantastic': 2, 'wonderful': 2, 'marvelous': 2, 'superb': 2
}

MODERATE_POSITIVE = {
    'shiny': 1, 'elegant': 1, 'comfortable': 1, 'premium': 1,
    'beautiful': 1, 'great': 1, 'good': 1, 'nice': 1, 'fine': 1,
    'pretty': 1, 'lovely': 1, 'satisfied': 1, 'pleased': 1,
    'happy': 1, 'satisfactory': 1, 'decent': 1
}

MODERATE_NEGATIVE = {
    'tarnish': -1, 'dull': -1, 'uncomfortable': -1, 'heavy': -1,
    'cheap': -1, 'poor': -1, 'disappointed': -1, 'fragile': -1,
    'ugly': -1, 'bad': -1, 'unhappy': -1, 'unsatisfied': -1,
    'mediocre': -1, 'average': -1, 'okay': -1, 'ok': -1
}

STRONG_NEGATIVE = {
    'broke': -2, 'broken': -2, 'terrible': -2, 'awful': -2,
    'worst': -2, 'horrible': -2, 'disgusting': -2, 'hate': -2,
    'useless': -2, 'waste': -2, 'defective': -2, 'damaged': -2
}

# Combine all dictionaries for lookup
ALL_WORDS = {**STRONG_POSITIVE, **MODERATE_POSITIVE, **MODERATE_NEGATIVE, **STRONG_NEGATIVE}

# Negation words
NEGATION_WORDS = ['not', 'never', 'no', "n't", 'cannot', "can't", "won't", "don't", "didn't", "isn't", "aren't", "wasn't", "weren't"]

# Maximum possible weight (for normalization)
MAX_POSSIBLE_WEIGHT = 20  # Heuristic: assume max 10 strong positive words


def preprocess_text(text):
    """
    Preprocess text: strip punctuation but preserve emoji, convert to lowercase, tokenize.
    Returns list of tokens.
    """
    if not text:
        return []
    
    # Preserve emoji by keeping unicode characters
    # Remove punctuation but keep spaces and alphanumeric + emoji
    text = re.sub(r'[^\w\s\U0001F300-\U0001F9FF]', ' ', text)
    
    # Convert to lowercase and split
    tokens = text.lower().split()
    
    # Filter out empty strings
    tokens = [t for t in tokens if t.strip()]
    
    return tokens


def analyze_sentiment(review_text, debug=False):
    """
    Analyze sentiment of review text using weighted scoring with negation handling.
    
    Args:
        review_text: The review text to analyze
        debug: If True, return debug information
    
    Returns:
        dict with keys: label, score, confidence, tokens (if debug=True)
    """
    if not review_text or not review_text.strip():
        result = {
            'label': 'Neutral',
            'score': 0.0,
            'confidence': 0.0
        }
        if debug:
            result['tokens'] = []
            result['matched_words'] = []
            result['negations'] = []
        return result
    
    tokens = preprocess_text(review_text)
    
    if not tokens:
        result = {
            'label': 'Neutral',
            'score': 0.0,
            'confidence': 0.0
        }
        if debug:
            result['tokens'] = []
            result['matched_words'] = []
            result['negations'] = []
        return result
    
    # Track matched words and their positions
    matched_words = []
    total_weight = 0
    
    # Find negation positions
    negation_positions = []
    for i, token in enumerate(tokens):
        # Check for negation words (with word boundaries)
        if re.search(r'\b(?:' + '|'.join(re.escape(nw) for nw in NEGATION_WORDS) + r')\b', token):
            negation_positions.append(i)
    
    # Check each token against word dictionary
    for i, token in enumerate(tokens):
        # Use word boundary matching
        for word, weight in ALL_WORDS.items():
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, token):
                # Check if within 3 tokens after a negation
                is_negated = False
                for neg_pos in negation_positions:
                    if i > neg_pos and i <= neg_pos + 3:
                        is_negated = True
                        break
                
                # Invert weight if negated
                final_weight = -weight if is_negated else weight
                total_weight += final_weight
                
                matched_words.append({
                    'word': word,
                    'token': token,
                    'position': i,
                    'weight': weight,
                    'final_weight': final_weight,
                    'negated': is_negated
                })
                break  # Only match once per token
    
    # Normalize score to -1.0 to +1.0 range
    score = max(-1.0, min(1.0, total_weight / MAX_POSSIBLE_WEIGHT))
    
    # Determine label based on thresholds
    if score > 0.2:
        label = 'Positive'
    elif score < -0.2:
        label = 'Negative'
    else:
        label = 'Neutral'
    
    # Calculate confidence
    # Based on number of matches and score magnitude
    match_count = len(matched_words)
    text_length = len(tokens)
    confidence = min(1.0, abs(score) + (match_count / max(1, text_length / 10)))
    
    result = {
        'label': label,
        'score': round(score, 3),
        'confidence': round(confidence, 3)
    }
    
    if debug:
        result['tokens'] = tokens
        result['matched_words'] = matched_words
        result['negations'] = [{'position': pos, 'word': tokens[pos]} for pos in negation_positions]
        result['total_weight'] = total_weight
        result['normalized_score'] = score
    
    return result


def detect_themes(review_text):
    """
    Detect themes in review text using phrase matching and keyword matching.
    Returns list of detected themes.
    """
    if not review_text:
        return ['Other']
    
    text_lower = review_text.lower()
    detected_themes = []
    
    # Theme definitions with keywords and phrases
    themes = {
        'Comfort': {
            'keywords': ['light', 'heavy', 'fit', 'fits', 'fitting', 'wearable', 
                        'comfortable', 'uncomfortable', 'weight', 'weighs', 'weighed', 
                        'feels', 'feeling', 'wear', 'wearing'],
            'phrases': ['easy to wear', 'hard to wear', 'comfortable to wear', 
                       'uncomfortable to wear', 'feels good', 'feels bad', 
                       'too heavy', 'too light']
        },
        'Durability': {
            'keywords': ['broke', 'broken', 'break', 'breaks', 'strong', 'strength', 
                        'quality', 'fragile', 'durable', 'durability', 'lasts', 
                        'lasting', 'sturdy', 'sturdiness', 'weak', 'weakness', 
                        'crack', 'cracked', 'damage', 'damaged'],
            'phrases': ['lasts long', 'broke after', 'high quality', 'poor quality', 
                       'good quality', 'bad quality', 'falls apart', 'well made']
        },
        'Appearance': {
            'keywords': ['shiny', 'shine', 'dull', 'design', 'designed', 'polish', 
                        'polished', 'beautiful', 'elegant', 'elegance', 'ugly', 
                        'looks', 'look', 'appearance', 'finish', 'finished', 
                        'color', 'colour', 'sparkle', 'sparkling'],
            'phrases': ['looks good', 'looks bad', 'beautiful design', 'nice finish', 
                       'poor finish', 'elegant design', 'ugly design']
        }
    }
    
    # Check each theme
    for theme_name, theme_data in themes.items():
        found = False
        
        # Check phrases first (more specific)
        for phrase in theme_data['phrases']:
            if phrase in text_lower:
                found = True
                break
        
        # Check keywords with word boundaries
        if not found:
            for keyword in theme_data['keywords']:
                pattern = r'\b' + re.escape(keyword) + r'\b'
                if re.search(pattern, text_lower):
                    found = True
                    break
        
        if found:
            detected_themes.append(theme_name)
    
    # Fallback to "Other" if no themes detected
    if not detected_themes:
        detected_themes = ['Other']
    
    return detected_themes

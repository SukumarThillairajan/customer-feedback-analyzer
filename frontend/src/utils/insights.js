/**
 * Insight generation utility functions with confidence-aware rules.
 */

/**
 * Generate insights based on aggregated data.
 * @param {Object} sentimentData - Aggregated sentiment data
 * @param {Object} themeData - Aggregated theme data
 * @param {Array} allFeedback - All feedback data (optional, for detailed insights)
 * @returns {Array} Array of insight objects
 */
export const generateInsights = (sentimentData, themeData, allFeedback = []) => {
  const insights = [];
  
  if (!sentimentData || !themeData) {
    return insights;
  }
  
  const total = sentimentData.total || 0;
  const positive = sentimentData.positive || 0;
  const negative = sentimentData.negative || 0;
  const neutral = sentimentData.neutral || 0;
  const avgScore = sentimentData.average_score || 0;
  const avgConfidence = sentimentData.average_confidence || 0;
  
  // Rule 1: Strong positive sentiment
  if (avgScore > 0.2) {
    insights.push({
      type: 'positive',
      message: `Strong positive sentiment: average score ${avgScore.toFixed(2)}`,
      confidence: avgConfidence,
      priority: 'high'
    });
  }
  
  // Rule 2: Negative sentiment trend
  if (avgScore < -0.1) {
    insights.push({
      type: 'negative',
      message: `Negative sentiment trend: average score ${avgScore.toFixed(2)}. Consider product review.`,
      confidence: avgConfidence,
      priority: 'high'
    });
  }
  
  // Rule 3: High positive percentage
  if (total > 0 && (positive / total) > 0.6) {
    const percentage = ((positive / total) * 100).toFixed(1);
    insights.push({
      type: 'positive',
      message: `Product is well-received: ${percentage}% positive reviews`,
      confidence: avgConfidence,
      priority: 'medium'
    });
  }

  // Rule: Mixed Sentiment
  if (total >= 2 && positive > 0 && negative > 0) {
    insights.push({
      type: 'neutral',
      message: `Mixed feedback detected: ${positive} positive and ${negative} negative reviews.`,
      confidence: avgConfidence,
      priority: 'medium'
    });
  }
  
  // Rule 4: Low average rating (if we have feedback data)
  if (allFeedback.length > 0) {
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    if (avgRating < 3.5) {
      insights.push({
        type: 'negative',
        message: `Low average rating: ${avgRating.toFixed(1)}/5.0 - consider product review`,
        confidence: 0.8,
        priority: 'high'
      });
    }
  }
  
  // Rule 5: Theme-specific insights
  const durabilityTotal = Object.keys(themeData).reduce((sum, theme) => {
    if (theme.toLowerCase().includes('durability')) {
      return sum + (themeData[theme] || 0);
    }
    return sum;
  }, 0);
  
  if (durabilityTotal > 0 && allFeedback.length > 0) {
    // Count negative durability reviews
    const negativeDurability = allFeedback.filter(f => 
      f.themes.some(t => t.toLowerCase().includes('durability')) &&
      f.sentiment.label === 'Negative' &&
      f.sentiment.confidence >= 0.6
    ).length;
    
    const percentage = (negativeDurability / durabilityTotal) * 100;
    if (percentage > 40) {
      insights.push({
        type: 'durability',
        message: `Investigate durability: ${negativeDurability} negative reviews (${percentage.toFixed(1)}%)`,
        confidence: avgConfidence,
        priority: 'high'
      });
    }
  }
  
  // Rule 6: Comfort issues
  const comfortTotal = Object.keys(themeData).reduce((sum, theme) => {
    if (theme.toLowerCase().includes('comfort')) {
      return sum + (themeData[theme] || 0);
    }
    return sum;
  }, 0);
  
  if (comfortTotal > 0 && allFeedback.length > 0) {
    const comfortIssues = allFeedback.filter(f => 
      f.themes.some(t => t.toLowerCase().includes('comfort')) &&
      (f.sentiment.label === 'Negative' || f.review_text.toLowerCase().includes('heavy') || f.review_text.toLowerCase().includes('uncomfortable'))
    ).length;
    
    const percentage = (comfortIssues / comfortTotal) * 100;
    if (percentage > 50) {
      insights.push({
        type: 'comfort',
        message: `Consider lighter designs for better comfort: ${comfortIssues} comfort issues (${percentage.toFixed(1)}%)`,
        confidence: avgConfidence,
        priority: 'medium'
      });
    }
  }
  
  // Rule 7: Appearance issues
  const appearanceTotal = Object.keys(themeData).reduce((sum, theme) => {
    if (theme.toLowerCase().includes('appearance')) {
      return sum + (themeData[theme] || 0);
    }
    return sum;
  }, 0);
  
  if (appearanceTotal > 0 && allFeedback.length > 0) {
    const negativeAppearance = allFeedback.filter(f => 
      f.themes.some(t => t.toLowerCase().includes('appearance')) &&
      f.sentiment.label === 'Negative' &&
      f.sentiment.confidence >= 0.6
    ).length;
    
    const percentage = (negativeAppearance / appearanceTotal) * 100;
    if (percentage > 60) {
      insights.push({
        type: 'appearance',
        message: `Review product design and finish quality: ${negativeAppearance} negative appearance reviews (${percentage.toFixed(1)}%)`,
        confidence: avgConfidence,
        priority: 'high'
      });
    }
  }
  
  return insights;
};

import React, { useState } from 'react';

/**
 * Advanced Insight Generator
 * Implements multi-dimensional analysis of sentiment, ratings, and themes.
 */
const InsightGenerator = ({ sentimentData, themeData, allFeedback, onRefresh }) => {
  const [insights, setInsights] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // --- Analysis Helper Functions ---

  /**
   * 1. Overall Sentiment Health Analysis
   * Checks the global pulse of customer feedback.
   */
  const analyzeOverallHealth = (sData) => {
    const results = [];
    if (!sData) return results;

    const { total, positive, negative } = sData;

    // High: Negative outweighs positive
    if (negative > positive) {
      results.push({
        category: "Overall Health",
        type: "warning",
        message: "Negative Feedback Outweighs Positive",
        detail: `${negative} negative vs ${positive} positive reviews.`,
        action: "Investigate recent product batches or service issues.",
        priority: "high",
        confidence: 0.85,
        impact: "high",
        effort: "medium"
      });
    }

    return results;
  };

  /**
   * 2. Theme-Specific Insights
   * Uses smart thresholds to detect specific product issues.
   */
  const analyzeThemes = (tData, feedback) => {
    const results = [];
    if (!tData || !feedback || feedback.length === 0) return results;

    // Helper to get negative count for a theme
    const getThemeStats = (themeName) => {
      const themeReviews = feedback.filter(f => 
        f.themes && f.themes.includes(themeName)
      );
      const total = themeReviews.length;
      if (total === 0) return null;

      const negative = themeReviews.filter(f => 
        f.sentiment.label === 'Negative'
      ).length;

      return { total, negative, percentage: (negative / total) * 100 };
    };

    // Durability Analysis (Threshold: >40% negative)
    const durability = getThemeStats('Durability');
    if (durability && durability.percentage > 40) {
      results.push({
        category: "Product Quality",
        type: "durability",
        message: "High Durability Concerns",
        detail: `${durability.percentage.toFixed(1)}% of durability mentions are negative (${durability.negative}/${durability.total}).`,
        action: "Review manufacturing quality control and material strength.",
        priority: "high",
        confidence: 0.85,
        impact: "high",
        effort: "high"
      });
    }

    // Comfort Analysis (Threshold: >30% negative)
    const comfort = getThemeStats('Comfort');
    if (comfort && comfort.percentage > 30) {
      results.push({
        category: "Product Design",
        type: "comfort",
        message: "Comfort Issues Detected",
        detail: `${comfort.percentage.toFixed(1)}% of comfort mentions are negative.`,
        action: "Evaluate product weight and fit.",
        priority: "medium",
        confidence: 0.8,
        impact: "medium",
        effort: "medium"
      });
    }

    // Appearance Analysis (Threshold: >60% negative)
    const appearance = getThemeStats('Appearance');
    if (appearance && appearance.percentage > 60) {
      results.push({
        category: "Aesthetics",
        type: "appearance",
        message: "Appearance/Finish Dissatisfaction",
        detail: `Significant dissatisfaction with product look (${appearance.percentage.toFixed(1)}% negative).`,
        action: "Check finishing process and product photography accuracy.",
        priority: "high",
        confidence: 0.9,
        impact: "high",
        effort: "medium"
      });
    }

    return results;
  };

  /**
   * 3. Rating Analysis
   * Analyzes star ratings independent of text sentiment.
   */
  const analyzeRatings = (feedback) => {
    const results = [];
    if (!feedback || feedback.length === 0) return results;

    const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;

    if (avgRating < 2.5) {
      results.push({
        category: "Rating Health",
        type: "rating",
        message: "Critical Rating Drop",
        detail: `Average rating is dangerously low (${avgRating.toFixed(1)}/5.0).`,
        action: "Emergency audit of product line required.",
        priority: "critical",
        confidence: 1.0,
        impact: "high",
        effort: "high"
      });
    } else if (avgRating < 3.5) {
      results.push({
        category: "Rating Health",
        type: "rating",
        message: "Below Average Ratings",
        detail: `Average rating (${avgRating.toFixed(1)}) indicates room for improvement.`,
        action: "Analyze 1-2 star reviews for recurring patterns.",
        priority: "high",
        confidence: 1.0,
        impact: "high",
        effort: "medium"
      });
    }

    return results;
  };

  /**
   * 4. Contradiction Detection
   * Finds discrepancies between star ratings and text sentiment.
   */
  const detectContradictions = (feedback) => {
    const results = [];
    if (!feedback) return results;

    // High Rating (4-5) but Negative Sentiment
    const happyButSad = feedback.filter(f => 
      f.rating >= 4 && 
      f.sentiment.label === 'Negative' && 
      f.sentiment.confidence > 0.5
    );

    if (happyButSad.length > 0) {
      results.push({
        category: "Data Anomaly",
        type: "contradiction",
        message: "Rating/Sentiment Contradiction (Positive Rating, Negative Text)",
        detail: `${happyButSad.length} reviews have high ratings but negative text.`,
        action: "Read these reviews manually - customers might be sarcastic or mixed.",
        priority: "medium",
        confidence: 0.7,
        impact: "low",
        effort: "low"
      });
    }

    // Low Rating (1-2) but Positive Sentiment
    const sadButHappy = feedback.filter(f => 
      f.rating <= 2 && 
      f.sentiment.label === 'Positive' && 
      f.sentiment.confidence > 0.5
    );

    if (sadButHappy.length > 0) {
      results.push({
        category: "Data Anomaly",
        type: "contradiction",
        message: "Rating/Sentiment Contradiction (Negative Rating, Positive Text)",
        detail: `${sadButHappy.length} reviews have low ratings but positive text.`,
        action: "Check for delivery/service issues unrelated to product quality.",
        priority: "medium",
        confidence: 0.7,
        impact: "low",
        effort: "low"
      });
    }

    return results;
  };

  /**
   * 5. Product-Level Insights
   * Groups feedback by product to find best/worst performers.
   */
  const analyzeByProduct = (feedback) => {
    const results = [];
    if (!feedback) return results;

    // Group by product_id
    const productStats = {};
    feedback.forEach(f => {
      if (!productStats[f.product_id]) {
        productStats[f.product_id] = { count: 0, totalRating: 0, negativeCount: 0 };
      }
      productStats[f.product_id].count++;
      productStats[f.product_id].totalRating += f.rating;
      if (f.sentiment.label === 'Negative') productStats[f.product_id].negativeCount++;
    });

    // Analyze each product
    Object.entries(productStats).forEach(([pid, stats]) => {
      if (stats.count < 2) return; // Skip products with insufficient data

      const avgRating = stats.totalRating / stats.count;
      const negPercent = (stats.negativeCount / stats.count) * 100;

      // Problem Product
      if (avgRating < 3.0 && negPercent > 50) {
        results.push({
          category: "Product Performance",
          type: "product",
          message: `Underperforming Product: ${pid}`,
          detail: `Avg Rating: ${avgRating.toFixed(1)}, Negative Feedback: ${negPercent.toFixed(0)}%.`,
          action: `Consider halting sales or redesigning ${pid}.`,
          priority: "critical",
          confidence: 0.9,
          impact: "high",
          effort: "high"
        });
      }

      // Star Product
      if (avgRating >= 4.5 && stats.count >= 3) {
        results.push({
          category: "Product Performance",
          type: "star",
          message: `Star Product: ${pid}`,
          detail: `Excellent performance with ${avgRating.toFixed(1)} average rating.`,
          action: "Promote this product in marketing campaigns.",
          priority: "low",
          confidence: 0.9,
          impact: "high",
          effort: "low"
        });
      }
    });

    return results;
  };

  /**
   * 6. Quick Win Identification
   * Keyword matching for actionable, low-effort fixes.
   */
  const identifyQuickWins = (feedback) => {
    const results = [];
    if (!feedback) return results;

    const patterns = [
      { phrase: "too heavy", action: "Use lighter materials or hollow design", effort: "medium", impact: "high" },
      { phrase: "packaging", action: "Improve packaging quality/presentation", effort: "low", impact: "medium" },
      { phrase: "instructions", action: "Provide clearer care guide/manual", effort: "low", impact: "medium" },
      { phrase: "arrived damaged", action: "Enhance shipping protection/padding", effort: "low", impact: "high" },
      { phrase: "tarnish", action: "Add anti-tarnish coating or care kit", effort: "low", impact: "high" },
      { phrase: "clasp", action: "Inspect clasp mechanism quality", effort: "medium", impact: "high" }
    ];

    patterns.forEach(pattern => {
      const matches = feedback.filter(f => 
        f.review_text.toLowerCase().includes(pattern.phrase)
      );

      if (matches.length >= 2) {
        results.push({
          category: "Quick Win",
          type: "quick-win",
          message: `Recurring Issue: "${pattern.phrase}"`,
          detail: `Mentioned in ${matches.length} reviews.`,
          action: pattern.action,
          priority: "medium",
          confidence: 0.85,
          impact: pattern.impact,
          effort: pattern.effort
        });
      }
    });

    return results;
  };

  // --- Main Generation Logic ---

  const handleGenerateInsights = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      console.log('[insights] starting generation'); // DEBUG

      // Defensive: Fetch data if missing
      let sData = sentimentData;
      let tData = themeData;
      let fData = allFeedback;

      if (!sData || !tData || !fData || fData.length === 0) {
        if (onRefresh) {
          console.log('Data missing, fetching fresh data...'); // DEBUG
          const data = await onRefresh();
          if (data) {
            sData = data.sentiment;
            tData = data.themes;
            fData = data.feedback;
          }
        }
      }

      if (!sData || !tData || !fData) {
        throw new Error("Insufficient data to generate insights.");
      }

      // Run all analysis modules
      const allInsights = [
        ...analyzeOverallHealth(sData),
        ...analyzeThemes(tData, fData),
        ...analyzeRatings(fData),
        ...detectContradictions(fData),
        ...analyzeByProduct(fData),
        ...identifyQuickWins(fData)
      ];

      // Sort by priority (Critical -> High -> Medium -> Low)
      const priorityScore = { critical: 3, high: 2, medium: 1, low: 0 };
      allInsights.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

      console.log('[insights] got', allInsights); // DEBUG
      setInsights(allInsights);
      setShowInsights(true);

    } catch (err) {
      console.error('[insights] error', err);
      setError(err?.message || 'Unknown error generating insights');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- UI Helpers ---

  const getPriorityBadge = (priority) => {
    // Professional, neutral styling
    const baseClass = "px-2 py-1 rounded text-xs font-medium border uppercase tracking-wide";
    let styles = "bg-gray-100 text-gray-700 border-gray-200";
    
    if (priority === 'critical') styles = "bg-red-50 text-red-700 border-red-200";
    else if (priority === 'high') styles = "bg-orange-50 text-orange-700 border-orange-200";
    else if (priority === 'medium') styles = "bg-yellow-50 text-yellow-700 border-yellow-200";
    else if (priority === 'low') styles = "bg-blue-50 text-blue-700 border-blue-200";

    return (
      <span className={`${baseClass} ${styles}`}>
        {priority}
      </span>
    );
  };

  const getMetricBadge = (label, value, type) => {
    return (
      <span className="ml-4 text-xs text-gray-600">
        <span className="font-medium text-gray-500 mr-1">{label}:</span>
        {value}
      </span>
    );
  };

  // --- Render ---

  const counts = insights.reduce((acc, curr) => {
    acc[curr.priority] = (acc[curr.priority] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Insights Engine</h2>
          <p className="text-sm text-gray-500 mt-1">Automated analysis of sentiment, themes, and ratings</p>
        </div>
        <button
          onClick={handleGenerateInsights}
          disabled={isGenerating}
          className={`px-6 py-2 rounded-lg font-semibold text-white shadow-sm transition-all ${
            isGenerating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md active:transform active:scale-95'
          } transition-colors`}
        >
          {isGenerating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-bold">Analysis Error</p>
          <p>{error}</p>
        </div>
      )}

      {showInsights && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Header */}
          {insights.length > 0 ? (
            <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-200">
              {counts.critical > 0 && <span className="text-sm font-medium text-red-700">{counts.critical} Critical</span>}
              {counts.high > 0 && <span className="text-sm font-medium text-orange-700">{counts.high} High Priority</span>}
              {counts.medium > 0 && <span className="text-sm font-medium text-yellow-700">{counts.medium} Medium</span>}
              {counts.low > 0 && <span className="text-sm font-medium text-blue-700">{counts.low} Low Priority</span>}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 italic">No significant insights detected based on current thresholds.</p>
          )}

          {/* Insight Cards */}
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-5 rounded border-l-4 bg-white shadow-sm border-gray-200
                  ${insight.priority === 'critical' ? 'border-l-red-500' : 
                    insight.priority === 'high' ? 'border-l-orange-500' : 
                    insight.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-full">
                      <div className="mb-1">
                        {getPriorityBadge(insight.priority)}
                      </div>
                      <h4 className="text-base font-bold text-gray-900 mb-1">{insight.message}</h4>
                      <p className="text-sm text-gray-600 mb-3">{insight.detail}</p>
                      
                      <div className="flex items-center flex-wrap gap-y-2 pt-2 border-t border-gray-100 mt-2">
                        <span className="text-sm font-medium text-gray-800">
                          Action: <span className="font-normal text-gray-600">{insight.action}</span>
                        </span>
                        <div className="flex items-center ml-auto sm:ml-4">
                          {getMetricBadge("Impact", insight.impact, "impact")}
                          {getMetricBadge("Effort", insight.effort, "effort")}
                          <span className="ml-4 text-xs text-gray-500" title="Confidence Score">
                            Confidence: {(insight.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightGenerator;

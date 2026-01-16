import React, { useState, useEffect, useRef } from 'react';
import api, { getAggregatedSentiment, getAggregatedThemes, getAllFeedback } from '../services/api';
import StatsCards from './StatsCards';
import SentimentChart from './SentimentChart';
import InsightGenerator from './InsightGenerator';
import FeedbackForm from './FeedbackForm';
import ThemeByProductChart from '../services/ThemeByProductChart';
import { computeAdjustedAggregates } from "./aggregates.js";

const Dashboard = () => {
  const [sentimentData, setSentimentData] = useState(null);
  const [themeData, setThemeData] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [aggregates, setAggregates] = useState(null);
  const dashboardRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch aggregated data in parallel
      const [sentiment, themes, feedback] = await Promise.all([
        getAggregatedSentiment(),
        getAggregatedThemes(),
        getAllFeedback()
      ]);

      setSentimentData(sentiment);
      setThemeData(themes);
      setAllFeedback(feedback);
      
      // Compute advanced aggregates
      const aggs = computeAdjustedAggregates(Array.isArray(feedback) ? feedback : [], { halfLifeDays: 30, minConfidence: 0.2 });
      setAggregates(aggs);
      
      setLastRefresh(new Date());
      return { sentiment, themes, feedback };
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMsg = err.userMessage || 
        (err.request ? 'Cannot connect to backend server. Please ensure Django server is running on http://localhost:8000' :
         'Failed to load dashboard data. Please check your connection and try again.');
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualRefresh = () => {
    fetchData();
  };

  const handleSubmitSuccess = () => {
    fetchData();
    if (dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  if (loading && !sentimentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <span className="text-red-600 text-xl mr-3">⚠️</span>
          <div>
            <h3 className="text-red-800 font-bold">Error Loading Dashboard</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button
              onClick={handleManualRefresh}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 border-b border-gray-200 pb-8">
        <FeedbackForm onSubmitSuccess={handleSubmitSuccess} />
      </section>

      <div className="space-y-12">
        <section ref={dashboardRef} className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h2 className="text-3xl font-bold text-gray-800">Feedback Dashboard</h2>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
            <button
              onClick={handleManualRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards sentimentData={sentimentData} allFeedback={allFeedback} />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SentimentChart 
            sentimentData={sentimentData} 
            // Pass computed aggregates if available
            adjustedSentiment={aggregates?.sentiment}
            insufficientData={aggregates?.insufficientData}
            totalEffective={aggregates?.sentiment?.totalEffective}
          />
          <ThemeByProductChart refreshTrigger={lastRefresh} />
          </div>
        </section>

        {/* Insight Generator */}
        <section className="border-t border-gray-200 pt-8">
          <InsightGenerator
            sentimentData={sentimentData}
            themeData={themeData}
            allFeedback={allFeedback}
          />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

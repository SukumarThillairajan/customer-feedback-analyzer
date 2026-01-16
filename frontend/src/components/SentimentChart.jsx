import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentChart = ({ sentimentData, adjustedSentiment, insufficientData, totalEffective }) => {
  if (!sentimentData || sentimentData.total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Sentiment Distribution</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  // Use adjusted percentages if available, otherwise raw counts
  const chartData = adjustedSentiment ? [
    adjustedSentiment.positive * 100,
    adjustedSentiment.negative * 100,
    adjustedSentiment.neutral * 100
  ] : [
    sentimentData.positive || 0,
    sentimentData.negative || 0,
    sentimentData.neutral || 0
  ];

  const data = {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        label: adjustedSentiment ? 'Weighted %' : 'Feedback Count',
        data: chartData,
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(239, 68, 68, 0.8)',  // red
          'rgba(156, 163, 175, 0.8)'  // gray
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            if (adjustedSentiment) {
              return `${label}: ${value.toFixed(1)}%`;
            } else {
              const total = sentimentData.total || 1;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Sentiment Distribution</h3>
      <div className="h-64 flex items-center justify-center">
        <Pie data={data} options={options} />
      </div>
      {totalEffective !== undefined && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {insufficientData ? (
            <span className="inline-block px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">Low sample size — use caution (n={totalEffective.toFixed(1)})</span>
          ) : (
            <span>Effective Sample Size: n = {totalEffective.toFixed(1)}</span>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Effective Sample Size shows the adjusted number of feedback entries used in analysis, which may differ from the total feedback count due to weighted contributions.
          </p>
        </div>
      )}
    </div>
  );
};

export default SentimentChart;

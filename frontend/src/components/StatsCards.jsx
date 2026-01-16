import React from 'react';

const StatsCards = ({ sentimentData, allFeedback }) => {
  const total = sentimentData?.total || 0;
  const positive = sentimentData?.positive || 0;
  const negative = sentimentData?.negative || 0;
  const neutral = sentimentData?.neutral || 0;
  
  // Calculate average rating
  const avgRating = allFeedback && allFeedback.length > 0
    ? (allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1)
    : '0.0';

  const topRowStats = [
    {
      label: 'Total Feedback',
      value: total,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      label: 'Average Rating',
      value: avgRating,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    }
  ];

  const sentimentStats = [
    {
      label: 'Positive',
      value: positive,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      label: 'Neutral',
      value: neutral,
      color: 'bg-gray-500',
      textColor: 'text-gray-600'
    },
    {
      label: 'Negative',
      value: negative,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  const renderCard = (stat, index) => (
    <div
      key={index}
      className="bg-white rounded-lg shadow-md p-4 border-l-4"
      style={{ borderLeftColor: stat.color.replace('bg-', '').split('-')[1] === 'blue' ? '#3b82f6' :
               stat.color.replace('bg-', '').split('-')[1] === 'green' ? '#10b981' :
               stat.color.replace('bg-', '').split('-')[1] === 'red' ? '#ef4444' :
               stat.color.replace('bg-', '').split('-')[1] === 'gray' ? '#6b7280' :
               stat.color.replace('bg-', '').split('-')[1] === 'yellow' ? '#eab308' : '#a855f7' }}
    >
      <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
      <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
    </div>
  );

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topRowStats.map((stat, index) => renderCard(stat, index))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sentimentStats.map((stat, index) => renderCard(stat, index))}
      </div>
    </div>
  );
};

export default StatsCards;

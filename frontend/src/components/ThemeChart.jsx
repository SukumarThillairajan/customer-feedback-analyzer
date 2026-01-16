import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ThemeChart = ({ themeData, positiveThemes, negativeThemes, insufficientData, totalEffective }) => {
  if ((!themeData || Object.keys(themeData).length === 0) && (!positiveThemes || positiveThemes.length === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Theme Distribution</h3>
        <p className="text-gray-500 text-center py-8">No theme data available</p>
      </div>
    );
  }

  let themes = [];
  let counts = [];
  let bgColors = [];
  let borderColors = [];

  if (positiveThemes && negativeThemes) {
    // Use adjusted aggregates
    const allItems = [...positiveThemes, ...negativeThemes];
    // Sort by value descending
    allItems.sort((a, b) => b.value - a.value);
    
    themes = allItems.map(i => i.name);
    counts = allItems.map(i => i.value);
    bgColors = allItems.map(i => i.name.includes('(issues)') ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)');
    borderColors = allItems.map(i => i.name.includes('(issues)') ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)');
  } else {
    // Fallback to raw data
    themes = Object.keys(themeData);
    counts = Object.values(themeData);
    bgColors = 'rgba(59, 130, 246, 0.8)';
    borderColors = 'rgba(59, 130, 246, 1)';
  }

  const data = {
    labels: themes,
    datasets: [
      {
        label: 'Weighted Impact',
        data: counts,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Count: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Theme Distribution</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
      {insufficientData && (
        <div className="mt-2 text-center">
          <span className="inline-block px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">
            Low sample size (n={totalEffective?.toFixed(1) || 0})
          </span>
        </div>
      )}
    </div>
  );
};

export default ThemeChart;

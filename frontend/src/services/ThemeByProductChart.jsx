import React, { useEffect, useState } from 'react';
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
import { getThemesByProduct } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ThemeByProductChart = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getThemesByProduct();
        
        // Transform API data for Chart.js
        // API returns: { products: [], themes: [], counts: [[p1_t1, p1_t2...], [p2_t1...]] }
        // Chart.js expects datasets where each dataset is a theme across all products
        
        const datasets = data.themes.map((theme, themeIndex) => ({
          label: theme,
          data: data.counts.map(productCounts => productCounts[themeIndex]),
          backgroundColor: getThemeColor(themeIndex),
          borderColor: getThemeColor(themeIndex).replace('0.7', '1'),
          borderWidth: 1,
        }));

        setChartData({
          labels: data.products,
          datasets: datasets,
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching themes by product:", err);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Helper for consistent colors
  const getThemeColor = (index) => {
    const colors = [
      'rgba(59, 130, 246, 0.7)',  // blue
      'rgba(16, 185, 129, 0.7)',  // green
      'rgba(245, 158, 11, 0.7)',  // amber
      'rgba(239, 68, 68, 0.7)',   // red
      'rgba(139, 92, 246, 0.7)',  // purple
      'rgba(236, 72, 153, 0.7)',  // pink
    ];
    return colors[index % colors.length];
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(2)}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-gray-500">Loading chart...</div>;
  if (error) return <div className="h-64 flex items-center justify-center text-red-500">{error}</div>;
  if (!chartData) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Theme Counts by Product</h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Theme counts are fractionally weighted when multiple themes occur in a single feedback.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          “Other” represents feedback that does not match predefined Comfort, Durability, or Appearance themes.
        </p>
      </div>
    </div>
  );
};

export default ThemeByProductChart;
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Feedback Hub</h1>
          <p className="text-gray-600">Customer Feedback Analyzer with Sentiment Dashboard</p>
        </header>

        {/* Dashboard */}
        <Dashboard refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}

export default App;

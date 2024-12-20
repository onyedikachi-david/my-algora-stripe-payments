import React, { useState } from 'react';
import { TransactionChart } from './components/TransactionChart';
import { CurrencyDistributionChart } from './components/CurrencyDistributionChart';
import { WeekdayAnalysis } from './components/WeekdayAnalysis';
import { MonthlyVolumeTrends } from './components/MonthlyVolumeTrends';
import { ExchangeRateAnalysis } from './components/ExchangeRateAnalysis';
import { TransactionVelocity } from './components/TransactionVelocity';
import { ValueSegmentation } from './components/ValueSegmentation';
import { ProcessingEfficiency } from './components/ProcessingEfficiency';
import { TransactionMetrics } from './components/TransactionMetrics';
import { parseTransactions } from './utils/data';
import { BarChart3, RefreshCw, Calendar, Clock, Filter, Download } from 'lucide-react';
import { rawTransactionData } from './data/transactions';
import { LoadingOverlay } from './components/shared/UIComponents';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const transactions = parseTransactions(rawTransactionData);
  
  const lastUpdated = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial Analytics Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">Real-time payment processing insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                Last updated: {lastUpdated}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="text-sm text-gray-600 border-0 bg-transparent focus:ring-0 cursor-pointer hover:text-gray-900"
                >
                  <option>Last 24 Hours</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
            <button className="flex items-center px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors duration-200">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingOverlay isLoading={isLoading}>
          <div className="space-y-8">
            {/* Overview Section */}
            <section>
              <TransactionMetrics transactions={transactions} isLoading={isLoading} />
            </section>

            {/* Volume Analysis Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Volume Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MonthlyVolumeTrends transactions={transactions} />
                <TransactionVelocity transactions={transactions} />
              </div>
            </section>

            {/* Processing Analysis Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Processing Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProcessingEfficiency transactions={transactions} />
                <ValueSegmentation transactions={transactions} />
              </div>
            </section>

            {/* Distribution Analysis Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribution Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CurrencyDistributionChart transactions={transactions} />
                <WeekdayAnalysis transactions={transactions} />
              </div>
            </section>

            {/* Exchange Rate Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Exchange Rate Analysis</h2>
              <ExchangeRateAnalysis transactions={transactions} />
            </section>

            {/* Historical Trends Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Historical Trends</h2>
              <TransactionChart transactions={transactions} />
            </section>
          </div>
        </LoadingOverlay>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>All times are displayed in your local timezone</p>
            <div className="flex items-center space-x-4">
              <button className="hover:text-gray-900">Documentation</button>
              <button className="hover:text-gray-900">Support</button>
              <button className="hover:text-gray-900">API</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
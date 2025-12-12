import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

/**
 * AggregateChart Component
 *
 * A reusable component for displaying aggregated monitoring or analysis data
 * from the BroiLink backend API.
 *
 * Props:
 * - farmId: (required) The farm ID to fetch data for
 * - initialDataType: (optional) 'monitoring' or 'analysis', defaults to 'monitoring'
 * - initialRange: (optional) '1_day', '1_week', '1_month', or '6_months', defaults to '1_week'
 *
 * Example usage:
 * <AggregateChart farmId={1} initialDataType="monitoring" initialRange="1_week" />
 */
const AggregateChart = ({
  farmId,
  initialDataType = 'monitoring',
  initialRange = '1_week'
}) => {
  const [chartData, setChartData] = useState(null);
  const [dataType, setDataType] = useState(initialDataType);
  const [filters, setFilters] = useState({
    farm_id: farmId,
    date: new Date().toISOString().split('T')[0], // Today in YYYY-MM-DD format
    range: initialRange,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data whenever filters or dataType changes
  useEffect(() => {
    fetchData();
  }, [filters, dataType]);

  // Update farm_id in filters when prop changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, farm_id: farmId }));
  }, [farmId]);

  const fetchData = async () => {
    // Validation: ensure all required params are present
    if (!filters.farm_id || !filters.date || !filters.range) {
      setError('farm_id, date, and range are required');
      console.error('Missing required parameters:', filters);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;

      if (dataType === 'monitoring') {
        response = await apiService.monitoring.aggregate({
          farm_id: filters.farm_id,
          date: filters.date,
          range: filters.range,
        });
      } else if (dataType === 'analysis') {
        response = await apiService.analysis.aggregate({
          farm_id: filters.farm_id,
          date: filters.date,
          range: filters.range,
        });
      }

      // Backend returns data directly (not wrapped in { success: true, data: {...} })
      setChartData(response);
      console.log('Chart data loaded:', response);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (newRange) => {
    setFilters(prev => ({ ...prev, range: newRange }));
  };

  const handleDateChange = (newDate) => {
    setFilters(prev => ({ ...prev, date: newDate }));
  };

  const handleDataTypeToggle = (newType) => {
    setDataType(newType);
  };

  const renderDataTable = () => {
    if (!chartData) return null;

    const { labels } = chartData;

    if (dataType === 'monitoring') {
      const { temperature, humidity, ammonia } = chartData;

      return (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Time/Period</th>
                <th className="px-4 py-2 border">Temperature (°C)</th>
                <th className="px-4 py-2 border">Humidity (%)</th>
                <th className="px-4 py-2 border">Ammonia (ppm)</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border font-medium">{label}</td>
                  <td className="px-4 py-2 border text-center">
                    {temperature[index] !== null ? temperature[index] : '-'}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {humidity[index] !== null ? humidity[index] : '-'}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {ammonia[index] !== null ? ammonia[index] : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      const { feed, water, avg_weight, mortality } = chartData;

      return (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Time/Period</th>
                <th className="px-4 py-2 border">Feed (kg)</th>
                <th className="px-4 py-2 border">Water (L)</th>
                <th className="px-4 py-2 border">Avg Weight (kg)</th>
                <th className="px-4 py-2 border">Mortality</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border font-medium">{label}</td>
                  <td className="px-4 py-2 border text-center">
                    {feed[index] !== null ? feed[index] : '-'}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {water[index] !== null ? water[index] : '-'}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {avg_weight[index] !== null ? avg_weight[index] : '-'}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    {mortality[index] !== null ? mortality[index] : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Farm {farmId} - Aggregate Data
      </h2>

      {/* Data Type Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Type:
        </label>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              dataType === 'monitoring'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleDataTypeToggle('monitoring')}
          >
            Environment (IoT)
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              dataType === 'analysis'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleDataTypeToggle('analysis')}
          >
            Manual Analysis
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Range Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range:
          </label>
          <select
            value={filters.range}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1_day">1 Day (4-hour intervals)</option>
            <option value="1_week">1 Week (daily)</option>
            <option value="1_month">1 Month (weekly)</option>
            <option value="6_months">6 Months (monthly)</option>
          </select>
        </div>

        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anchor Date:
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && chartData && (
        <div>
          {renderDataTable()}

          {/* Metadata */}
          {chartData.meta && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Metadata:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Range:</span>{' '}
                  <span className="font-mono">{chartData.meta.range}</span>
                </div>
                <div>
                  <span className="font-medium">Farm ID:</span>{' '}
                  <span className="font-mono">{chartData.meta.farm_id}</span>
                </div>
                <div>
                  <span className="font-medium">Start:</span>{' '}
                  <span className="font-mono text-xs">{chartData.meta.start}</span>
                </div>
                <div>
                  <span className="font-medium">End:</span>{' '}
                  <span className="font-mono text-xs">{chartData.meta.end}</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Source: {chartData.meta.source}
              </div>
            </div>
          )}

          {/* Raw JSON Toggle (for debugging) */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Show Raw JSON Response
            </summary>
            <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(chartData, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !chartData && (
        <div className="text-center py-12 text-gray-500">
          <p>No data available. Try adjusting the filters.</p>
        </div>
      )}
    </div>
  );
};

export default AggregateChart;

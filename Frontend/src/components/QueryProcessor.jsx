import React, { useState, useEffect } from 'react';

const QueryProcessor = ({ onQueryResults }) => {
  const [queries, setQueries] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch available queries from the backend
    const fetchQueries = async () => {
      try {
        const response = await fetch('/api/available-queries');
        const data = await response.json();
        setQueries(data.queries);
        if (data.queries.length > 0) {
          setSelectedQueryId(data.queries[0].id);
        }
      } catch (error) {
        console.error('Error fetching queries:', error);
      }
    };

    fetchQueries();
  }, []);

  const fetchQueryResults = async () => {
    if (!selectedQueryId) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/query-results/${selectedQueryId}`);
      const data = await response.json();
      onQueryResults(data); // Send data to parent component
    } catch (error) {
      console.error('Error fetching query results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Select Data Query</h2>

      <div className="flex gap-2">
        <select
          className="p-2 border rounded"
          value={selectedQueryId || ''}
          onChange={(e) => setSelectedQueryId(e.target.value)}
          disabled={isLoading || queries.length === 0}
        >
          {queries.map((query) => (
            <option key={query.id} value={query.id}>{query.name}</option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={fetchQueryResults}
          disabled={isLoading || !selectedQueryId}
        >
          {isLoading ? 'Loading...' : 'Visualize'}
        </button>
      </div>
    </div>
  );
};

export default QueryProcessor;

import React, { useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { SQLEvaluation } from '../types';
import { api } from '../services/api';

interface SQLWorkspaceProps {
  onProceedToReadiness: () => void;
}

const DEFAULT_SQL = `SELECT 
    c.customer_id,
    c.customer_name,
    SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY total_spent DESC
LIMIT 5;`;

export const SQLWorkspace: React.FC<SQLWorkspaceProps> = ({ onProceedToReadiness }) => {
  const [query, setQuery] = useState(DEFAULT_SQL);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<SQLEvaluation | null>(null);

  const handleExecute = async () => {
    setExecuting(true);
    const res = await api.submitSQL(query);
    setResult(res);
    setExecuting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 font-sans text-[#0A192F]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase block">SQL Assessment</span>
          <h1 className="text-2xl font-bold text-[#0A192F] mt-0.5">Multi-Table JOIN & Aggregation Query</h1>
        </div>

        <button
          onClick={onProceedToReadiness}
          className="px-4 py-2 rounded bg-[#0A192F] hover:bg-[#112240] text-white text-xs font-semibold transition-colors flex items-center shadow-sm"
        >
          View Readiness Score <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-[#FFDE59]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm space-y-3 text-xs">
          <span className="font-mono font-bold text-[#64748B] uppercase block">QUERY PROMPT</span>
          <p className="text-[#64748B] leading-relaxed">
            Write a query returning top 5 customers with their total order spend using <code className="bg-slate-100 px-1 py-0.5 rounded">INNER JOIN</code> and <code className="bg-slate-100 px-1 py-0.5 rounded">GROUP BY</code>.
          </p>
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="bg-[#0A192F] rounded-lg overflow-hidden border border-slate-700">
            <div className="px-4 py-2 bg-[#112240] border-b border-slate-700 flex justify-between items-center text-xs">
              <span className="font-mono text-white">query.sql</span>
              <button
                onClick={handleExecute}
                disabled={executing}
                className="px-3 py-1 bg-[#427AB5] hover:bg-blue-600 text-white font-semibold rounded text-[11px] flex items-center"
              >
                <Play className="w-3 h-3 mr-1 fill-current" />
                {executing ? 'Executing...' : 'Execute Query'}
              </button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-44 p-4 bg-[#0A192F] text-[#FFDE59] font-mono text-xs focus:outline-none leading-relaxed"
            />
          </div>

          {result && (
            <div className="bg-white rounded-lg p-4 border border-[#E2E8F0] shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-center font-mono text-[11px]">
                <span className="font-bold text-[#0A192F]">Execution Results</span>
                <span className="text-emerald-700">{result.result_rows.length} rows in {result.execution_time_ms} ms</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                      <th className="p-2">ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.result_rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="p-2 text-[#64748B]">{row.customer_id}</td>
                        <td className="p-2 font-bold text-[#0A192F]">{row.customer_name}</td>
                        <td className="p-2 text-emerald-700 font-bold">${row.total_spent?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

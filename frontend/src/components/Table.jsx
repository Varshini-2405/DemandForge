import React from 'react';

const Table = ({ headers, data, onActionClick }) => {
  // Custom tag helper for risk status badges
  const renderRiskBadge = (risk) => {
    switch (risk) {
      case 'Critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/25">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            Safe
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200/50 dark:border-white/5 bg-white/30 dark:bg-brand-navy-light/20 backdrop-blur-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="table-header px-6 py-4">
                {header}
              </th>
            ))}
            {onActionClick && <th className="table-header px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx} className="table-row">
              <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">
                {row.id}
              </td>
              <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                {row.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {row.category}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">
                <span className={row.stock < 15 ? 'text-amber-500 font-bold' : ''}>
                  {row.stock} units
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white font-mono">
                ₹{row.price.toFixed(2)}
              </td>
              <td className="px-6 py-4">
                {renderRiskBadge(row.risk)}
              </td>
              
              {onActionClick && (
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onActionClick(row)}
                    className="text-xs font-bold text-brand-purple hover:underline hover:text-brand-purple-light transition-colors uppercase tracking-wider"
                  >
                    Foresee Demand
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;

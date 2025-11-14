
import React from 'react';
import type { HistoryItem } from '../types';
import HistoryItemCard from './HistoryItemCard';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelectItem, onClearHistory }) => {
  return (
    <div className="bg-secondary p-4 sm:p-6 rounded-xl shadow-2xl border border-accent/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-light">Analysis History</h3>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3 py-1 text-sm font-semibold text-red-300 bg-dangerous/20 hover:bg-dangerous/40 rounded-md transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      {history.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {history.map((item) => (
            <HistoryItemCard key={item.id} item={item} onSelect={onSelectItem} />
          ))}
        </div>
      ) : (
        <div className="text-center text-accent py-6">
          <p>No past analyses found.</p>
          <p className="text-sm">Your scan history will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;

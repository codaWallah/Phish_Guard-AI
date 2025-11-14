
import React from 'react';
import type { HistoryItem, AnalysisVerdict } from '../types';
import { LinkIcon } from './icons/LinkIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';

interface HistoryItemCardProps {
  item: HistoryItem;
  onSelect: (item: HistoryItem) => void;
}

const verdictConfig: Record<AnalysisVerdict, {
  textColor: string;
  borderColor: string;
}> = {
  SAFE: { textColor: 'text-safe', borderColor: 'border-safe/30' },
  SUSPICIOUS: { textColor: 'text-suspicious', borderColor: 'border-suspicious/30' },
  DANGEROUS: { textColor: 'text-dangerous', borderColor: 'border-dangerous/30' },
};


const HistoryItemCard: React.FC<HistoryItemCardProps> = ({ item, onSelect }) => {
  const { type, content, result, timestamp } = item;
  const config = verdictConfig[result.verdict];

  return (
    <button
      onClick={() => onSelect(item)}
      className={`w-full text-left p-3 rounded-lg border ${config.borderColor} bg-primary/50 hover:bg-accent/20 transition-all duration-200 flex items-center space-x-4`}
    >
      <div className={`flex-shrink-0 ${config.textColor}`}>
        {type === 'url' ? <LinkIcon className="h-6 w-6" /> : <EnvelopeIcon className="h-6 w-6" />}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-light font-semibold truncate" title={content}>
          {content}
        </p>
        <p className="text-xs text-accent">
          {new Date(timestamp).toLocaleString()}
        </p>
      </div>
      <div className="flex-shrink-0">
        <span className={`font-bold text-sm px-2.5 py-1 rounded-full bg-secondary ${config.textColor}`}>
          {result.verdict}
        </span>
      </div>
    </button>
  );
};

export default HistoryItemCard;

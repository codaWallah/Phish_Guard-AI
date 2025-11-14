
import React from 'react';
import type { AnalysisCheck } from '../types';

interface ResultCardProps {
  check: AnalysisCheck;
}

const ResultCard: React.FC<ResultCardProps> = ({ check }) => {
  const { check: title, description, score } = check;

  const getScoreColor = (s: number) => {
    if (s > 75) return 'bg-dangerous';
    if (s > 40) return 'bg-suspicious';
    return 'bg-safe';
  };
  
  const scoreColor = getScoreColor(score);

  return (
    <div className="bg-secondary p-5 rounded-lg border border-accent/20 hover:border-accent/40 transition-colors duration-300">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-lg text-light">{title}</h4>
        <span className={`text-sm font-bold px-2 py-1 rounded-full text-primary ${scoreColor}`}>
          {score}/100
        </span>
      </div>
      <p className="text-light/80 text-sm mb-3">{description}</p>
      <div className="w-full bg-primary rounded-full h-2.5">
        <div
          className={`${scoreColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ResultCard;

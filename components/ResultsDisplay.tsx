
import React, { useState, useEffect } from 'react';
import type { AnalysisResult, AnalysisVerdict } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { ShieldExclamationIcon } from './icons/ShieldExclamationIcon';
import { ShieldXIcon } from './icons/ShieldXIcon';
import ResultCard from './ResultCard';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

const verdictConfig: Record<AnalysisVerdict, {
  text: string;
  Icon: React.FC<{className?: string}>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  SAFE: {
    text: 'Safe',
    Icon: ShieldCheckIcon,
    bgColor: 'bg-safe/10',
    textColor: 'text-safe',
    borderColor: 'border-safe/50',
  },
  SUSPICIOUS: {
    text: 'Suspicious',
    Icon: ShieldExclamationIcon,
    bgColor: 'bg-suspicious/10',
    textColor: 'text-suspicious',
    borderColor: 'border-suspicious/50',
  },
  DANGEROUS: {
    text: 'Dangerous',
    Icon: ShieldXIcon,
    bgColor: 'bg-dangerous/10',
    textColor: 'text-dangerous',
    borderColor: 'border-dangerous/50',
  },
};

const useCountUp = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Using an ease-out cubic function for a smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easedProgress));

      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(end); // Ensure it ends on the exact number
      }
    }, frameRate);

    return () => {
      clearInterval(counter);
    };
  }, [end, duration]);

  return count;
};

const AnimatedScore: React.FC<{ score: number }> = ({ score }) => {
  const animatedValue = useCountUp(score);
  const scoreColor = score > 75 ? 'text-dangerous' : score > 40 ? 'text-suspicious' : 'text-safe';

  return (
    <span className={`font-bold text-xl ${scoreColor}`}>
      {animatedValue}/100
    </span>
  );
};


const SkeletonCard: React.FC = () => (
  <div className="bg-secondary p-4 rounded-lg animate-pulse">
    <div className="h-4 bg-accent/30 rounded w-1/3 mb-3"></div>
    <div className="h-3 bg-accent/30 rounded w-full mb-2"></div>
    <div className="h-3 bg-accent/30 rounded w-3/4"></div>
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-secondary p-6 rounded-lg animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-accent/30 rounded-full mb-4"></div>
          <div className="h-8 bg-accent/30 rounded w-1/4"></div>
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center text-accent py-10 px-4 border-2 border-dashed border-accent/20 rounded-lg">
        <h3 className="text-xl font-semibold">Awaiting Analysis</h3>
        <p className="mt-2">Your security report will appear here.</p>
      </div>
    );
  }

  const { verdict, overallScore, analysis } = result;
  const config = verdictConfig[verdict];
  const { Icon, text, bgColor, textColor, borderColor } = config;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={`p-6 rounded-xl border ${borderColor} ${bgColor} flex flex-col items-center text-center`}>
        <Icon className={`h-16 w-16 ${textColor}`} />
        <h2 className={`mt-4 text-3xl font-bold ${textColor}`}>{text}</h2>
        <p className="mt-1 text-light/80">
          Overall Risk Score: <AnimatedScore score={overallScore} />
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 text-light">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.map((item, index) => (
            <ResultCard key={index} check={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
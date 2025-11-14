
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import AnalysisInput from './components/AnalysisInput';
import ResultsDisplay from './components/ResultsDisplay';
import { performAnalysis } from './services/geminiService';
import type { AnalysisResult, AnalysisType, HistoryItem, AdvancedOptions } from './types';
import HistoryPanel from './components/HistoryPanel';
import Chatbot from './components/chatbot/Chatbot';
import { ChatIcon } from './components/icons/ChatIcon';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisKey, setAnalysisKey] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('phishGuardHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      // If parsing fails, clear corrupted data
      localStorage.removeItem('phishGuardHistory');
    }
  }, []);

  const handleAnalyze = useCallback(async (type: AnalysisType, content: string, options?: AdvancedOptions) => {
    if (!content.trim()) {
      setError("Please enter a URL or email content to analyze.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await performAnalysis(type, content, options);
      setAnalysisResult(result);
      setAnalysisKey(prevKey => prevKey + 1); // Force re-render of ResultsDisplay for animation
      
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString() + Math.random(),
        timestamp: Date.now(),
        type,
        content,
        result,
      };
      
      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory.slice(0, 49)]; // Keep latest 50
        localStorage.setItem('phishGuardHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setError(null);
    setAnalysisResult(item.result);
    setAnalysisKey(prevKey => prevKey + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('phishGuardHistory');
  };


  return (
    <div className="min-h-screen bg-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-light/80 mb-8 text-lg">
            Harness the power of AI to detect and neutralize phishing threats before they strike.
            Paste a suspicious URL or email content below to get an instant security analysis.
          </p>
          <AnalysisInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          {error && (
            <div className="mt-8 bg-red-900/50 border border-dangerous text-red-200 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="mt-8">
            <ResultsDisplay key={analysisKey} result={analysisResult} isLoading={isLoading} />
          </div>

          <div className="mt-12">
            <HistoryPanel
              history={history}
              onSelectItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-accent">
        <p>&copy; 2025 PhishGuard AI Powered & Created by <b> <a href="https://www.linkedin.com/in/mohd-anash/"> Mohd.Anash(aka Charlie)</b>. For informational purposes only. Always exercise caution.</p>
      </footer>

      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-safe text-primary p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-20 animate-fade-in"
          aria-label="Open AI assistant"
        >
          <ChatIcon className="h-8 w-8" />
        </button>
      )}

      {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default App;
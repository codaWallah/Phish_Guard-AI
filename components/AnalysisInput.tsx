
import React, { useState, useEffect, useCallback } from 'react';
import type { AnalysisType, UrlAdvancedOptions, EmailAdvancedOptions, AdvancedOptions } from '../types';

interface AnalysisInputProps {
  onAnalyze: (type: AnalysisType, content: string, options?: AdvancedOptions) => void;
  isLoading: boolean;
}

const AnalysisInput: React.FC<AnalysisInputProps> = ({ onAnalyze, isLoading }) => {
  const [activeTab, setActiveTab] = useState<AnalysisType>('url');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [urlOptions, setUrlOptions] = useState<UrlAdvancedOptions>({ simulationMode: 'desktop', countryCode: '' });
  const [emailOptions, setEmailOptions] = useState<EmailAdvancedOptions>({ extractAllLinks: false });

  // FIX: 'useCallback' was used without being imported. It's now imported from 'react'.
  const debouncedAnalyze = useCallback(
    (type: AnalysisType, content: string, options?: AdvancedOptions) => {
        onAnalyze(type, content, options);
    },
    [onAnalyze]
  );
  
  useEffect(() => {
    if (activeTab !== 'url' || !url.trim()) {
      return;
    }
    if (url.length < 8 || !url.includes('.') || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return;
    }
    const handler = setTimeout(() => {
      debouncedAnalyze('url', url, urlOptions);
    }, 1000); // 1-second delay for debouncing

    return () => {
      clearTimeout(handler);
    };
  }, [url, urlOptions, activeTab, debouncedAnalyze]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'url') {
      onAnalyze('url', url, urlOptions);
    } else {
      onAnalyze('email', email, emailOptions);
    }
  };

  const isButtonDisabled = isLoading || (activeTab === 'url' ? !url.trim() : !email.trim());

  const tabClass = (tabName: AnalysisType) => 
    `px-4 py-2.5 font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-secondary focus:ring-safe ${
      activeTab === tabName ? 'bg-accent text-white' : 'bg-secondary text-light/70 hover:bg-accent/50'
    }`;

  return (
    <div className="bg-secondary p-4 sm:p-6 rounded-xl shadow-2xl border border-accent/20">
      <div className="flex space-x-2 border-b border-accent/20 mb-4 pb-4">
        <button onClick={() => setActiveTab('url')} className={tabClass('url')}>
          URL Analysis
        </button>
        <button onClick={() => setActiveTab('email')} className={tabClass('email')}>
          Email Analysis
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {activeTab === 'url' ? (
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-3 bg-primary border border-accent rounded-lg text-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-safe"
              disabled={isLoading}
              aria-label="URL to analyze"
            />
            <p className="text-xs text-accent mt-2 px-1">Real-time analysis will begin shortly after you stop typing.</p>
          </div>
        ) : (
          <textarea
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Paste full email content here, including headers for best results..."
            className="w-full p-3 bg-primary border border-accent rounded-lg text-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-safe h-48 resize-y"
            disabled={isLoading}
            aria-label="Email content to analyze"
          />
        )}
        
        {/* Advanced Options */}
        <div className="mt-4">
            <button type="button" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="text-sm font-semibold text-safe hover:text-green-300 transition-colors">
                Advanced Options {isAdvancedOpen ? '▲' : '▼'}
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isAdvancedOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                {activeTab === 'url' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-primary/50 rounded-lg border border-accent/20">
                        <div>
                            <label htmlFor="sim-mode" className="block text-sm font-medium text-light/80 mb-1">Simulation Mode</label>
                            <select 
                                id="sim-mode"
                                value={urlOptions.simulationMode}
                                onChange={(e) => setUrlOptions(prev => ({ ...prev, simulationMode: e.target.value as 'desktop' | 'mobile' }))}
                                className="w-full p-2 bg-primary border border-accent rounded-lg text-light focus:outline-none focus:ring-2 focus:ring-safe"
                            >
                                <option value="desktop">Desktop</option>
                                <option value="mobile">Mobile</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="country-code" className="block text-sm font-medium text-light/80 mb-1">Country Code</label>
                            <input
                                type="text"
                                id="country-code"
                                value={urlOptions.countryCode}
                                onChange={(e) => setUrlOptions(prev => ({...prev, countryCode: e.target.value}))}
                                placeholder="e.g., US, DE"
                                className="w-full p-2 bg-primary border border-accent rounded-lg text-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-safe"
                            />
                        </div>
                    </div>
                )}
                 {activeTab === 'email' && (
                    <div className="p-4 bg-primary/50 rounded-lg border border-accent/20">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={emailOptions.extractAllLinks}
                                onChange={(e) => setEmailOptions(prev => ({ ...prev, extractAllLinks: e.target.checked }))}
                                className="h-5 w-5 rounded bg-primary border-accent text-safe focus:ring-safe"
                            />
                             <span className="text-sm font-medium text-light/80">Extract & Analyze All Links</span>
                        </label>
                    </div>
                )}
            </div>
        </div>

        <button
          type="submit"
          disabled={isButtonDisabled}
          className="mt-4 w-full flex items-center justify-center p-3 font-bold bg-safe text-primary rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : 'Scan Now'}
        </button>
      </form>
    </div>
  );
};

export default AnalysisInput;
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types';
import { getChatbotResponse } from '../../services/geminiService';
import { XIcon } from '../icons/XIcon';
import ChatBubble from './ChatBubble';
import { ShieldCheckIcon } from '../icons/ShieldCheckIcon';

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { role: 'model', text: 'Hi! I am GuardBot. How can I help you with your cybersecurity questions today?' }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));
      const responseText = await getChatbotResponse(input, history);
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I ran into an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[600px] flex flex-col bg-secondary shadow-2xl rounded-2xl border border-accent/30 z-30 animate-fade-in">
      <header className="flex items-center justify-between p-4 border-b border-accent/20 flex-shrink-0">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-6 w-6 text-safe" />
          <h2 className="ml-2 text-lg font-bold text-light">AI Assistant</h2>
        </div>
        <button onClick={onClose} className="p-1 text-accent hover:text-light rounded-full transition-colors">
          <XIcon className="h-6 w-6" />
        </button>
      </header>

      <div className="flex-grow p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="bg-primary px-4 py-2 rounded-lg max-w-xs">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form onSubmit={handleSend} className="p-4 border-t border-accent/20 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cybersecurity..."
            className="w-full p-3 bg-primary border border-accent rounded-lg text-light placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-safe"
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="bg-safe text-primary p-3 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;

import React from 'react';
import type { ChatMessage } from '../../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isModel = message.role === 'model';
  
  const bubbleClasses = isModel
    ? 'bg-primary text-light/90 rounded-r-lg rounded-bl-lg'
    : 'bg-safe text-primary rounded-l-lg rounded-br-lg';
    
  const wrapperClasses = isModel ? 'flex justify-start' : 'flex justify-end';

  return (
    <div className={wrapperClasses}>
      <div className={`px-4 py-3 max-w-sm whitespace-pre-wrap ${bubbleClasses}`}>
        {message.text}
      </div>
    </div>
  );
};

export default ChatBubble;

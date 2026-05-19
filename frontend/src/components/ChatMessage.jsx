import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import '../styles/chat.css';

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-avatar" aria-hidden="true">
        {isUser ? (
          <span className="avatar-label">You</span>
        ) : (
          <span className="avatar-label ai">AI</span>
        )}
      </div>
      <div className="message-content">
        {message.imageUrl && (
          <img src={message.imageUrl} alt="Uploaded" className="message-image" />
        )}
        <div className="message-bubble">
          <div className="message-text">
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
          {!isUser && message.content && (
            <button type="button" className="copy-btn" onClick={handleCopy} title="Copy response">
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

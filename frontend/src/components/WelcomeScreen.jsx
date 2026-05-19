import '../styles/chat.css';

const SUGGESTIONS = [
  {
    icon: '💡',
    title: 'Explain a concept',
    text: 'Explain machine learning in simple terms for a beginner',
  },
  {
    icon: '📝',
    title: 'Resume help',
    text: 'Write a strong resume bullet point for a full stack developer internship',
  },
  {
    icon: '🖼️',
    title: 'Image analysis',
    text: 'Upload an image and I will describe what I see using Gemini Vision',
  },
  {
    icon: '🎯',
    title: 'Interview prep',
    text: 'Give me 5 common HR interview questions with sample answers',
  },
];

const WelcomeScreen = ({ userName, onSuggestionClick, onUploadClick }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-badge">AI Assistant</div>
      <h2>Hello, {userName?.split(' ')[0] || 'there'} 👋</h2>
      <p className="welcome-subtitle">
        Ask anything, get instant answers, or upload an image for AI vision analysis.
      </p>

      <div className="suggestion-grid">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.title}
            type="button"
            className="suggestion-card"
            onClick={() => {
              if (item.title === 'Image analysis') {
                onUploadClick?.();
              } else {
                onSuggestionClick(item.text);
              }
            }}
          >
            <span className="suggestion-icon">{item.icon}</span>
            <h4>{item.title}</h4>
            <p>{item.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;

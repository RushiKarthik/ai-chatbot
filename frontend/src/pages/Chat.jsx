import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../utils/api';
import ChatMessage from '../components/ChatMessage';
import ProfileDropdown from '../components/ProfileDropdown';
import WelcomeScreen from '../components/WelcomeScreen';
import '../styles/chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadChats = async () => {
    try {
      const data = await chatAPI.getChats();
      setChats(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const selectChat = async (chatId) => {
    try {
      const chat = await chatAPI.getChat(chatId);
      setActiveChat(chat);
      setMessages(chat.messages || []);
      setSidebarOpen(false);
      setRenamingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const createNewChat = async () => {
    try {
      const chat = await chatAPI.createChat();
      setChats((prev) => [chat, ...prev]);
      setActiveChat(chat);
      setMessages([]);
      setSidebarOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!confirm('Delete this chat permanently?')) return;

    try {
      await chatAPI.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChat?._id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const startRename = (chat, e) => {
    e.stopPropagation();
    setRenamingId(chat._id);
    setRenameValue(chat.title);
  };

  const saveRename = async (chatId) => {
    if (!renameValue.trim()) {
      setRenamingId(null);
      return;
    }
    try {
      const data = await chatAPI.renameChat(chatId, renameValue.trim());
      setChats((prev) => prev.map((c) => (c._id === chatId ? { ...c, title: data.title } : c)));
      if (activeChat?._id === chatId) {
        setActiveChat((prev) => ({ ...prev, title: data.title }));
      }
    } catch (err) {
      alert(err.message);
    }
    setRenamingId(null);
  };

  const handleImageSelect = (file) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      alert('Only JPG, JPEG, and PNG files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if ((!messageText && !imageFile) || loading) return;

    let chatId = activeChat?._id;

    if (!chatId) {
      try {
        const chat = await chatAPI.createChat();
        setChats((prev) => [chat, ...prev]);
        setActiveChat(chat);
        chatId = chat._id;
      } catch (err) {
        alert(err.message);
        return;
      }
    }

    const userContent = messageText || 'Analyze this image';
    setInput('');
    setLoading(true);

    const tempUserMsg = {
      role: 'user',
      content: userContent,
      imageUrl: imagePreview || '',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      let data;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('content', userContent);
        data = await chatAPI.sendImageMessage(chatId, formData);
        clearImage();
      } else {
        data = await chatAPI.sendMessage(chatId, userContent);
      }

      setMessages((prev) => [...prev.slice(0, -1), data.userMessage, data.assistantMessage]);
      setChats((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, title: data.title } : c))
      );
      setActiveChat((prev) => (prev?._id === chatId ? { ...prev, title: data.title } : prev));
    } catch (err) {
      alert(err.message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-layout">
      <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Link to="/dashboard" className="sidebar-brand">
            <span className="brand-icon">AI</span>
            <span>AI Chat</span>
          </Link>
          <button type="button" className="new-chat-btn" onClick={createNewChat}>
            + New Chat
          </button>
        </div>

        <div className="chat-list">
          {chats.length === 0 && (
            <p className="chat-list-empty">No chats yet. Start a new conversation!</p>
          )}
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`chat-item ${activeChat?._id === chat._id ? 'active' : ''}`}
              onClick={() => renamingId !== chat._id && selectChat(chat._id)}
            >
              {renamingId === chat._id ? (
                <input
                  className="rename-input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => saveRename(chat._id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename(chat._id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <>
                  <span className="chat-title">{chat.title}</span>
                  <div className="chat-item-actions">
                    <button
                      type="button"
                      className="chat-action-btn"
                      title="Rename"
                      onClick={(e) => startRename(chat, e)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="chat-action-btn delete"
                      title="Delete"
                      onClick={(e) => deleteChat(chat._id, e)}
                    >
                      ×
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <small>Saved to MongoDB</small>
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="chat-header-title">
            <h2>{activeChat?.title || 'New Conversation'}</h2>
            <span className="chat-header-meta">Powered by Gemini</span>
          </div>
          <ProfileDropdown />
        </header>

        <div
          className={`messages-area ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {messages.length === 0 && !loading && (
            <WelcomeScreen
              userName={user?.name}
              onSuggestionClick={(text) => {
                setInput(text);
                sendMessage(text);
              }}
              onUploadClick={() => fileInputRef.current?.click()}
            />
          )}

          <div className="messages-list">
            {messages.map((msg, i) => (
              <ChatMessage key={`${msg.timestamp}-${i}`} message={msg} />
            ))}

            {loading && (
              <div className="typing-row">
                <div className="message-avatar">
                  <span className="avatar-label ai">AI</span>
                </div>
                <div className="typing-bubble">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                  <span className="typing-label">AI is typing...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {imagePreview && (
          <div className="image-preview-bar">
            <div className="preview-card">
              <img src={imagePreview} alt="Preview" />
              <div>
                <strong>Image ready</strong>
                <p>Gemini Vision will analyze this when you send</p>
              </div>
            </div>
            <button type="button" className="preview-remove" onClick={clearImage} aria-label="Remove image">
              ×
            </button>
          </div>
        )}

        <div className="input-area">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/jpg,image/png"
            hidden
            onChange={(e) => e.target.files[0] && handleImageSelect(e.target.files[0])}
          />
          <button
            type="button"
            className={`attach-btn ${imageFile ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            title="Upload image for analysis"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Chat... (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={loading}
          />
          <button
            type="button"
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || (!input.trim() && !imageFile)}
            aria-label="Send message"
          >
            {loading ? <span className="send-spinner"></span> : '↑'}
          </button>
        </div>
      </main>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}
    </div>
  );
};

export default Chat;

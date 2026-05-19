import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <Navbar />
      <section className="hero">
        <div className="hero-content">
          <h1>Your AI Assistant for Everything</h1>
          <p>
            Chat with an intelligent AI, analyze images, and manage your conversations —
            all in one modern platform built for students and professionals.
          </p>
          <div className="hero-buttons">
            {user ? (
              <Link to="/chat" className="btn-primary btn-large">Go to Chat</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary btn-large">Start Free</Link>
                <Link to="/login" className="btn-outline btn-large">Login</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">💬</span>
            <h3>Smart Chat</h3>
            <p>ChatGPT-like interface with markdown support and chat history.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🖼️</span>
            <h3>Image Analysis</h3>
            <p>Upload images and ask questions using Gemini Vision AI.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔐</span>
            <h3>Secure Auth</h3>
            <p>JWT authentication, email OTP verification, and password reset.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

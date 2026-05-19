import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}!</h1>
          <p>Your AI assistant dashboard</p>
        </div>

        <div className="dashboard-grid">
          <Link to="/chat" className="dashboard-card">
            <span className="card-icon">💬</span>
            <h3>Start Chatting</h3>
            <p>ChatGPT-style UI with markdown, image analysis, and chat history.</p>
            <span className="card-cta">Open Chat →</span>
          </Link>

          <Link to="/profile" className="dashboard-card">
            <span className="card-icon">👤</span>
            <h3>Your Profile</h3>
            <p>View and update your account details.</p>
            <span className="card-cta">Edit Profile →</span>
          </Link>

          <div className="dashboard-card info-card">
            <span className="card-icon">📊</span>
            <h3>Quick Stats</h3>
            <p>Email: {user?.email}</p>
            <p>Status: Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

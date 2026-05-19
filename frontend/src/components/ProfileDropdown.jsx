import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/chat.css';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-dropdown" ref={ref}>
      <button type="button" className="profile-trigger" onClick={() => setOpen(!open)}>
        <span className="profile-trigger-avatar">{user?.name?.[0]?.toUpperCase()}</span>
        <span className="profile-trigger-name">{user?.name}</span>
        <span className={`profile-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <span className="profile-menu-avatar">{user?.name?.[0]?.toUpperCase()}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <Link to="/dashboard" className="profile-menu-item" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link to="/profile" className="profile-menu-item" onClick={() => setOpen(false)}>
            Profile Settings
          </Link>
          <button type="button" className="profile-menu-item logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;

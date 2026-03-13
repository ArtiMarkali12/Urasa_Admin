import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <span className="hamburger"></span>
        </button>
        <div className="page-title">
          <h1>Admin Panel</h1>
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-icon">
          <span className="bell">🔔</span>
          <span className="notification-badge">3</span>
        </div>

        <div className="profile-section">
          <button 
            className="profile-button" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{admin?.name || 'Admin'}</span>
              <span className="profile-role">{admin?.role || 'Administrator'}</span>
            </div>
            <span className={`dropdown-arrow ${showProfileMenu ? 'rotate' : ''}`}>▼</span>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="dropdown-name">{admin?.name || 'Admin'}</div>
                  <div className="dropdown-email">{admin?.email || 'admin@urasa.com'}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item"
                onClick={() => {
                  navigate('/profile');
                  setShowProfileMenu(false);
                }}
              >
                <span className="dropdown-icon">👤</span>
                Profile
              </button>
              <button className="dropdown-item">
                <span className="dropdown-icon">⚙️</span>
                Settings
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <span className="dropdown-icon">🚪</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

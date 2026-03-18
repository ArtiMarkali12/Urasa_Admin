import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ toggleSidebar, isMobile }) => {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowProfileMenu(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {isMobile && (
          <button className="menu-toggle" onClick={toggleSidebar}>
            <span className="hamburger"></span>
          </button>
        )}
        <div className="page-title">
          <h1>Admin Panel</h1>
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-icon">
          <span className="bell">🔔</span>
          <span className="notification-badge">3</span>
        </div>

        <div className="profile-section" ref={profileRef}>
          <button
            className="profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              {admin?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {admin?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div>
                  <div className="dropdown-name">{admin?.name || "Admin"}</div>
                  <div className="dropdown-email">
                    {admin?.email || "admin@urasa.com"}
                  </div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item"
                onClick={() => {
                  navigate("/profile");
                  setShowProfileMenu(false);
                }}
              >
                <span className="dropdown-icon">👤</span>
                <span>Profile</span>
              </button>
              <button className="dropdown-item">
                <span className="dropdown-icon">⚙️</span>
                <span>Settings</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <span className="dropdown-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/booklets", label: "Booklets", icon: "📚" },
    { path: "/notebooks", label: "Notebooks", icon: "📓" },

    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      ></div>
      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${isMobile ? "mobile" : ""}`}
      >
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">U</span>
            <span className={`logo-text ${isOpen ? "visible" : ""}`}>
              URASA
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="menu-item">
                <Link
                  to={item.path}
                  className={`menu-link ${isActive(item.path) ? "active" : ""}`}
                  onClick={() => isMobile && toggleSidebar()}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className={`menu-label ${isOpen ? "visible" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className={`footer-text ${isOpen ? "visible" : ""}`}>
            © 2024 Urasa Admin
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookletAPI, notebookAPI, ledgerAPI, letterheadAPI, shoppingBagsAPI } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    booklets: 0,
    notebooks: 0,
    ledgers: 0,
    letterheads: 0,
    shoppingBags: 0,
    total: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [booklets, notebooks, ledgers, letterheads, shoppingBags] = await Promise.all([
        bookletAPI.getAll(),
        notebookAPI.getAll(),
        ledgerAPI.getAll(),
        letterheadAPI.getAll(),
        shoppingBagsAPI.getAll(),
      ]);

      const bookletCount = booklets.data.data?.length || 0;
      const notebookCount = notebooks.data.data?.length || 0;
      const ledgerCount = ledgers.data.data?.length || 0;
      const letterheadCount = letterheads.data.data?.length || 0;
      const shoppingBagsCount = shoppingBags.data.data?.length || 0;

      setStats({
        booklets: bookletCount,
        notebooks: notebookCount,
        ledgers: ledgerCount,
        letterheads: letterheadCount,
        shoppingBags: shoppingBagsCount,
        total: bookletCount + notebookCount + ledgerCount + letterheadCount + shoppingBagsCount,
      });

      // Combine recent orders
      const allOrders = [
        ...(booklets.data.data || []).map(o => ({ ...o, type: 'Booklet', date: o.createdAt })),
        ...(notebooks.data.data || []).map(o => ({ ...o, type: 'Notebook', date: o.createdAt })),
        ...(ledgers.data.data || []).map(o => ({ ...o, type: 'Ledger', date: o.createdAt })),
        ...(letterheads.data.data || []).map(o => ({ ...o, type: 'Letterhead', date: o.createdAt })),
        ...(shoppingBags.data.data || []).map(o => ({ ...o, type: 'Shopping Bag', date: o.createdAt })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      setRecentOrders(allOrders);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Orders', value: stats.total, icon: '📊', color: '#3b82f6', link: '/dashboard' },
    { title: 'Booklets', value: stats.booklets, icon: '📚', color: '#8b5cf6', link: '/booklets' },
    { title: 'Notebooks', value: stats.notebooks, icon: '📓', color: '#10b981', link: '/notebooks' },
    { title: 'Ledger Registers', value: stats.ledgers, icon: '📒', color: '#f59e0b', link: '/ledger-register' },
    { title: 'Letterheads', value: stats.letterheads, icon: '📄', color: '#ef4444', link: '/letterheads' },
    { title: 'Shopping Bags', value: stats.shoppingBags, icon: '🛍️', color: '#06b6d4', link: '/shopping-bags' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p className="dashboard-subtitle">Welcome to Urasa Admin Panel</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map((stat, index) => (
              <Link to={stat.link} key={index} className="stat-card-link">
                <div className="stat-card" style={{ '--stat-color': stat.color }}>
                  <div className="stat-icon" style={{ background: `rgba(${hexToRgb(stat.color)}, 0.2)` }}>
                    {stat.icon}
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{stat.value}</h3>
                    <p className="stat-label">{stat.title}</p>
                  </div>
                  {/* <div className="stat-arrow">→</div> */}
                </div>
              </Link>
            ))}
          </div>

          <div className="recent-orders">
            <div className="section-header">
              <h2>Recent Orders</h2>
              <Link to="/dashboard" className="view-all">View All</Link>
            </div>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <span className="order-type">{order.type}</span>
                        </td>
                        <td>{order.customerDetails?.name || 'N/A'}</td>
                        <td>{order.customerDetails?.email || 'N/A'}</td>
                        <td>{order.customerDetails?.phone || 'N/A'}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>
                          <button className="view-btn">View</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-orders">No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default Dashboard;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { admin, logout, updateAdminProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminAPI.updateProfile(formData);
      updateAdminProfile(response.data.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);

    try {
      await adminAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 Profile Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <h2>{admin?.name || 'Admin'}</h2>
            <p className="profile-role-badge">{admin?.role || 'Administrator'}</p>
            <p className="profile-email">{admin?.email || 'admin@urasa.com'}</p>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <div>
                <span className="stat-value">Active</span>
                <span className="stat-label">Status</span>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🛡️</span>
              <div>
                <span className="stat-value">{admin?.role === 'super-admin' ? 'Super' : 'Standard'}</span>
                <span className="stat-label">Access Level</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-forms">
          <div className="form-card">
            <div className="form-header">
              <h3>Edit Profile Information</h3>
              <button 
                className={`btn-toggle ${isEditing ? 'active' : ''}`}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="form-card">
            <div className="form-header">
              <h3>🔐 Change Password</h3>
            </div>

            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-password" disabled={loading}>
                  {loading ? 'Updating...' : '🔑 Update Password'}
                </button>
              </div>
            </form>
          </div>

          <div className="form-card danger-zone">
            <div className="form-header">
              <h3>⚠️ Danger Zone</h3>
            </div>
            <p className="danger-text">
              Once you log out, you will need to enter your credentials to access your account again.
            </p>
            <button className="btn-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

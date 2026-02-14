import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏢 Smart Inventory Management System</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.first_name} {user?.last_name}!</h2>
          <div className="user-info">
            <div className="info-item">
              <span className="label">Username:</span>
              <span className="value">{user?.username}</span>
            </div>
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="label">Role:</span>
              <span className={`badge ${user?.role}`}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <div className="feature-card disabled">
            <div className="icon">📦</div>
            <h3>Products</h3>
            <p>Manage your inventory</p>
            <small>Coming Soon</small>
          </div>

          <div className="feature-card disabled">
            <div className="icon">📊</div>
            <h3>Reports</h3>
            <p>View sales reports</p>
            <small>Coming Soon</small>
          </div>

          <div className="feature-card disabled">
            <div className="icon">🔔</div>
            <h3>Alerts</h3>
            <p>Low stock notifications</p>
            <small>Coming Soon</small>
          </div>

          <div className="feature-card disabled">
            <div className="icon">📝</div>
            <h3>Transactions</h3>
            <p>Track movements</p>
            <small>Coming Soon</small>
          </div>
        </div>

        <div className="info-banner">
          <h3>✅ Authentication System Active</h3>
          <p>User registration and login functionality is now complete!</p>
          <p className="small-text">
            This is Milestone 1 (Weeks 1-2) - Authentication and Role-Based Access Control
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

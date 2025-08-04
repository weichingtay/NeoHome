import React, { useState } from 'react';
import { FiHome, FiUser, FiLock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    
    if (!success) {
      setError('Invalid username or password');
    } else {
      setError('');
    }
  };

  const fillDemo = () => {
    setUsername('demo');
    setPassword('demo123');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FiHome className="login-logo" />
          <h1>NeoHome</h1>
          <p>Smart Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <FiUser className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FiLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>

        <div className="demo-section">
          <p>Demo Credentials:</p>
          <button type="button" onClick={fillDemo} className="demo-btn">
            Use Demo Account
          </button>
          <small>Username: demo | Password: demo123</small>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
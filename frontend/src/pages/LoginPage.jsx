import { useState } from 'react';
import { FaLock, FaShieldHalved } from 'react-icons/fa6';

import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: 'admin@milassets.local',
    password: 'Admin@123'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(credentials);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <FaShieldHalved />
          <div>
            <h1>Military Asset Management</h1>
            <p>Secure visibility for asset movement, assignments and expenditure across bases.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={credentials.email}
              onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>

          <button type="submit" className="primary-button" disabled={submitting}>
            <FaLock />
            <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="credential-hint">
          <span>Seed login</span>
          <p>`admin@milassets.local / Admin@123`</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

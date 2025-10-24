import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import './Login.css';

const Login = () => {
  const [authAction, setAuthAction] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('STUDENT');
  const [status, setStatus] = useState({ message: '', error: false });
  const { login} = useAuth();

  const handleAuthAction = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setStatus({ message: 'Username and password are required.', error: true });
      return;
    }
    
    setStatus({ message: 'Processing...', error: false });
    const credentials = { username, password, userType };
    
    const result = await login(credentials);

    if (!result.success) {
      setStatus({ message: result.message, error: true });
    }
  };

  return (
    <>
      <div className="auth-view">
        <div className="auth-container">
          
          <div className="scrolling-title">
            <marquee>
              🤝 Huddle Space: A Collaborative 🎓 Academic 💬 Discussion Forum 🗣️
            </marquee>
          </div>

          <div className="auth-header">
            <h1>HuddleSpace</h1>
            <p>Connect and collaborate instantly.</p>
          </div>

          <form className="auth-form" onSubmit={handleAuthAction}>
            <div className="auth-tabs">
              <button
                type="button"
                className={authAction === 'login' ? 'active' : ''}
                onClick={() => setAuthAction('login')}
              >
                Login
              </button>
              
            </div>

            <div className="auth-inputs">
              <input
                type="text"
                placeholder="Username (Roll No / Faculty ID)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <select value={userType} onChange={(e) => setUserType(e.target.value)}>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
              </select>
            </div>

            <button type="submit" className="auth-button">
              {authAction === 'login' ? 'Login' : 'Register'}
            </button>

            {status.message && (
              <div className={`auth-status ${status.error ? 'error' : 'success'}`}>
                {status.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* --- MOVED FOOTER OUTSIDE OF .auth-view --- */}
      <p className="auth-footer">
        copyright © All rights are reserved by Team Negative Feedback
      </p>
    </>
  );
};

export default Login;
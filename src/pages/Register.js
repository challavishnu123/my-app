import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import './Login.css'; // Assuming styles are shared
import { useNavigate } from 'react-router-dom'; // 1. IMPORT useNavigate

/**
 * Registration Component
 * @param {object} props
 * @param {function} props.onNavigateToLogin - Optional function to switch view to Login
 */
// 2. REMOVE onNavigateToLogin prop
const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('STUDENT');
  const [status, setStatus] = useState({ message: '', error: false });
  const { register } = useAuth(); // Only need the register function
  const navigate = useNavigate(); // 3. INITIALIZE useNavigate

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setStatus({ message: 'Username and password are required.', error: true });
      return;
    }
    
    setStatus({ message: 'Processing...', error: false });
    const credentials = { username, password, userType };
    
    // Only call register
    const result = await register(credentials);

    if (!result.success) {
      setStatus({ message: result.message, error: true });
    } else {
      // --- 4. THIS IS THE FIX ---
      // On success, show message and clear the form
      setStatus({ message: result.message, error: false });
      setUsername('');
      setPassword('');
      // The user is NOT logged in or redirected.
    }
  };

  // 5. ADDED this handler
  const handleGoToLogin = () => {
    navigate('/login'); // Navigate to the main login page
  };

  return (
    <div className="auth-view">
      <div className="auth-container">
        <div className="auth-header">
          <h1>HuddleSpace</h1>
          <p>Create your account.</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          {/* Tabs are removed as this component is only for registration */}
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
            {/* Consider adding a "Confirm Password" input for better UX */}
            <select value={userType} onChange={(e) => setUserType(e.target.value)}>
              <option value="STUDENT">Student</option>
              {/*<option value="FACULTY">Faculty</option>*/}
            </select>
          </div>

          <button type="submit" className="auth-button">
            Register
          </button>

          {status.message && (
            <div className={`auth-status ${status.error ? 'error' : 'success'}`}>
              {status.message}
            </div>
          )}

          {/* 6. MODIFIED this button */}
        </form>
      </div>
    </div>
  );
};

export default Register;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import UserSettings from './pages/UserSettings';
import AdminPanel from './pages/AdminPanel';
import ConnectionRequests from './pages/ConnectionRequests';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Feed from './pages/Feed'; // Ensure Feed is imported
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <Routes>
        {/* Public route for login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes that use the main layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Default route redirects to the chat dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* All main pages of your application */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="feed" element={<Feed />} />
          <Route path="forum" element={<Forum />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="connections" element={<ConnectionRequests />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="profile/:username" element={<Profile />} />
        </Route>

        {/* Fallback for any other URL */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
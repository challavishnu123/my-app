import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import UserSettings from './pages/UserSettings';
import AdminPanel from './pages/AdminPanel';
import ConnectionRequests from './pages/ConnectionRequests';
import Profile from './pages/Profile'; // --- IMPORT ---
import EditProfile from './pages/EditProfile'; // --- IMPORT ---
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="forum" element={<Forum />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="connections" element={<ConnectionRequests />} />
          {/* --- ADD NEW PROFILE ROUTES --- */}
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="profile/:username" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
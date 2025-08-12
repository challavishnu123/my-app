import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <aside className="sidebar">
            <header className="sidebar-header">
                <Link to={`/profile/${user.username}`} className="sidebar-user-link">
                    <div className="sidebar-user">{user.username}</div>
                </Link>
                <button onClick={logout} title="Logout" className="logout-btn">Logout</button>
            </header>

            <nav className="sidebar-nav">
                <Link to="/dashboard" className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                    Chat
                </Link>
                {/* --- THIS IS THE FIX --- */}
                {/* The missing "Feed" link has been added to the navigation. */}
                <Link to="/feed" className={`nav-link ${location.pathname.startsWith('/feed') ? 'active' : ''}`}>
                    Feed
                </Link>
                <Link to="/forum" className={`nav-link ${location.pathname.startsWith('/forum') ? 'active' : ''}`}>
                    Forum
                </Link>
                <Link to="/connections" className={`nav-link ${location.pathname.startsWith('/connections') ? 'active' : ''}`}>
                    Requests
                </Link>
                <Link to="/settings" className={`nav-link ${location.pathname.startsWith('/settings') ? 'active' : ''}`}>
                    Settings
                </Link>
                {user.userType === 'FACULTY' && (
                    <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                        Admin Panel
                    </Link>
                )}
            </nav>
            
            <div className="sidebar-footer">
                <p>HuddleSpace v1.9</p>
            </div>
        </aside>
    );
};

export default Sidebar;
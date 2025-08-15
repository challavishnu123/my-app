import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Sidebar.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navigationItems = [
        {
            path: `/profile/${user.username}`,
            label: 'Profile',
            icon: '👤',
            isActive: location.pathname.includes('/profile')
        },
        {
            path: '/dashboard',
            label: 'Chat',
            icon: '💬',
            isActive: location.pathname.startsWith('/dashboard')
        },
        {
            path: '/feed',
            label: 'Feed',
            icon: '',
            isActive: location.pathname.startsWith('/feed')
        },
        {
            path: '/forum',
            label: 'Forum',
            icon: '❓',
            isActive: location.pathname.startsWith('/forum')
        },
        {
            path: '/connections',
            label: 'Connections',
            icon: '🤝',
            isActive: location.pathname.startsWith('/connections')
        },
        {
            path: '/settings',
            label: 'Settings',
            icon: '⚙️',
            isActive: location.pathname.startsWith('/settings')
        }
    ];

    // Add admin panel for faculty
    if (user.userType?.toUpperCase() === 'FACULTY') {
        navigationItems.push({
            path: '/admin',
            label: 'Admin Panel',
            icon: '🛡️',
            isActive: location.pathname.startsWith('/admin')
        });
    }

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
        }
    };

    return (
        <aside className="sidebar">
            <header className="sidebar-header">
                <Link to={`/profile/${user.username}`} className="sidebar-user-link">
                    <div className="sidebar-user">
                        <div className="user-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{user.username}</div>
                            {/* FIX: Check userType value before displaying to ensure correctness */}
                            <div className="user-type">
                                {user.userType?.toUpperCase() === 'STUDENT' ? 'Student' : 'Faculty'}
                            </div>
                        </div>
                    </div>
                </Link>
                <button onClick={handleLogout} title="Logout" className="logout-btn">
                    🚪
                </button>
            </header>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">Navigation</div>
                    {navigationItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path} 
                            className={`nav-link ${item.isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            {item.isActive && <span className="nav-indicator"></span>}
                        </Link>
                    ))}
                </div>

                {/* Quick Actions Section */}
                <div className="nav-section">
                    <div className="nav-section-title">Quick Actions</div>
                    <button className="quick-action-btn" title="New Message">
                        <span className="nav-icon">✉️</span>
                        <span className="nav-label">New Message</span>
                    </button>
                    <button className="quick-action-btn" title="Create Post">
                        <span className="nav-icon">➕</span>
                        <span className="nav-label">Create Post</span>
                    </button>
                </div>
            </nav>
            
            <div className="sidebar-footer">
                <div className="app-info">
                    <div className="app-logo">🏠</div>
                    <div className="app-details">
                        <div className="app-name">HuddleSpace</div>
                        <div className="app-version">v2.0</div>
                    </div>
                </div>
                <div className="status-indicator online">
                    <span className="status-dot"></span>
                    <span className="status-text">Online</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
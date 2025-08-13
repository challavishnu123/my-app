import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import useAuth from '../hooks/useAuth';

const Profile = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await apiCall(`/api/profiles/${username}`);
                setProfile(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    const handleStartChat = () => {
        navigate(`/dashboard?chatWith=${username}`);
    };
    
    const handleConnect = async () => {
        try {
            await apiCall(`/api/connections/request/${username}`, 'POST');
            alert('Connection request sent!');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-state">
                    <h2>Error</h2>
                    <p className="error-message">{error}</p>
                    <button onClick={() => navigate(-1)} className="action-button">Go Back</button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-container">
                <div className="empty-state">
                    <h2>Profile not found</h2>
                    <p>The user you're looking for doesn't exist.</p>
                    <button onClick={() => navigate(-1)} className="action-button">Go Back</button>
                </div>
            </div>
        );
    }

    const isOwnProfile = user.username === username;
    const isFriend = profile.connections?.includes(user.username);

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-header-content">
                    <div className="profile-avatar">
                        {(profile.name || username).charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-header-info">
                        <h1>{profile.name || username}</h1>
                        <p className="profile-title">
                            {profile.userType === 'STUDENT' ? 'Student' : 'Faculty'} • {profile.department}
                        </p>
                        <div className="profile-stats">
                            <div className="stat">
                                <strong>{profile.connections?.length || 0}</strong>
                                <span>Connections</span>
                            </div>
                            {profile.subjects && (
                                <div className="stat">
                                    <strong>{profile.subjects.length}</strong>
                                    <span>Subjects</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="profile-actions">
                    {isOwnProfile ? (
                        <Link to="/profile/edit" className="action-button primary">
                            <span>✏️</span>
                            Edit Profile
                        </Link>
                    ) : (
                        <>
                            {isFriend ? (
                                <button onClick={handleStartChat} className="action-button primary">
                                    <span>💬</span>
                                    Message
                                </button>
                            ) : (
                                <button onClick={handleConnect} className="action-button secondary">
                                    <span>👋</span>
                                    Connect
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
            
            {/* Profile Details */}
            <div className="profile-content">
                <div className="profile-section">
                    <h3>About</h3>
                    <div className="profile-details">
                        {profile.rollNumber && (
                            <div className="detail-item">
                                <div className="detail-icon">🎓</div>
                                <div className="detail-content">
                                    <strong>Roll Number</strong>
                                    <span>{profile.rollNumber}</span>
                                </div>
                            </div>
                        )}
                        
                        {profile.facultyId && (
                            <div className="detail-item">
                                <div className="detail-icon">👨‍🏫</div>
                                <div className="detail-content">
                                    <strong>Faculty ID</strong>
                                    <span>{profile.facultyId}</span>
                                </div>
                            </div>
                        )}
                        
                        {profile.department && (
                            <div className="detail-item">
                                <div className="detail-icon">🏢</div>
                                <div className="detail-content">
                                    <strong>Department</strong>
                                    <span>{profile.department}</span>
                                </div>
                            </div>
                        )}
                        
                        {profile.year && (
                            <div className="detail-item">
                                <div className="detail-icon">📅</div>
                                <div className="detail-content">
                                    <strong>Year</strong>
                                    <span>{profile.year}</span>
                                </div>
                            </div>
                        )}
                        
                        {profile.section && (
                            <div className="detail-item">
                                <div className="detail-icon">📚</div>
                                <div className="detail-content">
                                    <strong>Section</strong>
                                    <span>{profile.section}</span>
                                </div>
                            </div>
                        )}
                        
                        {profile.email && (
                            <div className="detail-item">
                                <div className="detail-icon">📧</div>
                                <div className="detail-content">
                                    <strong>Email</strong>
                                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subjects Section for Faculty */}
                {profile.subjects && profile.subjects.length > 0 && (
                    <div className="profile-section">
                        <h3>Subjects</h3>
                        <div className="subjects-grid">
                            {profile.subjects.map((subject, index) => (
                                <div key={index} className="subject-tag">
                                    {subject}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Links Section */}
                {(profile.linkedinUrl || profile.githubUrl) && (
                    <div className="profile-section">
                        <h3>Links</h3>
                        <div className="links-grid">
                            {profile.linkedinUrl && (
                                <a 
                                    href={profile.linkedinUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="link-card linkedin"
                                >
                                    <div className="link-icon">💼</div>
                                    <div className="link-content">
                                        <strong>LinkedIn</strong>
                                        <span>View Professional Profile</span>
                                    </div>
                                </a>
                            )}
                            
                            {profile.githubUrl && (
                                <a 
                                    href={profile.githubUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="link-card github"
                                >
                                    <div className="link-icon">💻</div>
                                    <div className="link-content">
                                        <strong>GitHub</strong>
                                        <span>View Code Repository</span>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Connections Section */}
                {profile.connections && profile.connections.length > 0 && (
                    <div className="profile-section">
                        <h3>Connections ({profile.connections.length})</h3>
                        <div className="connections-grid">
                            {profile.connections.slice(0, 6).map((connection, index) => (
                                <Link 
                                    key={index} 
                                    to={`/profile/${connection}`} 
                                    className="connection-card"
                                >
                                    <div className="connection-avatar">
                                        {connection.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{connection}</span>
                                </Link>
                            ))}
                            {profile.connections.length > 6 && (
                                <div className="connection-card more">
                                    <div className="connection-avatar">+</div>
                                    <span>{profile.connections.length - 6} more</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
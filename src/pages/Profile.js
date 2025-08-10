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
        // Navigate to the dashboard and pass the username in the URL to initiate a chat
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

    if (loading) return <div className="profile-container"><h1>Loading profile...</h1></div>;
    if (error) return <div className="profile-container"><h1>Error</h1><p className="error-message">{error}</p></div>;
    if (!profile) return <div className="profile-container"><h1>Profile not found.</h1></div>;

    const isOwnProfile = user.username === username;
    const isFriend = profile.connections?.includes(user.username);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>{profile.name || username}'s Profile</h1>
                <div>
                    {isOwnProfile && <Link to="/profile/edit" className="action-button">Edit Profile</Link>}
                    {!isOwnProfile && isFriend && (
                        <button onClick={handleStartChat} className="action-button">Chat with {profile.name || username}</button>
                    )}
                    {!isOwnProfile && !isFriend && (
                        <button onClick={handleConnect} className="action-button">Send Connect Request</button>
                    )}
                </div>
            </div>
            
            <div className="profile-details">
                {profile.rollNumber && <p><strong>Roll Number:</strong> {profile.rollNumber}</p>}
                {profile.facultyId && <p><strong>Faculty ID:</strong> {profile.facultyId}</p>}
                {profile.department && <p><strong>Department:</strong> {profile.department}</p>}
                {profile.year && <p><strong>Year:</strong> {profile.year}</p>}
                {profile.section && <p><strong>Section:</strong> {profile.section}</p>}
                {profile.email && <p><strong>Email:</strong> <a href={`mailto:${profile.email}`}>{profile.email}</a></p>}
                {profile.subjects && profile.subjects.length > 0 && <p><strong>Subjects:</strong> {profile.subjects.join(', ')}</p>}
                {profile.linkedinUrl && <p><strong>LinkedIn:</strong> <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">View Profile</a></p>}
                {profile.githubUrl && <p><strong>GitHub:</strong> <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">View Profile</a></p>}
            </div>
        </div>
    );
};

export default Profile;
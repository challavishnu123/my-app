import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import useAuth from '../hooks/useAuth';

const EditProfile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        apiCall(`/api/profiles/${user.username}`)
            .then(data => {
                setFormData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load profile for editing:", err);
                setLoading(false);
            });
    }, [user.username]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubjectChange = (e) => {
        setFormData(prev => ({ ...prev, subjects: e.target.value.split(',').map(s => s.trim()) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiCall('/api/profiles/update', 'PUT', formData);
            alert('Profile updated successfully!');
            navigate(`/profile/${user.username}`);
        } catch (error) {
            alert(`Failed to update profile: ${error.message}`);
        }
    };

    if (loading) return <div className="profile-container"><h1>Loading...</h1></div>;

    return (
        <div className="profile-container">
            <h1>Edit Your Profile</h1>
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Department</label>
                    <input type="text" name="department" value={formData.department || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>LinkedIn URL</label>
                    <input type="url" name="linkedinUrl" value={formData.linkedinUrl || ''} onChange={handleChange} />
                </div>

                {user.userType === 'STUDENT' && (
                    <>
                        <div className="form-group">
                            <label>Year</label>
                            <input type="text" name="year" value={formData.year || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Section</label>
                            <input type="text" name="section" value={formData.section || ''} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>GitHub URL</label>
                            <input type="url" name="githubUrl" value={formData.githubUrl || ''} onChange={handleChange} />
                        </div>
                    </>
                )}

                {user.userType === 'FACULTY' && (
                    <div className="form-group">
                        <label>Subjects (comma-separated)</label>
                        <input type="text" name="subjects" value={formData.subjects?.join(', ') || ''} onChange={handleSubjectChange} />
                    </div>
                )}

                <button type="submit" className="action-button">Save Changes</button>
            </form>
        </div>
    );
};

export default EditProfile;
import React, { useState } from 'react';
import { apiCall } from '../services/api';
import useAuth from '../hooks/useAuth';

const UserSettings = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const { user } = useAuth();

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) {
            setMessage({ text: 'Both old and new passwords are required.', type: 'error' });
            return;
        }

        const endpoint = `/${user.userType.toLowerCase()}/update-password`;
        const payload = {
            [user.userType === 'STUDENT' ? 'rollNumber' : 'facultyId']: user.username,
            newPassword: newPassword,
            // Note: Your backend might require the oldPassword for verification, 
            // but the current backend code doesn't seem to use it.
        };

        try {
            const response = await apiCall(endpoint, 'PUT', payload);
            setMessage({ text: response.message || 'Password updated successfully!', type: 'success' });
            setOldPassword('');
            setNewPassword('');
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    return (
        <div className="settings-container">
            <h1>User Settings</h1>
            <div className="settings-card">
                <h2>Change Password</h2>
                <form onSubmit={handleUpdatePassword}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter your current password"
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                        />
                    </div>
                    <button type="submit" className="action-button">Update Password</button>
                    {message.text && (
                        <p className={`message ${message.type}`}>{message.text}</p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default UserSettings;
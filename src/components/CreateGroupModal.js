import React, { useState } from 'react';
import { apiCall } from '../services/api';
import './Modal.css'; // Assuming you have a general modal CSS or create one

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState('GENERAL'); // Default type
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            setError('Group name is required.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const payload = {
                groupName: groupName.trim(),
                groupType,
                description: description.trim()
            };
            await apiCall('/api/chat/groups', 'POST', payload);
            alert('Group created successfully!');
            onGroupCreated(); // Notify dashboard to refresh group list
            onClose(); // Close the modal
        } catch (err) {
            setError(err.message || 'Failed to create group. Please try again.');
            console.error("Group creation failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Create New Group</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="groupName">Group Name</label>
                        <input
                            type="text"
                            id="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="groupType">Group Type</label>
                        <select
                            id="groupType"
                            value={groupType}
                            onChange={(e) => setGroupType(e.target.value)}
                            disabled={loading}
                        >
                            <option value="GENERAL">General</option>
                            <option value="SUBJECT">Subject</option>
                        
                            {/* Add other types if needed */}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description about group type</label>
                        <textarea
                            id="description"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        ></textarea>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="action-button" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
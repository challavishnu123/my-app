import React, { useState } from 'react';
import { apiCall } from '../services/api';
import './Modal.css'; // Assuming you have this file for general modal styles

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    // --- UPDATED: Default to GENERAL, limit options ---
    const [groupType, setGroupType] = useState('GENERAL');
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
                groupType, // Will be GENERAL or SUBJECT
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
                    {/* Group Name Input */}
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
                    {/* Group Type Select (Limited Options) */}
                    <div className="form-group">
                        <label htmlFor="groupType">Group Type</label>
                        <select
                            id="groupType"
                            value={groupType}
                            onChange={(e) => setGroupType(e.target.value)}
                            disabled={loading}
                        >
                            {/* --- ONLY THESE OPTIONS --- */}
                            <option value="GENERAL">General</option>
                            <option value="SUBJECT">Subject</option>
                            {/* --- END OPTIONS --- */}
                        </select>
                    </div>
                    {/* Description Textarea */}
                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        ></textarea>
                    </div>
                    {/* Error Message */}
                    {error && <p className="error-message">{error}</p>}
                    {/* Modal Actions */}
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
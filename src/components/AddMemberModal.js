// src/components/AddMemberModal.js
import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';
import useAuth from '../hooks/useAuth'; // Import useAuth
import './Modal.css'; // General modal styles
import './AddMemberModal.css'; // Specific styles for this modal

const AddMemberModal = ({ groupId, currentMembers, onClose, onAddMember }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const { user } = useAuth(); // Get current user info

    // Debounced search effect
    useEffect(() => {
        const performSearch = async () => {
            const query = searchQuery.trim();
            if (query === '') {
                setSearchResults([]);
                setSelectedUser(null); // Clear selection if query is cleared
                return;
            }
            setLoadingSearch(true);
            setError('');
            try {
                const results = await apiCall(`/api/users/search?query=${encodeURIComponent(query)}`);
                // Filter out current user, existing members, and ensure results is an array
                const filteredResults = Array.isArray(results) ? results.filter(
                    u => u.username !== user?.username && !currentMembers.includes(u.username)
                ) : [];
                setSearchResults(filteredResults);
            } catch (err) {
                setError('Search failed. Please try again.');
                setSearchResults([]);
            } finally {
                setLoadingSearch(false);
            }
        };

        const timeoutId = setTimeout(performSearch, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [searchQuery, currentMembers, user?.username]); // Add dependencies

    const handleSelectUser = (userResult) => {
        setSelectedUser(userResult);
        setSearchQuery(userResult.username); // Fill input with selected user
        setSearchResults([]); // Hide dropdown after selection
    };

    const handleAddClick = async () => {
        if (!selectedUser) {
            setError('Please select a user to add.');
            return;
        }
        setAdding(true);
        setError('');
        try {
            // Call the onAddMember prop passed from Dashboard
            await onAddMember(selectedUser.username);
            // onClose(); // Let the Dashboard handle closing after success if needed
        } catch (err) {
            setError(err.message || 'Failed to add member.');
            setAdding(false); // Stop loading indicator on error
        }
        // No finally block needed here if Dashboard handles closing
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content add-member-modal-content"> {/* Optional specific class */}
                <h2>Add Member to Group</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleAddClick(); }}>
                    <div className="form-group">
                        <label htmlFor="userSearch">Search User</label>
                        <input
                            type="text"
                            id="userSearch"
                            placeholder="Enter username (Roll No / Faculty ID)"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSelectedUser(null); // Clear selection when typing
                            }}
                            disabled={adding}
                            autoComplete="off" // Prevent browser autocomplete interference
                        />
                        {loadingSearch && <p className="search-loading-text">Searching...</p>}
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && !selectedUser && (
                             <div className="search-results-dropdown">
                                {searchResults.map(result => (
                                    <div
                                        key={result.username}
                                        className="search-result-item"
                                        onClick={() => handleSelectUser(result)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSelectUser(result)} // Allow keyboard selection
                                        tabIndex={0} // Make it focusable
                                    >
                                        {result.username} ({result.userType})
                                    </div>
                                ))}
                             </div>
                        )}
                        {searchQuery && !loadingSearch && searchResults.length === 0 && !selectedUser && (
                            <p className="no-results-text">No eligible users found.</p>
                        )}
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} disabled={adding}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="action-button"
                            disabled={adding || !selectedUser} // Disable if no user selected or adding
                        >
                            {adding ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal;
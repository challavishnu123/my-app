import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../services/api';
import './ConnectionRequests.css';
const ConnectionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const pendingRequests = await apiCall('/api/connections/pending');
            setRequests(pendingRequests);
        } catch (err) {
            console.error("Failed to fetch pending requests:", err);
            setError("Could not load your connection requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.trim() === '') {
                setSearchResults([]);
                return;
            }
            try {
                const results = await apiCall(`/api/users/search?query=${searchQuery}`);
                setSearchResults(results);
            } catch (error) {
                console.error("Search failed:", error);
            }
        };
        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSendRequest = async (receiverId) => {
        try {
            const response = await apiCall(`/api/connections/request/${receiverId}`, 'POST');
            alert(response.message || "Connection request sent!");
            // Clear search to hide the results after sending a request
            setSearchQuery('');
            setSearchResults([]);
            document.querySelector('.user-search-input-requests').value = '';
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleAccept = async (requesterId) => {
        try {
            await apiCall(`/api/connections/accept/${requesterId}`, 'POST');
            navigate('/dashboard');
        } catch (err) {
            alert(`Failed to accept request: ${err.message}`);
        }
    };

    const handleReject = async (requesterId) => {
        try {
            await apiCall(`/api/connections/reject/${requesterId}`, 'POST');
            setRequests(prev => prev.filter(id => id !== requesterId));
        } catch (err) {
            alert(`Failed to reject request: ${err.message}`);
        }
    };

    return (
        <div className="requests-container">
            <h1>Connections</h1>

            {/* --- NEW SEARCH SECTION --- */}
            <div className="add-friend-section">
                <h2>Find New Friends</h2>
                <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search by Roll Number or Faculty ID..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="user-search-input-requests"
                    />
                </div>
                {searchResults.length > 0 && (
                    <div className="search-results requests-search-results">
                        {searchResults.map(user => (
                            <div key={user.username} className="request-item">
                                <span>{user.username} ({user.userType})</span>
                                <button onClick={() => handleSendRequest(user.username)} className="connect-btn">Send Request</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <hr className="divider" />

            {/* --- EXISTING PENDING REQUESTS SECTION --- */}
            <h2>Pending Requests</h2>
            {loading && <p>Loading requests...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && requests.length > 0 && (
                <div className="requests-list">
                    {requests.map(requesterId => (
                        <div key={requesterId} className="request-item">
                            <span><strong>{requesterId}</strong> wants to connect.</span>
                            <div className="request-actions">
                                <button onClick={() => handleAccept(requesterId)} className="accept-btn">Accept</button>
                                <button onClick={() => handleReject(requesterId)} className="reject-btn">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && !error && requests.length === 0 && (
                <p>You have no pending connection requests.</p>
            )}
        </div>
    );
};

export default ConnectionRequests;
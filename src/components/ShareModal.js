import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';

const ShareModal = ({ post, onClose }) => {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friendData = await apiCall('/api/chat/conversations');
                setFriends(friendData.conversations || []);
            } catch (error) {
                console.error("Failed to fetch friends for sharing:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFriends();
    }, []);

    const handleShare = async (friendId) => {
        try {
            // --- THIS IS THE FIX ---
            // This now correctly calls the new REST endpoint.
            const payload = {
                receiverId: friendId,
                postId: post.id,
                postOwner: post.username,
                fileId: post.fileId
            };
            await apiCall('/api/feed/share', 'POST', payload); 
            alert(`Post shared with ${friendId}!`);
            onClose();
        } catch (error) {
            alert(`Failed to share post: ${error.message}`);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Share Post with a Friend</h2>
                {loading && <p>Loading friends...</p>}
                <div className="friends-list">
                    {friends.length > 0 ? friends.map(friend => (
                        <div key={friend} className="friend-item">
                            <span>{friend}</span>
                            <button onClick={() => handleShare(friend)} className="action-button">Send</button>
                        </div>
                    )) : <p>You have no friends to share with.</p>}
                </div>
                <div className="modal-actions">
                    <button type="button" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
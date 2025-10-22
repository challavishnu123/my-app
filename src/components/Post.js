import React, { useState } from 'react';
import { apiCall } from '../services/api';
import useAuth from '../hooks/useAuth';
import ShareModal from './ShareModal';
import './Post.css';
const API_BASE_URL = 'http://localhost:8080';

const Post = ({ post, onUpdate }) => {
    const { user } = useAuth(); // Hook to get current user info
    const [commentText, setCommentText] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);

    // Check if the current user has liked this post
    const hasLiked = post.likes.includes(user.username);
    // Check if the current user is the owner of this post
    const isOwner = post.username === user.username; // <-- Ownership check for delete button

    // Construct image URLs
    const thumbnailUrl = `${API_BASE_URL}/api/feed/images/${post.fileId}/thumbnail`;
    const fullImageUrl = `${API_BASE_URL}/api/feed/images/${post.fileId}`;

    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    // Handler for liking/unliking a post
    const handleLike = async () => {
        try {
            await apiCall(`/api/feed/posts/${post.id}/like`, 'POST');
            onUpdate(); // Refresh feed data
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    // Handler for submitting a comment
    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await apiCall(`/api/feed/posts/${post.id}/comment`, 'POST', { text: commentText });
            setCommentText(''); // Clear comment input
            onUpdate(); // Refresh feed data
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    // --- DELETE FUNCTIONALITY ---
    // Handler for deleting a post
    const handleDelete = async () => {
        // Ask for confirmation before deleting
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            // Call the backend DELETE endpoint
            await apiCall(`/api/feed/posts/${post.id}`, 'DELETE');
            onUpdate(); // Refresh feed data to remove the post
        } catch (error) {
            alert(`Failed to delete post: ${error.message}`); // Show error if deletion fails
        }
    };
    // --- END DELETE FUNCTIONALITY ---

    return (
        <>
            <div className="post-card">
                {/* Post Header */}
                <div className="post-author">
                    <div className="post-author-info">
                        <div className="post-author-name">{post.username}</div>
                        <div className="post-timestamp">{formatTimestamp(post.createdAt || new Date())}</div>
                    </div>
                    {/* --- DELETE BUTTON (Conditionally Rendered) --- */}
                    {isOwner && ( // Only show button if the current user is the owner
                        <button onClick={handleDelete} className="delete-post-btn">
                            Delete
                        </button>
                    )}
                    {/* --- END DELETE BUTTON --- */}
                </div>

                {/* Post Description */}
                <div className="post-description">
                    <strong>{post.username}</strong> {post.description}
                </div>

                {/* Post Image */}
                <a href={fullImageUrl} target="_blank" rel="noopener noreferrer">
                    <img src={thumbnailUrl} alt={post.description} className="post-image" />
                </a>

                {/* Post Content - Actions and Comments */}
                <div className="post-content">
                    {/* Post Actions (Like, Comment Count, Share) */}
                    <div className="post-actions">
                        <button onClick={handleLike} className={`like-btn ${hasLiked ? 'liked' : ''}`}>
                            <span>❤️</span>
                            <span>{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</span>
                        </button>
                        <div className="comment-count">
                            <span>💬</span>
                            <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
                        </div>
                        <button onClick={() => setShowShareModal(true)} className="share-btn">
                            <span>📤</span>
                            <span>Share</span>
                        </button>
                    </div>

                    {/* Comments Display */}
                    <div className="post-comments">
                        {post.comments.slice(-3).map((comment, index) => ( // Show latest 3 comments
                            <p key={index}>
                                <strong>{comment.username}</strong> {comment.text}
                            </p>
                        ))}

                        {post.comments.length > 3 && ( // Option to view more comments if needed
                            <p className="view-more-comments">
                                View all {post.comments.length} comments
                            </p>
                        )}
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleComment} className="comment-form">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                        />
                        <button type="submit">Post</button>
                    </form>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal
                    post={post}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </>
    );
};

export default Post;
import React, { useState } from 'react';
import { apiCall } from '../services/api';
import useAuth from '../hooks/useAuth';
import ShareModal from './ShareModal';

const API_BASE_URL = 'http://localhost:8080';

const Post = ({ post, onUpdate }) => {
    const { user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    
    const hasLiked = post.likes.includes(user.username);
    const isOwner = post.username === user.username;
    
    const thumbnailUrl = `${API_BASE_URL}/api/feed/images/${post.fileId}/thumbnail`;
    const fullImageUrl = `${API_BASE_URL}/api/feed/images/${post.fileId}`;

    const handleLike = async () => {
        try {
            await apiCall(`/api/feed/posts/${post.id}/like`, 'POST');
            // --- THIS IS THE FIX ---
            // After a successful like, call onUpdate() to re-fetch all posts.
            onUpdate();
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await apiCall(`/api/feed/posts/${post.id}/comment`, 'POST', { text: commentText });
            setCommentText('');
            // --- THIS IS THE FIX ---
            // After a successful comment, call onUpdate() to re-fetch all posts.
            onUpdate();
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await apiCall(`/api/feed/posts/${post.id}`, 'DELETE');
            onUpdate();
        } catch (error) {
            alert(`Failed to delete post: ${error.message}`);
        }
    };
    
    return (
        <>
            <div className="post-card">
                <div className="post-author">
                    {post.username}
                    {isOwner && (
                        <button onClick={handleDelete} className="delete-post-btn">Delete</button>
                    )}
                </div>
                
                <a href={fullImageUrl} target="_blank" rel="noopener noreferrer">
                    <img src={thumbnailUrl} alt={post.description} className="post-image" />
                </a>

                <div className="post-content">
                    <div className="post-actions">
                        <button onClick={handleLike} className={`like-btn ${hasLiked ? 'liked' : ''}`}>
                            ❤️ {post.likes.length}
                        </button>
                        <span>💬 {post.comments.length}</span>
                        <button onClick={() => setShowShareModal(true)} className="share-btn">Share</button>
                    </div>
                    <p className="post-description">
                        <strong>{post.username}</strong> {post.description}
                    </p>
                    <div className="post-comments">
                        {post.comments.slice(-2).map((comment, index) => (
                            <p key={index}><strong>{comment.username}</strong> {comment.text}</p>
                        ))}
                    </div>
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
import React, { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../services/api';
import Post from '../components/Post';
import UploadModal from '../components/UploadModal';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    /**
     * --- THIS IS THE FIX ---
     * This function is now wrapped in useCallback to ensure it's stable and can be
     * passed down to child components without causing unnecessary re-renders.
     * It is responsible for fetching all posts from the backend.
     */
    const fetchPosts = useCallback(async () => {
        try {
            // We don't set loading to true here to avoid a full page flash on every update.
            const postData = await apiCall('/api/feed/posts');
            setPosts(postData);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            // Ensure loading is always turned off after the initial fetch.
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    if (loading) return <div className="feed-container"><h1>Loading Feed...</h1></div>;

    return (
        <div className="feed-container">
            <header className="feed-header">
                <h1>Image Feed</h1>
                <button onClick={() => setShowUploadModal(true)} className="action-button">Upload Post</button>
            </header>

            <div className="post-list">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <Post 
                            key={post.id} 
                            post={post} 
                            // Pass the fetchPosts function down as the 'onUpdate' prop.
                            // This allows a child component to trigger a data refresh for the entire feed.
                            onUpdate={fetchPosts} 
                        />
                    ))
                ) : (
                    <p>No posts yet. Be the first to share!</p>
                )}
            </div>

            {showUploadModal && (
                <UploadModal 
                    onClose={() => setShowUploadModal(false)}
                    onUploadSuccess={fetchPosts}
                />
            )}
        </div>
    );
};

export default Feed;
import React, { useState, useEffect, useCallback } from 'react';
import { apiCall } from '../services/api';
import Post from '../components/Post';
import UploadModal from '../components/UploadModal';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchPosts = useCallback(async () => {
        try {
            const postData = await apiCall('/api/feed/posts');
            setPosts(postData);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
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
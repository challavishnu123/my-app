import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

// A dedicated component for rendering a shared post preview
const SharedPost = ({ postId, postOwner, fileId }) => {
    const thumbnailUrl = `${API_BASE_URL}/api/feed/images/${fileId}/thumbnail`;
    const postLink = `/feed`; // Link to the main feed

    return (
        <Link to={postLink} className="shared-post-link">
            <div className="shared-post-card">
                <img src={thumbnailUrl} alt={`Post by ${postOwner}`} />
                <div className="shared-post-info">
                    <strong>Post by {postOwner}</strong>
                    <span>Click to view</span>
                </div>
            </div>
        </Link>
    );
};

const MessageList = ({ messages, currentUser }) => {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
                behavior: "smooth",
                block: "end",
                inline: "nearest"
            });
        }
    };

    useEffect(() => {
        // Add a small delay to ensure DOM is updated
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
            
            if (isNearBottom) {
                scrollToBottom();
            }
        }
    }, [messages]);

    return (
        <div className="messages-container" ref={messagesContainerRef}>
            {messages.map((msg, index) => {
                const isSent = msg.senderId === currentUser;
                const timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // --- THIS LOGIC IS NOW CORRECT ---
                if (msg.messageText && msg.messageText.startsWith('SHARED_POST::')) {
                    const parts = msg.messageText.split('::');
                    const [, postId, postOwner, fileId] = parts;

                    return (
                        <div key={msg.id || index} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
                            <div className="message">
                                {!isSent && <div className="sender-id">{msg.senderId} shared a post:</div>}
                                {isSent && <div className="sender-id">You shared a post:</div>}
                                <SharedPost postId={postId} postOwner={postOwner} fileId={fileId} />
                                <div className="timestamp">{timestamp}</div>
                            </div>
                        </div>
                    );
                }

                // Render a normal text message
                return (
                    <div key={msg.id || index} className={`message-wrapper ${isSent ? 'sent' : 'received'}`}>
                        <div className="message">
                            {!isSent && <div className="sender-id">{msg.senderId}</div>}
                            <p>{msg.messageText}</p>
                            <div className="timestamp">{timestamp}</div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
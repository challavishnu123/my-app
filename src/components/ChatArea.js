import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { apiCall } from '../services/api';

const ChatArea = ({ currentChat, messages, onSendMessage, onGroupAction, currentUser, groupMembers, onRemoveMember }) => {
    const [showMembers, setShowMembers] = useState(false);

    const handleJoinGroup = async () => {
        if (!currentChat) return;
        try {
            await apiCall(`/api/chat/groups/${currentChat.id}/join`, 'POST');
            onGroupAction();
        } catch (error) {
            alert(`Failed to join group: ${error.message}`);
        }
    };
    
    const handleLeaveGroup = async () => {
        if (!currentChat) return;
        try {
            await apiCall(`/api/chat/groups/${currentChat.id}/leave`, 'POST');
            onGroupAction();
        } catch (error) {
            alert(`Failed to leave group: ${error.message}`);
        }
    };

    if (!currentChat) {
        return (
            <main className="chat-area welcome-screen">
                <div className="welcome-content">
                    <div className="welcome-icon">💬</div>
                    <h2>Welcome to HuddleSpace</h2>
                    <p>Select a conversation or group from the sidebar to start chatting with your friends and colleagues.</p>
                    <div className="welcome-features">
                        <div className="feature">
                            <span className="feature-icon">🚀</span>
                            <span>Real-time messaging</span>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">👥</span>
                            <span>Group conversations</span>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">🔒</span>
                            <span>Secure communications</span>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const canSendMessage = currentChat.type === 'private' || currentChat.isMember;

    return (
        <main className="chat-area">
            {/* Modern Chat Header */}
            <header className="chat-header">
                <div className="chat-header-info">
                    <div className="chat-avatar">
                        {currentChat.type === 'group' ? '#' : currentChat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="chat-details">
                        <h2>{currentChat.name || 'Chat'}</h2>
                        <span className="chat-status">
                            {currentChat.type === 'group' 
                                ? `${groupMembers.length} members` 
                                : 'Online'
                            }
                        </span>
                    </div>
                </div>
                
                <div className="header-actions">
                    {currentChat.type === 'group' && (
                        <>
                            <button 
                                className={`header-btn ${showMembers ? 'active' : ''}`}
                                onClick={() => setShowMembers(!showMembers)}
                                title={showMembers ? 'Hide Members' : 'Show Members'}
                            >
                                👥
                            </button>
                            {currentChat.isMember ? (
                                <button 
                                    className="header-btn leave-btn" 
                                    onClick={handleLeaveGroup}
                                    title="Leave Group"
                                >
                                    🚪
                                </button>
                            ) : (
                                <button 
                                    className="header-btn join-btn" 
                                    onClick={handleJoinGroup}
                                    title="Join Group"
                                >
                                    ➕
                                </button>
                            )}
                        </>
                    )}
                    <button className="header-btn" title="More options">
                        ⋮
                    </button>
                </div>
            </header>
            
            {/* Group Members Panel */}
            {showMembers && currentChat.type === 'group' && (
                <div className="member-list-panel">
                    <div className="members-header">
                        <h4>Group Members ({groupMembers.length})</h4>
                        <button 
                            className="close-members-btn"
                            onClick={() => setShowMembers(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="members-list">
                        {groupMembers.map(member => (
                            <div key={member} className="member-item">
                                <div className="member-avatar">
                                    {member.charAt(0).toUpperCase()}
                                </div>
                                <div className="member-info">
                                    <span className="member-name">{member}</span>
                                    {member === currentUser.username && (
                                        <span className="member-badge">You</span>
                                    )}
                                </div>
                                {currentUser.userType === 'FACULTY' && member !== currentUser.username && (
                                    <button 
                                        onClick={() => onRemoveMember(member)} 
                                        className="remove-member-btn"
                                        title="Remove member"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <MessageList messages={messages} currentUser={currentUser.username} />

            {/* Message Input or Join Prompt */}
            {canSendMessage ? (
                <MessageInput onSendMessage={onSendMessage} />
            ) : (
                <div className="join-prompt">
                    <div className="join-prompt-content">
                        <div className="join-icon">🔒</div>
                        <div className="join-text">
                            <h3>Private Group</h3>
                            <p>You are not a member of this group. Join to participate in conversations.</p>
                            <button 
                                className="join-prompt-btn"
                                onClick={handleJoinGroup}
                            >
                                Join Group
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ChatArea;
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
            onGroupAction(); // This refreshes the chat state in the Dashboard
        } catch (error) {
            alert(`Failed to join group: ${error.message}`);
        }
    };
    
    const handleLeaveGroup = async () => {
        if (!currentChat) return;
        try {
            await apiCall(`/api/chat/groups/${currentChat.id}/leave`, 'POST');
            onGroupAction(); // This refreshes the chat state in the Dashboard
        } catch (error) {
            alert(`Failed to leave group: ${error.message}`);
        }
    };

    if (!currentChat) {
        return (
            <main className="chat-area welcome-screen">
                <h2>Welcome to HuddleSpace</h2>
                <p>Select a conversation or group to start chatting.</p>
            </main>
        );
    }

    const canSendMessage = currentChat.type === 'private' || currentChat.isMember;

    return (
        <main className="chat-area">
            <header className="chat-header">
                <h2>{currentChat.name || 'Chat'}</h2>
                <div className="header-actions">
                    {currentChat.type === 'group' && (
                        <>
                            <button onClick={() => setShowMembers(!showMembers)}>
                                {showMembers ? 'Hide Members' : 'Show Members'}
                            </button>
                            {currentChat.isMember ? (
                                <button className="leave-group-btn" onClick={handleLeaveGroup}>Leave Group</button>
                            ) : (
                                <button className="join-group-btn" onClick={handleJoinGroup}>Join Group</button>
                            )}
                        </>
                    )}
                </div>
            </header>
            
            {showMembers && currentChat.type === 'group' && (
                <div className="member-list-panel">
                    <h4>Group Members ({groupMembers.length})</h4>
                    <ul>
                        {groupMembers.map(member => (
                            <li key={member}>
                                {member}
                                {currentUser.userType === 'FACULTY' && member !== currentUser.username && (
                                    <button onClick={() => onRemoveMember(member)} className="remove-member-btn">
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <MessageList messages={messages} currentUser={currentUser.username} />

            {canSendMessage ? (
                <MessageInput onSendMessage={onSendMessage} />
            ) : (
                <div className="join-prompt">
                    <p>You are not a member of this group. Join to see and send messages.</p>
                </div>
            )}
        </main>
    );
};

export default ChatArea;
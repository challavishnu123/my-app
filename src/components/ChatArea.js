// src/components/ChatArea.js
import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { apiCall } from '../services/api';
import './ChatArea.css'; // Ensure CSS is imported

const ChatArea = ({ currentChat, messages, onSendMessage, onGroupAction, currentUser, groupMembers, onRemoveMember, onShowAddMember }) => {
    const [showMembers, setShowMembers] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false); // State for group info panel visibility
    const [groupDetails, setGroupDetails] = useState(null); // State to store full group details

    // Fetch Full Group Details when currentChat changes to a group or relevant details change
    useEffect(() => {
        // Reset details and info panel visibility when chat changes fundamentally
        if (currentChat?.id !== groupDetails?.groupId) { // Check if the group ID itself changed
             setGroupDetails(null);
             setShowGroupInfo(false);
             setShowMembers(false); // Also hide members list when switching chats
        }

        if (currentChat?.type === 'group') {
            // Fetch or re-fetch details if not loaded or if the members list might be stale
            // (e.g., after adding/removing members externally - though WebSocket events are better for this)
            if (!groupDetails || currentChat.id !== groupDetails.groupId || groupDetails.members.length !== groupMembers.length) {
                apiCall(`/api/chat/groups/${currentChat.id}`)
                    .then(data => {
                        setGroupDetails(data.group); // Store the full group object
                    })
                    .catch(err => {
                        console.error("Failed to fetch full group details:", err);
                        setGroupDetails(null); // Reset on error
                        setShowGroupInfo(false); // Ensure panel hides on error
                    });
            }
        }
    }, [currentChat, groupMembers, groupDetails]); // Re-run when currentChat, groupMembers, or groupDetails state changes


    const handleJoinGroup = async () => {
        if (!currentChat) return;
        try {
            await apiCall(`/api/chat/groups/${currentChat.id}/join`, 'POST');
            onGroupAction(); // Refresh group list/details in Dashboard
        } catch (error) {
            alert(`Failed to join group: ${error.message}`);
        }
    };

    const handleLeaveGroup = async () => {
        if (!currentChat) return;
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            await apiCall(`/api/chat/groups/${currentChat.id}/leave`, 'POST');
            onGroupAction(); // Refresh group list/details in Dashboard
        } catch (error) {
            alert(`Failed to leave group: ${error.message}`);
        }
    };

    // Welcome screen when no chat is selected
    if (!currentChat) {
        return (
            <main className="chat-area welcome-screen">
                <div className="welcome-content">
                    <div className="welcome-icon">💬</div>
                    <h2>Welcome to HuddleSpace</h2>
                    <p>Select a conversation or group to start chatting.</p>
                     <div className="welcome-features">
                        <div className="feature"><span className="feature-icon">🚀</span><span>Real-time messaging</span></div>
                        <div className="feature"><span className="feature-icon">👥</span><span>Group conversations</span></div>
                        <div className="feature"><span className="feature-icon">🔒</span><span>Secure communications</span></div>
                    </div>
                </div>
            </main>
        );
    }

    const canSendMessage = currentChat.type === 'private' || currentChat.isMember;
    // Determine creator using groupDetails primarily, fallback to currentChat if needed
    const isGroupCreator = currentChat.type === 'group' &&
                          currentUser?.username && // Ensure currentUser is loaded
                          (groupDetails?.createdBy || currentChat.createdBy) === currentUser.username;


    return (
        <main className="chat-area">
            {/* Chat Header */}
            <header className="chat-header">
                 <div className="chat-header-info">
                    {/* Avatar */}
                    <div className="chat-avatar">
                        {currentChat.type === 'group' ? '#' : currentChat.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Chat Name & Status */}
                    <div className="chat-details">
                        <h2>{currentChat.name || 'Chat'}</h2>
                        <span className="chat-status">
                            {currentChat.type === 'group'
                                ? `${groupMembers.length} members` // Use state for member count
                                : 'Online' // Simplify for private chat
                            }
                        </span>
                    </div>
                 </div>

                {/* Header Actions */}
                <div className="header-actions">
                    {currentChat.type === 'group' && (
                        <>
                            {/* Group Info Toggle Button */}
                            <button
                                className={`header-btn ${showGroupInfo ? 'active' : ''}`}
                                onClick={() => setShowGroupInfo(!showGroupInfo)}
                                title={showGroupInfo ? 'Hide Group Info' : 'Show Group Info'}
                                disabled={!groupDetails} // Disable until details are loaded
                            >
                                ℹ️
                            </button>

                            {/* Toggle Member List Button */}
                            <button
                                className={`header-btn ${showMembers ? 'active' : ''}`}
                                onClick={() => setShowMembers(!showMembers)}
                                title={showMembers ? 'Hide Members' : 'Show Members'}
                            >
                                👥
                            </button>

                             {/* Add Member Button */}
                             {currentChat.isMember && ( // Only members can add
                                <button
                                    className="header-btn add-member-btn"
                                    onClick={onShowAddMember} // Passed from Dashboard
                                    title="Add Member"
                                >
                                    ➕👤
                                </button>
                             )}

                            {/* Join/Leave Button */}
                            {currentChat.isMember ? (
                                <button className="header-btn leave-btn" onClick={handleLeaveGroup} title="Leave Group">🚪</button>
                            ) : (
                                <button className="header-btn join-btn" onClick={handleJoinGroup} title="Join Group">➕</button>
                            )}
                        </>
                    )}
                    {/* More Options Button */}
                    <button className="header-btn" title="More options">⋮</button>
                </div>
            </header>

            {/* Group Info Panel (Conditionally Rendered) */}
            {showGroupInfo && currentChat.type === 'group' && groupDetails && (
                <div className="group-info-panel">
                    <h4>Group Information</h4>
                    <p><strong>Name:</strong> {groupDetails.groupName}</p>
                    <p><strong>Type:</strong> {groupDetails.groupType}</p>
                    <p><strong>Created By:</strong> {groupDetails.createdBy}</p>
                    <p><strong>Description:</strong> {groupDetails.description || <i>No description</i>}</p>
                    <p><strong>Members:</strong> {groupMembers.length}</p> {/* Use state */}
                     <button
                         className="close-info-btn"
                         onClick={() => setShowGroupInfo(false)}
                     >
                         Close Info
                     </button>
                </div>
            )}

            {/* Group Members Panel (Conditionally Rendered) */}
            {showMembers && currentChat.type === 'group' && (
                <div className="member-list-panel">
                    <div className="members-header">
                        <h4>Group Members ({groupMembers.length})</h4> {/* Use state */}
                        <button className="close-members-btn" onClick={() => setShowMembers(false)}>✕</button>
                    </div>
                    <div className="members-list">
                        {/* Ensure groupMembers is an array before mapping */}
                        {Array.isArray(groupMembers) && groupMembers.map(member => (
                            <div key={member} className="member-item">
                                <div className="member-avatar">{member.charAt(0).toUpperCase()}</div>
                                <div className="member-info">
                                    <span className="member-name">{member}</span>
                                    {member === currentUser?.username && (<span className="member-badge">You</span>)}
                                    {/* Use groupDetails for creator check */}
                                    {member === groupDetails?.createdBy && (<span className="member-badge creator-badge">Creator</span>)}
                                </div>
                                {/* Remove Button Check (Ensure currentUser exists) */}
                                {isGroupCreator && member !== currentUser?.username && (
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
                         {/* Handle case where groupMembers might not be an array yet */}
                         {!Array.isArray(groupMembers) && <p>Loading members...</p>}
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <MessageList messages={messages} currentUser={currentUser?.username} /> {/* Ensure currentUser exists */}

            {/* Message Input or Join Prompt */}
            {canSendMessage ? (
                <MessageInput onSendMessage={onSendMessage} />
            ) : (
                 currentChat.type === 'group' && !currentChat.isMember && (
                    <div className="join-prompt">
                         <div className="join-prompt-content">
                             <div className="join-icon">🔒</div>
                             <div className="join-text">
                                 <h3>Join Group</h3>
                                 <p>You need to be a member to send messages.</p>
                                 <button className="join-prompt-btn" onClick={handleJoinGroup}>Join Group</button>
                             </div>
                         </div>
                    </div>
                )
            )}
        </main>
    );
};

export default ChatArea;
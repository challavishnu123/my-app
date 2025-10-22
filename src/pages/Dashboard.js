// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ChatArea from '../components/ChatArea';
import CreateGroupModal from '../components/CreateGroupModal';
import AddMemberModal from '../components/AddMemberModal'; // Import AddMemberModal
import { apiCall } from '../services/api';
import { connectWebSocket, disconnectWebSocket, sendMessage, subscribeToGroup } from '../services/socket';
import './Dashboard.css';

// --- ChatList Component ---
const ChatList = ({ friends, groups, onSelectChat, currentChat, onRemoveFriend, onSearchChange, searchResults, user, onShowCreateGroupModal, onDeleteGroup }) => {
    const isFaculty = user?.userType === 'FACULTY';

    return (
        <div className="chat-list-panel">
           {/* Search Bar */}
           <div className="search-bar-container">
               <input type="text" placeholder="Search for users..." onChange={onSearchChange} className="user-search-input"/>
           </div>

           {/* Search Results */}
           {searchResults.length > 0 && (
               <div className="search-results">
                   <h3 className="list-header">Search Results</h3>
                   {searchResults.map(u => (
                       <Link to={`/profile/${u.username}`} key={u.username} className="list-item search-item">
                           <div className="avatar">{u.username.charAt(0).toUpperCase()}</div>
                           <span className="item-name">{u.username} ({u.userType})</span>
                       </Link>
                   ))}
               </div>
           )}

           {/* Friends List */}
           <div className="friends-list">
               <h3 className="list-header">Friends</h3>
               {friends.length === 0 && <p className="empty-list-message">No friends yet.</p>}
               {friends.map(friend => (
                   <div
                       key={friend}
                       className={`list-item ${currentChat?.type === 'private' && currentChat?.id === friend ? 'active' : ''}`}
                       onClick={() => onSelectChat(friend, 'private')}
                   >
                       <Link to={`/profile/${friend}`} className="friend-profile-link" onClick={e => e.stopPropagation()}>
                           <div className="avatar">{friend.charAt(0).toUpperCase()}</div>
                       </Link>
                       <span className="item-name">{friend}</span>
                       <button onClick={(e) => { e.stopPropagation(); onRemoveFriend(friend); }} className="remove-chat-btn" title="Remove Connection">×</button>
                   </div>
               ))}
           </div>

           {/* Groups List - Now shows ALL active groups */}
           <div className="groups-list">
               <div className="list-header-container">
                    <h3 className="list-header">Groups</h3>
                    {isFaculty && (
                        <button
                            onClick={onShowCreateGroupModal}
                            className="create-group-btn"
                            title="Create New Group"
                        >
                            +
                        </button>
                    )}
               </div>
               {groups.length === 0 && <p className="empty-list-message">No groups found.</p>}
               {groups.map(group => {
                   const isActive = currentChat?.type === 'group' && currentChat?.id === group.groupId;
                   // Faculty creator check
                   const canDelete = isFaculty && user.username === group.createdBy;
                   return (
                       <div
                           key={group.groupId}
                           className={`list-item ${isActive ? 'active' : ''}`}
                           onClick={() => onSelectChat(group.groupId, 'group', group.groupName)}
                       >
                           <div className="avatar">#</div>
                           <span className="item-name">{group.groupName}</span>
                           {/* Conditionally show Delete Group Button */}
                           {canDelete && (
                               <button
                                   onClick={(e) => {
                                       e.stopPropagation();
                                       onDeleteGroup(group.groupId, group.groupName);
                                   }}
                                   className="delete-group-btn"
                                   title="Delete Group"
                               >
                                   🗑️
                               </button>
                           )}
                       </div>
                   );
                })}
           </div>
        </div>
    );
};

// --- Main Dashboard Component ---
const Dashboard = () => {
    const { user, token } = useAuth();
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]); // Will hold ALL active groups
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const addMemberModalGroupIdRef = useRef(null);

    // --- Unified WebSocket Message Handler ---
    const handleNewWebSocketMessage = useCallback((msg) => {
        if (!user) return;
        if (msg.groupId) { // Group Message
           if (msg.senderId !== user.username && currentChat?.type === 'group' && msg.groupId === currentChat.id) {
               setMessages(prev => [...prev, msg]);
           }
        } else if (msg.receiverId) { // Private Message
           if (currentChat?.type === 'private' &&
              ((msg.senderId === currentChat.id && msg.receiverId === user.username) ||
               (msg.senderId === user.username && msg.receiverId === currentChat.id))
              ) {
                setMessages(prev => [...prev, msg]);
                apiCall(`/api/chat/mark-read/${msg.senderId}`, 'PUT').catch(err => console.error("Auto mark-read failed:", err));
            } else if (msg.receiverId === user.username) {
                 console.log("Received private message for another chat:", msg);
            }
        }
    }, [currentChat, user]);

    // --- Select Chat Function ---
    const selectChat = useCallback(async (id, type, name = null) => {
        if (!user || !id) return;
        setMessages([]);
        setGroupMembers([]);
        const chatName = name || id;
        // Fetch group details *first* to get creator info before setting state
        let groupDetails = null;
        let isMember = false;
        let createdBy = null;
        if (type === 'group') {
             try {
                groupDetails = await apiCall(`/api/chat/groups/${id}`);
                isMember = groupDetails.group.members.includes(user.username);
                createdBy = groupDetails.group.createdBy; // Store creator
                setGroupMembers(groupDetails.group.members || []);
             } catch (groupError) {
                 console.error(`Failed to fetch group details for ${id}:`, groupError);
                 setCurrentChat(null); // Abort selection on error
                 return;
             }
        }

        // Set state including creator info for groups
        setCurrentChat({ id, type, name: chatName, isMember, createdBy }); // Add createdBy

        try {
            if (type === 'private') {
                const data = await apiCall(`/api/chat/private-messages/${id}`);
                setMessages(data.messages || []);
                await apiCall(`/api/chat/mark-read/${id}`, 'PUT');
            } else if (type === 'group') {
                subscribeToGroup(id, handleNewWebSocketMessage);
                if (isMember) { // Use the isMember flag determined above
                    const data = await apiCall(`/api/chat/groups/${id}/messages`);
                    setMessages(data.messages || []);
                }
                 // No need to fetch group details again here
            }
        } catch (error) {
             console.error(`Failed operation for chat ${id} (${type}):`, error);
             setMessages([]);
             if (type === 'group') setGroupMembers([]); // Clear members on error too
             setCurrentChat(null);
        }
    }, [user, handleNewWebSocketMessage]);

    // --- Fetch Initial Data (Friends & All Groups) ---
    const fetchInitialData = useCallback(async () => {
        if (!user) return;
        console.log("Fetching initial data (Friends & All Groups)...");
        try {
            const [friendData, allGroupData] = await Promise.all([
                apiCall('/api/chat/conversations'), // User's connections
                apiCall('/api/chat/groups/all')     // ALL active groups
            ]);
            setFriends(friendData?.conversations || []);
            setGroups(allGroupData?.groups || []); // Always store all active groups
        } catch (error) {
            console.error("Failed to fetch initial chat data:", error);
            setFriends([]);
            setGroups([]);
        }
    }, [user]);

    // --- Effect for Initial Load & chatWith Param ---
     useEffect(() => {
         if (user && token) {
             fetchInitialData(); // Load friends and groups

             const chatWithUser = searchParams.get('chatWith');
             if (chatWithUser) {
                 setTimeout(async () => { // Use async/await inside timeout
                     try {
                         const friendData = await apiCall('/api/chat/conversations');
                         const currentFriends = friendData.conversations || [];
                         setFriends(currentFriends); // Update state

                         if (currentFriends.includes(chatWithUser)) {
                            selectChat(chatWithUser, 'private');
                         } else {
                            console.warn(`Cannot start chat: User ${chatWithUser} not found in connections.`);
                         }
                     } catch (err) {
                          console.error("Failed to verify friend connection for chatWith param:", err);
                     } finally {
                         searchParams.delete('chatWith');
                         setSearchParams(searchParams, { replace: true });
                     }
                 }, 100);
             }
         }
     }, [user, token, fetchInitialData, searchParams, setSearchParams, selectChat]);

    // --- User Search Effect ---
    useEffect(() => {
        const performSearch = async () => {
            const query = searchQuery.trim();
            if (query === '') { setSearchResults([]); return; }
            try {
                const results = await apiCall(`/api/users/search?query=${encodeURIComponent(query)}`);
                setSearchResults(results?.filter(u => u.username !== user?.username) || []);
            } catch(e) { console.error("Search failed:", e); setSearchResults([]); }
        };
        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, user]);

    // --- WebSocket Connection Effect ---
    useEffect(() => {
        let isMounted = true;
        if (token) {
             const handleConnect = () => { if (isMounted) fetchInitialData(); };
            connectWebSocket(token, handleNewWebSocketMessage, handleNewWebSocketMessage, handleConnect);
        }
        return () => { isMounted = false; if (token) disconnectWebSocket(); };
    }, [token, handleNewWebSocketMessage, fetchInitialData]);

    // --- Send Message Handler ---
    const handleSendMessage = (messageText) => {
        if (!currentChat || !messageText.trim() || !user) return;
        const { id, type } = currentChat;
        const payload = {
            senderId: user.username, messageText: messageText.trim(), senderType: user.userType,
            ...(type === 'private' && { receiverId: id }), ...(type === 'group' && { groupId: id }),
        };
        const optimisticMessage = { ...payload, id: `temp-${Date.now()}`, timestamp: new Date().toISOString(), senderName: user.name || user.username };
        setMessages(prev => [...prev, optimisticMessage]);
        sendMessage(payload, type);
    };

    // --- Remove Friend Handler ---
    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm(`Remove ${friendId} as a friend/connection?`)) return;
        try {
            await apiCall(`/api/connections/reject/${friendId}`, 'POST');
            alert(`${friendId} removed.`);
            fetchInitialData(); // Refresh list
            if (currentChat?.type === 'private' && currentChat?.id === friendId) setCurrentChat(null);
        } catch (error) { alert(`Failed to remove friend: ${error.message}`); fetchInitialData(); }
    };

    // --- Remove Group Member Handler ---
    const handleRemoveGroupMember = async (memberId) => {
        if (!currentChat || currentChat.type !== 'group' || !user || user.userType !== 'FACULTY') {
            alert("Only the group creator (Faculty) can remove members."); return;
        }
        if (memberId === user.username) { alert("Creator cannot be removed."); return; } // Prevent self-removal
        if (!window.confirm(`Remove ${memberId} from the group?`)) return;
        try {
            await apiCall(`/api/chat/groups/${currentChat.id}/members/${memberId}`, 'DELETE');
            alert(`${memberId} removed.`);
            const groupDetails = await apiCall(`/api/chat/groups/${currentChat.id}`); // Refresh members
            setGroupMembers(groupDetails.group.members || []);
        } catch (error) {
            alert(`Failed to remove member: ${error.message}`);
            try { // Attempt refresh even on error
                const groupDetails = await apiCall(`/api/chat/groups/${currentChat.id}`);
                setGroupMembers(groupDetails.group.members || []);
            } catch (refreshError) { console.error("Failed to refresh members:", refreshError); }
        }
    };

    // --- Delete Group Handler ---
    const handleDeleteGroup = async (groupId, groupName) => {
        if (!window.confirm(`Delete group "${groupName}"? This deletes all messages and cannot be undone.`)) return;
        try {
            await apiCall(`/api/chat/groups/${groupId}`, 'DELETE');
            alert(`Group "${groupName}" deleted.`);
            fetchInitialData(); // Refresh list
            if (currentChat?.type === 'group' && currentChat?.id === groupId) setCurrentChat(null);
        } catch (error) { alert(`Failed to delete group: ${error.message}`); fetchInitialData(); }
    };

    // --- Handler after Group Creation ---
    const handleGroupCreated = () => { fetchInitialData(); };

    // --- Open Add Member Modal Handler ---
    const handleShowAddMemberModal = (groupId) => {
        if (!groupId) return;
        addMemberModalGroupIdRef.current = groupId;
        setShowAddMemberModal(true);
    };

    // --- Add Member Handler (called by modal) ---
    const handleAddMember = async (memberToAddId) => {
        const groupId = addMemberModalGroupIdRef.current;
        if (!groupId || !memberToAddId) { alert("Group ID or Member ID missing."); return; }
        try {
            const result = await apiCall(`/api/chat/groups/${groupId}/members/${memberToAddId}`, 'POST');
            alert(`User ${memberToAddId} added.`);
            setShowAddMemberModal(false);
            if (currentChat?.type === 'group' && currentChat?.id === groupId) {
                 if (result.group?.members) setGroupMembers(result.group.members);
                 else { // Fallback refresh
                     const groupDetails = await apiCall(`/api/chat/groups/${groupId}`);
                     setGroupMembers(groupDetails.group.members || []);
                 }
            }
        } catch (error) { alert(`Failed to add member: ${error.message}`); }
    };

    // --- Render ---
    if (!user) return <div className="loading-spinner">Loading dashboard...</div>;

    return (
        <div className="chat-dashboard-container">
            <ChatList
                friends={friends}
                groups={groups} // Pass all groups
                onSelectChat={selectChat}
                currentChat={currentChat}
                onRemoveFriend={handleRemoveFriend}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchResults={searchResults}
                user={user}
                onShowCreateGroupModal={() => setShowCreateGroupModal(true)}
                onDeleteGroup={handleDeleteGroup}
            />
            <ChatArea
                currentChat={currentChat} // Pass full currentChat object
                messages={messages}
                onSendMessage={handleSendMessage}
                onGroupAction={fetchInitialData} // Refreshes after Join/Leave
                currentUser={user}
                groupMembers={groupMembers}
                onRemoveMember={handleRemoveGroupMember}
                onShowAddMember={() => handleShowAddMemberModal(currentChat?.id)} // Pass handler
            />
             {showCreateGroupModal && user?.userType === 'FACULTY' && (
                 <CreateGroupModal
                     onClose={() => setShowCreateGroupModal(false)}
                     onGroupCreated={handleGroupCreated}
                 />
             )}
             {showAddMemberModal && currentChat?.type === 'group' && currentChat?.isMember && ( // Only show if user is member
                  <AddMemberModal
                      groupId={currentChat.id}
                      currentMembers={groupMembers}
                      onClose={() => setShowAddMemberModal(false)}
                      onAddMember={handleAddMember}
                  />
             )}
        </div>
    );
};

export default Dashboard;
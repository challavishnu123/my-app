import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ChatArea from '../components/ChatArea';
import { apiCall } from '../services/api';
import { connectWebSocket, disconnectWebSocket, sendMessage, subscribeToGroup } from '../services/socket';

const ChatList = ({ friends, groups, onSelectChat, currentChat, onRemoveFriend, onSearchChange, searchResults }) => (
    <div className="chat-list-panel">
        <div className="search-bar-container">
            <input type="text" placeholder="Search for users..." onChange={onSearchChange} className="user-search-input"/>
        </div>

        {searchResults.length > 0 && (
            <div className="search-results">
                <h3 className="list-header">Search Results</h3>
                {searchResults.map(user => (
                    <Link to={`/profile/${user.username}`} key={user.username} className="list-item search-item">
                        <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
                        <span className="item-name">{user.username}</span>
                    </Link>
                ))}
            </div>
        )}

        <h3 className="list-header">Friends</h3>
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
                <button onClick={(e) => { e.stopPropagation(); onRemoveFriend(friend); }} className="remove-chat-btn">×</button>
            </div>
        ))}
        <h3 className="list-header">Groups</h3>
        {groups.map(group => (
            <div
                key={group.groupId}
                className={`list-item ${currentChat?.type === 'group' && currentChat?.id === group.groupId ? 'active' : ''}`}
                onClick={() => onSelectChat(group.groupId, 'group', group.groupName)}
            >
                <div className="avatar">#</div>
                <span className="item-name">{group.groupName}</span>
            </div>
        ))}
    </div>
);


const Dashboard = () => {
    const { user, token } = useAuth();
    const [friends, setFriends] = useState([]);
    const [groups, setGroups] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    const selectChat = useCallback(async (id, type, name = null) => {
        setMessages([]);
        setGroupMembers([]);
        setCurrentChat({ id, type, name: name || id });

        if (type === 'private') {
            const data = await apiCall(`/api/chat/private-messages/${id}`);
            setMessages(data.messages);
        } else if (type === 'group') {
            subscribeToGroup(id, () => {}); // WebSocket subscription
            const groupDetails = await apiCall(`/api/chat/groups/${id}`);
            const isMember = groupDetails.group.members.includes(user.username);
            setGroupMembers(groupDetails.group.members);
            setCurrentChat({ id, type, name: name || id, isMember });
            if (isMember) {
                const data = await apiCall(`/api/chat/groups/${id}/messages`);
                setMessages(data.messages);
            }
        }
    }, [user.username]);

    const fetchInitialData = useCallback(async () => {
        try {
            const [friendData, groupData] = await Promise.all([
                apiCall('/api/chat/conversations'),
                apiCall('/api/chat/groups/all')
            ]);
            setFriends(friendData.conversations || []);
            setGroups(groupData.groups || []);
        } catch (error) { 
            console.error("Failed to fetch initial data:", error); 
            setFriends([]);
            setGroups([]);
        }
    }, []);
    
    useEffect(() => {
        fetchInitialData();
        const chatWithUser = searchParams.get('chatWith');
        if (chatWithUser) {
            selectChat(chatWithUser, 'private');
            searchParams.delete('chatWith');
            setSearchParams(searchParams);
        }
    }, [fetchInitialData, searchParams, setSearchParams, selectChat]);

    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.trim() === '') {
                setSearchResults([]);
                return;
            }
            try {
                const results = await apiCall(`/api/users/search?query=${searchQuery}`);
                setSearchResults(results);
            } catch(e) { console.error("Search failed:", e); }
        };
        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleNewPrivateMessage = useCallback((msg) => {
        if (msg.senderId === user.username) return;
        if (currentChat?.type === 'private' && (msg.senderId === currentChat.id || msg.receiverId === currentChat.id)) {
            setMessages(prev => [...prev, msg]);
        }
    }, [currentChat, user.username]);

    const handleNewGroupMessage = useCallback((msg) => {
        if (msg.senderId === user.username) return;
        if (currentChat?.type === 'group' && msg.groupId === currentChat.id) {
            setMessages(prev => [...prev, msg]);
        }
    }, [currentChat, user.username]);
    
    useEffect(() => {
        connectWebSocket(token, handleNewPrivateMessage, handleNewGroupMessage);
        return () => disconnectWebSocket();
    }, [token, handleNewPrivateMessage, handleNewGroupMessage]);
    
    const handleSendMessage = (messageText) => {
        if (!currentChat) return;
        const { id, type } = currentChat;
        const payload = { senderId: user.username, messageText, senderType: user.userType, receiverId: type === 'private' ? id : null, groupId: type === 'group' ? id : null };
        sendMessage(payload, type);
        setMessages(prev => [...prev, { ...payload, timestamp: new Date().toISOString() }]);
    };

    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm(`Are you sure you want to remove ${friendId} as a friend?`)) return;
        try {
            // This assumes a backend endpoint exists to remove a connection
            await apiCall(`/api/connections/remove/${friendId}`, 'POST');
            setFriends(prev => prev.filter(f => f !== friendId));
            if (currentChat?.id === friendId) {
                setCurrentChat(null);
            }
        } catch (error) {
            alert(`Failed to remove friend: ${error.message}`);
        }
    };

    const handleRemoveGroupMember = async (memberId) => {
        if (!window.confirm(`Remove ${memberId}?`)) return;
        try {
            await apiCall(`/api/chat/groups/${currentChat.id}/members/${memberId}`, 'DELETE');
            alert(`${memberId} removed.`);
            selectChat(currentChat.id, 'group', currentChat.name);
        } catch (error) {
            alert(`Failed to remove member: ${error.message}`);
        }
    };

    return (
        <div className="chat-dashboard-container">
            <ChatList
                friends={friends}
                groups={groups}
                onSelectChat={selectChat}
                currentChat={currentChat}
                onRemoveFriend={handleRemoveFriend}
                onSearchChange={(e) => setSearchQuery(e.target.value)}
                searchResults={searchResults}
            />
            <ChatArea
                currentChat={currentChat}
                messages={messages}
                onSendMessage={handleSendMessage}
                onGroupAction={() => selectChat(currentChat.id, 'group', currentChat.name)}
                currentUser={user}
                groupMembers={groupMembers}
                onRemoveMember={handleRemoveGroupMember}
            />
        </div>
    );
};

export default Dashboard;
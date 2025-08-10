import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const API_BASE_URL = 'http://localhost:8080';
let stompClient = null;
const subscriptions = {};

/**
 * Connects to the WebSocket server.
 * @param {string} token - The JWT token for authentication.
 * @param {function} onPrivateMessage - Callback for private messages.
 * @param {function} onGroupMessage - Callback for group messages.
 */
export const connectWebSocket = (token, onPrivateMessage, onGroupMessage, onConnect) => {
  if (stompClient && stompClient.connected) {
    console.log('WebSocket already connected.');
    return;
  }

  const socket = new SockJS(`${API_BASE_URL}/ws/chat?token=${token}`);
  stompClient = Stomp.over(socket);
  stompClient.reconnect_delay = 5000;

  stompClient.connect(
    {}, // No extra headers needed here, token is in URL
    (frame) => {
      console.log('WebSocket Connected: ' + frame);
      
      // Subscribe to personal queue for private messages
      subscriptions.private = stompClient.subscribe('/user/queue/messages', (message) => {
        onPrivateMessage(JSON.parse(message.body));
      });
      
      // The onConnect callback allows the component to know connection is ready
      if(onConnect) onConnect(); 
    },
    (error) => {
      console.error('WebSocket Connection Error:', error);
    }
  );
};

/**
 * Subscribes to a specific group's topic.
 * @param {string} groupId - The ID of the group to subscribe to.
 * @param {function} onGroupMessage - The callback to handle incoming messages.
 */
export const subscribeToGroup = (groupId, onGroupMessage) => {
    if (!stompClient || !stompClient.connected) {
        console.error("Cannot subscribe, Stomp client not connected.");
        return;
    }
    // Unsubscribe from any existing group subscription to avoid multiple handlers
    if (subscriptions.group) {
        subscriptions.group.unsubscribe();
    }
    subscriptions.group = stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
        onGroupMessage(JSON.parse(message.body));
    });
    console.log(`Subscribed to /topic/group/${groupId}`);
};

/**
 * Disconnects from the WebSocket server.
 */
export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log('WebSocket Disconnected');
    });
    stompClient = null;
    Object.keys(subscriptions).forEach(key => delete subscriptions[key]);
  }
};

/**
 * Sends a message via WebSocket.
 * @param {object} payload - The message payload.
 * @param {'private' | 'group'} type - The type of message.
 */
export const sendMessage = (payload, type) => {
  if (stompClient && stompClient.connected) {
    const destination = type === 'private' ? '/app/private-message' : '/app/group-message';
    stompClient.send(destination, {}, JSON.stringify(payload));
  } else {
    console.error('Cannot send message, WebSocket is not connected.');
  }
};
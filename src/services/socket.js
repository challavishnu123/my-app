import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const API_BASE_URL = "https://backendv-g1ln.onrender.com";
let stompClient = null;
const subscriptions = {};

export const connectWebSocket = (
  token,
  onPrivateMessage,
  onGroupMessage,
  onConnect
) => {
  if (stompClient && stompClient.connected) {
    return;
  }

  const socket = new SockJS(`${API_BASE_URL}/ws/chat?token=${token}`);
  stompClient = Stomp.over(socket);
  stompClient.reconnect_delay = 5000;

  stompClient.connect(
    {},
    (frame) => {
      console.log("WebSocket Connected: " + frame);
      subscriptions.private = stompClient.subscribe(
        "/user/queue/messages",
        (message) => {
          onPrivateMessage(JSON.parse(message.body));
        }
      );
      if (onConnect) onConnect();
    },
    (error) => {
      console.error("WebSocket Connection Error:", error);
    }
  );
};

export const subscribeToGroup = (groupId, onGroupMessage) => {
  if (!stompClient || !stompClient.connected) return;
  if (subscriptions.group) {
    subscriptions.group.unsubscribe();
  }
  subscriptions.group = stompClient.subscribe(
    `/topic/group/${groupId}`,
    (message) => {
      onGroupMessage(JSON.parse(message.body));
    }
  );
};

export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {});
    stompClient = null;
    Object.keys(subscriptions).forEach((key) => delete subscriptions[key]);
  }
};

export const sendMessage = (payload, type) => {
  if (stompClient && stompClient.connected) {
    let destination = "";

    // --- THIS IS THE FIX ---
    // The 'share' case has been removed as it is now handled via a standard API call.
    switch (type) {
      case "private":
        destination = "/app/private-message";
        break;
      case "group":
        destination = "/app/group-message";
        break;
      default:
        console.error("Unknown message type:", type);
        return;
    }
    stompClient.send(destination, {}, JSON.stringify(payload));
  } else {
    console.error("Cannot send message, WebSocket is not connected.");
  }
};

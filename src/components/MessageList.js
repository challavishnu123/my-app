import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUser }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <div className="messages-container">
            {messages.map((msg, index) => {
                const isSent = msg.senderId === currentUser;
                const timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
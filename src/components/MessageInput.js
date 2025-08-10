import React, { useState } from 'react';

const MessageInput = ({ onSendMessage }) => {
    const [messageText, setMessageText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (messageText.trim()) {
            onSendMessage(messageText);
            setMessageText('');
        }
    };

    return (
        <form className="message-input-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
            />
            <button type="submit">Send</button>
        </form>
    );
};

export default MessageInput;
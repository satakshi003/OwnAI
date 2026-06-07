import React, { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';

const ChatWindow = ({ messages, loading }) => {
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    if (messages.length === 0 && !loading) {
        return (
            <div className="chat-window empty">
                <div className="welcome-message">
                    <h2>How can I help you today?</h2>
                    <p>Start typing below to begin a new conversation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="messages-list">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-wrapper ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === 'user' ? <User size={24} /> : <Bot size={24} />}
                        </div>
                        <div className="message-content">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message-wrapper assistant loading">
                        <div className="message-avatar">
                            <Bot size={24} />
                        </div>
                        <div className="message-content typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>
        </div>
    );
};

export default ChatWindow;

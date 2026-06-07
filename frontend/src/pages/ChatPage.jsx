import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import useChat from '../hooks/useChat';

const ChatPage = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const {
        sessions,
        activeSession,
        messages,
        loading,
        handleSelectSession,
        handleNewSession,
        handleSendMessage
    } = useChat();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    if (authLoading || !user) {
        return <div className="loading-screen">Loading...</div>;
    }

    return (
        <div className="chat-app">
            <Sidebar 
                sessions={sessions}
                activeSession={activeSession}
                onSelectSession={handleSelectSession}
                onNewSession={handleNewSession}
            />
            <div className="chat-main">
                <ChatWindow 
                    messages={messages} 
                    loading={loading} 
                />
                <div className="chat-input-container">
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;

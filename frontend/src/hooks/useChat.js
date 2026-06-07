import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';

const useChat = () => {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch sessions on mount
    useEffect(() => {
        loadSessions();
    }, []);

    // Load history when active session changes
    useEffect(() => {
        if (activeSession) {
            loadHistory(activeSession);
        } else {
            setMessages([]);
        }
    }, [activeSession]);

    const loadSessions = async () => {
        try {
            const res = await chatAPI.getSessions();
            setSessions(res.data.sessions);
            // Optionally auto-select most recent session
            if (res.data.sessions.length > 0 && !activeSession) {
                setActiveSession(res.data.sessions[0]._id);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const loadHistory = async (sessionId) => {
        try {
            const res = await chatAPI.getHistory(sessionId);
            setMessages(res.data.history);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleSelectSession = (sessionId) => {
        setActiveSession(sessionId);
    };

    const handleNewSession = async () => {
        try {
            const res = await chatAPI.createSession('New Chat');
            setSessions([res.data.session, ...sessions]);
            setActiveSession(res.data.session._id);
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const handleSendMessage = async (content) => {
        let currentSessionId = activeSession;
        
        // Auto-create session if none active
        if (!currentSessionId) {
            try {
                const res = await chatAPI.createSession('New Chat');
                currentSessionId = res.data.session._id;
                setSessions([res.data.session, ...sessions]);
                setActiveSession(currentSessionId);
            } catch (error) {
                console.error('Error creating session before sending message:', error);
                return;
            }
        }

        const newUserMessage = { role: 'user', content };
        setMessages(prev => [...prev, newUserMessage]);
        setLoading(true);

        try {
            const res = await chatAPI.sendMessage(currentSessionId, content);
            setMessages(prev => [...prev, res.data.response]);
            // Refresh sessions to pick up any title changes
            loadSessions();
        } catch (error) {
            console.error('Error sending message:', error);
            // Could add an error message to chat state here
        } finally {
            setLoading(false);
        }
    };

    return {
        sessions,
        activeSession,
        messages,
        loading,
        handleSelectSession,
        handleNewSession,
        handleSendMessage
    };
};

export default useChat;

import ChatSession from '../models/ChatSession.js';
import Chat from '../models/Chat.js';
import { sendMessageToAgent } from '../services/langgraph.service.js';

export const createSession = async (req, res) => {
    try {
        const { title } = req.body;
        const session = await ChatSession.create({
            userId: req.user.id,
            title: title || 'New Chat'
        });
        
        res.status(201).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Verify session belongs to user
        const session = await ChatSession.findOne({ _id: sessionId, userId: req.user.id });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        const history = await Chat.find({ sessionId }).sort({ timestamp: 1 });
        res.status(200).json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ success: false, message: 'Session ID and message are required' });
        }

        // Verify session belongs to user
        const session = await ChatSession.findOne({ _id: sessionId, userId: req.user.id });
        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // 1. Save user's message to MongoDB
        await Chat.create({
            sessionId,
            role: 'user',
            content: message
        });

        // 2. Pass to LangGraph Service
        const assistantReplyContent = await sendMessageToAgent(message, sessionId);

        // 3. Save assistant's reply to MongoDB
        const assistantMessage = await Chat.create({
            sessionId,
            role: 'assistant',
            content: assistantReplyContent
        });

        // Update session title if it's "New Chat" and it's the first user message
        if (session.title === 'New Chat') {
            const chatCount = await Chat.countDocuments({ sessionId });
            if (chatCount <= 2) {
                // simple title generator: take first 4 words of user message
                const newTitle = message.split(' ').slice(0, 4).join(' ') + '...';
                session.title = newTitle;
                await session.save();
            }
        }

        res.status(200).json({
            success: true,
            response: assistantMessage
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

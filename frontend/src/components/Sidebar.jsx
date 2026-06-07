import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, MessageSquare, LogOut, User } from 'lucide-react';

const Sidebar = ({ sessions, activeSession, onSelectSession, onNewSession }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <button className="new-chat-btn" onClick={onNewSession}>
                    <PlusCircle size={20} />
                    <span>New Chat</span>
                </button>
            </div>
            
            <div className="sidebar-sessions">
                <div className="sessions-title">Recent Chats</div>
                <div className="sessions-list">
                    {sessions.map(session => (
                        <button 
                            key={session._id} 
                            className={`session-item ${activeSession === session._id ? 'active' : ''}`}
                            onClick={() => onSelectSession(session._id)}
                        >
                            <MessageSquare size={16} />
                            <span className="session-title">{session.title}</span>
                        </button>
                    ))}
                    {sessions.length === 0 && (
                        <div className="no-sessions">No previous chats</div>
                    )}
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="user-info">
                    <User size={18} />
                    <span className="user-email">{user?.email}</span>
                </div>
                <button className="logout-btn" onClick={logout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

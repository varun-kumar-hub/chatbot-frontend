import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Paperclip, X, Menu, Sparkles, Code, Mic, Briefcase } from 'lucide-react';
import MessageBubble from './MessageBubble';
import AdvancedChatMessage from './AdvancedChatMessage';
import styles from '../styles/ChatWindow.module.css';
import { PERSONAS } from '../data/personas';

const ChatWindow = ({ activeChatId, currentChatTitle, messages, onSendMessage, isLoading, isMobile, onToggleSidebar, userName = 'User', activePersona = 'standard', onOpenSettings }) => {
    const [input, setInput] = useState('');
    const [file, setFile] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() && !file) return;

        let finalMessage = input;
        const persona = PERSONAS.find(p => p.id === activePersona);

        // Add Prompt only if it's NOT the standard persona and NOT an empty message
        if (persona && persona.prompt && persona.id !== 'standard') {
            if (finalMessage) {
                finalMessage = persona.prompt + finalMessage;
            }
        }

        const userFile = file;

        setInput('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        onSendMessage(finalMessage, userFile);
    };

    // --- Empty State UI ---
    if (!activeChatId) {
        return (
            <div className={styles.chatWindow}>
                <header className={styles.header}>
                    {isMobile && (
                        <button className={styles.menuBtn} onClick={onToggleSidebar}>
                            <Menu size={24} />
                        </button>
                    )}
                    <h2 className={styles.title}>Neural Workspace</h2>
                </header>
                <div className={styles.emptyState}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroIcon}>
                            <Sparkles size={48} color="#8b5cf6" />
                        </div>
                        <h1 className={styles.heroTitle}>Welcome, <span className={styles.gradientText}>{userName}</span></h1>
                        <p className={styles.heroSubtitle}>Select a conversation or start a new one.</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- Active Chat UI ---
    const currentPersonaData = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];

    return (
        <div className={styles.chatWindow}>
            <header className={styles.header}>
                {isMobile && (
                    <button className={styles.menuBtn} onClick={onToggleSidebar}>
                        <Menu size={24} />
                    </button>
                )}
                <h2 className={styles.title}>{currentChatTitle || 'New Chat'}</h2>
                {!isMobile && (
                    <div style={{ position: 'absolute', right: 20, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.6, fontSize: '0.8rem' }}>
                        {currentPersonaData.icon}
                        <span>{currentPersonaData.name} Mode</span>
                    </div>
                )}
            </header>

            <div className={styles.messageList}>
                {messages.length === 0 && (
                    <div className={styles.chatHero}>
                        <div className={styles.heroIcon}>
                            {currentPersonaData.icon}
                        </div>
                        <h1 className={styles.heroTitle}>
                            Hi <span className={styles.gradientText}>{userName}</span>
                        </h1>
                        <h2 className={styles.heroSubtitle}>
                            I'm ready to help as your <b>{currentPersonaData.name}</b>.
                        </h2>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isLast = index === messages.length - 1;
                    if (msg.sender === 'user') {
                        return <MessageBubble key={msg.id} sender={msg.sender} content={msg.content} fileUrl={msg.file_url} />;
                    } else {
                        return (
                            <AdvancedChatMessage
                                key={msg.id}
                                content={msg.content}
                                isTyping={isLast && isLoading}
                            />
                        );
                    }
                })}

                {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                    <div className={styles.typingIndicator}>
                        <span></span><span></span><span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                {file && (
                    <div className={styles.filePreview}>
                        <span>📎 {file.name}</span>
                        <button onClick={() => setFile(null)} className={styles.removeFileBtn}><X size={14} /></button>
                    </div>
                )}
                <form className={styles.inputContainer} onSubmit={handleSubmit}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        className={styles.attachBtn}
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach Image"
                    >
                        <Paperclip size={18} />
                    </button>

                    <input
                        type="text"
                        className={styles.input}
                        placeholder={`Message as ${currentPersonaData.name}...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className={styles.sendBtn} disabled={!input.trim() && !file}>
                        <Send size={18} />
                    </button>
                </form>
                <div className={styles.disclaimer}>
                    Gemini 2.0 Flash Exp • <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={onOpenSettings}>Settings</span>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Paperclip, X, Menu, Sparkles, Code, Mic, Briefcase } from 'lucide-react';
import MessageBubble from './MessageBubble';
import AdvancedChatMessage from './AdvancedChatMessage';
import styles from '../styles/ChatWindow.module.css';

const PERSONAS = [
    { id: 'standard', name: 'Standard', icon: <Sparkles size={14} />, prompt: '' },
    { id: 'dev', name: 'Developer', icon: <Code size={14} />, prompt: '[SYSTEM: Act as a Senior Software Engineer. Provide efficient, well-commented code.] ' },
    { id: 'researcher', name: 'Researcher', icon: <Briefcase size={14} />, prompt: '[SYSTEM: Act as a Document Analyst. Analyze the context/files deeply and provide cited, factual answers.] ' },
    { id: 'designer', name: 'Designer', icon: <Sparkles size={14} />, prompt: '[SYSTEM: Act as a Creative Director. Focus on visual descriptions and generate images when appropriate.] ' },
    { id: 'witty', name: 'Witty', icon: <Mic size={14} />, prompt: '[SYSTEM: Be witty, sarcastic, and entertaining, but still helpful.] ' }
];

const ChatWindow = ({ activeChatId, currentChatTitle, messages, onSendMessage, isLoading, isMobile, onToggleSidebar, userName = 'User' }) => {
    const [input, setInput] = useState('');
    const [file, setFile] = useState(null);
    const [activePersona, setActivePersona] = useState('standard');
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
        if (persona && persona.prompt) {
            // Prepend persona prompt only if text exists
            if (finalMessage) {
                finalMessage = persona.prompt + finalMessage;
            }
        }

        const userFile = file;

        setInput('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Parent handles the async send with the modified message
        onSendMessage(finalMessage, userFile);
    };

    // Clean display of input (don't show the hidden prompt)
    // We already handle this by only prepending on submit.

    if (!activeChatId) {
        return (
            <div className={styles.chatWindow}>
                <header className={styles.header}>
                    {isMobile && (
                        <button className={`${styles.menuBtn} ${styles.mobileMenuFloat}`} onClick={onToggleSidebar}>
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
                        <p className={styles.heroSubtitle}>Select a conversation to begin your session.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatWindow}>
            <header className={styles.header}>
                {isMobile && (
                    <button className={`${styles.menuBtn} ${styles.mobileMenuFloat}`} onClick={onToggleSidebar}>
                        <Menu size={24} />
                    </button>
                )}
                {!isMobile && <Hash size={18} className={styles.headerIcon} />}
                <h2 className={styles.title}>{currentChatTitle || 'New Chat'}</h2>
            </header>

            <div className={styles.messageList}>
                {/* Empty State Hero for New Chat */}
                {messages.length === 0 && (
                    <div className={styles.chatHero}>
                        <div className={styles.heroIcon}>
                            <Sparkles size={42} color="#8b5cf6" />
                        </div>
                        <h1 className={styles.heroTitle}>
                            Hi <span className={styles.gradientText}>{userName}</span>
                        </h1>
                        <h2 className={styles.heroSubtitle}>Where should we start?</h2>
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
                {/* Fallback spinner if loading but no message object yet (rare with current logic but good for safety) */}
                {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
                    <div className={`${styles.typingIndicator} ${styles.aiTyper} `}>
                        <span>●</span><span>●</span><span>●</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                {/* Persona Selector */}
                <div className={styles.personaBar}>
                    {PERSONAS.map(p => (
                        <button
                            key={p.id}
                            className={`${styles.personaChip} ${activePersona === p.id ? styles.activeChip : ''}`}
                            onClick={() => setActivePersona(p.id)}
                            title={p.name}
                        >
                            {p.icon}
                            <span>{p.name}</span>
                        </button>
                    ))}
                </div>

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
                    >
                        <Paperclip size={18} />
                    </button>

                    <input
                        type="text"
                        className={styles.input}
                        placeholder={`Message as ${PERSONAS.find(p => p.id === activePersona)?.name}...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className={styles.sendBtn} disabled={!input.trim() && !file}>
                        <Send size={18} />
                    </button>
                </form>
                <div className={styles.disclaimer}>
                    AI can make mistakes. Please verify important information.
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;

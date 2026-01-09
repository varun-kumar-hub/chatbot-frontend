import React, { useState } from 'react';
import { MessageSquare, Plus, LogOut, Trash2, X, Search, Settings, Sun, Moon } from 'lucide-react';
import styles from '../styles/Sidebar.module.css';

const Sidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat, onClearAll, onLogout, userEmail, isOpen, isMobile, onClose, onToggleTheme, isDarkMode, onOpenSettings }) => {
    const [searchTerm, setSearchTerm] = useState('');
    // On Mobile, if not open, return null (or handle via CSS class for animation - let's use CSS class)
    const sidebarClass = isMobile
        ? `${styles.sidebar} ${styles.mobileSidebar} ${isOpen ? styles.open : ''}`
        : styles.sidebar;

    return (
        <>
            {/* Overlay for mobile */}
            {isMobile && isOpen && (
                <div className={styles.overlay} onClick={onClose} />
            )}

            <div className={sidebarClass}>
                <div className={styles.header}>
                    <div className={styles.headerTop}>
                        {/* Close Button for Mobile */}
                        {isMobile && (
                            <button className={styles.closeBtn} onClick={onClose}>
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    <button className={styles.newChatBtn} onClick={() => { onNewChat(); if (isMobile) onClose(); }}>
                        <Plus size={20} />
                        <span>New Chat</span>
                    </button>
                </div>

                <div className={styles.searchContainer}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.chatList}>
                    <div className={styles.sectionTitle}>Recent</div>
                    {chats.filter(chat => (chat.title || 'New Chat').toLowerCase().includes(searchTerm.toLowerCase())).map(chat => (
                        <div
                            key={chat.id}
                            className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ''}`}
                            onClick={() => { onSelectChat(chat.id); }}
                        >
                            <MessageSquare size={16} className={styles.chatIcon} />
                            <span className={styles.chatTitle}>{chat.title || 'New Chat'}</span>
                            {chat.id === activeChatId && (
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                                    title="Delete Chat"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <div className={styles.userProfile} onClick={onOpenSettings} role="button" tabIndex={0}>
                        <div className={styles.avatar}>
                            {userEmail ? userEmail[0].toUpperCase() : 'U'}
                        </div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>Varun Kumar</span>
                            <span className={styles.userEmail}>{userEmail}</span>
                        </div>
                        <div className={styles.profileChevron}>
                            <Settings size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

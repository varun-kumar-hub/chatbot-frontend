import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ConfirmationModal from './ConfirmationModal';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/Dashboard.module.css';

const Dashboard = ({ session, onLogout }) => {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Delete/Logout Confirmation State
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'DELETE_SINGLE', 'DELETE_ALL', 'LOGOUT'
    const [actionData, setActionData] = useState(null); // chatId for single delete
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalConfirmText, setModalConfirmText] = useState('Confirm');

    // 0. Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setShowSidebar(true); // Always show on desktop
            else setShowSidebar(false); // Default hide on mobile
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 1. Fetch Chats on Mount
    useEffect(() => {
        fetchChats();
    }, [session]);

    const fetchChats = async () => {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching chats:', error);
        else {
            setChats(data);
            if (data.length > 0 && !activeChatId) {
                setActiveChatId(data[0].id);
            }
        }
    };

    // 2. Fetch Messages when Active Chat Changes
    useEffect(() => {
        if (!activeChatId) {
            setMessages([]);
            return;
        }
        fetchMessages(activeChatId);
    }, [activeChatId]);

    const fetchMessages = async (chatId) => {
        setLoadingMessages(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching messages:', error);
        else setMessages(data);
        setLoadingMessages(false);
    };

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('light-theme');
    };

    const onRequestDeleteChat = (chatId) => {
        setActionType('DELETE_SINGLE');
        setActionData(chatId);
        setModalTitle("Delete Chat?");
        setModalMessage("This will permanently delete this conversation. This action cannot be undone.");
        setModalConfirmText("Delete Forever");
        setConfirmationModalOpen(true);
    };

    const onRequestClearAll = () => {
        setActionType('DELETE_ALL');
        setModalTitle("Clear All Chats?");
        setModalMessage("This will permanently delete ALL your conversations. This action cannot be undone.");
        setModalConfirmText("Clear Everything");
        setConfirmationModalOpen(true);
    };

    const onRequestLogout = () => {
        setActionType('LOGOUT');
        setModalTitle("Sign Out?");
        setModalMessage("Are you sure you want to sign out of your session?");
        setModalConfirmText("Sign Out");
        setConfirmationModalOpen(true);
    };

    const handleConfirmAction = async () => {
        try {
            if (actionType === 'LOGOUT') {
                onLogout(); // Call the prop from App.jsx
                return;
            }

            if (actionType === 'DELETE_ALL') {
                // Delete all chats for user
                const ids = chats.map(c => c.id);
                if (ids.length > 0) {
                    const { error: batchError } = await supabase.from('chats').delete().in('id', ids);
                    if (batchError) throw batchError;
                }
                setChats([]);
                setActiveChatId(null);
                setMessages([]);

            } else if (actionType === 'DELETE_SINGLE') {
                const chatId = actionData;
                if (!chatId) return;

                const { error } = await supabase.from('chats').delete().eq('id', chatId);
                if (error) throw error;

                setChats(chats.filter(c => c.id !== chatId));
                if (activeChatId === chatId) {
                    setActiveChatId(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error('Error in confirmation action:', error);
        } finally {
            setConfirmationModalOpen(false);
            setActionType(null);
            setActionData(null);
            setModalTitle('');
            setModalMessage('');
        }
    };

    const handleNewChat = async () => {
        // Create new chat in DB
        const { data, error } = await supabase
            .from('chats')
            .insert([{
                user_id: session.user.id,
                title: 'New Chat'
            }])
            .select();

        if (error) {
            console.error('Error creating chat:', error);
            return;
        }

        if (data && data.length > 0) {
            setChats([data[0], ...chats]); // Prepend
            setActiveChatId(data[0].id);
        }
    };

    const handleDeleteChat = async (id) => {
        const { error } = await supabase.from('chats').delete().eq('id', id);
        if (error) {
            console.error('Error deleting chat:', error);
            return;
        }

        const newChats = chats.filter(c => c.id !== id);
        setChats(newChats);

        if (activeChatId === id) {
            setActiveChatId(newChats.length > 0 ? newChats[0].id : null);
        }
    };

    const handleSendMessage = async (text, file) => {
        if (!activeChatId) return;
        if (!text && !file) return;

        // Optimistic UI Update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            content: text || (file ? "" : ""),
            file_url: file ? URL.createObjectURL(file) : null,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            // Call Backend API
            const formData = new FormData();
            formData.append('chat_id', activeChatId);
            if (text) formData.append('message', text);
            if (file) formData.append('file', file);

            let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

            // 1. Remove trailing slash
            if (BACKEND_URL.endsWith('/')) {
                BACKEND_URL = BACKEND_URL.slice(0, -1);
            }

            // 2. Ensure Protocol (Fix for "chatbot-backend..." without https://)
            if (BACKEND_URL && !BACKEND_URL.startsWith('http')) {
                BACKEND_URL = `https://${BACKEND_URL}`;
            }

            const endpoint = `${BACKEND_URL}/chat`;
            console.log("Making API Request to:", endpoint);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errorMessage = errData.detail || `Server Error ${response.status}: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            // Streaming Logic
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = "";

            // Create a placeholder AI message
            const aiMsgId = 'ai-' + Date.now();
            setMessages(prev => [...prev, {
                id: aiMsgId,
                sender: 'ai',
                content: '', // Start empty
                created_at: new Date().toISOString()
            }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiResponseText += chunk;

                // Update UI with new chunk
                setMessages(prev => prev.map(msg =>
                    msg.id === aiMsgId ? { ...msg, content: aiResponseText } : msg
                ));
            }

            // Stream finished. 
            // Local state is already updated via the stream loop.
            // No need to re-fetch and trigger 'isLoading' spinner. 
            // The DB sync happens on backend.
            // fetchMessages(activeChatId);

            // Update Chat Title if it's the first message
            const currentChat = chats.find(c => c.id === activeChatId);
            if (currentChat && currentChat.title === 'New Chat' && text) {
                const newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
                await supabase.from('chats').update({ title: newTitle }).eq('id', activeChatId);
                fetchChats();
            }

        } catch (error) {
            console.error("Chat Error:", error);
            // Add error message to UI
            setMessages(prev => [...prev, {
                id: 'err-' + Date.now(),
                sender: 'ai',
                content: `Error: ${error.message || "Connection failed"}. Please try again.`,
                created_at: new Date().toISOString()
            }]);
        }
    };

    const activeChat = chats.find(c => c.id === activeChatId);

    return (
        <div className={styles.dashboardContainer}>
            <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={setActiveChatId}
                onNewChat={handleNewChat}
                onDeleteChat={onRequestDeleteChat}
                onClearAll={onRequestClearAll}
                onLogout={onRequestLogout}
                userEmail={session?.user?.email}
                isOpen={showSidebar}
                isMobile={isMobile}
                onClose={() => setShowSidebar(false)}
                onToggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
            />

            <main className={styles.mainContent}>
                {/* ... existing ChatWindow ... */}
                <ChatWindow
                    activeChatId={activeChatId}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    currentChatTitle={chats.find(c => c.id === activeChatId)?.title}
                    onToggleSidebar={() => setShowSidebar(!showSidebar)}
                    isMobile={isMobile}
                    userName={session?.user?.user_metadata?.full_name?.split(' ')[0] || session?.user?.email?.split('@')[0] || 'User'}
                />
            </main>

            <ConfirmationModal
                isOpen={confirmationModalOpen}
                title={modalTitle}
                message={modalMessage}
                confirmText={modalConfirmText}
                isDangerous={actionType !== 'LOGOUT'}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmationModalOpen(false)}
            />
        </div>
    );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import ConfirmationModal from './ConfirmationModal';
import SettingsModal from './SettingsModal';
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

    // Settings State
    const [showSettings, setShowSettings] = useState(false);
    const [activePersona, setActivePersona] = useState('standard');
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Delete/Logout Confirmation State
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'DELETE_SINGLE', 'DELETE_ALL', 'LOGOUT'
    const [actionData, setActionData] = useState(null); // chatId for single delete
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalConfirmText, setModalConfirmText] = useState('Confirm');

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('light-theme');
    };

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

    // 4. Image Compression Helper
    const compressImage = (file) => {
        return new Promise((resolve) => {
            // If not an image, return original
            if (!file.type.startsWith('image/')) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 1500;
                    const MAX_HEIGHT = 1500;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    }, 'image/jpeg', 0.8);
                };
            };
        });
    };

    const handleSendMessage = async (text, file, personaPrompt) => {
        if (!activeChatId) return;
        if (!text && !file) return;

        // Optimistic UI Update using ORIGINAL file (for instant preview)
        const tempMsg = {
            id: 'temp-' + Date.now(),
            sender: 'user',
            content: text || (file ? "" : ""), // Display only USER text
            file_url: file ? URL.createObjectURL(file) : null,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            // Compress Image if needed
            let fileToUpload = file;
            if (file && file.type.startsWith('image/')) {
                console.log("Compressing image...");
                fileToUpload = await compressImage(file);
                console.log(`Original: ${file.size}, Compressed: ${fileToUpload.size}`);
            }

            // Call Backend API
            const formData = new FormData();
            formData.append('chat_id', activeChatId);
            if (text) formData.append('message', text); // Send clean text as message
            if (fileToUpload) formData.append('file', fileToUpload);
            if (personaPrompt) formData.append('persona_prompt', personaPrompt); // Send hidden instruction

            // Add persona prompt if needed (Usually handled by prompt engineering on backend or frontend before send. 
            // Since we moved state here, backend prompt injection is cleaner if handled here or in ChatWindow submit.
            // Let's rely on ChatWindow to construct the final text or pass activePersona to backend? 
            // For now, let's inject it into the message here if we want strictly frontend control, 
            // BUT ChatWindow submit logic handled it before. 
            // Wait, ChatWindow's handleSubmit was: "const persona = PERSONAS.find...".
            // Since Dashboard now owns the state, but ChatWindow handles the "Input", 
            // ChatWindow should prepend the prompt BEFORE calling onSendMessage.
            // So onSendMessage expects the *final* text. Correct.

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
                onOpenSettings={() => setShowSettings(true)}
            />

            <main className={styles.mainContent}>
                <ChatWindow
                    activeChatId={activeChatId}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    currentChatTitle={chats.find(c => c.id === activeChatId)?.title}
                    onToggleSidebar={() => setShowSidebar(!showSidebar)}
                    isMobile={isMobile}
                    userName={session?.user?.user_metadata?.full_name?.split(' ')[0] || session?.user?.email?.split('@')[0] || 'User'}
                    activePersona={activePersona}
                    onOpenSettings={() => setShowSettings(true)}
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

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                isDarkMode={isDarkMode}
                onToggleTheme={toggleTheme}
                activePersona={activePersona}
                onSetPersona={setActivePersona}
                userEmail={session?.user?.email}
                onClearAll={onRequestClearAll}
                onLogout={onRequestLogout}
            />
        </div>
    );
};

export default Dashboard;

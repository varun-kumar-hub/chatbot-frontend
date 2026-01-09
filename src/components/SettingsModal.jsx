import React, { useEffect, useState } from 'react';
import { X, Moon, Sun, Monitor, Cpu, User, Trash2, LogOut } from 'lucide-react';
import styles from '../styles/SettingsModal.module.css';
import { PERSONAS } from '../data/personas';

const SettingsModal = ({ isOpen, onClose, isDarkMode, onToggleTheme, activePersona, onSetPersona, userEmail, onClearAll, onLogout }) => {
    const [mount, setMount] = useState(false);

    useEffect(() => {
        if (isOpen) setMount(true);
        else setTimeout(() => setMount(false), 300); // Wait for animation
    }, [isOpen]);

    if (!mount) return null;

    return (
        <div className={`${styles.backdrop} ${isOpen ? styles.open : ''}`} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2 className={styles.title}>Settings</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Appearance</h3>
                    <div className={styles.row}>
                        <div className={styles.label}>
                            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                            <span>Theme Mode</span>
                        </div>
                        <div
                            className={`${styles.toggle} ${isDarkMode ? styles.checked : ''}`}
                            onClick={onToggleTheme}
                        >
                            <div className={styles.thumb} />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Intelligence Profile</h3>
                    <div className={styles.personaGrid}>
                        {PERSONAS.map(p => (
                            <div
                                key={p.id}
                                className={`${styles.personaCard} ${activePersona === p.id ? styles.active : ''}`}
                                onClick={() => onSetPersona(p.id)}
                            >
                                <div className={styles.personaIcon}>{p.icon}</div>
                                <span className={styles.personaName}>{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>System</h3>
                    <div className={styles.row}>
                        <div className={styles.label}>
                            <Cpu size={18} />
                            <span>Model Version</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gemini 2.0 Flash Exp</span>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.label}>
                            <Monitor size={18} />
                            <span>Connection</span>
                        </div>
                        <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>● Visual & Connected</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Account & Data</h3>
                    <div className={styles.row}>
                        <div className={styles.label}>
                            <User size={18} />
                            <span>Email</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{userEmail}</span>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Session</h3>

                    <button className={styles.actionBtn} onClick={onClearAll} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className={styles.iconBox}><Trash2 size={16} /></div> Clear All History</span>
                    </button>

                    <button className={styles.actionBtn} onClick={onLogout}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className={styles.iconBox}><LogOut size={16} /></div> Sign Out</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SettingsModal;

import React, { useState, useEffect, useRef } from 'react';
import { LogIn, Sparkles, Code, Zap, Shield, Cpu } from 'lucide-react';
import styles from '../styles/LoginScreen.module.css';
import { supabase } from '../supabaseClient';
import { Capacitor } from '@capacitor/core';

const LoginScreen = () => {
    const [scrolled, setScrolled] = useState(false);
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { left, top } = containerRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleTouchMove = (e) => {
        if (!containerRef.current || !e.touches[0]) return;
        const { left, top } = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - left;
        const y = e.touches[0].clientY - top;
        containerRef.current.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    // Typing animation text
    const phrases = ["Neural Workspace", "Cognitive Engine", "Creative Partner"];
    const [text, setText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) setScrolled(true);
            else setScrolled(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Typing Effect
    useEffect(() => {
        const currentPhrase = phrases[phraseIndex];
        const timeout = setTimeout(() => {
            if (!isDeleting && text === currentPhrase) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setPhraseIndex((prev) => (prev + 1) % phrases.length);
            } else {
                setText(currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)));
            }
        }, isDeleting ? 50 : 100);
        return () => clearTimeout(timeout);
    }, [text, isDeleting, phraseIndex]);

    const handleGoogleLogin = async () => {
        try {
            const isNative = Capacitor.isNativePlatform();
            // Use the specific custom scheme URL for mobile, standard origin for web
            const redirectTo = isNative
                ? 'com.varun.chatbot://login-callback'
                : window.location.origin;

            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectTo,
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
        } catch (error) {
            console.error("Error logging in:", error);
        }
    };

    return (
        <div
            className={styles.container}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
        >
            {/* Background Elements */}
            <div className={styles.bgGlow}></div>
            <div className={styles.gridOverlay}></div>

            {/* Left Side: Hero */}
            <div className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.badge}>
                        <Sparkles size={14} className={styles.sparkleIcon} />
                        <span>Next-Gen AI Platform</span>
                    </div>

                    <h1 className={styles.heading}>
                        Your Personal <br />
                        <span className={styles.gradientText}>{text}</span>
                        <span className={styles.cursor}>|</span>
                    </h1>

                    <p className={styles.subheading}>
                        Experience high-precision conversations, advanced code analysis, and context-aware intelligence.
                    </p>

                    <div className={styles.featureGrid}>
                        <div className={styles.featureBox}>
                            <Code size={20} className={styles.featureIcon} />
                            <span>Code Analysis</span>
                        </div>
                        <div className={styles.featureBox}>
                            <Zap size={20} className={styles.featureIcon} />
                            <span>Real-time Sync</span>
                        </div>
                        <div className={styles.featureBox}>
                            <Cpu size={20} className={styles.featureIcon} />
                            <span>Context AI</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Card */}
            <div className={styles.formSection}>
                <div className={styles.loginCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.logoRing}>
                            <div className={styles.innerDot}></div>
                        </div>
                        <h2>Authentication</h2>
                        <p>Access your secure workspace</p>
                    </div>

                    <button className={styles.googleBtn} onClick={handleGoogleLogin}>
                        <LogIn size={20} />
                        <span>Continue with Google</span>
                    </button>

                    <div className={styles.trustBadge}>
                        <Shield size={14} />
                        <span>End-to-End Encrypted Session</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;

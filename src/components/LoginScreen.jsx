import React, { useState, useEffect } from 'react';
import { LogIn, Sparkles, Code, Zap, Shield, Cpu } from 'lucide-react';
import styles from '../styles/LoginScreen.module.css';
import { supabase } from '../supabaseClient';

const LoginScreen = () => {
    const [scrolled, setScrolled] = useState(false);

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
        const speed = isDeleting ? 50 : 100;

        const timer = setTimeout(() => {
            if (!isDeleting && text === currentPhrase) {
                setTimeout(() => setIsDeleting(true), 1500);
            } else if (isDeleting && text === "") {
                setIsDeleting(false);
                setPhraseIndex((prev) => (prev + 1) % phrases.length);
            } else {
                setText(currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)));
            }
        }, speed);

        return () => clearTimeout(timer);
    }, [text, isDeleting, phraseIndex]);

    const handleGoogleLogin = async () => {
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
        } catch (error) {
            console.error("Error logging in:", error);
        }
    };

    return (
        <div className={styles.container}>
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

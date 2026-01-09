import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ThumbsUp, ThumbsDown, Bot } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import styles from '../styles/AdvancedChatMessage.module.css';

const AdvancedChatMessage = ({ content, isTyping }) => {
    const [liked, setLiked] = useState(null); // 'up' or 'down'

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
    };

    const CodeBlock = ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const [copied, setCopied] = useState(false);
        const codeText = String(children).replace(/\n$/, '');

        const onCopy = () => {
            handleCopy(codeText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return !inline && match ? (
            <div className={styles.codeWrapper}>
                <div className={styles.codeHeader}>
                    <span className={styles.langTag}>{match[1]}</span>
                    <button className={styles.copyBtn} onClick={onCopy} title="Copy Code">
                        {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
                <SyntaxHighlighter
                    style={atomDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, borderRadius: '0 0 8px 8px', background: '#1e1e24' }}
                    {...props}
                >
                    {codeText}
                </SyntaxHighlighter>
            </div>
        ) : (
            <code className={`${styles.inlineCode} ${className}`} {...props}>
                {children}
            </code>
        );
    };

    return (
        <div className={styles.messageContainer}>
            <div className={styles.avatarCol}>
                <div className={styles.aiAvatar}>
                    <Bot size={20} />
                </div>
            </div>

            <div className={styles.contentCol}>
                <div className={styles.bubble}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code: CodeBlock,
                            a: ({ node, ...props }) => <a className={styles.link} target="_blank" rel="noopener noreferrer" {...props} />
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                    {isTyping && <span className={styles.cursor}></span>}
                </div>

                <div className={styles.feedbackRow}>
                    <button
                        className={`${styles.feedbackBtn} ${liked === 'up' ? styles.active : ''}`}
                        onClick={() => setLiked('up')}
                    >
                        <ThumbsUp size={14} />
                    </button>
                    <button
                        className={`${styles.feedbackBtn} ${liked === 'down' ? styles.active : ''}`}
                        onClick={() => setLiked('down')}
                    >
                        <ThumbsDown size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedChatMessage;

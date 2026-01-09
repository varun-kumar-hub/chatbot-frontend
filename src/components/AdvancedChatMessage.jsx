import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ThumbsUp, ThumbsDown, Bot } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import styles from '../styles/AdvancedChatMessage.module.css';

const GeneratedImage = ({ query }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photographer, setPhotographer] = useState(null);
    const [error, setError] = useState(false);

    React.useEffect(() => {
        const fetchImage = async () => {
            try {
                let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
                if (BACKEND_URL.endsWith('/')) BACKEND_URL = BACKEND_URL.slice(0, -1);
                if (BACKEND_URL && !BACKEND_URL.startsWith('http')) BACKEND_URL = `https://${BACKEND_URL}`;
                const endpoint = `${BACKEND_URL}/image`;

                const formData = new FormData();
                formData.append('query', query);

                const res = await fetch(endpoint, {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error('Failed to fetch image');

                const data = await res.json();
                if (data.url) {
                    setImageUrl(data.url);
                    setPhotographer(data.photographer);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Image Fetch Error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [query]);

    if (loading) return (
        <div className={styles.imageSkeleton}>
            <span className={styles.loadingPulse}>Generating "{query}"...</span>
        </div>
    );

    if (error) return (
        <div className={styles.imageError}>
            <span>Could not generate image for "{query}"</span>
        </div>
    );

    return (
        <div className={styles.generatedImageContainer}>
            <img src={imageUrl} alt={query} className={styles.generatedImage} />
            <div className={styles.imageOverlay}>
                <span>Photo by {photographer} on Pexels</span>
            </div>
        </div>
    );
};

const AdvancedChatMessage = ({ content, isTyping }) => {
    const [liked, setLiked] = useState(null);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
    };

    React.useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
        });
    }, []);

    const MermaidBlock = ({ chart }) => {
        const [svg, setSvg] = useState('');
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        React.useEffect(() => {
            const renderChart = async () => {
                try {
                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } catch (error) {
                    console.error("Mermaid Render Error:", error);
                    setSvg(`<div class="struct-error">Invalid Diagram Syntax</div>`);
                }
            };
            if (chart) renderChart();
        }, [chart, id]);

        return (
            <div
                className={styles.mermaidWrapper}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        );
    };

    const CodeBlock = ({ node, inline, className, children, ...props }) => {
        const match = /language-(\w+)/.exec(className || '');
        const codeText = String(children).replace(/\n$/, '');

        // Handle Mermaid Diagrams
        if (!inline && match && match[1] === 'mermaid') {
            return <MermaidBlock chart={codeText} />;
        }

        const [copied, setCopied] = useState(false);
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
                    style={vscDarkPlus}
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

    // Split content by image tags
    const parts = content.split(/\(\(GENERATE_IMAGE: (.*?)\)\)/g);

    return (
        <div className={styles.messageContainer}>
            <div className={styles.avatarCol}>
                <div className={styles.aiAvatar}>
                    <Bot size={20} />
                </div>
            </div>

            <div className={styles.contentCol}>
                <div className={styles.bubble}>
                    {parts.map((part, index) => {
                        // Even indices are text, Odd are image queries
                        if (index % 2 === 1) {
                            return <GeneratedImage key={index} query={part} />;
                        }
                        return (
                            <ReactMarkdown
                                key={index}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code: CodeBlock,
                                    a: ({ node, ...props }) => <a className={styles.link} target="_blank" rel="noopener noreferrer" {...props} />
                                }}
                            >
                                {part}
                            </ReactMarkdown>
                        );
                    })}
                    {isTyping && <span className={styles.cursor}></span>}
                </div>

                <div className={styles.feedbackRow}>
                    <button
                        className={styles.feedbackBtn}
                        onClick={() => {
                            navigator.clipboard.writeText(content);
                            setLiked('copy');
                            setTimeout(() => setLiked(null), 2000);
                        }}
                        title="Copy Response"
                    >
                        {liked === 'copy' ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                    </button>
                    <div className={styles.dividerVertical}></div>
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

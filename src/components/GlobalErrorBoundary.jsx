import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    backgroundColor: '#0f1115',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    fontFamily: 'monospace'
                }}>
                    <h1 style={{ color: '#ef4444', marginBottom: '10px' }}>Something went wrong</h1>
                    <div style={{
                        background: '#1e1e24',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '800px',
                        overflow: 'auto',
                        border: '1px solid #333'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#f87171' }}>{this.state.error && this.state.error.toString()}</h3>
                        <pre style={{ color: '#aaa', fontSize: '12px' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;

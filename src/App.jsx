import React, { useState, useEffect, useRef } from 'react';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import { supabase } from './supabaseClient';
import { App as CapApp } from '@capacitor/app';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Session Error:", error);
      setSession(data?.session ?? null);
      setLoading(false);
    }).catch(err => {
      console.error("Unexpected session error:", err);
      setLoading(false);
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 3. Deep Link Handler (Mobile)
    let appListener = null;

    CapApp.addListener('appUrlOpen', async (data) => {
      console.log('App URL Open:', data.url);
      if (data.url.includes('login-callback')) {
        try {
          // Extract the hash part which contains access_token
          // Example: com.varun.chatbot://login-callback#access_token=...&refresh_token=...
          const urlObj = new URL(data.url);
          const hash = urlObj.hash;
          if (hash) {
            const params = new URLSearchParams(hash.substring(1)); // remove #
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token && refresh_token) {
              const { error } = await supabase.auth.setSession({
                access_token,
                refresh_token
              });
              if (error) throw error;
              console.log("Deep link session set!");
            }
          }
        } catch (e) {
          console.error("Deep Link Auth Error:", e);
        }
      }
    }).then(listener => {
      appListener = listener;
    });

    return () => {
      subscription.unsubscribe();
      if (appListener) appListener.remove();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#0f1115',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      {session ? (
        <Dashboard key={session.user.id} session={session} onLogout={handleLogout} />
      ) : (
        <LoginScreen />
      )}
    </>
  );
}

export default App;

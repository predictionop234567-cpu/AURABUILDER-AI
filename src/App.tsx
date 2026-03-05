import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useStore } from './store/useStore';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Settings from './pages/Settings';

export default function App() {
  const { setUser, user } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const initAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              plan: 'free',
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Auth state error:", err);
          setError(err.message);
          setLoading(false);
        });
      } catch (err: any) {
        console.error("Auth init error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    initAuth();

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization timed out");
        setLoading(false);
      }
    }, 5000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timeout);
    };
  }, [setUser]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl animate-bounce mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Initializing AURABUILDER...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-500 max-w-md mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/builder/:id" element={user ? <Builder /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from '../components/AdminDashboard';
import { Smartphone, Loader2 } from 'lucide-react';

interface AdminPageProps {
  onBackToStore: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBackToStore }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[AdminPage] Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white selection:bg-blue-600 selection:text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mb-5 shadow-xl shadow-blue-500/20 border border-white/20">
          <Smartphone className="w-7 h-7 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-3" />
        <p className="text-xs text-[#86868B] tracking-wider uppercase font-mono">
          Verificando sesión autorizada...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AdminLogin onBackToStore={onBackToStore} />;
  }

  return (
    <AdminDashboard
      user={currentUser}
      onSignOut={handleSignOut}
      onBackToStore={onBackToStore}
    />
  );
};

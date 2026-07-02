import { useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(!auth.isInitialized());

  useEffect(() => {
    const unsubscribe = auth.subscribe((updatedUser) => {
      setUser(updatedUser);
      setLoading(!auth.isInitialized());
    });
    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    login: auth.loginWithGoogle,
    logout: auth.logout,
  };
}

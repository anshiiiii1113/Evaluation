import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  restoreDemoUser,
  createDemoAccount,
  loginDemoAccount,
  logoutDemoAccount,
} from '../services/demoAuth';

const AuthContext = createContext();

/** Browser-local demo authentication. Not suitable for production accounts. */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const restoredUser = restoreDemoUser();
    setUser(restoredUser);
    setSession(restoredUser ? { user: restoredUser } : null);
    setAuthLoading(false);
  }, []);

  const signUp = useCallback(async (details) => {
    const nextUser = await createDemoAccount(details);
    setUser(nextUser);
    setSession({ user: nextUser });
    return { user: nextUser, session: { user: nextUser }, needsEmailConfirmation: false };
  }, []);

  const signIn = useCallback(async (credentials) => {
    const nextUser = await loginDemoAccount(credentials);
    setUser(nextUser);
    setSession({ user: nextUser });
    return { user: nextUser, session: { user: nextUser } };
  }, []);

  const signOut = useCallback(async () => {
    logoutDemoAccount();
    setUser(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, user, authLoading, signIn, signUp, signOut }),
    [session, user, authLoading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

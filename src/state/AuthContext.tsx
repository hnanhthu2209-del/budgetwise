// Auth context — guest by default, can sign in or sign up. Persists current
// userId in expo-secure-store. Once cloud sync is wired (M2), this is where
// remote token storage will plug in too.

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { userRepo, UserRow } from '../data/repositories/userRepo';
import { getDb } from '../data/db';

const KEY = 'budgetwise.userId';

type Mode = 'loading' | 'guest' | 'signedIn' | 'onboarding';

interface AuthValue {
  mode: Mode;
  user: UserRow | null;
  setOnboarded: () => void;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  deleteAccount: () => Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('loading');
  const [user, setUser] = useState<UserRow | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const id = await SecureStore.getItemAsync(KEY);
        if (id) {
          // Local lookup (cloud auth not yet wired)
          const db = await getDb();
          const u = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
          if (u) {
            setUser(u);
            setMode('signedIn');
            return;
          }
        }
        const onboarded = await SecureStore.getItemAsync('budgetwise.onboarded');
        setMode(onboarded ? 'guest' : 'onboarding');
      } catch {
        setMode('onboarding');
      }
    })();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      mode,
      user,
      setOnboarded: () => {
        SecureStore.setItemAsync('budgetwise.onboarded', '1').catch(() => {});
        setMode(prev => (prev === 'signedIn' ? prev : 'guest'));
      },
      signUp: async (email, password, displayName) => {
        const u = await userRepo.create({ email, password, displayName });
        await SecureStore.setItemAsync(KEY, u.id);
        await SecureStore.setItemAsync('budgetwise.onboarded', '1');
        setUser(u);
        setMode('signedIn');
      },
      signIn: async (email, password) => {
        const u = await userRepo.verifyPassword(email, password);
        if (!u) throw new Error('Incorrect email or password.');
        await SecureStore.setItemAsync(KEY, u.id);
        await SecureStore.setItemAsync('budgetwise.onboarded', '1');
        setUser(u);
        setMode('signedIn');
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync(KEY);
        setUser(null);
        setMode('guest');
      },
      continueAsGuest: () => {
        SecureStore.setItemAsync('budgetwise.onboarded', '1').catch(() => {});
        setMode('guest');
      },
      deleteAccount: async () => {
        if (!user) return;
        await userRepo.deleteAccount(user.id);
        await SecureStore.deleteItemAsync(KEY);
        setUser(null);
        setMode('onboarding');
      },
    }),
    [mode, user],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth used outside AuthProvider');
  return v;
}

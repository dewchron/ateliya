import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { sendOtp as sendOtpService, verifyOtp as verifyOtpService } from '../services/auth.service';
import { getProfile } from '../services/profile.service';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types/database.types';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  profile: Profile | null;
  gender: 'male' | 'female' | null;
  needsOnboarding: boolean;
  phoneNumber: string;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  session: null,
  profile: null,
  gender: null,
  needsOnboarding: false,
  phoneNumber: '',
  sendOtp: async () => {},
  verifyOtp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const fetchProfile = useCallback(async () => {
    setProfileLoaded(false);
    try {
      const p = await getProfile();
      setProfile(p);
    } catch {
      setProfile(null);
    }
    setProfileLoaded(true);
  }, []);

  // Track the current user ID so we can detect same-user SIGNED_IN events
  // (Supabase fires SIGNED_IN on every tab visibility change via _recoverAndRefresh)
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      currentUserIdRef.current = session?.user?.id ?? null;
      if (session) {
        await fetchProfile();
      } else {
        setProfileLoaded(true);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Skip TOKEN_REFRESHED — fired on tab focus, causes unnecessary re-renders
        if (event === 'TOKEN_REFRESHED') return;

        const newUserId = newSession?.user?.id ?? null;

        // Skip SIGNED_IN for the same user — Supabase fires this on every
        // tab visibility change (hidden→visible). Without this guard,
        // fetchProfile() resets profileLoaded→false, which shows the loading
        // spinner and unmounts/remounts the entire Stack, looking like a
        // full page reload.
        if (event === 'SIGNED_IN' && newUserId === currentUserIdRef.current) {
          setSession(newSession); // still update session object for fresh tokens
          return;
        }

        setSession(newSession);
        currentUserIdRef.current = newUserId;

        if (event === 'SIGNED_IN') {
          await fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setProfileLoaded(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const sendOtp = async (phone: string) => {
    await sendOtpService(phone);
  };

  const verifyOtp = async (phone: string, token: string) => {
    await verifyOtpService(phone, token);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const phoneNumber = session?.user?.phone ?? '';
  const isAuthenticated = !!session;
  const gender = profile?.gender ?? null;
  const stillLoading = isLoading || (isAuthenticated && !profileLoaded);
  const needsOnboarding = isAuthenticated && profileLoaded && !profile?.full_name;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: stillLoading,
        session,
        profile,
        gender,
        needsOnboarding,
        phoneNumber,
        sendOtp,
        verifyOtp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

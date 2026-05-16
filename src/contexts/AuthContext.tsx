import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User, AuthState } from "@/types";

// ─── Auth Context ─────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// ─── Auth Provider ────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    initialized: false,
  });

  // Map Supabase user to our User type
  const mapUser = (supabaseUser: { id: string; email?: string; created_at: string } | null): User | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      createdAt: supabaseUser.created_at,
    };
  };

  // Initialize: check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: mapUser(session?.user ?? null),
        loading: false,
        initialized: true,
      });
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState((prev) => ({
          ...prev,
          user: mapUser(session?.user ?? null),
          loading: false,
          initialized: true,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    const { error } = await supabase.auth.signUp({ email, password });
    setState((prev) => ({ ...prev, loading: false }));
    if (error) throw new Error(error.message);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true }));
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setState((prev) => ({ ...prev, loading: false }));
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    const { error } = await supabase.auth.signOut();
    setState((prev) => ({ ...prev, loading: false }));
    if (error) throw new Error(error.message);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

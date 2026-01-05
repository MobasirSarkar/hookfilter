"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
} from "react";
import type { User } from "@/lib/schema/user";
import { refreshAccessToken } from "@/lib/api/refresh";
import { getCurrentUser } from "@/lib/api/profile";

export interface AuthContextValue {
    accessToken: string | null;
    user: User | null;

    isAuthenticated: boolean;
    authReady: boolean;

    setAccessToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);

    const bootstrapped = useRef(false);

    const getToken = useCallback(() => accessToken, [accessToken]);

    useEffect(() => {
        if (bootstrapped.current) return;
        bootstrapped.current = true;

        let cancelled = false;

        const bootstrap = async () => {
            try {
                const token = await refreshAccessToken();
                if (cancelled) return;

                setAccessToken(token);

                const me = await getCurrentUser(token);
                if (cancelled) return;

                setUser(me);
            } catch {
                if (!cancelled) {
                    setAccessToken(null);
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setAuthReady(true);
                }
            }
        };

        bootstrap();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                accessToken,
                user,
                isAuthenticated: !!accessToken && !!user,
                authReady,
                setAccessToken,
                setUser,
                getToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}

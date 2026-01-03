"use client";

import { User } from "@/lib/schema/user";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface AuthContextValue {
    accessToken: string | null;
    user: User | null;
    setAccessToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    getToken: () => string | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const getToken = useCallback(() => accessToken, [accessToken]);

    useEffect(() => {
        console.log("AuthProvider mounted");
        return () => console.log("AuthProvider unmounted");
    }, []);
    return (
        <AuthContext.Provider
            value={{
                accessToken,
                setAccessToken,
                user,
                setUser,
                getToken,
                isAuthenticated: !!user,
            }
            }
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

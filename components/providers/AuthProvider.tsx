"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { fetchCurrentUser, loginUser, signUpUser, logoutUser, purgeLegacySensitiveStorage } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loginDemo: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Purge any plain passwords from legacy localStorage
    purgeLegacySensitiveStorage();

    // Fetch user from server-side session cookie
    fetchCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogin = async (email: string, password: string): Promise<User> => {
    const loggedInUser = await loginUser(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const handleSignUp = async (name: string, email: string, password: string): Promise<User> => {
    const newUser = await signUpUser(name, email, password);
    setUser(newUser);
    return newUser;
  };

  const handleLogout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
  };

  const handleLoginDemo = async (): Promise<User> => {
    const loggedInUser = await loginUser("alex.morgan@example.com", "demo123");
    setUser(loggedInUser);
    return loggedInUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login: handleLogin,
        signup: handleSignUp,
        logout: handleLogout,
        loginDemo: handleLoginDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

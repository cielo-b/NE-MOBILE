import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { storage } from '../utils/storage';
import { userAPI } from '../services/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    register: (userData: { name: string; username: string; email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Initialize auth state on app start
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {

            setIsLoading(true);
            const storedUser = await storage.getUser();


            if (storedUser) {
                // Verify the stored user is still valid
                try {

                    const updatedUser = await userAPI.getUser(storedUser.id);

                    setUser(updatedUser);
                } catch (error) {
                    // If user verification fails, clear stored data

                    console.error('AuthContext: Verification error:', error);
                    await storage.clearAll();
                    setUser(null);
                }
            } else {

            }
        } catch (error) {
            console.error('AuthContext: Error initializing auth:', error);
            setUser(null);
        } finally {

            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {

            setIsLoading(true);
            const userData = await userAPI.login(username, password);


            if (userData) {

                setUser(userData);
                await storage.setUser(userData);
                await storage.setAuthToken(userData.id); // Using user ID as token for simplicity

                return true;
            }


            return false;
        } catch (error) {
            console.error('AuthContext: Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: { name: string; username: string; email: string; password: string }): Promise<void> => {
        try {

            setIsLoading(true);

            // Create user via API
            const newUser = await userAPI.createUser(userData);


            // Auto-login after successful registration
            setUser(newUser);
            await storage.setUser(newUser);
            await storage.setAuthToken(newUser.id);

        } catch (error) {
            console.error('AuthContext: Registration error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {

            setIsLoading(true);
            setUser(null);
            await storage.clearAll();

        } catch (error) {
            console.error('AuthContext: Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async (): Promise<void> => {
        if (!user) return;

        try {
            const updatedUser = await userAPI.getUser(user.id);
            setUser(updatedUser);
            await storage.setUser(updatedUser);
        } catch (error) {
            console.error('Error refreshing user:', error);
            // If refresh fails, logout the user
            await logout();
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 
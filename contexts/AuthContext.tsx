import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { storage } from '../utils/storage';
import { userAPI } from '../services/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string) => Promise<boolean>;
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
            console.log('AuthContext: Initializing authentication...');
            setIsLoading(true);
            const storedUser = await storage.getUser();
            console.log('AuthContext: Stored user found:', storedUser);

            if (storedUser) {
                // Verify the stored user is still valid
                try {
                    console.log('AuthContext: Verifying stored user...');
                    const updatedUser = await userAPI.getUser(storedUser.id);
                    console.log('AuthContext: User verification successful:', updatedUser);
                    setUser(updatedUser);
                } catch (error) {
                    // If user verification fails, clear stored data
                    console.log('AuthContext: Stored user verification failed, clearing auth data');
                    console.error('AuthContext: Verification error:', error);
                    await storage.clearAll();
                    setUser(null);
                }
            } else {
                console.log('AuthContext: No stored user found');
            }
        } catch (error) {
            console.error('AuthContext: Error initializing auth:', error);
            setUser(null);
        } finally {
            console.log('AuthContext: Authentication initialization complete');
            setIsLoading(false);
        }
    };

    const login = async (username: string): Promise<boolean> => {
        try {
            console.log('AuthContext: Login attempt for username:', username);
            setIsLoading(true);
            const userData = await userAPI.login(username);
            console.log('AuthContext: Login API response:', userData);

            if (userData) {
                console.log('AuthContext: Login successful, setting user data');
                setUser(userData);
                await storage.setUser(userData);
                await storage.setAuthToken(userData.id); // Using user ID as token for simplicity
                console.log('AuthContext: User data stored successfully');
                return true;
            }

            console.log('AuthContext: Login failed - no user data returned');
            return false;
        } catch (error) {
            console.error('AuthContext: Login error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            console.log('AuthContext: Logout initiated');
            setIsLoading(true);
            setUser(null);
            await storage.clearAll();
            console.log('AuthContext: Logout completed successfully');
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
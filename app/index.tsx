import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/ui/Loading';

export default function IndexScreen() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        console.log('IndexScreen: useEffect triggered', { isAuthenticated, isLoading });

        if (!isLoading) {
            if (isAuthenticated) {
                console.log('IndexScreen: User is authenticated, redirecting to dashboard');
                router.replace('/(tabs)/dashboard');
            } else {
                console.log('IndexScreen: User is not authenticated, redirecting to login');
                router.replace('/login');
            }
        } else {
            console.log('IndexScreen: Still loading authentication state');
        }
    }, [isAuthenticated, isLoading]);

    console.log('IndexScreen: Rendering loading screen');
    return <Loading text="Loading..." />;
} 
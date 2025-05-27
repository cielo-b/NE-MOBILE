import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/ui/Loading';

export default function IndexScreen() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace('/(tabs)/dashboard');
            } else {
                router.replace('/login');
            }
        }
    }, [isAuthenticated, isLoading]);

    return <Loading text="Loading..." />;
} 
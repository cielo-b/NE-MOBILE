import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { validation } from '../utils/validation';

export default function LoginScreen() {
    const { login, isAuthenticated, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/(tabs)/dashboard');
        }
    }, [isAuthenticated]);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        const emailValidation = validation.email(formData.username);
        if (!emailValidation.isValid) {
            newErrors.username = emailValidation.message!;
        }

        const passwordValidation = validation.password(formData.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message!;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await login(formData.username);

            if (success) {
                Toast.show({
                    type: 'success',
                    text1: 'Welcome back!',
                    text2: 'You have been logged in successfully.',
                });
                router.replace('/(tabs)/dashboard');
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Login Failed',
                    text2: 'Invalid username or user not found.',
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Login Error',
                text2: 'An error occurred during login. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    if (isLoading) {
        return <Loading text="Initializing..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 justify-center px-6 py-12">
                        {/* Header */}
                        <View className="items-center mb-8">
                            <View className="w-20 h-20 bg-primary-600 rounded-full items-center justify-center mb-4">
                                <Text className="text-white text-2xl font-bold">$</Text>
                            </View>
                            <Text className="text-3xl font-bold text-gray-900 mb-2">
                                Finance Tracker
                            </Text>
                            <Text className="text-gray-600 text-center">
                                Track your expenses and manage your budget
                            </Text>
                        </View>

                        {/* Login Form */}
                        <View className="space-y-4">
                            <Input
                                label="Email Address"
                                placeholder="Enter your email"
                                value={formData.username}
                                onChangeText={(value) => updateFormData('username', value)}
                                error={errors.username}
                                leftIcon="mail-outline"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                                required
                            />

                            <Input
                                label="Password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChangeText={(value) => updateFormData('password', value)}
                                error={errors.password}
                                leftIcon="lock-closed-outline"
                                secureTextEntry
                                autoComplete="password"
                                required
                            />

                            <Button
                                title="Sign In"
                                onPress={handleLogin}
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                fullWidth
                                size="lg"
                                className="mt-6"
                            />
                        </View>

                        {/* Demo Instructions */}
                        <View className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <Text className="text-blue-800 font-semibold mb-2">
                                Demo Instructions:
                            </Text>
                            <Text className="text-blue-700 text-sm">
                                Use any valid email format to login. The app will authenticate using the MockAPI users endpoint.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 
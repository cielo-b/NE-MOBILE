import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

import { useAuth } from '../contexts/AuthContext';
import { validation } from '../utils/validation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

interface LoginFormData {
    username: string;
    password: string;
}

export default function LoginScreen() {
    const { login } = useAuth();
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const logoRotateAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        // Start animations when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.loop(
                Animated.timing(logoRotateAnim, {
                    toValue: 1,
                    duration: 10000,
                    useNativeDriver: true,
                })
            ),
        ]).start();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Email is required';
        } else if (!validation.isValidEmail(formData.username.trim())) {
            newErrors.username = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 3) {
            newErrors.password = 'Password must be at least 3 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const success = await login(formData.username.trim(), formData.password);

            if (success) {
                Toast.show({
                    type: 'success',
                    text1: 'Welcome back!',
                    text2: 'Successfully logged in',
                });

                router.replace('/(tabs)/dashboard');
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Login Failed',
                    text2: 'Invalid username or password',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: error.message || 'Invalid credentials',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateFormData = (field: keyof LoginFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <View className="flex-1">
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#334155']}
                className="absolute inset-0"
            />

            {/* Animated Background Shapes */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    transform: [
                        {
                            scale: scaleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1.5],
                            }),
                        },
                    ],
                }}
            />

            <Animated.View
                style={{
                    position: 'absolute',
                    bottom: -150,
                    left: -150,
                    width: 300,
                    height: 300,
                    borderRadius: 150,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    transform: [
                        {
                            scale: scaleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1.2],
                            }),
                        },
                    ],
                }}
            />

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="flex-1 px-6 py-8 justify-center">
                            {/* Header */}
                            <Animated.View
                                style={{
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                className="items-center mb-12"
                            >
                                <Animated.View
                                    className="w-24 h-24 bg-primary-600 rounded-full items-center justify-center mb-8 shadow-lg"
                                >
                                    <Ionicons name="wallet" size={48} color="white" />

                                </Animated.View>

                                <Text className="text-white text-4xl font-bold mb-3">
                                    Welcome Back
                                </Text>
                                <Text className="text-gray-300 text-center text-lg leading-7 mb-4">
                                    Sign in to continue managing{'\n'}your expenses
                                </Text>
                            </Animated.View>

                            {/* Form */}
                            <Animated.View
                                style={{
                                    opacity: fadeAnim,
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim },
                                    ],
                                }}
                                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20"
                            >
                                <View className="">
                                    <Input
                                        label="Email"
                                        placeholder="Enter your email address"
                                        value={formData.username}
                                        onChangeText={(value) => updateFormData('username', value)}
                                        error={errors.username}
                                        leftIcon="mail-outline"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        variant="glass"
                                    />

                                    <Input
                                        label="Password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChangeText={(value) => updateFormData('password', value)}
                                        error={errors.password}
                                        leftIcon="lock-closed-outline"
                                        secureTextEntry={!showPassword}
                                        rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                                        onRightIconPress={() => setShowPassword(!showPassword)}
                                        variant="glass"
                                    />
                                    <Button
                                        title="Sign In"
                                        onPress={handleLogin}
                                        loading={isLoading}
                                        disabled={isLoading}
                                        variant="gradient"
                                        size="lg"
                                        fullWidth
                                        leftIcon="log-in-outline"
                                    />
                                    <View className='flex flex-row items-center justify-center'>

                                        <Text className="text-gray-300 text-base">
                                            Don't have an account?{' '}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => router.push('/register')}
                                            className="ml-1"
                                        >
                                            <Text className="text-primary-400 font-semibold text-base">
                                                Sign Up
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
} 
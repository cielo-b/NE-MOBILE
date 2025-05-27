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

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function RegisterScreen() {
    const { register } = useAuth();
    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
        ]).start();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validation.isValidEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await register({
                name: formData.name.trim(),
                username: formData.email.trim(),
                email: formData.email.trim(),
                password: formData.password,
            });

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Account created successfully!',
            });

            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Registration Failed',
                text2: error.message || 'Failed to create account',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const updateFormData = (field: keyof RegisterFormData, value: string) => {
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
                        contentContainerStyle={{ flexGrow: 1 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="flex-1 px-6 py-8">
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
                                className="items-center mb-8"
                            >
                                <Animated.View
                                    className="w-24 h-24 bg-primary-600 rounded-full items-center justify-center mb-8 shadow-lg"
                                >
                                    <Ionicons name="wallet" size={48} color="white" />

                                </Animated.View>

                                <Text className="text-white text-3xl font-bold mb-2">
                                    Create Account
                                </Text>
                                <Text className="text-gray-300 text-center text-base leading-6">
                                    Join us to start tracking your expenses{'\n'}and managing your budget
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
                                className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-3 border border-white/20"
                            >
                                <View className="">
                                    <Input
                                        label="Full Name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChangeText={(value) => updateFormData('name', value)}
                                        error={errors.name}
                                        leftIcon="person-outline"
                                        autoCapitalize="words"
                                        variant="glass"
                                    />

                                    <Input
                                        label="Email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChangeText={(value) => updateFormData('email', value)}
                                        error={errors.email}
                                        leftIcon="mail-outline"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        variant="glass"
                                    />

                                    <Input
                                        label="Password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChangeText={(value) => updateFormData('password', value)}
                                        error={errors.password}
                                        leftIcon="lock-closed-outline"
                                        secureTextEntry={!showPassword}
                                        rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                                        onRightIconPress={() => setShowPassword(!showPassword)}
                                        variant="glass"
                                    />

                                    <Input
                                        label="Confirm Password"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChangeText={(value) => updateFormData('confirmPassword', value)}
                                        error={errors.confirmPassword}
                                        leftIcon="lock-closed-outline"
                                        secureTextEntry={!showConfirmPassword}
                                        rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                        onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        variant="glass"
                                    />
                                    <Button
                                        title="Create Account"
                                        onPress={handleRegister}
                                        loading={isLoading}
                                        disabled={isLoading}
                                        variant="gradient"
                                        size="lg"
                                        fullWidth
                                        leftIcon="person-add-outline"
                                    />
                                    <View className='flex flex-row items-center justify-center'>

                                        <Text className="text-gray-300 text-base">
                                            Already have an account?{' '}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => router.push('/login')}
                                            className="ml-1"
                                        >
                                            <Text className="text-primary-400 font-semibold text-base">
                                                Sign In
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
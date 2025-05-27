import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

import { useBudget } from '../contexts/BudgetContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { useAuth } from '@/contexts/AuthContext';

export default function BudgetSettingsScreen() {
    const { budgetSettings, setBudgetSettings } = useBudget();
    const [monthlyLimit, setMonthlyLimit] = useState(budgetSettings.monthlyLimit.toString());
    const [notificationThreshold, setNotificationThreshold] = useState(budgetSettings.notificationThreshold.toString());
    const [isLoading, setIsLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated]);

    useEffect(() => {
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

    const handleSave = async () => {
        const limitValue = parseFloat(monthlyLimit);
        const thresholdValue = parseFloat(notificationThreshold);

        if (isNaN(limitValue) || limitValue <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid monthly limit greater than 0.');
            return;
        }

        if (isNaN(thresholdValue) || thresholdValue < 0 || thresholdValue > 100) {
            Alert.alert('Invalid Input', 'Please enter a notification threshold between 0 and 100.');
            return;
        }

        setIsLoading(true);
        try {
            await setBudgetSettings({
                monthlyLimit: limitValue,
                notificationThreshold: thresholdValue,
            });

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Budget settings saved successfully',
            });

            router.back();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save budget settings',
            });
        } finally {
            setIsLoading(false);
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

            <SafeAreaView className="flex-1">
                {/* Enhanced Header */}
                <LinearGradient
                    colors={['#0f172a', '#1e293b']}
                    className="px-4 py-6"
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="p-2 rounded-xl bg-white/10"
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>

                            <View className="flex-1 items-center">
                                <Text className="text-white text-xl font-bold">
                                    Budget Settings
                                </Text>
                                <Text className="text-gray-300 text-sm">
                                    Configure your spending limits
                                </Text>
                            </View>

                            <View style={{ width: 40 }} />
                        </View>
                    </Animated.View>
                </LinearGradient>

                <ScrollView className="flex-1">
                    <View className="p-6">
                        <AnimatedCard
                            className=" mb-6"
                            animationType="slideUp"
                            delay={200}
                        >
                            <Text className="text-white text-lg font-bold mb-6">
                                Monthly Budget Configuration
                            </Text>

                            <View className="space-y-4">
                                <Input
                                    label="Monthly Spending Limit"
                                    placeholder="1000"
                                    value={monthlyLimit}
                                    onChangeText={setMonthlyLimit}
                                    leftIcon="cash-outline"
                                    keyboardType="numeric"
                                    variant="glass"
                                    required
                                />

                                <Input
                                    label="Notification Threshold (%)"
                                    placeholder="80"
                                    value={notificationThreshold}
                                    onChangeText={setNotificationThreshold}
                                    leftIcon="notifications-outline"
                                    keyboardType="numeric"
                                    variant="glass"
                                    required
                                />
                            </View>
                        </AnimatedCard>
                        <AnimatedCard
                            className="bg-transparent"
                            animationType="scale"
                            delay={400}
                        >
                            <View className="space-y-4">
                                <Button
                                    title="Save Settings"
                                    onPress={handleSave}
                                    loading={isLoading}
                                    disabled={isLoading}
                                    variant="gradient"
                                    fullWidth
                                    size="lg"
                                    leftIcon="checkmark-outline"
                                />

                                <Button
                                    title="Cancel"
                                    onPress={() => router.back()}
                                    variant="glass"
                                    fullWidth
                                    size="lg"
                                    leftIcon="close-outline"
                                />
                            </View>
                        </AnimatedCard>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
} 
import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Enhanced Header with Gradient */}
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
                    <View className="flex-row items-center">
                        <Text className="text-white text-2xl font-bold">Profile</Text>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView className="flex-1">
                <View className="">
                    {/* User Info Card */}
                    <AnimatedCard
                        className="mb-6 p-6 bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl shadow-slate-500/25"
                        animationType="slideUp"
                        delay={200}
                    >
                        <View className="items-center mb-6">
                            <View className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-full items-center justify-center mb-4 border-2 border-white/30">
                                <Ionicons name="person" size={48} color="white" />
                            </View>
                            <Text className="text-white text-2xl font-bold mb-2">
                                {user?.name || user?.username || 'User'}
                            </Text>
                            {user?.email && (
                                <Text className="text-white/80 text-lg">{user.email}</Text>
                            )}
                        </View>

                        <View className="space-y-4">
                            <View className="flex-row items-center bg-white/10 backdrop-blur-lg rounded-xl p-4">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                                    <Ionicons name="mail-outline" size={24} color="white"/>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white/80 text-sm font-medium">Email</Text>
                                    <Text className="text-white font-bold text-lg">
                                        {user?.email || 'Not set'}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center bg-white/10 backdrop-blur-lg rounded-xl p-4">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                                    <Ionicons name="calendar-outline" size={24} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white/80 text-sm font-medium">Member Since</Text>
                                    <Text className="text-white font-bold text-lg">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </AnimatedCard>

                    {/* Quick Actions */}
                    <AnimatedCard
                        className="mb-6 p-6 bg-white/95 backdrop-blur-lg shadow-xl"
                        animationType="slideLeft"
                        delay={400}
                    >
                        <Text className="text-lg font-bold text-gray-900 mb-4">
                            Quick Actions
                        </Text>
                        <View className="space-y-3">
                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-blue-50 rounded-2xl"
                                onPress={() => router.push('/budget-settings')}
                            >
                                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                                    <Ionicons name="settings-outline" size={24} color="#3b82f6" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">Budget Settings</Text>
                                    <Text className="text-gray-600 text-sm">Manage your spending limits</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-emerald-50 rounded-2xl"
                                onPress={() => router.push('/(tabs)/expenses')}
                            >
                                <View className="w-12 h-12 bg-emerald-100 rounded-full items-center justify-center mr-4">
                                    <Ionicons name="receipt-outline" size={24} color="#10b981" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">View All Expenses</Text>
                                    <Text className="text-gray-600 text-sm">See your spending history</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-slate-50 rounded-2xl"
                                onPress={() => router.push('/expense-form')}
                            >
                                <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-4">
                                    <Ionicons name="add-circle-outline" size={24} color="#64748b" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">Add New Expense</Text>
                                    <Text className="text-gray-600 text-sm">Track a new purchase</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </AnimatedCard>

                    {/* Logout Button */}
                    <AnimatedCard
                        className="bg-transparent p-6"
                        animationType="scale"
                        delay={600}
                    >
                        <Button
                            title="Logout"
                            onPress={handleLogout}
                            variant="danger"
                            leftIcon="log-out-outline"
                            fullWidth
                            size="lg"
                        />
                    </AnimatedCard>
                </View>
            </ScrollView>
        </View>
    );
} 
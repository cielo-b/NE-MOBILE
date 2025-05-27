import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

import { expenseAPI } from '../../services/api';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {


    if (!category || typeof category !== 'string') {
        console.warn('Invalid category provided to expense details getCategoryIcon:', category);
        return 'ellipse-outline';
    }

    switch (category.toLowerCase()) {
        case 'food & dining':
            return 'restaurant-outline';
        case 'transportation':
            return 'car-outline';
        case 'shopping':
            return 'bag-outline';
        case 'entertainment':
            return 'game-controller-outline';
        case 'bills & utilities':
            return 'receipt-outline';
        case 'healthcare':
            return 'medical-outline';
        case 'education':
            return 'school-outline';
        case 'travel':
            return 'airplane-outline';
        default:
            return 'ellipse-outline';
    }
};

const getCategoryColor = (category: string): string => {


    if (!category || typeof category !== 'string') {
        console.warn('Invalid category provided to expense details getCategoryColor:', category);
        return '#6b7280';
    }

    switch (category.toLowerCase()) {
        case 'food & dining':
            return '#f59e0b';
        case 'transportation':
            return '#3b82f6';
        case 'shopping':
            return '#ec4899';
        case 'entertainment':
            return '#8b5cf6';
        case 'bills & utilities':
            return '#ef4444';
        case 'healthcare':
            return '#10b981';
        case 'education':
            return '#06b6d4';
        case 'travel':
            return '#f97316';
        default:
            return '#6b7280';
    }
};

export default function ExpenseDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [expense, setExpense] = useState<Expense | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
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

    useEffect(() => {
        if (id) {
            loadExpense(id);
        }
    }, [id]);

    const loadExpense = async (expenseId: string) => {
        try {
            setIsLoading(true);
            const data = await expenseAPI.getExpense(expenseId);
            setExpense(data);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load expense details',
            });
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        if (expense) {
            router.push(`/expense-form?id=${expense.id}`);
        }
    };

    const handleDelete = async () => {
        if (!expense) return;

        setIsDeleting(true);
        try {
            await expenseAPI.deleteExpense(expense.id);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Expense deleted successfully',
            });

            // Navigate back to expenses list
            router.replace('/(tabs)/expenses');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete expense. Please try again.',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <Loading text="Loading expense details..." />;
    }

    if (!expense) {
        return (
            <View className="flex-1">
                <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

                {/* Background Gradient */}
                <LinearGradient
                    colors={['#0f172a', '#1e293b', '#334155']}
                    className="absolute inset-0"
                />

                <SafeAreaView className="flex-1">
                    <View className="flex-1 items-center justify-center p-8">
                        <View className="w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-6">
                            <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
                        </View>
                        <Text className="text-white text-xl font-semibold mb-3">
                            Expense Not Found
                        </Text>
                        <Text className="text-gray-300 text-center mb-8 leading-6">
                            The expense you're looking for doesn't exist or has been deleted.
                        </Text>
                        <Button
                            title="Go Back"
                            onPress={() => router.back()}
                            variant="gradient"
                            leftIcon="arrow-back-outline"
                        />
                    </View>
                </SafeAreaView>
            </View>
        );
    }
    const categoryIcon = getCategoryIcon(expense.category ?? '');
    const categoryColor = getCategoryColor(expense.category ?? '');

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
                    className="px-4 py-4"
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
                                    Expense Details
                                </Text>
                                <Text className="text-gray-300 text-sm">
                                    View and manage expense
                                </Text>
                            </View>

                            <View style={{ width: 40 }} />
                        </View>
                    </Animated.View>
                </LinearGradient>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    <View className="p-4">
                        {/* Main Info Card */}
                        <AnimatedCard
                            className="mb-4"
                            animationType="slideUp"
                            delay={200}
                        >
                            <View className="items-center mb-4">
                                <View
                                    className="w-16 h-16 rounded-full items-center justify-center mb-3 border-2 border-white/20"
                                    style={{ backgroundColor: `${categoryColor}30` }}
                                >
                                    <Ionicons
                                        name={categoryIcon}
                                        size={32}
                                        color={categoryColor}
                                    />
                                </View>

                                <Text className="text-white text-2xl font-bold mb-2">
                                    {formatters.currency(expense.amount)}
                                </Text>

                                <Text className="text-white text-lg font-semibold text-center">
                                    {expense.title || 'Untitled Expense'}
                                </Text>
                            </View>

                            {/* Details Grid */}
                            <View className="space-y-3">
                                <View className="flex-row items-center bg-white/5 rounded-xl p-3">
                                    <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="grid-outline" size={16} color="#9ca3af" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-xs">Category</Text>
                                        <Text className="text-white font-medium text-sm">{expense.category}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center bg-white/5 rounded-xl p-3">
                                    <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-xs">Date</Text>
                                        <Text className="text-white font-medium text-sm">
                                            {formatters.date(expense.date || new Date())}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {formatters.relativeDate(expense.date || new Date())}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center bg-white/5 rounded-xl p-3">
                                    <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="time-outline" size={16} color="#9ca3af" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-xs">Created</Text>
                                        <Text className="text-white font-medium text-sm">
                                            {formatters.dateTime(expense.createdAt)}
                                        </Text>
                                    </View>
                                </View>

                                {expense.updatedAt !== expense.createdAt && (
                                    <View className="flex-row items-center bg-white/5 rounded-xl p-3">
                                        <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mr-3">
                                            <Ionicons name="pencil-outline" size={16} color="#9ca3af" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-300 text-xs">Last Updated</Text>
                                            <Text className="text-white font-medium text-sm">
                                                {formatters.dateTime(expense.updatedAt || expense.createdAt)}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </AnimatedCard>

                        {/* Description Card */}
                        {expense.description && (
                            <AnimatedCard
                                className="mb-4"
                                animationType="slideLeft"
                                delay={300}
                            >
                                <View className="flex-row items-start">
                                    <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mr-3 mt-1">
                                        <Ionicons name="text-outline" size={16} color="#9ca3af" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-300 text-xs mb-2">Description</Text>
                                        <Text className="text-white leading-5 text-sm">
                                            {expense.description}
                                        </Text>
                                    </View>
                                </View>
                            </AnimatedCard>
                        )}

                        {/* Action Buttons */}
                        <AnimatedCard
                            className="bg-transparent"
                            animationType="scale"
                            delay={400}
                        >
                            <View className="space-y-3">
                                <Button
                                    title="Edit Expense"
                                    onPress={handleEdit}
                                    variant="gradient"
                                    leftIcon="pencil-outline"
                                    fullWidth
                                    size="md"
                                />

                                <Button
                                    title="Delete Expense"
                                    onPress={handleDelete}
                                    variant="danger"
                                    loading={isDeleting}
                                    disabled={isDeleting}
                                    leftIcon="trash-outline"
                                    fullWidth
                                    size="md"
                                />
                            </View>
                        </AnimatedCard>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
} 
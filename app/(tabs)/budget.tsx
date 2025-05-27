import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useRouter, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { expenseAPI } from '../../services/api';
import { Expense, EXPENSE_CATEGORIES } from '../../types';
import { formatters } from '../../utils/formatters';
import { Card } from '../../components/ui/Card';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { Loading } from '../../components/ui/Loading';
import { debug } from '../../utils/debug';

interface CategoryBudget {
    category: string;
    spent: number;
    limit: number;
    percentage: number;
}

export default function BudgetScreen() {
    const { user, isAuthenticated } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const router = useRouter();

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

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
        ]).start();
    }, []);

    // Mock budget limits - in a real app, these would come from user settings
    const budgetLimits: { [key: string]: number } = {
        'Food & Dining': 500,
        'Transportation': 200,
        'Shopping': 300,
        'Entertainment': 150,
        'Bills & Utilities': 400,
        'Healthcare': 200,
        'Education': 100,
        'Travel': 250,
        'Other': 100,
    };

    useEffect(() => {
        loadExpenses();
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadExpenses();
        }, [])
    );

    const loadExpenses = async () => {
        try {
            debug.log('BudgetScreen', 'Loading expenses...');
            setIsLoading(true);
            let data = await expenseAPI.getAllExpenses();

            // Filter expenses by current user
            data = data.filter(expense => expense.userId === user?.id);
            debug.log('BudgetScreen', 'Raw expenses data received:', data);

            // Normalize and validate each expense
            const normalizedExpenses = data.map((expense, index) => {
                const validation = debug.validateExpense(expense);
                if (!validation.isValid) {
                    debug.warn('BudgetScreen', `Invalid expense at index ${index}:`, validation.issues);
                }

                // Normalize the expense data structure
                const normalized = debug.normalizeExpense(expense);
                return normalized;
            }).filter(expense => expense && expense.id); // Filter out invalid expenses

            debug.log('BudgetScreen', 'Normalized expenses:', normalizedExpenses);
            setExpenses(normalizedExpenses);
        } catch (error) {
            debug.error('BudgetScreen', 'Error loading expenses:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load expenses',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadExpenses();
        setIsRefreshing(false);
    };

    const getCurrentMonthExpenses = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date || expense.createdAt);
            return expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear;
        });
    };

    const getCategoryBudgets = (): CategoryBudget[] => {
        const currentMonthExpenses = getCurrentMonthExpenses();
        const categorySpending: { [key: string]: number } = {};

        // Calculate spending per category
        currentMonthExpenses.forEach(expense => {
            const category = expense.category || 'Other';
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : expense.amount;
            categorySpending[category] = (categorySpending[category] || 0) + amount;
        });

        // Create budget objects for all categories
        return EXPENSE_CATEGORIES.map(category => {
            const spent = categorySpending[category] || 0;
            const limit = budgetLimits[category] || 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;

            return {
                category,
                spent,
                limit,
                percentage: Math.min(percentage, 100),
            };
        }).sort((a, b) => b.percentage - a.percentage);
    };

    const getTotalBudget = () => {
        return Object.values(budgetLimits).reduce((total, limit) => total + limit, 0);
    };

    const getTotalSpent = () => {
        return getCurrentMonthExpenses().reduce((total, expense) => {
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : expense.amount;
            return total + amount;
        }, 0);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return '#ef4444'; // Red
        if (percentage >= 75) return '#f59e0b'; // Orange
        if (percentage >= 50) return '#eab308'; // Yellow
        return '#22c55e'; // Green
    };

    const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {


        if (!category || typeof category !== 'string') {
            console.warn('Invalid category provided to budget getCategoryIcon:', category);
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

    if (isLoading) {
        return <Loading text="Loading budget data..." />;
    }

    const categoryBudgets = getCategoryBudgets();
    const totalBudget = getTotalBudget();
    const totalSpent = getTotalSpent();
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                            <Text className="text-white text-2xl font-bold">Budget</Text>
                            <Text className="text-gray-300 text-sm mt-1">
                                Monitor your spending limits
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/budget-settings')}
                            className="bg-gray-500/20 px-4 py-2 rounded-xl flex-row items-center border border-gray-400/30"
                        >
                            <Ionicons name="settings-outline" size={18} color="white" />
                            <Text className="text-white font-semibold ml-2">Settings</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            >
                <View className="">
                    {/* Overall Budget Summary */}
                    <AnimatedCard
                        className="mb-6 p-6 bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl shadow-slate-500/25"
                        animationType="slideUp"
                        delay={200}
                    >
                        <Text className="text-white text-lg font-bold mb-6">
                            Monthly Budget Overview
                        </Text>

                        <View className="items-center mb-6">
                            <Text className="text-white text-4xl font-bold">
                                {formatters.currency(totalSpent)}
                            </Text>
                            <Text className="text-white/80 text-lg">
                                of {formatters.currency(totalBudget)} budget
                            </Text>
                        </View>

                        {/* Overall Progress Bar */}
                        <View className="mb-6">
                            <View className="flex-row justify-between mb-3">
                                <Text className="text-white/90 text-sm font-medium">Overall Progress</Text>
                                <Text className="text-white font-bold text-lg">
                                    {overallPercentage.toFixed(1)}%
                                </Text>
                            </View>
                            <View className="h-4 bg-white/20 rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full bg-white"
                                    style={{
                                        width: `${Math.min(overallPercentage, 100)}%`,
                                    }}
                                />
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-white/80 text-sm">Remaining</Text>
                                <Text className="text-white font-bold text-xl">
                                    {formatters.currency(Math.max(totalBudget - totalSpent, 0))}
                                </Text>
                            </View>
                            {overallPercentage > 100 && (
                                <View className="items-end">
                                    <Text className="text-red-200 text-sm">Over budget</Text>
                                    <Text className="text-red-100 font-bold text-lg">
                                        {formatters.currency(totalSpent - totalBudget)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </AnimatedCard>

                    {/* Category Breakdown Header */}
                    <AnimatedCard
                        className="mb-4 p-6 bg-white/95"
                        animationType="slideUp"
                        delay={300}
                    >
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-gray-900">
                                Category Breakdown
                            </Text>
                            <View className="bg-blue-50 px-3 py-1 rounded-full">
                                <Text className="text-blue-600 text-xs font-medium">
                                    {categoryBudgets.length} Categories
                                </Text>
                            </View>
                        </View>
                    </AnimatedCard>

                    {/* Category Budget Cards */}
                    {categoryBudgets.map((budget, index) => (
                        <AnimatedCard
                            key={budget.category}
                            className="mb-4 bg-white/95 p-6"
                            animationType="slideLeft"
                            delay={400 + (index * 100)}
                        >
                            <View className="flex-row items-center mb-4">
                                <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                                    <Ionicons
                                        name={getCategoryIcon(budget.category)}
                                        size={24}
                                        color="#6b7280"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">{budget.category}</Text>
                                    <Text className="text-gray-600 text-sm">
                                        {formatters.currency(budget.spent)} of {formatters.currency(budget.limit)}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text
                                        className="font-bold text-xl"
                                        style={{ color: getProgressColor(budget.percentage) }}
                                    >
                                        {budget.percentage.toFixed(0)}%
                                    </Text>
                                    <Text className="text-gray-500 text-xs">
                                        {budget.percentage > 100 ? 'Over limit' : 'Used'}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            <View className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min(budget.percentage, 100)}%`,
                                        backgroundColor: getProgressColor(budget.percentage),
                                    }}
                                />
                            </View>

                            {budget.percentage > 100 && (
                                <View className="bg-red-50 p-3 rounded-xl mt-2">
                                    <View className="flex-row items-center">
                                        <Ionicons name="warning" size={16} color="#ef4444" />
                                        <Text className="text-red-600 text-sm font-medium ml-2">
                                            Over budget by {formatters.currency(budget.spent - budget.limit)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </AnimatedCard>
                    ))}

                </View>
            </ScrollView>
        </View>
    );
} 
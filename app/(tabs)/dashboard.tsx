import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Animated } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';

import { useAuth } from '../../contexts/AuthContext';
import { useBudget } from '../../contexts/BudgetContext';
import { expenseAPI } from '../../services/api';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { debug } from '../../utils/debug';
import { Card } from '../../components/ui/Card';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { Loading } from '../../components/ui/Loading';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#3b82f6',
    },
};

export default function DashboardScreen() {
    const { user, logout, isAuthenticated } = useAuth();
    const { budgetSettings, currentMonthSpent, isOverBudget, percentageUsed, refreshBudgetData } = useBudget();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

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
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for budget alert
        if (isOverBudget) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isOverBudget]);

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
            debug.log('DashboardScreen', 'Loading expenses...');
            setIsLoading(true);
            let data = await expenseAPI.getAllExpenses();

            // Filter expenses by current user
            data = data.filter(expense => expense.userId === user?.id);
            debug.log('DashboardScreen', 'Raw expenses data received:', data);

            // Normalize and validate each expense
            const normalizedExpenses = data.map((expense, index) => {
                const validation = debug.validateExpense(expense);
                if (!validation.isValid) {
                    debug.warn('DashboardScreen', `Invalid expense at index ${index}:`, validation.issues);
                }

                // Normalize the expense data structure
                const normalized = debug.normalizeExpense(expense);
                return normalized;
            }).filter(expense => expense && expense.id); // Filter out invalid expenses

            debug.log('DashboardScreen', 'Normalized expenses:', normalizedExpenses);
            setExpenses(normalizedExpenses);
            await refreshBudgetData();
        } catch (error) {
            debug.error('DashboardScreen', 'Error loading expenses:', error);
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

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/login');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to logout',
            });
        }
    };

    const calculateTotalExpenses = () => {
        return expenses.reduce((total, expense) => {
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : expense.amount;
            return total + amount;
        }, 0);
    };

    const getThisMonthExpenses = () => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date || expense.createdAt);
            return expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear;
        });
    };

    const getRecentExpenses = () => {
        return expenses
            .sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt).getTime();
                const dateB = new Date(b.date || b.createdAt).getTime();
                return dateB - dateA;
            })
            .slice(0, 5);
    };

    const getCategoryBreakdown = () => {
        const categoryTotals: { [key: string]: number } = {};

        expenses.forEach(expense => {
            const category = expense.category || 'Other';
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : expense.amount;
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    };

    const getWeeklySpendingData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date;
        });

        const weeklyData = last7Days.map(date => {
            const dayExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date || expense.createdAt);
                return expenseDate.toDateString() === date.toDateString();
            });

            const total = dayExpenses.reduce((sum, expense) => {
                const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : expense.amount;
                return sum + amount;
            }, 0);

            return total;
        });

        return {
            labels: last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [{
                data: weeklyData,
                strokeWidth: 3,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            }],
        };
    };

    const getPieChartData = () => {
        const categoryBreakdown = getCategoryBreakdown();
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        return categoryBreakdown.map((item, index) => ({
            name: item.category,
            population: item.amount,
            color: colors[index % colors.length],
            legendFontColor: '#6b7280',
            legendFontSize: 12,
        }));
    };

    if (isLoading) {
        return <Loading text="Loading dashboard..." />;
    }

    const thisMonthExpenses = getThisMonthExpenses();
    const thisMonthTotal = thisMonthExpenses.reduce((total, expense) => {
        const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : expense.amount;
        return total + amount;
    }, 0);
    const recentExpenses = getRecentExpenses();
    const topCategories = getCategoryBreakdown();
    const weeklyData = getWeeklySpendingData();
    const pieData = getPieChartData();

    return (
        <View className="flex-1 bg-gray-50">
            {/* Enhanced Header with Gradient and Floating Effect */}
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#334155']}
                className="px-6 py-8 shadow-2xl"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 12,
                }}
            >
                <SafeAreaView>
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <View className="flex items-center justify-between items-center mb-4">
                            <View className="flex-1">
                                <Text className="text-white text-3xl font-bold mb-1">
                                    Welcome back!
                                </Text>
                            </View>
                            {/* <TouchableOpacity
                                onPress={handleLogout}
                                className="bg-red-500/20 backdrop-blur-lg px-5 py-3 rounded-2xl border border-red-400/30 shadow-lg"
                                style={{
                                    shadowColor: '#ef4444',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                }}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="log-out-outline" size={18} color="#fca5a5" />
                                    <Text className="text-red-300 font-semibold ml-2">Logout</Text>
                                </View>
                            </TouchableOpacity> */}
                        </View>

                        {/* Quick Stats Row */}
                        <View className="flex-row space-x-4">
                            <View className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-white/70 text-sm font-medium">This Month</Text>
                                        <Text className="text-white text-xl font-bold">
                                            {formatters.currency(thisMonthTotal)}
                                        </Text>
                                    </View>
                                    {/* <View className="w-12 h-12 bg-blue-500/20 rounded-full items-center justify-center">
                                        <Ionicons name="calendar" size={24} color="#60a5fa" />
                                    </View> */}
                                </View>
                            </View>

                            <View className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-white/70 text-sm font-medium">Total Expenses</Text>
                                        <Text className="text-white text-xl font-bold">
                                            {expenses.length}
                                        </Text>
                                    </View>
                                    {/* <View className="w-12 h-12 bg-emerald-500/20 rounded-full items-center justify-center">
                                        <Ionicons name="receipt" size={24} color="#34d399" />
                                    </View> */}
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView
                className="flex-1 -mt-4"
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-6">
                    {/* Budget Alert with Enhanced Animation */}
                    {isOverBudget && (
                        <Animated.View
                            style={{
                                transform: [{ scale: pulseAnim }],
                            }}
                        >
                            <AnimatedCard
                                className="mb-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-lg border-red-300/30 shadow-xl"
                                animationType="slideUp"
                                delay={100}
                                style={{
                                    shadowColor: '#ef4444',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                }}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 bg-red-500/30 rounded-full items-center justify-center mr-4">
                                        <Ionicons name="warning" size={28} color="#ef4444" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-red-800 font-bold text-lg mb-1">Budget Exceeded!</Text>
                                        <Text className="text-red-600 text-sm leading-5">
                                            You've spent ${(currentMonthSpent - budgetSettings.monthlyLimit).toFixed(2)} over your monthly limit.
                                        </Text>
                                    </View>
                                </View>
                            </AnimatedCard>
                        </Animated.View>
                    )}

                    {/* Enhanced Budget Progress Card */}
                    <AnimatedCard
                        className="mb-6 p-6 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-0"
                        variant="elevated"
                        animationType="slideUp"
                        delay={200}
                        style={{
                            shadowColor: '#3b82f6',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.15,
                            shadowRadius: 16,
                            elevation: 12,
                        }}
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Monthly Budget</Text>
                            <TouchableOpacity
                                onPress={() => router.push('/budget-settings')}
                                className="p-3 rounded-2xl bg-blue-50 shadow-md"
                                style={{
                                    shadowColor: '#3b82f6',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                }}
                            >
                                <Ionicons name="settings-outline" size={22} color="#3b82f6" />
                            </TouchableOpacity>
                        </View>

                        {/* Circular Progress Indicator */}
                        <View className="items-center mb-8">
                            <View className="relative">
                                <View className="w-32 h-32 rounded-full border-8 border-gray-200" />
                                <View
                                    className="absolute inset-0 w-32 h-32 rounded-full border-8 border-transparent"
                                    style={{
                                        borderTopColor: isOverBudget ? '#ef4444' : percentageUsed > 80 ? '#f59e0b' : '#22c55e',
                                        transform: [{ rotate: `${(percentageUsed / 100) * 360}deg` }],
                                    }}
                                />
                                <View className="absolute inset-0 items-center justify-center">
                                    <Text className="text-3xl font-bold text-gray-900">
                                        {Math.min(percentageUsed, 100).toFixed(0)}%
                                    </Text>
                                    <Text className="text-gray-500 text-sm">used</Text>
                                </View>
                            </View>
                        </View>

                        <View className="bg-gray-50 rounded-2xl p-6">
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-1">
                                    <Text className="text-gray-600 text-sm font-medium mb-1">Spent this month</Text>
                                    <Text className="text-2xl font-bold text-gray-900">
                                        {formatters.currency(currentMonthSpent)}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-gray-600 text-sm font-medium mb-1">Budget limit</Text>
                                    <Text className="text-xl font-semibold text-gray-700">
                                        {formatters.currency(budgetSettings.monthlyLimit)}
                                    </Text>
                                </View>
                            </View>

                            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <Animated.View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min(percentageUsed, 100)}%`,
                                        backgroundColor: isOverBudget ? '#ef4444' : percentageUsed > 80 ? '#f59e0b' : '#22c55e',
                                    }}
                                />
                            </View>

                            <View className="flex-row justify-between items-center mt-4">
                                <View>
                                    <Text className="text-gray-600 text-sm">Remaining</Text>
                                    <Text className="text-lg font-bold text-emerald-600">
                                        {formatters.currency(Math.max(budgetSettings.monthlyLimit - currentMonthSpent, 0))}
                                    </Text>
                                </View>
                                {isOverBudget && (
                                    <View className="items-end">
                                        <Text className="text-red-500 text-sm font-medium">Over budget</Text>
                                        <Text className="text-red-600 font-bold text-lg">
                                            {formatters.currency(currentMonthSpent - budgetSettings.monthlyLimit)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </AnimatedCard>

                    {/* Enhanced Quick Stats Grid */}
                    <View className="grid grid-cols-2 gap-4 mb-6">
                        <AnimatedCard
                            className="bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl"
                            animationType="scale"
                            delay={300}
                            style={{
                                shadowColor: '#3b82f6',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                            }}
                        >
                            <View className="items-center p-6">
                                <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="calendar-outline" size={32} color="white" />
                                </View>
                                <Text className="text-white/80 text-sm font-medium mb-2">This Month</Text>
                                <Text className="text-white text-2xl font-bold mb-1">
                                    {formatters.currency(thisMonthTotal)}
                                </Text>
                                <Text className="text-white/70 text-xs">
                                    {thisMonthExpenses.length} transactions
                                </Text>
                            </View>
                        </AnimatedCard>

                        <AnimatedCard
                            className="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl"
                            animationType="scale"
                            delay={400}
                            style={{
                                shadowColor: '#10b981',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                            }}
                        >
                            <View className="items-center p-6">
                                <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="trending-up-outline" size={32} color="white" />
                                </View>
                                <Text className="text-white/80 text-sm font-medium mb-2">Total Spent</Text>
                                <Text className="text-white text-2xl font-bold mb-1">
                                    {formatters.currency(calculateTotalExpenses())}
                                </Text>
                                <Text className="text-white/70 text-xs">
                                    {expenses.length} total
                                </Text>
                            </View>
                        </AnimatedCard>
                    </View>

                    {/* Enhanced Weekly Spending Chart */}
                    {weeklyData.datasets[0].data.some(val => val > 0) && (
                        <AnimatedCard
                            className="mb-6 p-6 bg-white shadow-2xl border-0"
                            variant="elevated"
                            animationType="slideUp"
                            delay={500}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.1,
                                shadowRadius: 16,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-6">
                                <View>
                                    <Text className="text-xl font-bold text-gray-900 mb-1">
                                        Weekly Spending Trend
                                    </Text>
                                    <Text className="text-gray-500 text-sm">Last 7 days overview</Text>
                                </View>
                            </View>
                            <LineChart
                                data={weeklyData}
                                width={screenWidth - 110}
                                height={240}
                                chartConfig={{
                                    ...chartConfig,
                                    backgroundGradientFrom: '#ffffff',
                                    backgroundGradientTo: '#f8fafc',
                                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                }}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: 16,
                                }}
                                withDots={true}
                                withShadow={true}
                                withInnerLines={false}
                                withOuterLines={false}
                            />
                        </AnimatedCard>
                    )}

                    {/* Enhanced Category Breakdown Chart */}
                    {pieData.length > 0 && (
                        <AnimatedCard
                            className="mb-8 p-6 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-0"
                            variant="elevated"
                            animationType="slideUp"
                            delay={600}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 10 },
                                shadowOpacity: 0.1,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-6">
                                <View>
                                    <Text className="text-2xl font-bold text-gray-900 mb-1">
                                        Spending by Category
                                    </Text>
                                    <Text className="text-gray-600 text-sm font-medium">
                                        Current month breakdown
                                    </Text>
                                </View>
                            </View>
                            <PieChart
                                data={pieData}
                                width={screenWidth - 80}
                                height={240}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                center={[10, 10]}
                                absolute
                                hasLegend={false}
                                avoidFalseZero={true}
                                style={{
                                    borderRadius: 16,
                                    marginBottom: 10,
                                }}
                            />
                            <View className="mt-4 border-t border-gray-200 pt-4">
                                <Text className="text-gray-700 font-semibold mb-2">Category Breakdown</Text>
                                <View className="flex-row flex-wrap justify-between">
                                    {pieData.map((item, index) => (
                                        <View key={index} className="flex-row items-center mb-3 w-1/2">
                                            <View 
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: 6,
                                                    backgroundColor: item.color,
                                                    marginRight: 8,
                                                }}
                                            />
                                            <View>
                                                <Text className="text-gray-800 text-sm font-medium">{item.name}</Text>
                                                <Text className="text-gray-600 text-xs">{item.population}%</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </AnimatedCard>
                    )}

                    {/* Enhanced Quick Actions */}
                    <AnimatedCard
                        className="mb-6 p-6 bg-gradient-to-br from-slate-700 to-slate-800 shadow-2xl border-0"
                        variant="elevated"
                        animationType="scale"
                        delay={700}
                        style={{
                            shadowColor: '#1e293b',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.4,
                            shadowRadius: 16,
                        }}
                    >
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-white text-xl font-bold">
                                Quick Actions
                            </Text>
                            <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                                <Ionicons name="flash" size={16} color="white" />
                            </View>
                        </View>
                        <View className="flex-row space-x-4">
                            <TouchableOpacity
                                className="flex-1 bg-white/15 backdrop-blur-lg rounded-3xl p-6 items-center border border-white/20 shadow-lg"
                                onPress={() => router.push('/expense-form')}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                }}
                            >
                                <View className="w-14 h-14 bg-blue-500/30 rounded-full items-center justify-center mb-3">
                                    <Ionicons name="add-circle" size={28} color="#60a5fa" />
                                </View>
                                <Text className="text-white font-bold text-center">Add Expense</Text>
                                <Text className="text-white/70 text-xs text-center mt-1">Track spending</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-white/15 backdrop-blur-lg rounded-3xl p-6 items-center border border-white/20 shadow-lg"
                                onPress={() => router.push('/(tabs)/expenses')}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                }}
                            >
                                <View className="w-14 h-14 bg-emerald-500/30 rounded-full items-center justify-center mb-3">
                                    <Ionicons name="list-circle" size={28} color="#34d399" />
                                </View>
                                <Text className="text-white font-bold text-center">View All</Text>
                                <Text className="text-white/70 text-xs text-center mt-1">See history</Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedCard>

                    {/* Enhanced Top Categories */}
                    {topCategories.length > 0 && (
                        <AnimatedCard
                            className="mb-6 p-6 bg-white shadow-2xl border-0"
                            variant="elevated"
                            animationType="slideLeft"
                            delay={800}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.1,
                                shadowRadius: 16,
                            }}
                        >
                            <View className="flex-row items-center justify-between mb-6">
                                <View>
                                    <Text className="text-xl font-bold text-gray-900 mb-1">
                                        Top Categories
                                    </Text>
                                    <Text className="text-gray-500 text-sm">Your biggest spending areas</Text>
                                </View>
                                <View className="bg-orange-50 px-4 py-2 rounded-full">
                                    <Text className="text-orange-600 text-xs font-semibold">Top 5</Text>
                                </View>
                            </View>
                            {topCategories.map((item, index) => (
                                <View key={item.category} className="flex-row justify-between items-center mb-4 p-4 bg-gray-50 rounded-2xl shadow-sm">
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full items-center justify-center mr-4 shadow-md">
                                            <Text className="text-white font-bold text-lg">{index + 1}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-lg">{item.category}</Text>
                                            <Text className="text-gray-500 text-sm">Category spending</Text>
                                        </View>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-gray-900 font-bold text-xl">
                                            {formatters.currency(item.amount)}
                                        </Text>
                                        <Text className="text-gray-500 text-xs">total spent</Text>
                                    </View>
                                </View>
                            ))}
                        </AnimatedCard>
                    )}

                    {/* Enhanced Recent Expenses */}
                    <AnimatedCard
                        className="mb-8 p-6 bg-white shadow-2xl border-0"
                        variant="elevated"
                        animationType="slideRight"
                        delay={900}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.1,
                            shadowRadius: 16,
                        }}
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-xl font-bold text-gray-900 mb-1">
                                    Recent Expenses
                                </Text>
                                <Text className="text-gray-500 text-sm">Latest transactions</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/(tabs)/expenses')}
                                className="bg-blue-50 px-4 py-2 rounded-full shadow-sm"
                            >
                                <Text className="text-blue-600 font-bold text-sm">View All</Text>
                            </TouchableOpacity>
                        </View>

                        {recentExpenses.length > 0 ? (
                            recentExpenses.map((expense, index) => (
                                <View key={expense.id} style={{ marginBottom: index === recentExpenses.length - 1 ? 0 : 16 }}>
                                    <ExpenseCard
                                        expense={expense}
                                        onPress={() => router.push(`/expense-details/${expense.id}`)}
                                    />
                                </View>
                            ))
                        ) : (
                            <View className="items-center py-16">
                                <View className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full items-center justify-center mb-6 shadow-lg">
                                    <Ionicons name="receipt-outline" size={40} color="#9ca3af" />
                                </View>
                                <Text className="text-gray-500 text-xl font-semibold mb-3">No expenses yet</Text>
                                <Text className="text-gray-400 text-center mb-8 leading-6 px-4">
                                    Start tracking your spending by adding your first expense and take control of your finances
                                </Text>
                                <TouchableOpacity
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 rounded-2xl shadow-xl"
                                    onPress={() => router.push('/expense-form')}
                                    style={{
                                        shadowColor: '#3b82f6',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                    }}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="add-circle" size={24} color="white" />
                                        <Text className="text-white font-bold ml-3 text-lg">Add First Expense</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </AnimatedCard>
                </View>
            </ScrollView>
        </View>
    );
} 
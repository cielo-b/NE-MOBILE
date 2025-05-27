import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../contexts/AuthContext';
import { expenseAPI } from '../../services/api';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { debug } from '../../utils/debug';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';

export default function DashboardScreen() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            debug.log('DashboardScreen', 'Loading expenses...');
            setIsLoading(true);
            const data = await expenseAPI.getAllExpenses();
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
            .slice(0, 3);
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

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            >
                <View className="p-4">
                    {/* Welcome Header */}
                    <View className="mb-6">
                        <Text className="text-2xl font-bold text-gray-900">
                            Welcome back, {user?.name || user?.username || 'User'}!
                        </Text>
                        <Text className="text-gray-600 mt-1">
                            Here's your financial overview
                        </Text>
                    </View>

                    {/* Quick Stats */}
                    <View className="flex-row mb-6 space-x-3">
                        <Card className="flex-1" variant="elevated">
                            <View className="items-center">
                                <Text className="text-gray-600 text-sm">This Month</Text>
                                <Text className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatters.currency(thisMonthTotal)}
                                </Text>
                                <Text className="text-gray-500 text-xs">
                                    {thisMonthExpenses.length} transactions
                                </Text>
                            </View>
                        </Card>

                        <Card className="flex-1" variant="elevated">
                            <View className="items-center">
                                <Text className="text-gray-600 text-sm">Total Spent</Text>
                                <Text className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatters.currency(calculateTotalExpenses())}
                                </Text>
                                <Text className="text-gray-500 text-xs">
                                    {expenses.length} total
                                </Text>
                            </View>
                        </Card>
                    </View>

                    {/* Quick Actions */}
                    <Card className="mb-6" variant="elevated">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">
                            Quick Actions
                        </Text>
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                className="flex-1 bg-primary-600 rounded-lg p-4 items-center"
                                onPress={() => router.push('/expense-form')}
                            >
                                <Ionicons name="add" size={24} color="white" />
                                <Text className="text-white font-medium mt-2">Add Expense</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 bg-gray-600 rounded-lg p-4 items-center"
                                onPress={() => router.push('/(tabs)/expenses')}
                            >
                                <Ionicons name="list" size={24} color="white" />
                                <Text className="text-white font-medium mt-2">View All</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {/* Top Categories */}
                    {topCategories.length > 0 && (
                        <Card className="mb-6" variant="elevated">
                            <Text className="text-lg font-semibold text-gray-900 mb-4">
                                Top Categories
                            </Text>
                            {topCategories.map((item, index) => (
                                <View key={item.category} className="flex-row justify-between items-center mb-3">
                                    <Text className="text-gray-700 font-medium">{item.category}</Text>
                                    <Text className="text-gray-900 font-semibold">
                                        {formatters.currency(item.amount)}
                                    </Text>
                                </View>
                            ))}
                        </Card>
                    )}

                    {/* Recent Expenses */}
                    <Card className="mb-6" variant="elevated">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-semibold text-gray-900">
                                Recent Expenses
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
                                <Text className="text-primary-600 font-medium">View All</Text>
                            </TouchableOpacity>
                        </View>

                        {recentExpenses.length > 0 ? (
                            recentExpenses.map((expense) => (
                                <ExpenseCard
                                    key={expense.id}
                                    expense={expense}
                                    onPress={() => router.push(`/expense-details/${expense.id}`)}
                                />
                            ))
                        ) : (
                            <View className="items-center py-8">
                                <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                                <Text className="text-gray-500 mt-2">No expenses yet</Text>
                                <TouchableOpacity
                                    className="mt-3"
                                    onPress={() => router.push('/expense-form')}
                                >
                                    <Text className="text-primary-600 font-medium">Add your first expense</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 
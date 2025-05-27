import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../contexts/AuthContext';
import { expenseAPI } from '../../services/api';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setIsLoading(true);
            const data = await expenseAPI.getAllExpenses();
            setExpenses(data);
        } catch (error) {
            console.error('Failed to load expenses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: confirmLogout,
                },
            ]
        );
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            Toast.show({
                type: 'success',
                text1: 'Logged out',
                text2: 'You have been logged out successfully',
            });
            router.replace('/login');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to logout',
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const getExpenseStats = () => {
        const totalExpenses = expenses.length;
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        // This month expenses
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear;
        });

        const thisMonthAmount = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Average per month
        const monthsWithExpenses = new Set(
            expenses.map(expense => {
                const date = new Date(expense.date);
                return `${date.getFullYear()}-${date.getMonth()}`;
            })
        ).size;

        const averagePerMonth = monthsWithExpenses > 0 ? totalAmount / monthsWithExpenses : 0;

        // Most expensive category
        const categoryTotals: { [key: string]: number } = {};
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        const topCategory = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)[0];

        return {
            totalExpenses,
            totalAmount,
            thisMonthAmount,
            averagePerMonth,
            topCategory: topCategory ? { category: topCategory[0], amount: topCategory[1] } : null,
        };
    };

    if (isLoading) {
        return <Loading text="Loading profile..." />;
    }

    const stats = getExpenseStats();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                <View className="p-4">
                    {/* User Info Card */}
                    <Card className="mb-6" variant="elevated">
                        <View className="items-center">
                            <View className="w-20 h-20 bg-primary-600 rounded-full items-center justify-center mb-4">
                                <Text className="text-white text-2xl font-bold">
                                    {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>

                            <Text className="text-xl font-bold text-gray-900 mb-1">
                                {user?.name || 'User'}
                            </Text>

                            <Text className="text-gray-600 mb-4">
                                {user?.email || user?.username}
                            </Text>

                            <View className="bg-primary-50 px-3 py-1 rounded-full">
                                <Text className="text-primary-700 text-sm font-medium">
                                    Member since {formatters.date(user?.createdAt || new Date().toISOString())}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* Statistics Card */}
                    <Card className="mb-6" variant="elevated">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">
                            Your Statistics
                        </Text>

                        <View className="space-y-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="receipt-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">Total Expenses</Text>
                                </View>
                                <Text className="text-gray-900 font-semibold">
                                    {stats.totalExpenses}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="cash-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">Total Spent</Text>
                                </View>
                                <Text className="text-gray-900 font-semibold">
                                    {formatters.currency(stats.totalAmount)}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">This Month</Text>
                                </View>
                                <Text className="text-gray-900 font-semibold">
                                    {formatters.currency(stats.thisMonthAmount)}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="trending-up-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">Monthly Average</Text>
                                </View>
                                <Text className="text-gray-900 font-semibold">
                                    {formatters.currency(stats.averagePerMonth)}
                                </Text>
                            </View>

                            {stats.topCategory && (
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <Ionicons name="star-outline" size={20} color="#6b7280" />
                                        <Text className="text-gray-700 ml-3">Top Category</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-gray-900 font-semibold">
                                            {stats.topCategory.category}
                                        </Text>
                                        <Text className="text-gray-600 text-sm">
                                            {formatters.currency(stats.topCategory.amount)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Card>

                    {/* Settings Card */}
                    <Card className="mb-6" variant="elevated">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">
                            Settings
                        </Text>

                        <View className="space-y-1">
                            <TouchableOpacity className="flex-row items-center justify-between py-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="notifications-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">Notifications</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row items-center justify-between py-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="pie-chart-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">Budget Settings</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row items-center justify-between py-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="download-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">Export Data</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row items-center justify-between py-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">Help & Support</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>

                            <TouchableOpacity className="flex-row items-center justify-between py-3">
                                <View className="flex-row items-center">
                                    <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
                                    <Text className="text-gray-700 ml-3">About</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {/* App Info */}
                    <Card className="mb-6" variant="outlined">
                        <View className="items-center">
                            <Text className="text-gray-600 text-sm mb-1">Finance Tracker</Text>
                            <Text className="text-gray-500 text-xs">Version 1.0.0</Text>
                        </View>
                    </Card>

                    {/* Logout Button */}
                    <Button
                        title="Logout"
                        onPress={handleLogout}
                        variant="danger"
                        loading={isLoggingOut}
                        disabled={isLoggingOut}
                        fullWidth
                        size="lg"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 
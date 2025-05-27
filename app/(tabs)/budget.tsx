import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { expenseAPI } from '../../services/api';
import { Expense, EXPENSE_CATEGORIES } from '../../types';
import { formatters } from '../../utils/formatters';
import { Card } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { debug } from '../../utils/debug';

interface CategoryBudget {
    category: string;
    spent: number;
    limit: number;
    percentage: number;
}

export default function BudgetScreen() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const loadExpenses = async () => {
        try {
            debug.log('BudgetScreen', 'Loading expenses...');
            setIsLoading(true);
            const data = await expenseAPI.getAllExpenses();
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
        console.log('Budget getCategoryIcon called with category:', category);

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
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
            >
                <View className="p-4">
                    {/* Overall Budget Summary */}
                    <Card className="mb-6" variant="elevated">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">
                            Monthly Budget Overview
                        </Text>

                        <View className="items-center mb-4">
                            <Text className="text-3xl font-bold text-gray-900">
                                {formatters.currency(totalSpent)}
                            </Text>
                            <Text className="text-gray-600">
                                of {formatters.currency(totalBudget)} budget
                            </Text>
                        </View>

                        {/* Overall Progress Bar */}
                        <View className="mb-4">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-600 text-sm">Overall Progress</Text>
                                <Text className="text-gray-900 font-medium text-sm">
                                    {overallPercentage.toFixed(1)}%
                                </Text>
                            </View>
                            <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min(overallPercentage, 100)}%`,
                                        backgroundColor: getProgressColor(overallPercentage),
                                    }}
                                />
                            </View>
                        </View>

                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">
                                Remaining: {formatters.currency(Math.max(totalBudget - totalSpent, 0))}
                            </Text>
                            {overallPercentage > 100 && (
                                <Text className="text-danger-600 font-medium">
                                    Over budget by {formatters.currency(totalSpent - totalBudget)}
                                </Text>
                            )}
                        </View>
                    </Card>

                    {/* Category Budgets */}
                    <Text className="text-lg font-semibold text-gray-900 mb-4">
                        Category Breakdown
                    </Text>

                    {categoryBudgets.map((budget) => (
                        <Card key={budget.category} className="mb-3">
                            <View className="flex-row items-center mb-3">
                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                    <Ionicons
                                        name={getCategoryIcon(budget.category)}
                                        size={20}
                                        color="#6b7280"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-medium">{budget.category}</Text>
                                    <Text className="text-gray-600 text-sm">
                                        {formatters.currency(budget.spent)} of {formatters.currency(budget.limit)}
                                    </Text>
                                </View>
                                <Text
                                    className="font-semibold"
                                    style={{ color: getProgressColor(budget.percentage) }}
                                >
                                    {budget.percentage.toFixed(0)}%
                                </Text>
                            </View>

                            {/* Progress Bar */}
                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${budget.percentage}%`,
                                        backgroundColor: getProgressColor(budget.percentage),
                                    }}
                                />
                            </View>

                            {budget.percentage > 100 && (
                                <Text className="text-danger-600 text-xs mt-2">
                                    Over budget by {formatters.currency(budget.spent - budget.limit)}
                                </Text>
                            )}
                        </Card>
                    ))}

                    {/* Budget Tips */}
                    <Card className="mt-6" variant="outlined">
                        <View className="flex-row items-start">
                            <Ionicons name="bulb-outline" size={24} color="#f59e0b" />
                            <View className="ml-3 flex-1">
                                <Text className="text-gray-900 font-medium mb-2">Budget Tips</Text>
                                <Text className="text-gray-600 text-sm leading-5">
                                    • Track your expenses daily to stay within budget{'\n'}
                                    • Set realistic limits based on your income{'\n'}
                                    • Review and adjust budgets monthly{'\n'}
                                    • Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings
                                </Text>
                            </View>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 
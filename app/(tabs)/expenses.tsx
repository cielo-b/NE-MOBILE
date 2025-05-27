import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { expenseAPI } from '../../services/api';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { debug } from '../../utils/debug';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';

export default function ExpensesScreen() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        loadExpenses();
    }, []);

    useEffect(() => {
        filterExpenses();
    }, [expenses, searchQuery, selectedCategory]);

    const loadExpenses = async () => {
        try {
            debug.log('ExpensesScreen', 'Loading expenses...');
            setIsLoading(true);
            const data = await expenseAPI.getAllExpenses();
            debug.log('ExpensesScreen', 'Raw expenses data received:', data);

            // Normalize and validate each expense
            const normalizedExpenses = data.map((expense, index) => {
                const validation = debug.validateExpense(expense);
                if (!validation.isValid) {
                    debug.warn('ExpensesScreen', `Invalid expense at index ${index}:`, validation.issues);
                }

                // Normalize the expense data structure
                const normalized = debug.normalizeExpense(expense);
                return normalized;
            }).filter(expense => expense && expense.id); // Filter out invalid expenses

            debug.log('ExpensesScreen', 'Normalized expenses:', normalizedExpenses);
            setExpenses(normalizedExpenses);
        } catch (error) {
            debug.error('ExpensesScreen', 'Error loading expenses:', error);
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

    const filterExpenses = () => {
        debug.log('ExpensesScreen', 'filterExpenses called', { searchQuery, selectedCategory, expensesCount: expenses.length });

        let filtered = [...expenses];

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(expense => {
                debug.log('ExpensesScreen', 'Filtering expense:', expense);

                try {
                    // Safe string checks with null/undefined handling
                    const titleMatch = expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
                    const categoryMatch = expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
                    const descriptionMatch = expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false;

                    return titleMatch || categoryMatch || descriptionMatch;
                } catch (error) {
                    debug.error('ExpensesScreen', 'Error filtering expense:', error);
                    return false;
                }
            });
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(expense => {
                debug.log('ExpensesScreen', 'Category filtering expense:', { expense: expense.id, category: expense.category, selectedCategory });
                try {
                    return expense.category === selectedCategory;
                } catch (error) {
                    debug.error('ExpensesScreen', 'Error in category filter:', error);
                    return false;
                }
            });
        }

        // Sort by date (newest first)
        try {
            filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (error) {
            debug.error('ExpensesScreen', 'Error sorting expenses:', error);
        }

        debug.log('ExpensesScreen', 'Filtered expenses result:', filtered.length);
        setFilteredExpenses(filtered);
    };

    const handleDeleteExpense = async (expenseId: string) => {
        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await expenseAPI.deleteExpense(expenseId);
                            setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
                            Toast.show({
                                type: 'success',
                                text1: 'Success',
                                text2: 'Expense deleted successfully',
                            });
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Error',
                                text2: 'Failed to delete expense',
                            });
                        }
                    },
                },
            ]
        );
    };

    const getUniqueCategories = () => {
        const categories = [...new Set(expenses.map(expense => expense.category))];
        return categories.sort();
    };

    const getTotalAmount = () => {
        return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
    };

    if (isLoading) {
        return <Loading text="Loading expenses..." />;
    }

    const uniqueCategories = getUniqueCategories();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1">
                {/* Search and Filter Section */}
                <View className="bg-white p-4 border-b border-gray-200">
                    <Input
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        leftIcon="search-outline"
                        rightIcon={searchQuery ? "close-outline" : undefined}
                        onRightIconPress={() => setSearchQuery('')}
                    />

                    {/* Category Filter */}
                    {uniqueCategories.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mt-3"
                        >
                            <TouchableOpacity
                                className={`mr-3 px-4 py-2 rounded-full border ${selectedCategory === ''
                                    ? 'bg-primary-600 border-primary-600'
                                    : 'bg-white border-gray-300'
                                    }`}
                                onPress={() => setSelectedCategory('')}
                            >
                                <Text className={`font-medium ${selectedCategory === '' ? 'text-white' : 'text-gray-700'
                                    }`}>
                                    All
                                </Text>
                            </TouchableOpacity>

                            {uniqueCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    className={`mr-3 px-4 py-2 rounded-full border ${selectedCategory === category
                                        ? 'bg-primary-600 border-primary-600'
                                        : 'bg-white border-gray-300'
                                        }`}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text className={`font-medium ${selectedCategory === category ? 'text-white' : 'text-gray-700'
                                        }`}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Summary */}
                    <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-gray-100">
                        <Text className="text-gray-600">
                            {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                        </Text>
                        <Text className="text-lg font-bold text-gray-900">
                            Total: {formatters.currency(getTotalAmount())}
                        </Text>
                    </View>
                </View>

                {/* Expenses List */}
                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    <View className="p-4">
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.map((expense) => (
                                <ExpenseCard
                                    key={expense.id}
                                    expense={expense}
                                    onPress={() => router.push(`/expense-details/${expense.id}`)}
                                    onEdit={() => router.push(`/expense-form?id=${expense.id}`)}
                                    onDelete={() => handleDeleteExpense(expense.id)}
                                    showActions={true}
                                />
                            ))
                        ) : (
                            <View className="items-center py-12">
                                <Ionicons name="receipt-outline" size={64} color="#9ca3af" />
                                <Text className="text-gray-500 text-lg mt-4 mb-2">
                                    {searchQuery || selectedCategory ? 'No matching expenses' : 'No expenses yet'}
                                </Text>
                                <Text className="text-gray-400 text-center mb-6">
                                    {searchQuery || selectedCategory
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'Start tracking your expenses by adding your first one'
                                    }
                                </Text>

                                {!searchQuery && !selectedCategory && (
                                    <TouchableOpacity
                                        className="bg-primary-600 px-6 py-3 rounded-lg"
                                        onPress={() => router.push('/expense-form')}
                                    >
                                        <Text className="text-white font-medium">Add First Expense</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
} 
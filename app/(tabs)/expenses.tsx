import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Animated, StatusBar } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../contexts/AuthContext';
import { expenseAPI } from '../../services/api';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { debug } from '../../utils/debug';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/ui/Loading';
import { AnimatedCard } from '../../components/ui/AnimatedCard';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';

export default function ExpensesScreen() {
    const { user, isAuthenticated } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<any>('');

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

    useEffect(() => {
        loadExpenses();
    }, []);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadExpenses();
        }, [])
    );

    useEffect(() => {
        filterExpenses();
    }, [expenses, searchQuery, selectedCategory]);

    const loadExpenses = async () => {
        try {
            debug.log('ExpensesScreen', 'Loading expenses...');
            setIsLoading(true);
            let data = await expenseAPI.getAllExpenses();
            data = data.filter(expense => expense.userId === user?.id);
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
            filtered.sort((a, b) => {
                const dateA = new Date(a.date || a.createdAt || new Date()).getTime();
                const dateB = new Date(b.date || b.createdAt || new Date()).getTime();
                return dateB - dateA;
            });
        } catch (error) {
            debug.error('ExpensesScreen', 'Error sorting expenses:', error);
        }

        debug.log('ExpensesScreen', 'Filtered expenses result:', filtered.length);
        setFilteredExpenses(filtered);
    };

    const handleDeleteExpense = async (expenseId: string) => {



        try {
            debug.log('ExpensesScreen', 'Deleting expense:', expenseId);

            // Show loading state
            setIsRefreshing(true);

            // Delete from API
            await expenseAPI.deleteExpense(expenseId);

            // Remove from local state immediately for better UX
            setExpenses(prev => prev.filter(expense => expense.id !== expenseId));

            // Reload all expenses to ensure consistency
            await loadExpenses();

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Expense deleted successfully',
            });

            debug.log('ExpensesScreen', 'Expense deleted successfully');
        } catch (error) {
            debug.error('ExpensesScreen', 'Error deleting expense:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete expense. Please try again.',
            });

            // Reload expenses to ensure consistency
            await loadExpenses();
        } finally {
            setIsRefreshing(false);
        }
    };

    const getUniqueCategories = () => {
        const categories = [...new Set(expenses.map(expense => expense.category))];
        return categories.sort();
    };

    const getTotalAmount = () => {
        return filteredExpenses.reduce((total, expense) => {
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : expense.amount;
            return total + amount;
        }, 0);
    };

    if (isLoading) {
        return <Loading text="Loading expenses..." />;
    }

    const uniqueCategories = getUniqueCategories();

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
                            <Text className="text-white text-2xl font-bold">Expenses</Text>
                            <Text className="text-gray-300 text-sm mt-1">
                                Track and manage your spending
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/expense-form')}
                            className="bg-blue-500 px-4 py-2 rounded-xl flex-row items-center shadow-lg"
                        >
                            <Ionicons name="add" size={18} color="white" />
                            <Text className="text-white font-semibold ml-2">Add</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>

            <View className="flex-1">
                {/* Search and Filter Section */}
                <AnimatedCard
                    className="p-6"
                    animationType="slideUp"
                    delay={200}
                >
                    <Input
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        leftIcon="search-outline"
                        rightIcon={searchQuery ? "close-outline" : undefined}
                        onRightIconPress={() => setSearchQuery('')}
                        variant="filled"
                    />

                    {/* Category Filter */}
                    {uniqueCategories.length > 0 && (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mt-3"
                        >
                            <TouchableOpacity
                                className={`mr-3 px-4 py-2 rounded-full ${selectedCategory === ''
                                    ? 'bg-blue-500'
                                    : 'bg-white border border-gray-300'
                                    }`}
                                onPress={() => setSelectedCategory('')}
                            >
                                <Text className={`font-semibold ${selectedCategory === '' ? 'text-white' : 'text-gray-700'
                                    }`}>
                                    All
                                </Text>
                            </TouchableOpacity>

                            {uniqueCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    className={`mr-3 px-4 py-2 rounded-full ${selectedCategory === category
                                        ? 'bg-blue-500'
                                        : 'bg-white border border-gray-300'
                                        }`}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text className={`font-semibold ${selectedCategory === category ? 'text-white' : 'text-gray-700'
                                        }`}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Summary */}
                    <View className="flex-row justify-between items-center mt-6 pt-4">
                        <View>
                            <Text className="text-gray-600 text-sm">
                                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                                {searchQuery || selectedCategory ? 'Filtered results' : 'All expenses'}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-xl font-bold text-gray-900">
                                {formatters.currency(getTotalAmount())}
                            </Text>
                            <Text className="text-gray-500 text-xs">Total amount</Text>
                        </View>
                    </View>
                </AnimatedCard>

                {/* Expenses List */}
                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    <View className="p-4">
                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.map((expense, index) => (
                                <AnimatedCard
                                    key={expense.id}
                                    className="mb-3"
                                    animationType="slideUp"
                                    delay={300 + (index * 50)}
                                >
                                    <ExpenseCard
                                        expense={expense}
                                        onPress={() => router.push(`/expense-details/${expense.id}`)}
                                        onEdit={() => router.push(`/expense-form?id=${expense.id}`)}
                                        onDelete={() => {

                                            handleDeleteExpense(expense.id);
                                        }}
                                        showActions={true}
                                    />
                                </AnimatedCard>
                            ))
                        ) : (
                            <AnimatedCard
                                className=" "
                                animationType="scale"
                                delay={300}
                            >
                                <View className="items-center py-16">
                                    <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                                        <Ionicons name="receipt-outline" size={40} color="#9ca3af" />
                                    </View>
                                    <Text className="text-gray-500 text-xl font-semibold mb-3">
                                        {searchQuery || selectedCategory ? 'No matching expenses' : 'No expenses yet'}
                                    </Text>
                                    <Text className="text-gray-400 text-center mb-8 px-8 leading-6">
                                        {searchQuery || selectedCategory
                                            ? 'Try adjusting your search or filter criteria to find what you\'re looking for'
                                            : 'Start tracking your expenses by adding your first one and take control of your finances'
                                        }
                                    </Text>

                                    {!searchQuery && !selectedCategory && (
                                        <TouchableOpacity
                                            className="bg-blue-500 px-8 py-4 rounded-2xl shadow-lg"
                                            onPress={() => router.push('/expense-form')}
                                        >
                                            <View className="flex-row items-center">
                                                <Ionicons name="add-circle" size={20} color="white" />
                                                <Text className="text-white font-semibold ml-2">Add First Expense</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </AnimatedCard>
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
} 
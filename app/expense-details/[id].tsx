import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { expenseAPI } from '../../services/api';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    console.log('ExpenseDetails getCategoryIcon called with category:', category);

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
    console.log('ExpenseDetails getCategoryColor called with category:', category);

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

    const handleDelete = () => {
        Alert.alert(
            'Delete Expense',
            'Are you sure you want to delete this expense? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete,
                },
            ]
        );
    };

    const confirmDelete = async () => {
        if (!expense) return;

        setIsDeleting(true);
        try {
            await expenseAPI.deleteExpense(expense.id);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Expense deleted successfully',
            });
            router.back();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete expense',
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
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center p-8">
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <Text className="text-gray-900 text-xl font-semibold mt-4 mb-2">
                        Expense Not Found
                    </Text>
                    <Text className="text-gray-600 text-center mb-6">
                        The expense you're looking for doesn't exist or has been deleted.
                    </Text>
                    <Button
                        title="Go Back"
                        onPress={() => router.back()}
                        variant="primary"
                    />
                </View>
            </SafeAreaView>
        );
    }

    const categoryIcon = getCategoryIcon(expense.category);
    const categoryColor = getCategoryColor(expense.category);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                <View className="p-4">
                    {/* Main Info Card */}
                    <Card className="mb-6" variant="elevated">
                        <View className="items-center mb-6">
                            <View
                                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: `${categoryColor}20` }}
                            >
                                <Ionicons
                                    name={categoryIcon}
                                    size={40}
                                    color={categoryColor}
                                />
                            </View>

                            <Text className="text-3xl font-bold text-gray-900 mb-2">
                                {formatters.currency(expense.amount)}
                            </Text>

                            <Text className="text-xl font-semibold text-gray-800 text-center">
                                {expense.title}
                            </Text>
                        </View>

                        {/* Details Grid */}
                        <View className="space-y-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="grid-outline" size={20} color="#6b7280" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-600 text-sm">Category</Text>
                                    <Text className="text-gray-900 font-medium">{expense.category}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-600 text-sm">Date</Text>
                                    <Text className="text-gray-900 font-medium">
                                        {formatters.date(expense.date)}
                                    </Text>
                                    <Text className="text-gray-500 text-xs">
                                        {formatters.relativeDate(expense.date)}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="time-outline" size={20} color="#6b7280" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-600 text-sm">Created</Text>
                                    <Text className="text-gray-900 font-medium">
                                        {formatters.dateTime(expense.createdAt)}
                                    </Text>
                                </View>
                            </View>

                            {expense.updatedAt !== expense.createdAt && (
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="pencil-outline" size={20} color="#6b7280" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-600 text-sm">Last Updated</Text>
                                        <Text className="text-gray-900 font-medium">
                                            {formatters.dateTime(expense.updatedAt)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Card>

                    {/* Description Card */}
                    {expense.description && (
                        <Card className="mb-6" variant="elevated">
                            <View className="flex-row items-start">
                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3 mt-1">
                                    <Ionicons name="text-outline" size={20} color="#6b7280" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-600 text-sm mb-2">Description</Text>
                                    <Text className="text-gray-900 leading-6">
                                        {expense.description}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <View className="space-y-3">
                        <Button
                            title="Edit Expense"
                            onPress={handleEdit}
                            leftIcon="pencil-outline"
                            fullWidth
                            size="lg"
                        />

                        <Button
                            title="Delete Expense"
                            onPress={handleDelete}
                            variant="danger"
                            loading={isDeleting}
                            disabled={isDeleting}
                            leftIcon="trash-outline"
                            fullWidth
                            size="lg"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { Card } from '../ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface ExpenseCardProps {
    expense: Expense;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {


    if (!category || typeof category !== 'string') {
        console.warn('Invalid category provided to getCategoryIcon:', category);
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
        console.warn('Invalid category provided to getCategoryColor:', category);
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

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
    expense,
    onPress,
    onEdit,
    onDelete,
    showActions = false,
}) => {



    const { isAuthenticated } = useAuth()

    // Ensure all required fields exist with fallbacks
    const safeExpense = {
        id: expense.id || '',
        title: expense.title || expense.name || 'Untitled Expense',
        amount: expense.amount || 0,
        category: expense.category || 'Other',
        description: expense.description || '',
        date: expense.date || expense.createdAt || new Date().toISOString(),
        createdAt: expense.createdAt || new Date().toISOString(),
        updatedAt: expense.updatedAt || expense.createdAt || new Date().toISOString(),
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated]);




    const categoryIcon = getCategoryIcon(safeExpense.category);
    const categoryColor = getCategoryColor(safeExpense.category);

    return (
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
            <Card className="mb-3">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${categoryColor}20` }}
                        >
                            <Ionicons
                                name={categoryIcon}
                                size={24}
                                color={categoryColor}
                            />
                        </View>

                        <View className="flex-1">
                            <Text className="text-gray-900 text-base font-semibold">
                                {safeExpense.title}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                {safeExpense.category}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                                {formatters.relativeDate(safeExpense.date)}
                            </Text>
                        </View>
                    </View>

                    <View className="items-end">
                        <Text className="text-gray-900 text-lg font-bold">
                            {formatters.currency(safeExpense.amount)}
                        </Text>

                        {showActions && (
                            <View className="flex-row mt-2">
                                {onEdit && (
                                    <TouchableOpacity
                                        onPress={() => {

                                            onEdit();
                                        }}
                                        className="mr-3 p-2"
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons
                                            name="pencil-outline"
                                            size={18}
                                            color="#6b7280"
                                        />
                                    </TouchableOpacity>
                                )}

                                {onDelete && (
                                    <TouchableOpacity
                                        onPress={() => {



                                            try {
                                                onDelete();

                                            } catch (error) {
                                                console.error('🗑️ Error calling onDelete:', error);
                                            }
                                        }}
                                        className="p-2"
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={18}
                                            color="#ef4444"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                {safeExpense.description && (
                    <Text className="text-gray-600 text-sm mt-3">
                        {safeExpense.description}
                    </Text>
                )}
            </Card>
        </TouchableOpacity>
    );
}; 
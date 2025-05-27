import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../../types';
import { formatters } from '../../utils/formatters';
import { Card } from '../ui/Card';

interface ExpenseCardProps {
    expense: Expense;
    onPress?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showActions?: boolean;
}

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
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
    const categoryIcon = getCategoryIcon(expense.category);
    const categoryColor = getCategoryColor(expense.category);

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
                                {expense.title}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                {expense.category}
                            </Text>
                            <Text className="text-gray-400 text-xs">
                                {formatters.relativeDate(expense.date)}
                            </Text>
                        </View>
                    </View>

                    <View className="items-end">
                        <Text className="text-gray-900 text-lg font-bold">
                            {formatters.currency(expense.amount)}
                        </Text>

                        {showActions && (
                            <View className="flex-row mt-2">
                                {onEdit && (
                                    <TouchableOpacity
                                        onPress={onEdit}
                                        className="mr-3 p-1"
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
                                        onPress={onDelete}
                                        className="p-1"
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

                {expense.description && (
                    <Text className="text-gray-600 text-sm mt-3">
                        {expense.description}
                    </Text>
                )}
            </Card>
        </TouchableOpacity>
    );
}; 
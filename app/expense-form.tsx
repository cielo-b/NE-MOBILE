import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useAuth } from '../contexts/AuthContext';
import { expenseAPI } from '../services/api';
import { ExpenseFormData, EXPENSE_CATEGORIES } from '../types';
import { validation } from '../utils/validation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';

export default function ExpenseFormScreen() {
    const { user } = useAuth();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditing = !!id;

    const [formData, setFormData] = useState<ExpenseFormData>({
        title: '',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    useEffect(() => {
        if (isEditing && id) {
            loadExpense(id);
        }
    }, [id, isEditing]);

    const loadExpense = async (expenseId: string) => {
        try {
            setIsLoading(true);
            const expense = await expenseAPI.getExpense(expenseId);
            setFormData({
                title: expense.name || expense.title || '',
                amount: expense.amount?.toString() || '0',
                category: expense.category || '',
                description: expense.description || '',
                date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
            });
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

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        const titleValidation = validation.title(formData.title);
        if (!titleValidation.isValid) {
            newErrors.title = titleValidation.message!;
        }

        const amountValidation = validation.amount(formData.amount);
        if (!amountValidation.isValid) {
            newErrors.amount = amountValidation.message!;
        }

        const categoryValidation = validation.category(formData.category);
        if (!categoryValidation.isValid) {
            newErrors.category = categoryValidation.message!;
        }

        const descriptionValidation = validation.description(formData.description || '');
        if (!descriptionValidation.isValid) {
            newErrors.description = descriptionValidation.message!;
        }

        const dateValidation = validation.date(formData.date);
        if (!dateValidation.isValid) {
            newErrors.date = dateValidation.message!;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (!user) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'User not authenticated',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && id) {
                await expenseAPI.updateExpense(id, formData);
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Expense updated successfully',
                });
            } else {
                await expenseAPI.createExpense({
                    ...formData,
                    userId: user.id,
                });
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Expense added successfully',
                });
            }
            router.back();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: `Failed to ${isEditing ? 'update' : 'create'} expense`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateFormData = (field: keyof ExpenseFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleCancel = () => {
        if (hasUnsavedChanges()) {
            Alert.alert(
                'Discard Changes',
                'Are you sure you want to discard your changes?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                ]
            );
        } else {
            router.back();
        }
    };

    const hasUnsavedChanges = () => {
        if (!isEditing) {
            return formData.title || formData.amount || formData.category || formData.description;
        }
        // For editing, we'd need to compare with original data
        return false;
    };

    if (isLoading) {
        return <Loading text="Loading expense..." />;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="bg-white px-4 py-3 border-b border-gray-200 flex-row items-center justify-between">
                    <TouchableOpacity onPress={handleCancel}>
                        <Ionicons name="close" size={24} color="#6b7280" />
                    </TouchableOpacity>
                    <Text className="text-lg font-semibold text-gray-900">
                        {isEditing ? 'Edit Expense' : 'Add Expense'}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                    <View className="p-4">
                        <Card>
                            <Input
                                label="Title"
                                placeholder="Enter expense title"
                                value={formData.title}
                                onChangeText={(value) => updateFormData('title', value)}
                                error={errors.title}
                                leftIcon="document-text-outline"
                                required
                            />

                            <Input
                                label="Amount"
                                placeholder="0.00"
                                value={formData.amount}
                                onChangeText={(value) => updateFormData('amount', value)}
                                error={errors.amount}
                                leftIcon="cash-outline"
                                keyboardType="numeric"
                                required
                            />

                            {/* Category Picker */}
                            <View className="mb-4">
                                <Text className="text-gray-700 text-sm font-medium mb-2">
                                    Category <Text className="text-danger-500">*</Text>
                                </Text>
                                <TouchableOpacity
                                    className={`border rounded-lg p-3 flex-row items-center justify-between ${errors.category ? 'border-danger-500' : 'border-gray-300'
                                        }`}
                                    onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="grid-outline" size={20} color="#6b7280" />
                                        <Text className={`ml-2 text-base ${formData.category ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                            {formData.category || 'Select category'}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color="#6b7280"
                                    />
                                </TouchableOpacity>
                                {errors.category && (
                                    <Text className="text-danger-500 text-sm mt-1">{errors.category}</Text>
                                )}
                            </View>

                            {/* Category Options */}
                            {showCategoryPicker && (
                                <View className="mb-4 border border-gray-200 rounded-lg bg-gray-50">
                                    {EXPENSE_CATEGORIES.map((category) => (
                                        <TouchableOpacity
                                            key={category}
                                            className="p-3 border-b border-gray-200 last:border-b-0"
                                            onPress={() => {
                                                updateFormData('category', category);
                                                setShowCategoryPicker(false);
                                            }}
                                        >
                                            <Text className={`text-base ${formData.category === category ? 'text-primary-600 font-medium' : 'text-gray-700'
                                                }`}>
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Input
                                label="Date"
                                placeholder="YYYY-MM-DD"
                                value={formData.date}
                                onChangeText={(value) => updateFormData('date', value)}
                                error={errors.date}
                                leftIcon="calendar-outline"
                                required
                            />

                            <Input
                                label="Description"
                                placeholder="Optional description"
                                value={formData.description}
                                onChangeText={(value) => updateFormData('description', value)}
                                error={errors.description}
                                leftIcon="text-outline"
                                multiline
                                numberOfLines={3}
                                style={{ height: 80, textAlignVertical: 'top' }}
                            />
                        </Card>

                        {/* Action Buttons */}
                        <View className="mt-6 space-y-3">
                            <Button
                                title={isEditing ? 'Update Expense' : 'Add Expense'}
                                onPress={handleSubmit}
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                fullWidth
                                size="lg"
                            />

                            <Button
                                title="Cancel"
                                onPress={handleCancel}
                                variant="outline"
                                fullWidth
                                size="lg"
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
} 
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Animated, StatusBar } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

import { useAuth } from '../contexts/AuthContext';
import { useBudget } from '../contexts/BudgetContext';
import { expenseAPI } from '../services/api';
import { ExpenseFormData, EXPENSE_CATEGORIES } from '../types';
import { validation } from '../utils/validation';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { AnimatedCard } from '../components/ui/AnimatedCard';
import { Loading } from '../components/ui/Loading';
import { DatePicker } from '../components/ui/DatePicker';

export default function ExpenseFormScreen() {
    const { user, isAuthenticated } = useAuth();
    const { checkBudgetAlert, refreshBudgetData } = useBudget();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditing = !!id;
    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated]);

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

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

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
                title: expense.title || '',
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

        // Check budget alert for new expenses
        if (!isEditing) {
            const expenseAmount = parseFloat(formData.amount);
            if (!isNaN(expenseAmount)) {
                checkBudgetAlert(expenseAmount);
            }
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

            // Refresh budget data after adding/updating expense
            await refreshBudgetData();

            // Navigate back to trigger refresh
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
        <View className="flex-1">
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#334155']}
                className="absolute inset-0"
            />

            {/* Animated Background Shapes */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    transform: [
                        {
                            scale: scaleAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1.5],
                            }),
                        },
                    ],
                }}
            />

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    {/* Enhanced Header */}
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <LinearGradient
                            colors={['#0f172a', '#1e293b']}
                            className="px-4 py-4"
                        >
                            <View className="flex-row items-center justify-between">
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    className="p-2 rounded-xl bg-white/10"
                                >
                                    <Ionicons name="close" size={24} color="white" />
                                </TouchableOpacity>

                                <View className="flex-1 items-center">
                                    <Text className="text-white text-xl font-bold">
                                        {isEditing ? 'Edit Expense' : 'Add Expense'}
                                    </Text>
                                    <Text className="text-gray-300 text-sm">
                                        {isEditing ? 'Update your expense details' : 'Track your spending'}
                                    </Text>
                                </View>

                                <View style={{ width: 40 }} />
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                        <View className="p-6 border-none">
                            {/* Form Content */}
                            <AnimatedCard
                                className=" mb-6"
                                animationType="slideUp"
                                delay={200}
                            >
                                <View className="space-y-4">
                                    <Input
                                        label="Expense Title"
                                        placeholder="What did you spend on?"
                                        value={formData.title}
                                        onChangeText={(value) => updateFormData('title', value)}
                                        error={errors.title}
                                        leftIcon="receipt-outline"
                                        variant="glass"
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
                                        variant="glass"
                                        required
                                    />

                                    {/* Category Picker */}
                                    <View>
                                        <Text className="text-white text-sm font-semibold mb-3">
                                            Category <Text className="text-red-400">*</Text>
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                                            className="bg-white/10  border-2 border-white/20 rounded-2xl p-4 flex-row items-center justify-between"
                                        >
                                            <View className="flex-row items-center">
                                                <Ionicons name="grid-outline" size={22} color="#9ca3af" />
                                                <Text className="text-white ml-3 text-base font-medium">
                                                    {formData.category || 'Select a category'}
                                                </Text>
                                            </View>
                                            <Ionicons
                                                name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="#9ca3af"
                                            />
                                        </TouchableOpacity>
                                        {errors.category && (
                                            <View className="flex-row items-center mt-2">
                                                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                                                <Text className="text-red-500 text-sm ml-2 font-medium">
                                                    {errors.category}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Category Options */}
                                    {showCategoryPicker && (
                                        <Animated.View
                                            style={{
                                                opacity: fadeAnim,
                                            }}
                                            className="bg-white/5 rounded-2xl p-2"
                                        >
                                            {EXPENSE_CATEGORIES.map((category) => (
                                                <TouchableOpacity
                                                    key={category}
                                                    onPress={() => {
                                                        updateFormData('category', category);
                                                        setShowCategoryPicker(false);
                                                    }}
                                                    className={`p-3 rounded-xl mb-1 ${formData.category === category
                                                        ? 'bg-blue-500/30'
                                                        : 'bg-white/5'
                                                        }`}
                                                >
                                                    <Text className={`font-medium ${formData.category === category
                                                        ? 'text-blue-300'
                                                        : 'text-white'
                                                        }`}>
                                                        {category}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </Animated.View>
                                    )}

                                    <DatePicker
                                        label="Date"
                                        value={formData.date}
                                        onDateChange={(value) => updateFormData('date', value)}
                                        error={errors.date}
                                        variant="glass"
                                        required
                                    />

                                    <Input
                                        label="Description"
                                        placeholder="Optional notes about this expense"
                                        value={formData.description}
                                        onChangeText={(value) => updateFormData('description', value)}
                                        error={errors.description}
                                        leftIcon="text-outline"
                                        multiline
                                        numberOfLines={3}
                                        variant="glass"
                                        style={{ height: 80, textAlignVertical: 'top' }}
                                    />
                                </View>
                            </AnimatedCard>

                            {/* Action Buttons */}
                            <AnimatedCard
                                className="bg-transparent"
                                animationType="scale"
                                delay={400}
                            >
                                <View className="space-y-4">
                                    <Button
                                        title={isEditing ? 'Update Expense' : 'Add Expense'}
                                        onPress={handleSubmit}
                                        loading={isSubmitting}
                                        disabled={isSubmitting}
                                        variant="gradient"
                                        size="lg"
                                        fullWidth
                                        leftIcon={isEditing ? "checkmark-outline" : "add-outline"}
                                    />

                                    <Button
                                        title="Cancel"
                                        onPress={handleCancel}
                                        variant="glass"
                                        size="lg"
                                        fullWidth
                                        leftIcon="close-outline"
                                    />
                                </View>
                            </AnimatedCard>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
} 
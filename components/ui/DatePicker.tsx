import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerProps {
    label?: string;
    value: string;
    onDateChange: (date: string) => void;
    error?: string;
    required?: boolean;
    variant?: 'default' | 'filled' | 'glass';
}

export const DatePicker: React.FC<DatePickerProps> = ({
    label,
    value,
    onDateChange,
    error,
    required = false,
    variant = 'default',
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];
            onDateChange(dateString);
        }
    };

    const formatDisplayDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-gray-700 text-sm font-medium mb-2">
                    {label} {required && <Text className="text-danger-500">*</Text>}
                </Text>
            )}

            <TouchableOpacity
                className={`border rounded-lg p-3 flex-row items-center justify-between ${error ? 'border-danger-500' : 'border-gray-300'
                    }`}
                onPress={() => setShowPicker(true)}
            >
                <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                    <Text className="ml-2 text-base text-gray-900">
                        {formatDisplayDate(value)}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>

            {error && (
                <Text className="text-danger-500 text-sm mt-1">{error}</Text>
            )}

            {showPicker && (
                <DateTimePicker
                    value={new Date(value)}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
}; 
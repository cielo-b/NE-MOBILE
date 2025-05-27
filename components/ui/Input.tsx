import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    variant?: 'default' | 'filled';
    required?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    variant = 'default',
    required = false,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const getContainerStyles = () => {
        const baseStyles = 'border rounded-lg flex-row items-center';
        const variantStyles = variant === 'filled' ? 'bg-gray-50' : 'bg-white';

        if (error) {
            return `${baseStyles} ${variantStyles} border-danger-500`;
        } else if (isFocused) {
            return `${baseStyles} ${variantStyles} border-primary-500`;
        } else {
            return `${baseStyles} ${variantStyles} border-gray-300`;
        }
    };

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-gray-700 text-sm font-medium mb-2">
                    {label}
                    {required && <Text className="text-danger-500"> *</Text>}
                </Text>
            )}

            <View className={getContainerStyles()}>
                {leftIcon && (
                    <View className="pl-3">
                        <Ionicons
                            name={leftIcon}
                            size={20}
                            color={error ? '#ef4444' : isFocused ? '#0284c7' : '#6b7280'}
                        />
                    </View>
                )}

                <TextInput
                    className={`
            flex-1 py-3 text-gray-900 text-base
            ${leftIcon ? 'pl-2' : 'pl-3'}
            ${rightIcon ? 'pr-2' : 'pr-3'}
          `}
                    placeholderTextColor="#9ca3af"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={style}
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity
                        className="pr-3"
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                    >
                        <Ionicons
                            name={rightIcon}
                            size={20}
                            color={error ? '#ef4444' : isFocused ? '#0284c7' : '#6b7280'}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <Text className="text-danger-500 text-sm mt-1">{error}</Text>
            )}
        </View>
    );
}; 
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    variant?: 'default' | 'filled' | 'glass';
    required?: boolean;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    variant = 'default',
    required = false,
    helperText,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    // Animation values
    const focusAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animate focus state
        Animated.timing(focusAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();

        // Scale animation on focus
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1.02 : 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    }, [isFocused]);

    useEffect(() => {
        // Shake animation on error
        if (error) {
            Animated.sequence([
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [error]);

    const getContainerStyles = () => {
        const baseStyles = 'border-2 rounded-2xl flex-row items-center transition-all duration-200';

        switch (variant) {
            case 'filled':
                return `${baseStyles} bg-gray-50`;
            case 'glass':
                return `${baseStyles} bg-white/10 backdrop-blur-lg border-white/20`;
            default:
                return `${baseStyles} bg-white shadow-sm`;
        }
    };

    const getBorderColor = () => {
        if (error) return '#ef4444';
        if (isFocused) return '#3b82f6';
        return variant === 'glass' ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb';
    };

    const getTextColor = () => {
        return variant === 'glass' ? '#ffffff' : '#111827';
    };

    const getLabelColor = () => {
        if (error) return '#ef4444';
        if (isFocused) return '#3b82f6';
        return variant === 'glass' ? '#d1d5db' : '#374151';
    };

    const getIconColor = () => {
        if (error) return '#ef4444';
        if (isFocused) return '#3b82f6';
        return variant === 'glass' ? '#9ca3af' : '#6b7280';
    };

    const handleFocus = (e: any) => {
        setIsFocused(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        props.onBlur?.(e);
    };

    const handleChangeText = (text: string) => {
        setHasValue(text.length > 0);
        props.onChangeText?.(text);
    };

    return (
        <View className="mb-6">
            {label && (
                <Animated.View
                    style={{
                        transform: [
                            {
                                translateY: focusAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -2],
                                }),
                            },
                        ],
                    }}
                >
                    <Text
                        className="text-sm font-semibold mb-3 transition-colors duration-200"
                        style={{ color: getLabelColor() }}
                    >
                        {label}
                        {required && <Text className="text-red-500 ml-1">*</Text>}
                    </Text>
                </Animated.View>
            )}

            <Animated.View
                style={{
                    transform: [
                        { translateX: shakeAnim },
                        { scale: scaleAnim },
                    ],
                }}
            >
                <View
                    className={getContainerStyles()}
                    style={{
                        borderColor: getBorderColor(),
                        shadowColor: isFocused ? '#3b82f6' : '#000',
                        shadowOffset: {
                            width: 0,
                            height: isFocused ? 4 : 2,
                        },
                        shadowOpacity: isFocused ? 0.1 : 0.05,
                        shadowRadius: isFocused ? 8 : 4,
                        elevation: isFocused ? 8 : 2,
                    }}
                >
                    {leftIcon && (
                        <View className="pl-4">
                            <Animated.View
                                style={{
                                    transform: [
                                        {
                                            scale: focusAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 1.1],
                                            }),
                                        },
                                    ],
                                }}
                            >
                                <Ionicons
                                    name={leftIcon}
                                    size={22}
                                    color={getIconColor()}
                                />
                            </Animated.View>
                        </View>
                    )}

                    <TextInput
                        className={`
                            flex-1 py-4 text-base font-medium
                            ${leftIcon ? 'pl-3' : 'pl-4'}
                            ${rightIcon ? 'pr-3' : 'pr-4'}
                        `}
                        style={[
                            { color: getTextColor() },
                            style
                        ]}
                        placeholderTextColor={variant === 'glass' ? '#9ca3af' : '#9ca3af'}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChangeText={handleChangeText}
                        {...props}
                    />

                    {rightIcon && (
                        <TouchableOpacity
                            className="pr-4"
                            onPress={onRightIconPress}
                            disabled={!onRightIconPress}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Animated.View
                                style={{
                                    transform: [
                                        {
                                            scale: focusAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 1.1],
                                            }),
                                        },
                                    ],
                                }}
                            >
                                <Ionicons
                                    name={rightIcon}
                                    size={22}
                                    color={getIconColor()}
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            {/* Error Message */}
            {error && (
                <Animated.View
                    style={{
                        opacity: focusAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                        }),
                    }}
                >
                    <View className="flex-row items-center mt-2">
                        <Ionicons name="alert-circle" size={16} color="#ef4444" />
                        <Text className="text-red-500 text-sm ml-2 font-medium">
                            {error}
                        </Text>
                    </View>
                </Animated.View>
            )}

            {/* Helper Text */}
            {helperText && !error && (
                <Text className="text-gray-500 text-sm mt-2 ml-1">
                    {helperText}
                </Text>
            )}
        </View>
    );
}; 
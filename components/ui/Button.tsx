import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gradient' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    style,
    onPress,
    ...props
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const isDisabled = disabled || loading;

    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: isDisabled ? 0.6 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [isDisabled]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = (event: any) => {
        if (!isDisabled && onPress) {
            onPress(event);
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/25';
            case 'secondary':
                return 'bg-gray-600 border-gray-600 shadow-lg shadow-gray-500/25';
            case 'outline':
                return 'bg-transparent border-blue-600 border-2';
            case 'danger':
                return 'bg-red-600 border-red-600 shadow-lg shadow-red-500/25';
            case 'glass':
                return 'bg-white/10 backdrop-blur-lg border-white/20 border-2';
            default:
                return 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/25';
        }
    };

    const getTextStyles = () => {
        switch (variant) {
            case 'outline':
                return 'text-blue-600';
            case 'glass':
                return 'text-white';
            default:
                return 'text-white';
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'outline':
                return '#2563eb';
            case 'glass':
                return '#ffffff';
            default:
                return '#ffffff';
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'px-4 py-2';
            case 'md':
                return 'px-6 py-3';
            case 'lg':
                return 'px-8 py-4';
            default:
                return 'px-6 py-3';
        }
    };

    const getTextSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'text-sm';
            case 'md':
                return 'text-base';
            case 'lg':
                return 'text-lg';
            default:
                return 'text-base';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm':
                return 16;
            case 'md':
                return 18;
            case 'lg':
                return 20;
            default:
                return 18;
        }
    };

    const renderContent = () => (
        <>
            {loading && (
                <ActivityIndicator
                    size="small"
                    color={getIconColor()}
                    style={{ marginRight: 8 }}
                />
            )}

            {!loading && leftIcon && (
                <Ionicons
                    name={leftIcon}
                    size={getIconSize()}
                    color={getIconColor()}
                    style={{ marginRight: 8 }}
                />
            )}

            <Text
                className={`
                    ${getTextStyles()}
                    ${getTextSizeStyles()}
                    font-semibold text-center
                `}
            >
                {title}
            </Text>

            {!loading && rightIcon && (
                <Ionicons
                    name={rightIcon}
                    size={getIconSize()}
                    color={getIconColor()}
                    style={{ marginLeft: 8 }}
                />
            )}
        </>
    );

    if (variant === 'gradient') {
        return (
            <Animated.View
                style={[
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    },
                    style,
                ]}
            >
                <TouchableOpacity
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isDisabled}
                    activeOpacity={0.8}
                    {...props}
                >
                    <LinearGradient
                        colors={['#3b82f6', '#1d4ed8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className={`
                            ${getSizeStyles()}
                            ${fullWidth ? 'w-full' : ''}
                            rounded-2xl flex-row items-center justify-center
                            shadow-lg shadow-blue-500/25
                        `}
                    >
                        {renderContent()}
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={[
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                },
                style,
            ]}
        >
            <TouchableOpacity
                className={`
                    ${getVariantStyles()}
                    ${getSizeStyles()}
                    ${fullWidth ? 'w-full' : ''}
                    rounded-2xl flex-row items-center justify-center
                    transition-all duration-200
                `}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.8}
                {...props}
            >
                {renderContent()}
            </TouchableOpacity>
        </Animated.View>
    );
}; 
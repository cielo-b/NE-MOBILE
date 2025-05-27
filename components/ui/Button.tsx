import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    leftIcon?: keyof typeof Ionicons.glyphMap;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    style,
    ...props
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return 'bg-primary-600 border-primary-600';
            case 'secondary':
                return 'bg-gray-600 border-gray-600';
            case 'outline':
                return 'bg-transparent border-primary-600';
            case 'danger':
                return 'bg-danger-600 border-danger-600';
            default:
                return 'bg-primary-600 border-primary-600';
        }
    };

    const getTextStyles = () => {
        switch (variant) {
            case 'outline':
                return 'text-primary-600';
            default:
                return 'text-white';
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'outline':
                return '#0284c7';
            default:
                return '#ffffff';
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2';
            case 'md':
                return 'px-4 py-3';
            case 'lg':
                return 'px-6 py-4';
            default:
                return 'px-4 py-3';
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

    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        border rounded-lg flex-row items-center justify-center
      `}
            disabled={isDisabled}
            style={style}
            {...props}
        >
            {loading && (
                <ActivityIndicator
                    size="small"
                    color={getIconColor()}
                    className="mr-2"
                />
            )}

            {!loading && leftIcon && (
                <Ionicons
                    name={leftIcon}
                    size={getIconSize()}
                    color={getIconColor()}
                    className="mr-2"
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
        </TouchableOpacity>
    );
}; 
import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    padding = 'md',
    children,
    style,
    ...props
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'elevated':
                return 'bg-white shadow-lg shadow-gray-200';
            case 'outlined':
                return 'bg-white border border-gray-200';
            default:
                return 'bg-white shadow-sm shadow-gray-100';
        }
    };

    const getPaddingStyles = () => {
        switch (padding) {
            case 'none':
                return '';
            case 'sm':
                return 'p-3';
            case 'md':
                return 'p-4';
            case 'lg':
                return 'p-6';
            default:
                return 'p-4';
        }
    };

    return (
        <View
            className={`
        ${getVariantStyles()}
        ${getPaddingStyles()}
        rounded-lg
      `}
            style={style}
            {...props}
        >
            {children}
        </View>
    );
}; 
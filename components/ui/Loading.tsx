import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
    size?: 'small' | 'large';
    text?: string;
    overlay?: boolean;
    color?: string;
}

export const Loading: React.FC<LoadingProps> = ({
    size = 'large',
    text,
    overlay = false,
    color = '#0284c7',
}) => {
    const content = (
        <View className="items-center justify-center">
            <ActivityIndicator size={size} color={color} />
            {text && (
                <Text className="text-gray-600 text-base mt-3 text-center">
                    {text}
                </Text>
            )}
        </View>
    );

    if (overlay) {
        return (
            <View className="absolute inset-0 bg-white/80 items-center justify-center z-50">
                {content}
            </View>
        );
    }

    return (
        <View className="flex-1 items-center justify-center p-8">
            {content}
        </View>
    );
}; 
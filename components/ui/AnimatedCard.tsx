import React, { useRef, useEffect, ReactNode } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { Card, CardProps } from './Card';

interface AnimatedCardProps extends Omit<CardProps, 'children'> {
    children: ReactNode;
    delay?: number;
    duration?: number;
    animationType?: 'fadeIn' | 'slideUp' | 'scale' | 'slideLeft' | 'slideRight';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    delay = 0,
    duration = 600,
    animationType = 'fadeIn',
    style,
    ...props
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        const animations = [];

        switch (animationType) {
            case 'fadeIn':
                animations.push(
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    })
                );
                break;

            case 'slideUp':
                animations.push(
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateAnim, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    })
                );
                break;

            case 'scale':
                animations.push(
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        delay,
                        useNativeDriver: true,
                    })
                );
                break;

            case 'slideLeft':
                translateAnim.setValue(-50);
                animations.push(
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateAnim, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    })
                );
                break;

            case 'slideRight':
                translateAnim.setValue(50);
                animations.push(
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateAnim, {
                        toValue: 0,
                        duration,
                        delay,
                        useNativeDriver: true,
                    })
                );
                break;
        }

        Animated.parallel(animations).start();
    }, [delay, duration, animationType]);

    const getAnimatedStyle = (): ViewStyle => {
        const baseStyle = {
            opacity: fadeAnim,
        };

        switch (animationType) {
            case 'slideUp':
            case 'slideLeft':
            case 'slideRight':
                return {
                    ...baseStyle,
                    transform: [{ translateY: translateAnim }],
                };

            case 'scale':
                return {
                    ...baseStyle,
                    transform: [{ scale: scaleAnim }],
                };

            default:
                return baseStyle;
        }
    };

    return (
        <Animated.View style={[getAnimatedStyle(), style]}>
            <Card {...props}>
                {children}
            </Card>
        </Animated.View>
    );
}; 
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { AuthProvider } from '../contexts/AuthContext';
import { BudgetProvider } from '../contexts/BudgetContext';
import '../global.css';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {


  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error('RootLayout: Font loading error:', error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {

      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {

    return null;
  }


  return <RootLayoutNav />;
}

function RootLayoutNav() {


  return (
    <AuthProvider>
      <BudgetProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="expense-form" options={{
              presentation: 'modal',
              headerShown: false
            }} />
            <Stack.Screen name="expense-details/[id]" options={{
              headerShown: false
            }} />
            <Stack.Screen name="budget-settings" options={{
              presentation: 'modal',
              headerShown: false
            }} />
          </Stack>
          <Toast />
        </ThemeProvider>
      </BudgetProvider>
    </AuthProvider>
  );
}

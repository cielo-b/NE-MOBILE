import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface BudgetSettings {
  monthlyLimit: number;
  notificationThreshold: number;
}

const STORAGE_KEYS = {
  USER: '@finance_tracker_user',
  AUTH_TOKEN: '@finance_tracker_token',
  ONBOARDING_COMPLETED: '@finance_tracker_onboarding',
  BUDGET_SETTINGS: '@finance_tracker_budget_settings',
};

export const storage = {
  // User management
  setUser: async (user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw new Error('Failed to save user data');
    }
  },

  getUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  removeUser: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Error removing user:', error);
      throw new Error('Failed to remove user data');
    }
  },

  // Auth token management
  setAuthToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw new Error('Failed to save auth token');
    }
  },

  getAuthToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  removeAuthToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw new Error('Failed to remove auth token');
    }
  },

  // Onboarding
  setOnboardingCompleted: async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } catch (error) {
      console.error('Error setting onboarding completed:', error);
    }
  },

  getOnboardingCompleted: async (): Promise<boolean> => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  },

  // Budget settings management (per user)
  setBudgetSettings: async (userId: string, settings: BudgetSettings): Promise<void> => {
    try {
      const key = `${STORAGE_KEYS.BUDGET_SETTINGS}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving budget settings:', error);
      throw new Error('Failed to save budget settings');
    }
  },

  getBudgetSettings: async (userId: string): Promise<BudgetSettings | null> => {
    try {
      const key = `${STORAGE_KEYS.BUDGET_SETTINGS}_${userId}`;
      const settingsData = await AsyncStorage.getItem(key);
      return settingsData ? JSON.parse(settingsData) : null;
    } catch (error) {
      console.error('Error getting budget settings:', error);
      return null;
    }
  },

  // Clear budget settings for a specific user
  clearUserBudgetSettings: async (userId: string): Promise<void> => {
    try {
      const key = `${STORAGE_KEYS.BUDGET_SETTINGS}_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing user budget settings:', error);
    }
  },

  // Clear all data
  clearAll: async (): Promise<void> => {
    try {
      // Get all keys to find user-specific budget settings
      const allKeys = await AsyncStorage.getAllKeys();
      const budgetKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.BUDGET_SETTINGS));
      
      const keysToRemove = [
        STORAGE_KEYS.USER,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        ...budgetKeys, // Include all user-specific budget settings
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  },
}; 
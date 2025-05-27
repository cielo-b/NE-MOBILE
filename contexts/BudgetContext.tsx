import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { storage } from '../utils/storage';
import { expenseAPI, userAPI } from '../services/api';
import { Expense, BudgetSettings } from '../types';
import { useAuth } from './AuthContext';

interface BudgetContextType {
    budgetSettings: BudgetSettings;
    currentMonthSpent: number;
    isOverBudget: boolean;
    percentageUsed: number;
    setBudgetSettings: (settings: BudgetSettings) => Promise<void>;
    checkBudgetAlert: (newExpenseAmount: number) => void;
    refreshBudgetData: () => Promise<void>;
}

const defaultBudgetSettings: BudgetSettings = {
    monthlyLimit: 1000,
    notificationThreshold: 80,
    categoryLimits: {},
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

interface BudgetProviderProps {
    children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [budgetSettings, setBudgetSettingsState] = useState<BudgetSettings>(defaultBudgetSettings);
    const [currentMonthSpent, setCurrentMonthSpent] = useState(0);

    useEffect(() => {
        if (user?.id) {
            initializeBudget();
        }
    }, [user?.id]);

    const initializeBudget = async () => {
        if (!user?.id) return;

        try {
            // First try to get settings from API
            const apiSettings = await userAPI.getBudgetSettings(user.id);
            if (apiSettings) {
                setBudgetSettingsState(apiSettings);
            } else {
                // Fall back to local storage if API fails
                const storedSettings = await storage.getBudgetSettings(user.id);
                if (storedSettings) {
                    setBudgetSettingsState(storedSettings);
                    // Sync local settings to API
                    await userAPI.updateBudgetSettings(user.id, storedSettings);
                }
            }
            await refreshBudgetData();
        } catch (error) {
            console.error('Error initializing budget:', error);
        }
    };

    const setBudgetSettings = async (settings: BudgetSettings) => {
        if (!user?.id) {
            throw new Error('User not authenticated');
        }

        try {
            // Update API first
            await userAPI.updateBudgetSettings(user.id, settings);
            // Then update local state and storage
            setBudgetSettingsState(settings);
            await storage.setBudgetSettings(user.id, settings);
        } catch (error) {
            console.error('Error saving budget settings:', error);
            throw error;
        }
    };

    const refreshBudgetData = async () => {
        if (!user?.id) return;

        try {
            let expenses = await expenseAPI.getAllExpenses();

            // Filter expenses by current user
            expenses = expenses.filter((expense: Expense) => expense.userId === user.id);

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const monthlyExpenses = expenses.filter((expense: Expense) => {
                const expenseDate = new Date(expense.date || expense.createdAt);
                return expenseDate.getMonth() === currentMonth &&
                    expenseDate.getFullYear() === currentYear;
            });

            const totalSpent = monthlyExpenses.reduce((total: number, expense: Expense) => {
                const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) || 0 : expense.amount;
                return total + amount;
            }, 0);

            setCurrentMonthSpent(totalSpent);
        } catch (error) {
            console.error('Error refreshing budget data:', error);
        }
    };

    const checkBudgetAlert = (newExpenseAmount: number) => {
        const projectedSpent = currentMonthSpent + newExpenseAmount;
        const projectedPercentage = (projectedSpent / budgetSettings.monthlyLimit) * 100;

        if (projectedPercentage >= budgetSettings.notificationThreshold &&
            currentMonthSpent < budgetSettings.monthlyLimit * (budgetSettings.notificationThreshold / 100)) {
            Alert.alert(
                'Budget Alert',
                `Adding this expense will bring you to ${projectedPercentage.toFixed(1)}% of your monthly budget limit ($${budgetSettings.monthlyLimit}).`,
                [
                    { text: 'Continue', style: 'default' },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }

        if (projectedSpent > budgetSettings.monthlyLimit) {
            Alert.alert(
                'Budget Exceeded',
                `This expense will exceed your monthly budget by $${(projectedSpent - budgetSettings.monthlyLimit).toFixed(2)}.`,
                [
                    { text: 'Add Anyway', style: 'destructive' },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }
    };

    const isOverBudget = currentMonthSpent > budgetSettings.monthlyLimit;
    const percentageUsed = (currentMonthSpent / budgetSettings.monthlyLimit) * 100;

    const value: BudgetContextType = {
        budgetSettings,
        currentMonthSpent,
        isOverBudget,
        percentageUsed,
        setBudgetSettings,
        checkBudgetAlert,
        refreshBudgetData,
    };

    return (
        <BudgetContext.Provider value={value}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = (): BudgetContextType => {
    const context = useContext(BudgetContext);
    if (context === undefined) {
        throw new Error('useBudget must be used within a BudgetProvider');
    }
    return context;
}; 
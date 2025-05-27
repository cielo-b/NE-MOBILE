import axios from 'axios';
import { User, Expense, ExpenseFormData } from '../types';

const BASE_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  // Login user by username and password
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      console.log('Attempting login for username:', username);
      const response = await api.get(`/users?username=${encodeURIComponent(username)}`);
      const users = response.data;

      console.log(users)
      
      if (users.length === 0) {
        console.log('No user found with username:', username);
        throw new Error('Invalid username or password');
      }
      
      const user = users[0];
      console.log('User found:', user);

      if(user.username != username){
        console.log('Username validation failed');
        throw new Error('Invalid username or password');
      }
      
      // Validate password
      if (user.password !== password) {
        console.log('Password validation failed');
        throw new Error('Invalid username or password');
      }
      
      console.log('Login successful for user:', user.username);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to authenticate user');
    }
  },

  // Create new user
  createUser: async (userData: { name: string; username: string; email: string; password: string }): Promise<User> => {
    try {
      const payload = {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = await api.post('/users', payload);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw new Error('Failed to create user account');
    }
  },

  // Get user by ID
  getUser: async (userId: string): Promise<User> => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error);
      throw new Error('Failed to fetch user data');
    }
  },
};

// Expense API
export const expenseAPI = {
  // Get all expenses
  getAllExpenses: async (): Promise<Expense[]> => {
    try {
      const response = await api.get('/expenses');
      return response.data;
    } catch (error) {
      console.error('Get expenses error:', error);
      throw new Error('Failed to fetch expenses');
    }
  },

  // Get expenses by user ID
  getUserExpenses: async (userId: string): Promise<Expense[]> => {
    try {
      const response = await api.get(`/expenses?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user expenses error:', error);
      throw new Error('Failed to fetch user expenses');
    }
  },

  // Get expense by ID
  getExpense: async (expenseId: string): Promise<Expense> => {
    try {
      const response = await api.get(`/expenses/${expenseId}`);
      return response.data;
    } catch (error) {
      console.error('Get expense error:', error);
      throw new Error('Failed to fetch expense details');
    }
  },

  // Create new expense
  createExpense: async (expenseData: ExpenseFormData & { userId: string }): Promise<Expense> => {
    try {
      const payload = {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const response = await api.post('/expenses', payload);
      return response.data;
    } catch (error) {
      console.error('Create expense error:', error);
      throw new Error('Failed to create expense');
    }
  },

  // Update expense
  updateExpense: async (expenseId: string, expenseData: Partial<ExpenseFormData>): Promise<Expense> => {
    try {
      const payload = {
        ...expenseData,
        ...(expenseData.amount && { amount: parseFloat(expenseData.amount) }),
        updatedAt: new Date().toISOString(),
      };
      const response = await api.put(`/expenses/${expenseId}`, payload);
      return response.data;
    } catch (error) {
      console.error('Update expense error:', error);
      throw new Error('Failed to update expense');
    }
  },

  // Delete expense
  deleteExpense: async (expenseId: string): Promise<void> => {
    try {
      await api.delete(`/expenses/${expenseId}`);
    } catch (error) {
      console.error('Delete expense error:', error);
      throw new Error('Failed to delete expense');
    }
  },
};

export default api; 
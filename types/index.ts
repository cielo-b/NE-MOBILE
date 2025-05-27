export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title?: string;
  name?: string;
  amount: number ;
  category?: string;
  description?: string;
  date?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  userId: string;
}

export interface ExpenseFormData {
  title: string;
  amount: string;
  category: string;
  description?: string;
  date: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export type ExpenseCategory = 
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills & Utilities'
  | 'Healthcare'
  | 'Education'
  | 'Travel'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other',
]; 
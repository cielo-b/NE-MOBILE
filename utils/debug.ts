import { Expense } from '../types';

export const debug = {
  log: (component: string, message: string, data?: any) => {
    console.log(`[${component}] ${message}`, data ? data : '');
  },
  
  warn: (component: string, message: string, data?: any) => {
    console.warn(`[${component}] ${message}`, data ? data : '');
  },
  
  error: (component: string, message: string, error?: any) => {
    console.error(`[${component}] ${message}`, error ? error : '');
  },
  
  validateExpense: (expense: any) => {
    const issues: string[] = [];
    
    if (!expense) {
      issues.push('Expense is null or undefined');
      return { isValid: false, issues };
    }
    
    if (!expense.id) issues.push('Missing id');
    if (!expense.title && !expense.name) issues.push('Missing title/name');
    if (!expense.amount && expense.amount !== 0) issues.push('Missing amount');
    if (!expense.category) issues.push('Missing category');
    if (!expense.date && !expense.createdAt) issues.push('Missing date/createdAt');
    
    return {
      isValid: issues.length === 0,
      issues
    };
  },
  
  normalizeExpense: (expense: any): Expense => {
    console.log('Normalizing expense:', expense);
    
    if (!expense) {
      // Return a default expense object if input is null/undefined
      return {
        id: '',
        title: 'Invalid Expense',
        amount: 0,
        category: 'Other',
        description: '',
        date: new Date().toISOString(),
        userId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    // Clean up amount if it's a string
    let cleanAmount = expense.amount || 0;
    if (typeof cleanAmount === 'string') {
      const cleanedAmount = cleanAmount.replace(/[^0-9.-]/g, '');
      cleanAmount = parseFloat(cleanedAmount) || 0;
    }
    
    // Ensure amount is reasonable
    if (cleanAmount > 999999999) {
      console.warn('Extremely large amount detected, capping:', cleanAmount);
      cleanAmount = 999999999;
    }
    
    // Normalize the expense object to match expected structure
    const normalized: Expense = {
      id: expense.id || '',
      title: expense.title || expense.name || 'Untitled Expense',
      amount: cleanAmount,
      category: expense.category || 'Other',
      description: expense.description || '',
      date: expense.date || expense.createdAt || new Date().toISOString(),
      userId: expense.userId || '',
      createdAt: expense.createdAt || new Date().toISOString(),
      updatedAt: expense.updatedAt || expense.createdAt || new Date().toISOString(),
    };
    
    console.log('Normalized expense result:', normalized);
    return normalized;
  },
  
  validateUser: (user: any) => {
    const issues: string[] = [];
    
    if (!user) {
      issues.push('User is null or undefined');
      return { isValid: false, issues };
    }
    
    if (!user.id) issues.push('Missing id');
    if (!user.username) issues.push('Missing username');
    if (!user.email && !user.username) issues.push('Missing email/username');
    if (!user.name && !user.username) issues.push('Missing name/username');
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}; 
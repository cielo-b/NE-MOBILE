export const validation = {
  email: (email: string): { isValid: boolean; message?: string } => {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  },

  password: (password: string): { isValid: boolean; message?: string } => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    return { isValid: true };
  },

  amount: (amount: string): { isValid: boolean; message?: string } => {
    if (!amount) {
      return { isValid: false, message: 'Amount is required' };
    }
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return { isValid: false, message: 'Please enter a valid number' };
    }
    
    if (numericAmount <= 0) {
      return { isValid: false, message: 'Amount must be greater than 0' };
    }
    
    if (numericAmount > 999999.99) {
      return { isValid: false, message: 'Amount is too large' };
    }
    
    return { isValid: true };
  },

  title: (title: string): { isValid: boolean; message?: string } => {
    if (!title) {
      return { isValid: false, message: 'Title is required' };
    }
    
    if (title.trim().length < 2) {
      return { isValid: false, message: 'Title must be at least 2 characters long' };
    }
    
    if (title.length > 100) {
      return { isValid: false, message: 'Title must be less than 100 characters' };
    }
    
    return { isValid: true };
  },

  category: (category: string): { isValid: boolean; message?: string } => {
    if (!category) {
      return { isValid: false, message: 'Category is required' };
    }
    
    return { isValid: true };
  },

  description: (description: string): { isValid: boolean; message?: string } => {
    if (description && description.length > 500) {
      return { isValid: false, message: 'Description must be less than 500 characters' };
    }
    
    return { isValid: true };
  },

  date: (date: string): { isValid: boolean; message?: string } => {
    if (!date) {
      return { isValid: false, message: 'Date is required' };
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    
    if (isNaN(selectedDate.getTime())) {
      return { isValid: false, message: 'Please enter a valid date' };
    }
    
    if (selectedDate > today) {
      return { isValid: false, message: 'Date cannot be in the future' };
    }
    
    return { isValid: true };
  },
}; 
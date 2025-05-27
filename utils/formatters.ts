export const formatters = {
  currency: (amount: number | string, currency: string = 'USD'): string => {
    console.log('formatters.currency called with:', { amount, currency });
    
    let numericAmount: number;
    
    if (typeof amount === 'string') {
      // Clean the string and convert to number
      const cleanedAmount = amount.replace(/[^0-9.-]/g, '');
      numericAmount = parseFloat(cleanedAmount);
    } else {
      numericAmount = amount;
    }
    
    if (typeof numericAmount !== 'number' || isNaN(numericAmount)) {
      console.warn('Invalid amount provided to currency formatter:', amount);
      numericAmount = 0;
    }
    
    // Handle extremely large numbers
    if (numericAmount > 999999999) {
      console.warn('Extremely large amount detected, capping at 999,999,999:', numericAmount);
      numericAmount = 999999999;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  },

  date: (date: string | Date): string => {
    console.log('formatters.date called with:', date);
    
    if (!date) {
      console.warn('No date provided to date formatter');
      return 'No Date';
    }
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date provided to date formatter:', date);
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  },

  dateTime: (date: string | Date): string => {
    console.log('formatters.dateTime called with:', date);
    
    if (!date) {
      console.warn('No date provided to dateTime formatter');
      return 'No Date';
    }
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date provided to dateTime formatter:', date);
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting dateTime:', error);
      return 'Invalid Date';
    }
  },

  relativeDate: (date: string | Date): string => {
    console.log('formatters.relativeDate called with:', date);
    
    if (!date) {
      console.warn('No date provided to relativeDate formatter');
      return 'No Date';
    }
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date provided to relativeDate formatter:', date);
        return 'Invalid Date';
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - dateObj.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        return 'Today';
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 0) {
        return 'Future';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.floor(diffInDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
      }
    } catch (error) {
      console.error('Error formatting relativeDate:', error);
      return 'Invalid Date';
    }
  },

  percentage: (value: number, total: number): string => {
    console.log('formatters.percentage called with:', { value, total });
    
    if (typeof value !== 'number' || typeof total !== 'number' || isNaN(value) || isNaN(total)) {
      console.warn('Invalid numbers provided to percentage formatter:', { value, total });
      return '0%';
    }
    
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(1)}%`;
  },

  compactNumber: (num: number): string => {
    console.log('formatters.compactNumber called with:', num);
    
    if (typeof num !== 'number' || isNaN(num)) {
      console.warn('Invalid number provided to compactNumber formatter:', num);
      return '0';
    }
    
    if (num < 1000) {
      return num.toString();
    } else if (num < 1000000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else if (num < 1000000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
  },

  capitalize: (str: string): string => {
    console.log('formatters.capitalize called with:', str);
    
    if (!str || typeof str !== 'string') {
      console.warn('Invalid string provided to capitalize formatter:', str);
      return '';
    }
    
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate: (str: string, maxLength: number): string => {
    console.log('formatters.truncate called with:', { str, maxLength });
    
    if (!str || typeof str !== 'string') {
      console.warn('Invalid string provided to truncate formatter:', str);
      return '';
    }
    
    if (typeof maxLength !== 'number' || maxLength < 0) {
      console.warn('Invalid maxLength provided to truncate formatter:', maxLength);
      return str;
    }
    
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  },
}; 
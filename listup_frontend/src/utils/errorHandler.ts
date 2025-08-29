// Error handling utility for authentication and form validation
export interface ApiError {
  message: string;
  field?: string;
  code?: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

// Common error messages for better UX
export const ERROR_MESSAGES = {
  // Network/Connection errors
  NETWORK_ERROR: "Connection failed. Please check your internet connection and try again.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  
  // Authentication errors
  INVALID_CREDENTIALS: "Invalid email or password. Please check your credentials and try again.",
  ACCOUNT_NOT_FOUND: "No account found with this email address. Please check your email or sign up.",
  ACCOUNT_EXISTS: "An account with this email already exists. Please log in instead.",
  PASSWORD_TOO_WEAK: "Password is too weak. Please use at least 6 characters with a mix of letters and numbers.",
  EMAIL_INVALID: "Please enter a valid email address.",
  EMAIL_REQUIRED: "Email address is required.",
  PASSWORD_REQUIRED: "Password is required.",
  
  // Validation errors
  NAME_REQUIRED: "Full name is required.",
  NAME_TOO_SHORT: "Name must be at least 2 characters long.",
  PHONE_INVALID: "Please enter a valid phone number (at least 10 digits).",
  
  // Vendor-specific errors
  STORE_NAME_REQUIRED: "Store name is required.",
  STORE_NAME_TOO_SHORT: "Store name must be at least 2 characters long.",
  STORE_ADDRESS_REQUIRED: "Store address is required.",
  STORE_ADDRESS_TOO_SHORT: "Store address must be at least 5 characters long.",
  BUSINESS_CATEGORY_REQUIRED: "Business category is required.",
  BUSINESS_CATEGORY_TOO_SHORT: "Business category must be at least 2 characters long.",
  
  // Server errors
  SERVER_ERROR: "Something went wrong on our end. Please try again in a few minutes.",
  MAINTENANCE: "We're currently performing maintenance. Please try again later.",
  RATE_LIMITED: "Too many attempts. Please wait a few minutes before trying again.",
  
  // Generic errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  TRY_AGAIN: "Please try again.",
};

// Parse API errors and return user-friendly messages
export function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    // Handle standard Error objects
    const message = error.message.toLowerCase();
    
    // Check for common error patterns
    if (message.includes('network') || message.includes('connection')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    if (message.includes('invalid credentials') || message.includes('wrong password')) {
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    }
    if (message.includes('user not found') || message.includes('account not found')) {
      return ERROR_MESSAGES.ACCOUNT_NOT_FOUND;
    }
    if (message.includes('email already exists') || message.includes('user already exists')) {
      return ERROR_MESSAGES.ACCOUNT_EXISTS;
    }
    if (message.includes('password') && message.includes('weak')) {
      return ERROR_MESSAGES.PASSWORD_TOO_WEAK;
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return ERROR_MESSAGES.RATE_LIMITED;
    }
    if (message.includes('maintenance')) {
      return ERROR_MESSAGES.MAINTENANCE;
    }
    
    // Return the original message if it's user-friendly
    if (message.length < 100 && !message.includes('internal') && !message.includes('server')) {
      return error.message;
    }
    
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  // Handle axios response errors
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as any).response;
    
    if (response?.status) {
      switch (response.status) {
        case 400:
          if (response.data?.message) {
            return response.data.message;
          }
          if (response.data?.errors && Array.isArray(response.data.errors)) {
            return "Please fix the errors below to continue.";
          }
          return "Invalid request. Please check your information and try again.";
        case 401:
          return ERROR_MESSAGES.INVALID_CREDENTIALS;
        case 403:
          return "Access denied. Please check your permissions.";
        case 404:
          return ERROR_MESSAGES.ACCOUNT_NOT_FOUND;
        case 409:
          return ERROR_MESSAGES.ACCOUNT_EXISTS;
        case 422:
          return "Please check your information and try again.";
        case 429:
          return ERROR_MESSAGES.RATE_LIMITED;
        case 500:
          return ERROR_MESSAGES.SERVER_ERROR;
        case 503:
          return ERROR_MESSAGES.MAINTENANCE;
        default:
          return ERROR_MESSAGES.SERVER_ERROR;
      }
    }
    
    if (response?.data?.message) {
      return response.data.message;
    }
  }
  
  // Handle network errors
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as any).code;
    if (code === 'NETWORK_ERROR' || code === 'ERR_NETWORK') {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (code === 'ECONNABORTED' || code === 'ERR_TIMEOUT') {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Parse validation errors from API response
export function parseValidationErrors(error: unknown): ValidationError[] {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as any).response;
    if (response?.data?.errors && Array.isArray(response.data.errors)) {
      return response.data.errors.map((err: any) => ({
        field: err.field || 'unknown',
        message: err.message || 'Invalid value',
        value: err.value
      }));
    }
  }
  return [];
}

// Get field-specific error message
export function getFieldErrorMessage(field: string, value: string): string | null {
  switch (field) {
    case 'name':
      if (!value.trim()) return ERROR_MESSAGES.NAME_REQUIRED;
      if (value.trim().length < 2) return ERROR_MESSAGES.NAME_TOO_SHORT;
      break;
    case 'email':
      if (!value.trim()) return ERROR_MESSAGES.EMAIL_REQUIRED;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return ERROR_MESSAGES.EMAIL_INVALID;
      }
      break;
    case 'password':
      if (!value) return ERROR_MESSAGES.PASSWORD_REQUIRED;
      if (value.length < 6) return ERROR_MESSAGES.PASSWORD_TOO_WEAK;
      break;
    case 'phone':
      if (value.trim() && value.trim().length < 10) {
        return ERROR_MESSAGES.PHONE_INVALID;
      }
      break;
    case 'storeName':
      if (!value.trim()) return ERROR_MESSAGES.STORE_NAME_REQUIRED;
      if (value.trim().length < 2) return ERROR_MESSAGES.STORE_NAME_TOO_SHORT;
      break;
    case 'storeAddress':
      if (!value.trim()) return ERROR_MESSAGES.STORE_ADDRESS_REQUIRED;
      if (value.trim().length < 5) return ERROR_MESSAGES.STORE_ADDRESS_TOO_SHORT;
      break;
    case 'businessCategory':
      if (!value.trim()) return ERROR_MESSAGES.BUSINESS_CATEGORY_REQUIRED;
      if (value.trim().length < 2) return ERROR_MESSAGES.BUSINESS_CATEGORY_TOO_SHORT;
      break;
  }
  return null;
}

// Check if error is retryable
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('server') ||
           message.includes('maintenance');
  }
  
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as any).response;
    return response?.status >= 500 || response?.status === 429;
  }
  
  return false;
}


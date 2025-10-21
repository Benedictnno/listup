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
  
  // Authentication errors - Enhanced for better UX
  INVALID_CREDENTIALS: "The email or password you entered is incorrect. Please check your credentials and try again.",
  ACCOUNT_NOT_FOUND: "No account found with this email address. Please check your email or create a new account.",
  ACCOUNT_EXISTS: "An account with this email already exists. Please log in instead or use a different email address.",
  PASSWORD_TOO_WEAK: "Password must be at least 6 characters long. For security, consider using a mix of letters, numbers, and symbols.",
  EMAIL_INVALID: "Please enter a valid email address (e.g., yourname@example.com).",
  EMAIL_REQUIRED: "Email address is required to create your account.",
  PASSWORD_REQUIRED: "Password is required to secure your account.",
  
  // Enhanced login-specific errors
  LOGIN_FAILED: "Login failed. Please check your email and password, then try again.",
  ACCOUNT_LOCKED: "Your account has been temporarily locked due to multiple failed attempts. Please try again in 15 minutes.",
  ACCOUNT_INACTIVE: "Your account is inactive. Please check your email for activation instructions or contact support.",
  SESSION_EXPIRED: "Your login session has expired. Please log in again.",
  
  // Enhanced signup-specific errors
  SIGNUP_FAILED: "Unable to create your account. Please check your information and try again.",
  EMAIL_ALREADY_REGISTERED: "This email is already registered. Please log in instead or use a different email address.",
  PHONE_ALREADY_REGISTERED: "This phone number is already registered. Please use a different number or log in instead.",
  STORE_NAME_TAKEN: "This store name is already taken. Please choose a different name for your store.",
  
  // Validation errors - Enhanced for clarity
  NAME_REQUIRED: "Please enter your full name as it appears on official documents.",
  NAME_TOO_SHORT: "Name must be at least 2 characters long. Please enter your complete name.",
  PHONE_INVALID: "Please enter a valid phone number with at least 10 digits (e.g., 08012345678).",
  
  // Vendor-specific errors - Enhanced for clarity
  STORE_NAME_REQUIRED: "Please enter a name for your store so customers can find you easily.",
  STORE_NAME_TOO_SHORT: "Store name must be at least 2 characters long. Make it memorable for your customers.",
  STORE_ADDRESS_REQUIRED: "Please enter your store address so customers know where to find you.",
  STORE_ADDRESS_TOO_SHORT: "Store address must be at least 5 characters long. Include landmarks or nearby locations.",
  BUSINESS_CATEGORY_REQUIRED: "Please select a business category to help customers find your products.",
  BUSINESS_CATEGORY_TOO_SHORT: "Business category must be at least 2 characters long. Be specific about what you sell.",
  
  // Server errors - Enhanced for user understanding
  SERVER_ERROR: "We're experiencing technical difficulties. Please try again in a few minutes. If the problem persists, contact our support team.",
  MAINTENANCE: "We're currently performing scheduled maintenance to improve your experience. Please try again in 30 minutes.",
  RATE_LIMITED: "Too many attempts detected. Please wait 5 minutes before trying again to protect your account.",
  
  // Generic errors - Enhanced for clarity
  UNKNOWN_ERROR: "Something unexpected happened. Please try again, and if the problem continues, contact our support team.",
  TRY_AGAIN: "Please try again. If the problem persists, contact our support team.",
  
  // Success messages for better UX
  LOGIN_SUCCESS: "Welcome back! Redirecting you to your dashboard...",
  SIGNUP_SUCCESS: "Account created successfully! Welcome to ListUp. Redirecting to your dashboard...",
  PASSWORD_RESET_SENT: "Password reset instructions have been sent to your email. Please check your inbox.",
};

// Parse API errors and return user-friendly messages
export function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    // Handle standard Error objects
    const message = error.message.toLowerCase();
    
    // Check for common error patterns with enhanced messages
    if (message.includes('network') || message.includes('connection')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }
    if (message.includes('invalid credentials') || message.includes('wrong password') || message.includes('authentication failed')) {
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    }
    if (message.includes('user not found') || message.includes('account not found') || message.includes('no user found')) {
      return ERROR_MESSAGES.ACCOUNT_NOT_FOUND;
    }
    if (message.includes('email already exists') || message.includes('user already exists') || message.includes('duplicate email')) {
      return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
    }
    if (message.includes('phone already exists') || message.includes('duplicate phone')) {
      return ERROR_MESSAGES.PHONE_ALREADY_REGISTERED;
    }
    if (message.includes('store name') && message.includes('taken')) {
      return ERROR_MESSAGES.STORE_NAME_TAKEN;
    }
    if (message.includes('password') && (message.includes('weak') || message.includes('too short'))) {
      return ERROR_MESSAGES.PASSWORD_TOO_WEAK;
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return ERROR_MESSAGES.RATE_LIMITED;
    }
    if (message.includes('maintenance')) {
      return ERROR_MESSAGES.MAINTENANCE;
    }
    if (message.includes('account locked') || message.includes('temporarily blocked')) {
      return ERROR_MESSAGES.ACCOUNT_LOCKED;
    }
    if (message.includes('account inactive') || message.includes('not activated')) {
      return ERROR_MESSAGES.ACCOUNT_INACTIVE;
    }
    if (message.includes('session expired') || message.includes('token expired')) {
      return ERROR_MESSAGES.SESSION_EXPIRED;
    }
    
    // Comprehensive regex to catch any 3-digit status code in error messages
    const statusCodeMatch = message.match(/\b(\d{3})\b/);
    if (statusCodeMatch && ['400', '401', '403', '404', '409', '422', '429', '500', '503'].includes(statusCodeMatch[1])) {
      const statusCode = parseInt(statusCodeMatch[1]);
      return getHttpStatusMessage(statusCode);
    }
    
    // Return the original message if it's user-friendly
    if (message.length < 100 && !message.includes('internal') && !message.includes('server') && !message.includes('error')) {
      return error.message;
    }
    
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  // Handle axios response errors with enhanced messages
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as any).response;
    
    if (response?.status) {
      switch (response.status) {
        case 400:
          if (response.data?.message) {
            const message = response.data.message.toLowerCase();
            // Enhanced 400 error handling
            if (message.includes('validation') || message.includes('invalid')) {
              return "Please check your information and make sure all required fields are filled correctly.";
            }
            if (message.includes('email') && message.includes('format')) {
              return ERROR_MESSAGES.EMAIL_INVALID;
            }
            if (message.includes('password') && message.includes('weak')) {
              return ERROR_MESSAGES.PASSWORD_TOO_WEAK;
            }
            return response.data.message;
          }
          if (response.data?.errors && Array.isArray(response.data.errors)) {
            return "Please fix the errors below to continue.";
          }
          return "Please check your information and try again. Make sure all required fields are filled correctly.";
        case 401:
          if (response.data?.message?.toLowerCase().includes('expired')) {
            return ERROR_MESSAGES.SESSION_EXPIRED;
          }
          return ERROR_MESSAGES.INVALID_CREDENTIALS;
        case 403:
          if (response.data?.message?.toLowerCase().includes('locked')) {
            return ERROR_MESSAGES.ACCOUNT_LOCKED;
          }
          if (response.data?.message?.toLowerCase().includes('inactive')) {
            return ERROR_MESSAGES.ACCOUNT_INACTIVE;
          }
          return "Access denied. Please check your account status or contact support.";
        case 404:
          if (response.data?.message?.toLowerCase().includes('user') || response.data?.message?.toLowerCase().includes('account')) {
            return ERROR_MESSAGES.ACCOUNT_NOT_FOUND;
          }
          return "The requested resource was not found. Please check your information and try again.";
        case 409:
          if (response.data?.message?.toLowerCase().includes('email')) {
            return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
          }
          if (response.data?.message?.toLowerCase().includes('phone')) {
            return ERROR_MESSAGES.PHONE_ALREADY_REGISTERED;
          }
          if (response.data?.message?.toLowerCase().includes('store')) {
            return ERROR_MESSAGES.STORE_NAME_TAKEN;
          }
          return ERROR_MESSAGES.ACCOUNT_EXISTS;
        case 422:
          return "Please check your information and make sure all required fields are filled correctly.";
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
      const message = response.data.message.toLowerCase();
      // Additional message parsing for common patterns
      if (message.includes('duplicate') && message.includes('email')) {
        return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
      }
      if (message.includes('duplicate') && message.includes('phone')) {
        return ERROR_MESSAGES.PHONE_ALREADY_REGISTERED;
      }
      if (message.includes('duplicate') && message.includes('store')) {
        return ERROR_MESSAGES.STORE_NAME_TAKEN;
      }
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

// Get field-specific error message with enhanced clarity
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
  console.log(true);
  
  return false;
}

// Get success message for different actions
export function getSuccessMessage(action: 'login' | 'signup' | 'password-reset'): string {
  switch (action) {
    case 'login':
      return ERROR_MESSAGES.LOGIN_SUCCESS;
    case 'signup':
      return ERROR_MESSAGES.SIGNUP_SUCCESS;
    case 'password-reset':
      return ERROR_MESSAGES.PASSWORD_RESET_SENT;
    default:
      return "Operation completed successfully!";
  }
}

// Helper function to get user-friendly messages for HTTP status codes
function getHttpStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Please check your information and make sure all required fields are filled correctly.";
    case 401:
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    case 403:
      return "Access denied. Please check your account status or contact support.";
    case 404:
      return "The requested information was not found. Please check your details and try again.";
    case 409:
      return "This information conflicts with an existing account. Please use different details or log in to your existing account.";
    case 422:
      return "Please check your information and make sure all required fields are filled correctly.";
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


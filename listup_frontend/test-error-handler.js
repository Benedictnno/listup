// Simple test file to verify error handler functionality
// This file is for testing purposes only and can be deleted after verification

// Mock the error handler functions
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "The email or password you entered is incorrect. Please check your credentials and try again.",
  ACCOUNT_NOT_FOUND: "No account found with this email address. Please check your email or create a new account.",
  EMAIL_ALREADY_REGISTERED: "This email is already registered. Please log in instead or use a different email address.",
  RATE_LIMITED: "Too many attempts detected. Please wait 5 minutes before trying again to protect your account.",
  SERVER_ERROR: "We're experiencing technical difficulties. Please try again in a few minutes. If the problem persists, contact our support team.",
  MAINTENANCE: "We're currently performing scheduled maintenance to improve your experience. Please try again in 30 minutes.",
};

function getHttpStatusMessage(status) {
  switch (status) {
    case 400:
      return "Please check your information and make sure all required fields are filled correctly.";
    case 401:
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    case 403:
      return "Access denied. Please check your account status or contact support.";
    case 404:
      return ERROR_MESSAGES.ACCOUNT_NOT_FOUND;
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

function parseApiError(error) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Comprehensive regex to catch any 3-digit status code in error messages
    const statusCodeMatch = message.match(/\b(\d{3})\b/);
    if (statusCodeMatch && ['400', '401', '403', '404', '409', '422', '429', '500', '503'].includes(statusCodeMatch[1])) {
      const statusCode = parseInt(statusCodeMatch[1]);
      return getHttpStatusMessage(statusCode);
    }
    
    return "Unknown error occurred";
  }
  
  return "Invalid error object";
}

// Test cases
const testErrors = [
  new Error("Request failed with status code 409"),
  new Error("Request failed with status code 401"),
  new Error("Request failed with status code 500"),
  new Error("Something went wrong with status code 422"),
  new Error("Network error with status 429"),
  new Error("Axios error: Request failed with status code 404"),
  new Error("Fetch failed: HTTP error 403"),
  new Error("Regular error message without status code"),
];

console.log("Testing Error Handler:");
console.log("=====================");

testErrors.forEach((error, index) => {
  const result = parseApiError(error);
  console.log(`Test ${index + 1}: "${error.message}"`);
  console.log(`Result: ${result}`);
  console.log("---");
});

console.log("Test completed!");

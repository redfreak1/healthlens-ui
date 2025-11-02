/**
 * Utility functions for user management
 */

export const getCurrentUserId = (): string => {
  return localStorage.getItem('currentUserId') || '123';
};

export const getCurrentUserEmail = (): string => {
  return localStorage.getItem('currentUserEmail') || '';
};

export const setCurrentUser = (userId: string, email: string): void => {
  localStorage.setItem('currentUserId', userId);
  localStorage.setItem('currentUserEmail', email);
};

/**
 * Maps email/username to user ID based on business requirements
 */
export const mapEmailToUserId = (email: string): string => {
  const username = email.toLowerCase();
  
  if (username.includes('srinivas')) return '456';
  if (username.includes('vivek')) return '123';
  if (username.includes('dinesh')) return '789';
  if (username.includes('sridhar')) return '901';
  
  // Default user ID for other users
  return '123';
};
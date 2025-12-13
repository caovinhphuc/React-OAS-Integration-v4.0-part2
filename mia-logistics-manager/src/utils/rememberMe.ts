// Remember Me Utility Functions

const REMEMBER_ME_KEYS = {
  EMAIL: 'mia_remembered_email',
  PASSWORD: 'mia_remembered_password',
  EXPIRES: 'mia_remembered_expires',
} as const;

const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export interface RememberMeData {
  email: string;
  password?: string;
  expiresAt: Date;
}

/**
 * Save credentials to localStorage with expiration
 */
export const saveRememberMe = (email: string, password?: string): boolean => {
  try {
    const expiresAt = new Date(Date.now() + REMEMBER_ME_DURATION);

    localStorage.setItem(REMEMBER_ME_KEYS.EMAIL, email);
    if (password) {
      localStorage.setItem(REMEMBER_ME_KEYS.PASSWORD, password);
    }
    localStorage.setItem(REMEMBER_ME_KEYS.EXPIRES, expiresAt.toISOString());

    console.log('Remember me data saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save remember me data:', error);
    return false;
  }
};

/**
 * Load remembered credentials if they exist and are valid
 */
export const loadRememberMe = (): RememberMeData | null => {
  try {
    const email = localStorage.getItem(REMEMBER_ME_KEYS.EMAIL);
    const password = localStorage.getItem(REMEMBER_ME_KEYS.PASSWORD);
    const expiresAtStr = localStorage.getItem(REMEMBER_ME_KEYS.EXPIRES);

    if (!email || !expiresAtStr) {
      return null;
    }

    const expiresAt = new Date(expiresAtStr);
    const now = new Date();

    if (now >= expiresAt) {
      // Credentials expired, clear them
      clearRememberMe();
      console.log('Remember me data expired, cleared');
      return null;
    }

    return {
      email,
      password: password || undefined,
      expiresAt,
    };
  } catch (error) {
    console.error('Failed to load remember me data:', error);
    clearRememberMe(); // Clear corrupted data
    return null;
  }
};

/**
 * Clear all remembered credentials
 */
export const clearRememberMe = (): void => {
  try {
    localStorage.removeItem(REMEMBER_ME_KEYS.EMAIL);
    localStorage.removeItem(REMEMBER_ME_KEYS.PASSWORD);
    localStorage.removeItem(REMEMBER_ME_KEYS.EXPIRES);
    console.log('Remember me data cleared');
  } catch (error) {
    console.error('Failed to clear remember me data:', error);
  }
};

/**
 * Check if remember me data exists and is valid
 */
export const hasValidRememberMe = (): boolean => {
  const data = loadRememberMe();
  return data !== null;
};

/**
 * Get remaining time until expiration
 */
export const getRememberMeTimeRemaining = (): number | null => {
  try {
    const expiresAtStr = localStorage.getItem(REMEMBER_ME_KEYS.EXPIRES);
    if (!expiresAtStr) return null;

    const expiresAt = new Date(expiresAtStr);
    const now = new Date();
    const remaining = expiresAt.getTime() - now.getTime();

    return remaining > 0 ? remaining : null;
  } catch (error) {
    console.error('Failed to get remember me time remaining:', error);
    return null;
  }
};

/**
 * Format remaining time for display
 */
export const formatTimeRemaining = (milliseconds: number): string => {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );

  if (days > 0) {
    return `${days} ngày ${hours} giờ`;
  } else if (hours > 0) {
    return `${hours} giờ`;
  } else {
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
    return `${minutes} phút`;
  }
};

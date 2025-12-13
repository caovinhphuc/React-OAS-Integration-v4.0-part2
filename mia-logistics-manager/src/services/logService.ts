const API_BASE_URL = 'http://localhost:5050/api';

export type LogPayload = {
  userId?: string;
  email?: string;
  action: string;
  resource?: string;
  details?: string;
};

export const logService = {
  async init(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/logs/init`, { method: 'POST' });
    } catch {}
  },

  async write(payload: LogPayload): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}
  },

  async logout(payload: { userId?: string; email?: string }): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {}
  },
};

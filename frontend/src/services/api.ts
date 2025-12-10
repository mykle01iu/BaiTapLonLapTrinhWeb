// src/services/api.ts
import type { Transaction, CategoryBudget, UserInfo } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔗 API_URL configured:', API_URL);

// Helper function để lấy token từ localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth-token');
};

// Helper function để tạo headers với authentication
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Handle API errors
const handleResponse = async (response: Response) => {
  let data;
  
  try {
    data = await response.json();
  } catch (parseError) {
    console.error('❌ Failed to parse response:', parseError);
    throw new Error('Invalid response from server');
  }
  
  if (!response.ok) {
    console.error('❌ API Error:', response.status, data?.message || 'Unknown error');
    throw new Error(data?.message || `HTTP ${response.status}: Something went wrong`);
  }
  
  console.log('✅ API Success:', response.status, data);
  return data;
};

// ============= AUTH API =============

export const authAPI = {
  register: async (
    username: string,
    password: string,
    email?: string,
    acceptTerms?: boolean
  ) => {
    console.log('📤 Registering user:', { username, email, acceptTerms });
    console.log('📍 Fetch URL:', `${API_URL}/auth/register`);
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          email,
          acceptTerms: acceptTerms || false
        })
      });

      console.log('📥 Response received:', response.status, response.statusText);

      const data = await handleResponse(response);

      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }

      return data;
    } catch (error: any) {
      console.error('❌ Register failed:', error.message);
      console.error('❌ Full error:', error);
      throw error;
    }
  },

  login: async (username: string, password: string) => {
    console.log('📤 Logging in user:', { username });
    console.log('📍 Fetch URL:', `${API_URL}/auth/login`);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      console.log('📥 Response received:', response.status, response.statusText);

      const data = await handleResponse(response);

      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem('auth-token', data.token);
      }

      return data;
    } catch (error: any) {
      console.error('❌ Login failed:', error.message);
      console.error('❌ Full error:', error);
      throw error;
    }
  },

  requestPasswordReset: async (email: string) => {
    const response = await fetch(`${API_URL}/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    return handleResponse(response);
  },

  validateResetToken: async (token: string) => {
    const response = await fetch(`${API_URL}/password-reset/validate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    return handleResponse(response);
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/password-reset/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });

    return handleResponse(response);
  },

  getCurrentUser: async (): Promise<{ success: boolean; user: UserInfo }> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders()
    });

    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem('auth-token');
  }
};

// ============= TRANSACTION API =============

export const transactionAPI = {
  getAll: async (): Promise<{ success: boolean; transactions: Transaction[] }> => {
    const response = await fetch(`${API_URL}/transactions`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  create: async (transaction: Omit<Transaction, 'id'>): Promise<{ success: boolean; transaction: Transaction }> => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    
    return handleResponse(response);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};

// ============= BUDGET API =============

export const budgetAPI = {
  getAll: async (): Promise<{ success: boolean; budgets: CategoryBudget[] }> => {
    const response = await fetch(`${API_URL}/budgets`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  },

  create: async (budget: CategoryBudget): Promise<{ success: boolean; budget: CategoryBudget }> => {
    const response = await fetch(`${API_URL}/budgets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(budget)
    });
    
    return handleResponse(response);
  },

  update: async (id: string, budget: Partial<CategoryBudget>): Promise<{ success: boolean; budget: CategoryBudget }> => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(budget)
    });
    
    return handleResponse(response);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
};
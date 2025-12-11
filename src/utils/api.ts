import { projectId, publicAnonKey } from './supabase/info.tsx';
import { supabase } from './supabase/client';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-743362cc`;

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || publicAnonKey;
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Transactions API
export const transactionsApi = {
  getAll: () => apiCall('/transactions'),
  create: (data: any) => apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: any) => apiCall(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => apiCall(`/transactions/${id}`, {
    method: 'DELETE'
  })
};

// Categories API
export const categoriesApi = {
  getAll: () => apiCall('/categories'),
  create: (data: any) => apiCall('/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: any) => apiCall(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => apiCall(`/categories/${id}`, {
    method: 'DELETE'
  })
};

// Budgets API
export const budgetsApi = {
  getAll: () => apiCall('/budgets'),
  create: (data: any) => apiCall('/budgets', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: any) => apiCall(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => apiCall(`/budgets/${id}`, {
    method: 'DELETE'
  })
};

// Goals API
export const goalsApi = {
  getAll: () => apiCall('/goals'),
  create: (data: any) => apiCall('/goals', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: any) => apiCall(`/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => apiCall(`/goals/${id}`, {
    method: 'DELETE'
  })
};

// Reminders API
export const remindersApi = {
  getAll: () => apiCall('/reminders'),
  create: (data: any) => apiCall('/reminders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id: string, data: any) => apiCall(`/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id: string) => apiCall(`/reminders/${id}`, {
    method: 'DELETE'
  })
};

// Profile API
export const profileApi = {
  get: () => apiCall('/profile'),
  update: (data: any) => apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};
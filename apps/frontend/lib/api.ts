import { createClient } from './supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (response.status === 401) {
    throw new Error(data.detail || 'Unauthorized');
  }

  if (!response.ok) {
    const errorMessage = data.error?.message || data.detail || 'API request failed';
    throw new Error(`${errorMessage} (${response.status})`);
  }

  return data;
}

export const analysisApi = {
  upload: async (formData: FormData) => {
    return fetchWithAuth('/analyses/', {
      method: 'POST',
      body: formData,
    });
  },
  getHistory: async (limit = 10, offset = 0) => {
    return fetchWithAuth(`/analyses/?limit=${limit}&offset=${offset}`);
  },
  getDetail: async (id: string) => {
    return fetchWithAuth(`/analyses/${id}`);
  },
  getUsageStats: async () => {
    return fetchWithAuth(`/analyses/stats/usage`);
  }
};

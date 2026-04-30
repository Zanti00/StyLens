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

  if (!response.ok) {
    throw new Error(data.error?.message || 'API request failed');
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
  }
};

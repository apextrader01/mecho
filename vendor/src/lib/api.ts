const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function vendorApiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('shortedge_vendor_token') : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

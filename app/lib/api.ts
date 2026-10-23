
const API_BASE_URL = 'http://localhost:8001';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('studyflow_token')
      : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ?? `Request failed with status ${response.status}`;

    throw new Error(
      typeof message === 'string' ? message : JSON.stringify(message)
    );
  }

  return data;
}

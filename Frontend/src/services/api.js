const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'string' && data) ||
      'Something went wrong';

    throw new Error(message);
  }

  return data;
}

export function authApi() {
  return {
    login: (email, password) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request('/api/auth/me'),
  };
}

export function bankingApi() {
  return {
    getAccounts: ({ all = false, search = '' } = {}) => {
      const params = new URLSearchParams();
      if (all) params.set('all', 'true');
      if (search) params.set('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request(`/api/accounts${query}`);
    },
    getTransferTargets: (search = '') => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request(`/api/accounts/transfer-targets${query}`);
    },
    createAccount: (payload) =>
      request('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateAccount: (accountId, payload) =>
      request(`/api/accounts/${accountId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    deleteAccount: (accountId) =>
      request(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      }),
    getTransactions: () => request('/api/transactions'),
    getBalance: (accountId) => request(`/api/accounts/${accountId}/balance`),
    createTransfer: (payload) =>
      request('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    createInitialFunds: (payload) =>
      request('/api/transactions/initial-funds', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  };
}

export function adminApi() {
  return {
    getUsers: (search = '') => {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      return request(`/api/admin/users${query}`);
    },
    createUser: (payload) =>
      request('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateUser: (userId, payload) =>
      request(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    deleteUser: (userId) =>
      request(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      }),
  };
}

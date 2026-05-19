const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to make authenticated API requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('Server error. Please try again.');
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.data = data; // Extra info like needsVerification
    throw error;
  }

  return data;
};

// Auth API calls
export const authAPI = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body) => apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  resendOtp: (body) => apiRequest('/auth/resend-otp', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => apiRequest('/auth/profile'),
  updateProfile: (body) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

// Chat API calls
export const chatAPI = {
  getChats: () => apiRequest('/chats'),
  getChat: (id) => apiRequest(`/chats/${id}`),
  createChat: () => apiRequest('/chats', { method: 'POST' }),
  deleteChat: (id) => apiRequest(`/chats/${id}`, { method: 'DELETE' }),
  renameChat: (id, title) =>
    apiRequest(`/chats/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
  sendMessage: (id, content) =>
    apiRequest(`/chats/${id}/message`, { method: 'POST', body: JSON.stringify({ content }) }),
  sendImageMessage: (id, formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/chats/${id}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      return data;
    });
  },
};

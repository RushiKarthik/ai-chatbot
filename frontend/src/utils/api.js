

// FORCE THE PRODUCTION RENDER SERVER ROOT DIRECTLY
const API_URL = 'https://ai-chatbot-4-7r46.onrender.com';

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
    error.data = data;
    throw error;
  }

  return data;
};

// Auth API calls — Mapped with /api/auth
export const authAPI = {
  register: (body) => apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body) => apiRequest('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  resendOtp: (body) => apiRequest('/api/auth/resend-otp', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => apiRequest('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => apiRequest('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getProfile: () => apiRequest('/api/auth/profile'),
  updateProfile: (body) => apiRequest('/api/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

// Chat API calls — Mapped with /api/chats
export const chatAPI = {
  getChats: () => apiRequest('/api/chats'),
  getChat: (id) => apiRequest(`/api/chats/${id}`),
  createChat: () => apiRequest('/api/chats', { method: 'POST' }),
  deleteChat: (id) => apiRequest(`/api/chats/${id}`, { method: 'DELETE' }),
  renameChat: (id, title) =>
    apiRequest(`/api/chats/${id}`, { method: 'PUT', body: JSON.stringify({ title }) }),
  sendMessage: (id, content) =>
    apiRequest(`/api/chats/${id}/message`, { method: 'POST', body: JSON.stringify({ content }) }),
  sendImageMessage: (id, formData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_URL}/api/chats/${id}/image`, {
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
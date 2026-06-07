import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
};

export const chatAPI = {
    getSessions: () => api.get('/chat/sessions'),
    createSession: (title) => api.post('/chat/sessions', { title }),
    getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
    sendMessage: (sessionId, message) => api.post('/chat', { sessionId, message }),
};

export default api;

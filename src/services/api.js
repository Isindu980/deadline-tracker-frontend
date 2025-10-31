import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to get current token
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

//Request interceptor 
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

//Response interceptor
api.interceptors.response.use((response) => {
    // Return the full response object so components can access response.data
    return response;
}, (error) => {
    if (error.response?.status === 401) {
        // Token expired or invalid
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }
    
    if (error.response) {
        // Attach the user-friendly message to the error for easy access
        const userMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
        error.userMessage = userMessage;
    } else {
        error.userMessage = 'Network error. Please check your connection.';
    }
    return Promise.reject(error);
});

const apiClient = {
    get: (endpoint, config) => api.get(endpoint, config),
    post: (endpoint, data, config) => api.post(endpoint, data, config),
    put: (endpoint, data, config) => api.put(endpoint, data, config),
    delete: (endpoint, config) => api.delete(endpoint, config),
    patch: (endpoint, data, config) => api.patch(endpoint, data, config),
};

export default apiClient;
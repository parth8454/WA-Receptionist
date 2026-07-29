import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
});

// Auto attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto redirect to login if token expired
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('shop');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const registerShop = (data) => api.post('/auth/register', data);
export const loginShop = (data) => api.post('/auth/login', data);

// Shop
export const connectWhatsApp = (shopId) => api.get(`/shop/connect/${shopId}`);
export const updateSettings = (data) => api.put('/shop/settings', data);
export const disconnectWhatsApp = (shopId) => api.post('/shop/disconnect', { shopId });

// Catalog
export const getProducts = (shopId) => api.get(`/shop/catalog/${shopId}`);
export const addProduct = (data) => api.post('/shop/products', data);
export const deleteProduct = (id) => api.delete(`/shop/products/${id}`);
export const updateProduct = (id, data) => api.put(`/shop/products/${id}`, data);

// Broadcast
export const sendBroadcast = (data) => api.post('/shop/broadcast', data);
export const getStats = (shopId) => api.get(`/shop/stats/${shopId}`);

// Appointments
export const getAppointments = (shopId) => api.get(`/shop/appointments/${shopId}`);
export const getLeads = (shopId) => api.get(`/shop/leads/${shopId}`);
export const updateLeadStatus = (id, data) => api.put(`/shop/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/shop/leads/${id}`);

export default api;
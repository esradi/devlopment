const API_BASE_URL = 'http://127.0.0.1:8000/api';
import * as mockData from './mockData';


const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: getHeaders()
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Unauthorized access - redirecting to login');
                }
                throw new Error(`API Error: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.warn(`Backend unreachable at ${endpoint}, using mock data...`, error);
            
            // Failover to mock data
            if (endpoint.includes('/auth/me/')) return mockData.mockUserData;
            if (endpoint.includes('/applications/')) return mockData.mockApplications;
            
            // Distinguish between single offer and full list
            if (endpoint.match(/\/offers\/\d+/)) {
                const id = parseInt(endpoint.split('/').filter(Boolean).pop(), 10);
                const offer = mockData.mockRecommendations.find(o => o.id === id);
                if (offer) return offer;
                throw new Error('Offer not found');
            } else if (endpoint.includes('/offers/')) {
                return mockData.mockRecommendations;
            }
            
            if (endpoint.includes('/matching/')) return mockData.mockMatchBreakdown;
            
            throw error;
        }
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    }
};

export const dashboardService = {
    getMe: () => api.get('/auth/me/'),
    getRecentApplications: () => api.get('/applications/'),
    getRecommendations: () => api.get('/offers/'),
    getOfferDetails: (id) => api.get(`/offers/${id}/`),
    getMatchingBreakdown: (studentId, offerId) =>
        api.get(`/matching/?student_id=${studentId}&offer_id=${offerId}`),
    updateProfile: (data) => api.post('/profile/update/', data),
};

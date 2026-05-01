const API_BASE_URL = 'http://127.0.0.1:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.warn('Unauthorized access - redirecting to login');
                // Optional: handle redirection or token refresh here
            }
            throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
    },

    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    },

    async put(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok && response.status !== 204) throw new Error(`API Error: ${response.status}`);
        return response.status === 204 ? null : response.json();
    }
};

export const authService = {
    login: (credentials) => api.post('/auth/login/', credentials),
    signup: (userData) => api.post('/auth/signup/', userData),
    getMe: () => api.get('/auth/me/'),
};

export const studentService = {
    getProfile: () => api.get('/students/profile/'),
    updateProfile: (data) => api.put('/students/profile/', data),
    getDashboard: () => api.get('/student/dashboard/'),
    getAnalytics: () => api.get('/student/analytics/'),
    getRecommendations: () => api.get('/student/recommendations/'),
    getCompetencies: () => api.get('/student/competencies/'),
    uploadCV: (formData) => {
        const token = localStorage.getItem('access_token');
        return fetch(`${API_BASE_URL}/student/profile/upload-cv/`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        }).then(res => res.json());
    },
    uploadPicture: (formData) => {
        const token = localStorage.getItem('access_token');
        return fetch(`${API_BASE_URL}/student/profile/upload-picture/`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        }).then(res => res.json());
    }
};

export const companyService = {
    getDashboard: () => api.get('/company/dashboard/'),
    getMineOffers: () => api.get('/offers/mine/'),
    createOffer: (data) => api.post('/offers/', data),
    getOfferOptions: () => api.get('/offers/options/'),
    getOfferApplicants: (offerId) => api.get(`/applications/offer/${offerId}/`),
    updateApplicationStatus: (id, status) => api.post(`/applications/${id}/update-status/`, { status }),
};

export const offerService = {
    getAll: () => api.get('/offers/'),
    getDetails: (id) => api.get(`/offers/${id}/`),
    toggleFavorite: (id) => api.post(`/offers/${id}/favorite/`),
};

export const applicationService = {
    apply: (offerId) => api.post('/offers/applications/', { offer: offerId }),
    getMine: () => api.get('/applications/'),
    getDetails: (id) => api.get(`/applications/${id}/`),
};

export const quizService = {
    getQuiz: (id) => api.get(`/quizzes/${id}/`),
    submitQuiz: (id, answers) => api.post(`/quizzes/${id}/submit/`, { answers }),
};

// Alias for backwards compatibility if needed
export const dashboardService = studentService;

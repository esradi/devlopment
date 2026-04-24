const API_BASE_URL = 'http://localhost:8000/api';

const getHeaders = (isFormData = false, includeAuth = true) => {
    const token = localStorage.getItem('access_token');
    const headers = {};
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    if (includeAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    async get(endpoint, includeAuth = true) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getHeaders(false, includeAuth)
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

    async post(endpoint, data, includeAuth = true) {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(isFormData, includeAuth),
            body: isFormData ? data : JSON.stringify(data)
        });
        if (!response.ok) {
            const errDetails = await response.text();
            throw new Error(`API Error: ${response.status} - ${errDetails}`);
        }
        return response.json();
    },

    async put(endpoint, data) {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(isFormData),
            body: isFormData ? data : JSON.stringify(data)
        });
        if (!response.ok) {
            const errDetails = await response.text();
            throw new Error(`API Error: ${response.status} - ${errDetails}`);
        }
        return response.json();
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok && response.status !== 204) throw new Error(`API Error: ${response.status}`);
        return response.status === 204 ? null : response.json();
    },

    async patch(endpoint, data) {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(isFormData),
            body: isFormData ? data : JSON.stringify(data)
        });
        if (!response.ok) {
            const errDetails = await response.text();
            throw new Error(`API Error: ${response.status} - ${errDetails}`);
        }
        return response.json();
    }
};

export const authService = {
    login: (credentials) => api.post('/login/', credentials, false),
    signup: (userData) => api.post('/register/', userData, false),
    verifyEmail: (data) => api.post('/verify-email/', data, false),
    getMe: () => api.get('/auth/me/'),
    updateMe: (data) => api.patch('/auth/me/', data),
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
    getOffers: () => api.get('/offers/mine/'),
    createOffer: (data) => api.post('/offers/', data),
    getOfferOptions: () => api.get('/offers/metadata/'),
    getOfferDetails: (id) => api.get(`/offers/${id}/`),
    updateOffer: (id, data) => api.put(`/offers/${id}/`, data),
    deleteOffer: (id) => api.delete(`/offers/${id}/`),
    getOfferApplicants: (offerId) => api.get(`/applications/offer/${offerId}/`),
    getApplications: (params = {}) => api.get('/applications/company/list/', params),
    getApplicationDetails: (id) => api.get(`/applications/${id}/company/detail/`),
    updateApplicationStatus: (id, status) => {
        if (status === 'accepted') return api.post(`/applications/${id}/accept/`);
        if (status === 'rejected') return api.post(`/applications/${id}/refuse/`);
        return api.post(`/applications/${id}/view/`); // Example of other action
    },
    getProfile: () => api.get('/company/profile/'),
    updateProfile: (data) => api.patch('/company/profile/', data),
    generateConvention: (id) => api.post(`/applications/${id}/generate-convention/`),
};

export const conventionService = {
    getConventions: () => api.get('/conventions/'),
    getDetails: (id) => api.get(`/conventions/${id}/`),
    signCompany: (id, webauthnResponse) => api.post(`/conventions/${id}/sign-company/`, { 
        confirmed: true, 
        webauthn_response: webauthnResponse 
    }),
    download: (id) => `${API_BASE_URL}/conventions/${id}/download/`,
};

export const offerService = {
    getAll: () => api.get('/offers/'),
    getDetails: (id) => api.get(`/offers/${id}/`),
    toggleFavorite: (id) => api.post(`/offers/${id}/toggle-favorite/`),
};

export const applicationService = {
    apply: (offerId, coverLetter) => api.post('/applications/', { offer: offerId, cover_letter: coverLetter }),
    getMine: () => api.get('/applications/mine/'),
    getDetails: (id) => api.get(`/applications/${id}/`),
};

export const quizService = {
    getQuiz: (id) => api.get(`/quizzes/${id}/`),
    submitQuiz: (id, answers) => api.post(`/quizzes/${id}/submit/`, { answers }),
};

export const messageService = {
    getAll: () => api.get('/messages/'),
    create: (data) => api.post('/messages/', data),
};

export const interviewService = {
    getAll: () => api.get('/interviews/'),
    getDetails: (id) => api.get(`/interviews/${id}/`),
    create: (data) => api.post('/interviews/', data),
    update: (id, data) => api.put(`/interviews/${id}/`, data),
    delete: (id) => api.delete(`/interviews/${id}/`),
};

// Alias for backwards compatibility if needed
export const dashboardService = studentService;

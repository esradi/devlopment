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
const handleApiError = async (response) => {
    let errorMessage = `API Error: ${response.status}`;
    try {
        const text = await response.text();
        if (!text) throw new Error(errorMessage);
        try {
            const errorData = JSON.parse(text);
            if (errorData.detail) errorMessage = errorData.detail;
            else if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
            else if (errorData.error) errorMessage = errorData.error;
            else if (typeof errorData === 'object') {
                const firstKey = Object.keys(errorData)[0];
                const firstError = errorData[firstKey];
                if (Array.isArray(firstError)) errorMessage = `${firstKey}: ${firstError[0]}`;
                else if (typeof firstError === 'string') errorMessage = firstError;
                else errorMessage = text;
            } else errorMessage = text;
        } catch (e) {
            errorMessage = text;
        }
    } catch (e) { }
    throw new Error(errorMessage);
};

export const api = {
    // async get(endpoint, includeAuth = true) {
    //     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    //         headers: getHeaders(false, includeAuth)
    //     });
    //     if (!response.ok) {
    //         if (response.status === 401) {
    //             console.warn('Unauthorized access - redirecting to login');
    //         }
    //         await handleApiError(response);
    //     }
    //     return response.json();
    // },
    async get(endpoint, paramsOrAuth = true) {
        let includeAuth = true;
        let url = `${API_BASE_URL}${endpoint}`;

        if (typeof paramsOrAuth === 'object') {
            const queryString = new URLSearchParams(paramsOrAuth).toString();
            if (queryString) url += `?${queryString}`;
        } else {
            includeAuth = paramsOrAuth;
        }

        const response = await fetch(url, {
            headers: getHeaders(false, includeAuth)
        });
        if (!response.ok) {
            if (response.status === 401) console.warn('Unauthorized access');
            await handleApiError(response);
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
            await handleApiError(response);
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
            await handleApiError(response);
        }
        return response.json();
    },

    async delete(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok && response.status !== 204) await handleApiError(response);
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
            await handleApiError(response);
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
    getCompetencies: () => api.get('/student/skills/'),
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
    getOfferDetails: (id) => api.get(`/offers/${id}/`),
    updateOffer: (id, data) => api.put(`/offers/${id}/`),
    deleteOffer: (id) => api.delete(`/offers/${id}/`),
    getOfferApplicants: (offerId) => api.get(`/applications/offer/${offerId}/`),
    getApplications: (params = {}) => api.get('/applications/company/list/', params),
    getApplicationDetails: (id) => api.get(`/applications/${id}/company/detail/`),
    updateApplicationStatus: (id, status) => {
        if (status === 'accepted') return api.post(`/applications/${id}/accept/`);
        if (status === 'rejected') return api.post(`/applications/${id}/refuse/`);
        return api.post(`/applications/${id}/view/`);
    },
    getProfile: () => api.get('/company/profile/'),
    updateProfile: (data) => api.patch('/company/profile/update/', data),
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
    toggleFavorite: (id) => api.post(`/offers/${id}/favorite/`),
};

export const applicationService = {
    apply: (offerId, coverLetter) => api.post('/applications/', { offer: offerId, cover_letter: coverLetter }),
    getMine: () => api.get('/applications/mine/'),
    getDetails: (id) => api.get(`/applications/${id}/`),
};

export const quizService = {
    getQuiz: (id) => api.get(`/quizzes/${id}/`),
    submitQuiz: (id, answers) => api.post(`/quizzes/${id}/submit/`, { answers }),
    getAvailableQuizzes: () => api.get('/student/quizzes/available/'),
    getQuizDetails: (id) => api.get(`/student/quizzes/${id}/`),
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

export const notificationService = {
    getAll: () => api.get('/notifications/'),
    getUnreadCount: () => api.get('/notifications/unread_count/'),
    markRead: (id) => api.post(`/notifications/${id}/mark_read/`),
    markAllRead: () => api.post('/notifications/mark_all_read/'),
};

export const adminService = {
    getDashboard: () => api.get('/admin/dashboard/'),
    getUsers: (role) => api.get(role ? `/admin/users/?role=${role}` : '/admin/users/'),
    getUserActivity: (id) => api.get(`/admin/users/${id}/activity/`),
    verifyUser: (id) => api.post(`/admin/users/${id}/verify/`),
    updateUserStatus: (id, data) => api.post(`/admin/users/${id}/status/`, data),

    getCompanies: () => api.get('/admin/companies/'),
    verifyCompany: (id) => api.post(`/admin/companies/${id}/verify/`),
    rejectCompany: (id, reason) => api.post(`/admin/companies/${id}/reject/`, { reason }),

    getValidations: (status) => api.get(status ? `/admin/internships/?status=${status}` : '/admin/internships/'),
    getValidationDetails: (id) => api.get(`/admin/validations/${id}/`),
    approveValidation: (id, data) => api.post(`/admin/internships/${id}/validate/`, { ...data, status: 'approved' }),
    rejectValidation: (id, data) => api.post(`/admin/internships/${id}/validate/`, { ...data, status: 'rejected' }),

    getPortfolios: (status) => api.get(status ? `/admin/portfolios/?status=${status}` : '/admin/portfolios/'),
    reviewPortfolio: (id, data) => api.post(`/admin/portfolios/${id}/review/`, data),

    getAnalytics: () => api.get('/admin/analytics/'),
    getAlerts: () => api.get('/admin/alerts/'),
    getActivityFeed: () => api.get('/admin/activities/'),
    getSpecialities: () => api.get('/admin/specialities/'),

    exportUsers: (role) => api.get(role ? `/admin/users/export/?role=${role}` : '/admin/users/export/'),
    search: (query) => api.get(`/admin/search/?q=${query}`),
};

// Alias for backwards compatibility if needed
export const dashboardService = studentService;

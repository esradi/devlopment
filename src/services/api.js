import { API_URL } from '../config';

const API_BASE_URL = `${API_URL}/api`;

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
            else if (errorData.error) {
                errorMessage = errorData.error;
                if (errorData.reason) errorMessage += `|REASON|${errorData.reason}`;
            }
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
    async get(endpoint, options = true) {
        const includeAuth = typeof options === 'boolean' ? options : (options.includeAuth !== false);
        const responseType = typeof options === 'object' ? options.responseType : 'json';
        const params = typeof options === 'object' ? options.params : null;

        let url = `${API_BASE_URL}${endpoint}`;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, val]) => {
                if (val !== undefined && val !== null) searchParams.append(key, val);
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString;
            }
        }

        const response = await fetch(url, {
            headers: getHeaders(false, includeAuth)
        });

        if (!response.ok) {
            if (response.status === 401) console.warn('Unauthorized access');
            await handleApiError(response);
        }

        if (responseType === 'blob') return response.blob();
        return response.json();
    },

    async post(endpoint, data, options = true) {
        const includeAuth = typeof options === 'boolean' ? options : (options.includeAuth !== false);
        const responseType = typeof options === 'object' ? options.responseType : 'json';

        const isFormData = data instanceof FormData;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(isFormData, includeAuth),
            body: isFormData ? data : JSON.stringify(data)
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        if (responseType === 'blob') return response.blob();
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

    // Webauthn methods
    getWebauthnRegistrationOptions: () => api.post('/webauthn/register/options/', {}),
    verifyWebauthnRegistration: (data) => api.post('/webauthn/register/verify/', data),
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
    updateOffer: (id, data) => api.put(`/offers/${id}/`, data),
    deleteOffer: (id) => api.delete(`/offers/${id}/`),
    getOfferApplicants: (offerId, params = {}) => api.get(`/applications/offer/${offerId}/`, { params }),
    getApplications: (params = {}) => api.get('/applications/company/list/', { params }),
    getApplicationDetails: (id) => api.get(`/applications/${id}/company/detail/`),
    updateApplicationStatus: (id, status) => {
        if (status === 'accepted') return api.post(`/applications/${id}/accept/`);
        if (status === 'rejected') return api.post(`/applications/${id}/refuse/`);
        return api.post(`/applications/${id}/view/`);
    },
    getProfile: () => api.get('/company/profile/'),
    updateProfile: (data) => api.put('/company/profile/', data),
    generateConvention: (id) => api.post(`/applications/${id}/generate-convention/`),
    getConventionStats: () => api.get('/company/conventions/stats/'),
    getAcceptedInterns: () => api.get('/applications/company/list/', { params: { status: 'accepted' } }),
    // uploadLogo: (formData) => api.patch('/company/profile/', formData),
    uploadLogo: (formData) => api.post('/company/profile/logo/', formData),
    getAnalytics: () => api.get('/company/analytics/'),
};

export const referenceService = {
    getReferences: () => api.get('/references/'),
    getDetails: (id) => api.get(`/references/${id}/`),
    create: (data) => api.post('/references/', data),
    sign: (id) => api.post(`/references/${id}/sign/`),
};

export const conventionService = {
    getConventions: () => api.get('/conventions/'),
    getDetails: (id) => api.get(`/conventions/${id}/`),
    signStudent: (id, payload) => api.post(`/conventions/${id}/sign-student/`,
        payload.manual ? { ...payload, confirmed: true } : { confirmed: true, webauthn_response: payload }
    ),
    signCompany: (id, payload) => api.post(`/conventions/${id}/sign-company/`,
        payload.manual ? { ...payload, confirmed: true } : { confirmed: true, webauthn_response: payload }
    ),
    validateAdmin: (id, payload) => api.post(`/conventions/${id}/validate_admin/`,
        payload.manual ? payload : { webauthn_response: payload }
    ),
    download: (id, vCode) => vCode
        ? `${API_BASE_URL}/conventions/${id}/download/?v=${vCode}`
        : `${API_BASE_URL}/conventions/${id}/download/`,
    notifyReminder: (id, target) => api.post(`/conventions/${id}/notify-reminder/`, { target }),
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
    getAvailableQuizzes: () => api.get('/challenges/skillchallenge/'),
    getQuizDetails: (id) => api.get(`/challenges/skillchallenge/${id}/`),
};

export const messageService = {
    getAll: () => api.get('/messages/'),
    create: (data) => api.post('/messages/', data),
    getUnreadCount: () => api.get('/messages/unread_count/'),
    markRead: (senderId) => api.post('/messages/mark_read/', { sender_id: senderId }),
    getContacts: () => api.get('/admin/users/'), // Admins can message any user
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
    getUnreadCount: () => api.get('/notifications/unread-count/'),
    markRead: (id) => api.post(`/notifications/${id}/mark-read/`),
    markAllRead: () => api.post('/notifications/mark_all_read/'),
};

export const adminService = {
    getDashboard: () => api.get('/admin/dashboard/'),
    getUsers: (params) => api.get('/admin/users/', { params }),
    getUserActivity: (id) => api.get(`/admin/users/${id}/activity/`),
    verifyUser: (id) => api.post(`/admin/users/${id}/verify/`),
    updateUserStatus: (id, data) => api.post(`/admin/users/${id}/status/`, data),

    getCompanies: (params) => api.get('/admin/companies/', { params }),
    verifyCompany: (id) => api.post(`/admin/companies/${id}/verify/`),
    rejectCompany: (id, reason) => api.post(`/admin/companies/${id}/reject/`, { reason }),

    getValidations: (params) => api.get('/admin/applications/', { params }),
    getValidationDetails: (id) => api.get(`/admin/applications/${id}/`),
    getConventionStats: () => api.get('/admin/applications/stats/'),
    exportApplications: (params) => api.get('/admin/applications/export/', { params, responseType: 'blob' }),
    autoSignAllConventions: () => api.post('/admin/applications/auto_sign_all/'),
    signAllForApplication: (id) => api.post(`/admin/applications/${id}/sign_all_for_application/`),
    initConvention: (id) => api.post(`/admin/applications/${id}/init_convention/`),
    acceptApplication: (id) => api.post(`/admin/applications/${id}/accept_application/`),
    rejectApplication: (id, reason) => api.post(`/admin/applications/${id}/reject_application/`, { reason }),
    bulkDelete: (ids) => api.post('/admin/applications/bulk_delete/', { ids }),
    bulkAccept: (ids) => api.post('/admin/applications/bulk_accept/', { ids }),
    bulkSign: (ids) => api.post('/admin/applications/bulk_sign/', { ids }),
    activateUser: (id) => api.post(`/admin/users/${id}/activate/`),

    getAdminChallenges: (params) => api.get('/admin/challenges/', { params }),

    getAnalytics: () => api.get('/admin/analytics/'),
    getAlerts: () => api.get('/admin/alerts/'),
    getActivityFeed: () => api.get('/admin/activities/'),
    getSpecialities: () => api.get('/admin/specialities/'),

    exportUsers: async (role) => {
        const token = localStorage.getItem('access_token');
        const url = role
            ? `${API_BASE_URL}/admin/users/export/?role=${role}`
            : `${API_BASE_URL}/admin/users/export/`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Export failed with status ${response.status}`);
        }
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'students_export.xlsx';
        link.click();
        URL.revokeObjectURL(link.href);
    },
    search: (query) => api.get(`/admin/search/?q=${query}`),
};

export const dashboardService = studentService;

export const groupService = {
    getAll: () => api.get('/groups/groups/'),
    create: (data) => api.post('/groups/groups/', data),
    join: (id) => api.post(`/groups/groups/${id}/join/`),
    leave: (id) => api.post(`/groups/groups/${id}/leave/`),
    getMessages: (id) => api.get(`/groups/groups/${id}/messages/`),
    sendMessage: (id, data) => api.post(`/groups/groups/${id}/messages/`, data),
};

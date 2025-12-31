import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // Change this to your FastAPI backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
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

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (token) => api.post('/auth/google', { token }),
};

// Candidate APIs
export const candidateAPI = {
  uploadResume: (formData) => {
    return api.post('/candidate/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getProfile: () => api.get('/candidate/profile'),
  getRecommendedJobs: () => api.get('/candidate/recommended-jobs'),
  getSkillGaps: (jobId) => api.get(`/candidate/skill-gaps/${jobId}`),
};

// Recruiter APIs
export const recruiterAPI = {
  createJob: (data) => api.post('/recruiter/jobs', data),
  getJobs: () => api.get('/recruiter/jobs'),
  getJobCandidates: (jobId) => api.get(`/recruiter/jobs/${jobId}/candidates`),
  getDashboardStats: () => api.get('/recruiter/dashboard/stats'),
  generateQuestions: (jobId) => api.post(`/recruiter/jobs/${jobId}/interview-questions`),
};

export default api;
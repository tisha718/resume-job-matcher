import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* -------------------- REQUEST INTERCEPTOR -------------------- */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------- RESPONSE INTERCEPTOR -------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);

      if (error.response.status === 401) {
        console.warn('401 received – token may be invalid');

        // DO NOT auto-logout during initial app load or signup
        if (window.location.pathname !== '/login' &&
            window.location.pathname !== '/signup') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }

    }
    return Promise.reject(error);
  }
);

/* ==================== AUTH APIs ==================== */
export const authAPI = {
  // OAuth2PasswordRequestForm
  login: (formData) =>
    api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }),

  // Query params signup
  signup: (params) =>
    api.post('/signup', null, { params }),

  logout: () => api.post('/logout'),
};

/* ==================== RESUME APIs ==================== */
export const resumeAPI = {
  uploadResume: (file, userId) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('user_id', userId);

    return api.post('/candidate/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAllResumes: (userId) =>
    api.get('/candidate/resumes', { params: { user_id: userId } }),

  deleteResume: (resumeId, userId) =>
    api.delete(`/candidate/resume/${resumeId}`, {
      params: { user_id: userId },
    }),

  downloadResume: (resumeId, userId) =>
    api.get(`/candidate/resume/${resumeId}/download`, {
      params: { user_id: userId },
      responseType: 'blob',
    }),

  extractSkills: (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/resume/extract-skills', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

/* ==================== CANDIDATE APIs ==================== */
export const candidateAPI = {
  getRecommendedJobs: (userId, resumeId, limit = 5) =>
    api.get('/candidate/recommended-jobs', {
      params: { user_id: userId, resume_id: resumeId, limit },
    }),

  getJobSkillAnalysis: (jobId, userId, resumeId) =>
    api.get(`/candidate/jobs/${jobId}/skill-analysis`, {
      params: { user_id: userId, resume_id: resumeId },
    }),

  applyForJob: (jobId, userId, resumeId) =>
    api.post(`/candidate/jobs/${jobId}/apply`, null, {
      params: { user_id: userId, resume_id: resumeId },
    }),

  generateInterviewQuestions: (jobId, difficulty) =>
    api.get(`/candidate/jobs/${jobId}/prepare`, {
      params: { difficulty: difficulty.toLowerCase() },
    }),

  getAppliedJobs: (userId) =>
    api.get('/candidate/applications', {
      params: { user_id: userId },
    }),

  withdrawApplication: (applicationId) =>
    api.delete(`/candidate/${applicationId}/hard`),
};

/* ==================== ANALYTICS APIs ==================== */
export const applicationAPI = {
  getOverallFitScoreDistribution: () =>
    api.get('/analytics/overall-job-fit-score-distribution'),

  getApplicationsSummary: (jobId) =>
    api.get('/analytics/particular-job/applications-summary', {
      params: { job_id: jobId },
    }),

  getFitScoreDistribution: (jobId) =>
    api.get(`/analytics/${jobId}/fit-score-distribution`),

  getApplicationsForJob: (jobId) =>
    api.get(`/analytics/${jobId}/applications`),

  updateApplicationStatus: (applicationId, status) =>
    api.put(`/analytics/${applicationId}/status`, null, {
      params: { status },
    }),
};

/* ==================== RECRUITER APIs ==================== */
export const recruiterAPI = {
  getJobs: () => api.get('/recruiter/jobs'),

  getJobsByRecruiter: (recruiterId) =>
    api.get(`/recruiter/jobs/by-recruiter/${recruiterId}`),

  createJob: (payload) =>
    api.post('/recruiter/jobs/new', null, { params: payload }),

  updateJob: (jobId, payload) =>
    api.put(`/recruiter/jobs/${jobId}`, null, { params: payload }),

  deleteJob: (jobId) =>
    api.delete(`/recruiter/jobs/delete/${jobId}`),

  getJobCandidates: (jobId) =>
    api.get(`/recruiter/jobs/${jobId}/candidates`),

  getDashboardStats: () =>
    api.get('/recruiter/dashboard/stats'),

  generateQuestions: (jobId) =>
    api.post(`/recruiter/jobs/${jobId}/interview-questions`),
};

export default api;

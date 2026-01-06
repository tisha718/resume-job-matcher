import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001'; // Change this to your FastAPI backend URL

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

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      // Handle 401 Unauthorized - redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.request);
    } else {
      // Error in setting up request
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (token) => api.post('/auth/google', { token }),
};

// Resume Upload API
export const resumeAPI = {
  // Upload resume to Azure Blob + DB
  uploadResume: async (file, userId) => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('user_id', userId);
    
    return api.post('/api/candidate/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  // Get all resumes for user
  getAllResumes: (userId) => {
    return api.get(`/api/candidate/resumes?user_id=${userId}`);
  },
  
  // Delete resume
  deleteResume: (resumeId, userId) => {
    return api.delete(`/api/candidate/resume/${resumeId}?user_id=${userId}`);
  },

  // Extract skills from resume (stateless)
  extractSkills: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/resume/extract-skills', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};

// Candidate APIs
export const candidateAPI = {
  // Get recommended jobs for a resume
  getRecommendedJobs: (userId, resumeId, limit = 5) => {
    return api.get('/api/candidate/recommended-jobs', {
      params: { user_id: userId, resume_id: resumeId, limit }
    });
  },
  
  // Get skill analysis for a specific job
  getJobSkillAnalysis: (jobId, userId, resumeId) => {
    return api.get(`/api/candidate/jobs/${jobId}/skill-analysis`, {
      params: { user_id: userId, resume_id: resumeId }
    });
  },
  
  // Apply for a job
  applyForJob: (jobId, userId, resumeId) => {
    return api.post(`/api/candidate/jobs/${jobId}/apply`, null, {
      params: { user_id: userId, resume_id: resumeId }
    });
  },

  // Generate interview questions for a job
  generateInterviewQuestions: (jobId, difficulty) => {
    return api.get(`/api/candidate/jobs/${jobId}/prepare`, {
      params: { difficulty: difficulty.toLowerCase() }
    });
  },
};

// Recruiter APIs
export const recruiterAPI = {
  createJob: (data) => api.post('/api/recruiter/jobs', data),
  getJobs: () => api.get('/api/recruiter/jobs'),
  // NEW: fetch by recruiter id from your FastAPI route
  getJobsByRecruiter: (recruiterId) => api.get(`/api/recruiter/jobs/by-recruiter/10`),
  getJobCandidates: (jobId) => api.get(`/api/recruiter/jobs/${jobId}/candidates`),
  getDashboardStats: () => api.get('/api/recruiter/dashboard/stats'),
  generateQuestions: (jobId) => api.post(`/api/recruiter/jobs/${jobId}/interview-questions`),
};

export default api;
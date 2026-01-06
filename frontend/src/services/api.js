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

  // Download resume
  downloadResume: (resumeId, userId) => {
    return api.get(`/api/candidate/resume/${resumeId}/download`, {
      params: { user_id: userId },
      responseType: 'blob', // Important for file downloads
    });
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

  // Get all applied jobs for a user - FIXED PATH
  getAppliedJobs: (userId) => {
    return api.get('/api/candidate/api/candidate/applications', {
      params: { user_id: userId }
    });
  },

  // Withdraw application (hard delete)
  withdrawApplication: (applicationId) => {
    return api.delete(`/api/candidate/${applicationId}/hard`);
  },

  // Get job details by job ID
  getJobDetails: (jobId) => {
    return api.get(`/api/candidate/api/candidate/jobs/${jobId}`);
  },
};

// Application Analytics APIs
export const applicationAPI = {
  // Get applications summary for a particular job
  getApplicationsSummary: (jobId) => {
    return api.get('/application/analytics/particular-job/applications-summary', {
      params: { job_id: jobId }
    });
  },

  // Get fit score distribution for a job
  getFitScoreDistribution: (jobId) => {
    return api.get(`/application/analytics/${jobId}/fit-score-distribution`);
  },

  // Get all applications for a specific job with detailed scores
  getApplicationsForJob: (jobId) => {
    return api.get(`/application/analytics/${jobId}/applications`);
  },

  // Update application status
  updateApplicationStatus: (applicationId, status) => {
    return api.put(`/application/analytics/${applicationId}/status`, null, {
      params: { status }
    });
  },
};

// Recruiter APIs
export const recruiterAPI = {
  createJob: (data) => api.post('/recruiter/jobs', data),
  getJobs: () => api.get('/recruiter/jobs'),
  getJobCandidates: (jobId) => api.get(`/recruiter/jobs/${jobId}/candidates`),
  getDashboardStats: () => api.get('/recruiter/dashboard/stats'),
  generateQuestions: (jobId) => api.post(`/recruiter/jobs/${jobId}/interview-questions`),
};

// User APIs
export const userAPI = {
  // Get user details by user ID
  getUserDetails: (userId) => {
    return api.get(`/api/users/${userId}`);
  },
  
  // Batch get multiple users (if your backend supports it)
  getBatchUserDetails: (userIds) => {
    return api.post('/api/users/batch', { user_ids: userIds });
  },
  
  // Get user profile
  getUserProfile: () => {
    return api.get('/api/users/profile');
  },
  
  // Update user profile
  updateUserProfile: (data) => {
    return api.put('/api/users/profile', data);
  },
};

export default api;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Upload, FileText, Briefcase, TrendingUp, LogOut, User, Star
} from 'lucide-react';

import ResumeUpload from './ResumeUpload';
import MyProfile from './MyProfile';
import JobRecommendations from './JobRecommendations';

const CandidateDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load resumes from localStorage on mount
  useEffect(() => {
    const savedResumes = localStorage.getItem('uploadedResumes');
    if (savedResumes) {
      const resumes = JSON.parse(savedResumes);
      setUploadedResumes(resumes);
      if (resumes.length > 0 && !selectedResumeId) {
        setSelectedResumeId(resumes[0].id);
      }
    }
  }, []);

  // Save resumes to localStorage whenever they change
  useEffect(() => {
    if (uploadedResumes.length > 0) {
      localStorage.setItem('uploadedResumes', JSON.stringify(uploadedResumes));
    } else {
      localStorage.removeItem('uploadedResumes');
    }
  }, [uploadedResumes]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResumeUploaded = (newResume) => {
    setUploadedResumes(prev => [newResume, ...prev]);
    setSelectedResumeId(newResume.id);
    setActiveTab('profile');
  };

  const handleDeleteResume = (resumeId) => {
    const updatedResumes = uploadedResumes.filter(r => r.id !== resumeId);
    setUploadedResumes(updatedResumes);
    
    if (selectedResumeId === resumeId) {
      setSelectedResumeId(updatedResumes.length > 0 ? updatedResumes[0].id : null);
    }
  };

  const mockJobs = [
    { id: 1, title: 'Senior Full Stack Developer', company: 'TechCorp Inc.', location: 'Remote', type: 'Full-time', salary: '$80k-120k', matchScore: 0.92, posted: '2 days ago' },
    { id: 2, title: 'Backend Engineer', company: 'StartupXYZ', location: 'San Francisco', type: 'Full-time', salary: '$90k-130k', matchScore: 0.85, posted: '1 week ago' },
    { id: 3, title: 'DevOps Engineer', company: 'CloudSystems', location: 'New York', type: 'Contract', salary: '$70k-100k', matchScore: 0.78, posted: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-blue-100 text-sm">Candidate Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white text-gray-600 hover:shadow-md'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white text-gray-600 hover:shadow-md'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Resume</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white text-gray-600 hover:shadow-md'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>My Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'jobs'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white text-gray-600 hover:shadow-md'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Job Matches</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Uploaded Resumes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{uploadedResumes.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Job Matches</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{mockJobs.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg Match Score</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">85%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <ResumeUpload onResumeUploaded={handleResumeUploaded} />
        )}

        {activeTab === 'profile' && (
          <MyProfile
            uploadedResumes={uploadedResumes}
            selectedResumeId={selectedResumeId}
            onSelectResume={setSelectedResumeId}
            onDeleteResume={handleDeleteResume}
            onNavigateToUpload={() => setActiveTab('upload')}
          />
        )}

        {activeTab === 'jobs' && <JobRecommendations />}
      </div>
    </div>
  );
};

export default CandidateDashboard;
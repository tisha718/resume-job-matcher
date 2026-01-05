import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resumeAPI } from '../../services/api';
import { 
  Upload, FileText, Briefcase, TrendingUp, Star
} from 'lucide-react';

import DashboardNavbar from '../common/DashboardNavbar';
import StatCard from '../common/StatCard';
import ResumeUpload from './ResumeUpload';
import MyProfile from './MyProfile';
import JobRecommendations from './JobRecommendations';

const CandidateDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [resumeCount, setResumeCount] = useState(0);

  // Initialize history state on mount
  useEffect(() => {
    if (!window.history.state?.initialized) {
      window.history.replaceState(
        { initialized: true, tab: activeTab, page: 'candidate-dashboard' }, 
        '', 
        '/candidate-dashboard'
      );
    }
  }, []);

  useEffect(() => {
    fetchResumeCount();
  }, []);

  // Handle tab changes - push to history
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    window.history.pushState(
      { tab: newTab, page: 'candidate-dashboard' }, 
      '', 
      '/candidate-dashboard'
    );
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.page === 'candidate-dashboard') {
        if (event.state?.tab) {
          setActiveTab(event.state.tab);
        }
      } else {
        navigate(-1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  const fetchResumeCount = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;
      
      const response = await resumeAPI.getAllResumes(userId);
      setResumeCount(response.data.resumes?.length || 0);
    } catch (err) {
      console.error('Error fetching resume count:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleResumeUploaded = () => {
    fetchResumeCount();
  };

  const handleResumeDeleted = () => {
    fetchResumeCount();
  };

  const handleNavigateToJobs = () => {
    handleTabChange('jobs');
  };

  const handleNavigateToProfile = () => {
    handleTabChange('profile');
  };

  const mockJobs = [
    { id: 1, title: 'Senior Full Stack Developer', company: 'TechCorp Inc.', location: 'Remote', type: 'Full-time', salary: '$80k-120k', matchScore: 0.92, posted: '2 days ago' },
    { id: 2, title: 'Backend Engineer', company: 'StartupXYZ', location: 'San Francisco', type: 'Full-time', salary: '$90k-130k', matchScore: 0.85, posted: '1 week ago' },
    { id: 3, title: 'DevOps Engineer', company: 'CloudSystems', location: 'New York', type: 'Contract', salary: '$70k-100k', matchScore: 0.78, posted: '3 days ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar 
        userType="candidate"
        userName={user?.name || 'User'}
        onLogout={handleLogout}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => handleTabChange('overview')}
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
            onClick={() => handleTabChange('upload')}
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
            onClick={() => handleTabChange('jobs')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'jobs'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white text-gray-600 hover:shadow-md'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Job Matches</span>
          </button>
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-white text-gray-600 hover:shadow-md'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>My Profile</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Uploaded Resumes" 
                value={resumeCount} 
                icon={FileText}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                onClick={handleNavigateToProfile}
              />
              <StatCard 
                title="Job Matches" 
                value={mockJobs.length} 
                icon={Briefcase}
                bgColor="bg-green-100"
                iconColor="text-green-600"
              />
              <StatCard 
                title="Avg Match Score" 
                value="85%" 
                icon={Star}
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
              />
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <ResumeUpload 
            onResumeUploaded={handleResumeUploaded} 
            onNavigateToJobs={handleNavigateToJobs}
          />
        )}

        {activeTab === 'profile' && (
          <MyProfile onDeleteResume={handleResumeDeleted} />
        )}

        {activeTab === 'jobs' && <JobRecommendations />}
      </div>
    </div>
  );
};

export default CandidateDashboard;
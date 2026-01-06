import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, Users, TrendingUp, Plus, X, Menu,
  User, Mail, MapPin, Phone, Download, FileText
} from 'lucide-react';
import DashboardNavbar from '../common/DashboardNavbar';
import StatCard from '../common/StatCard';
import CreateJobModal from './CreateJobModal';
import { useAuth } from '../../context/AuthContext';
import JobCard from './JobCardWithApplicants';
import JobDetailsModal from './JobDetailsModal';
import { AnalyticsPipeline, MatchDistributionChart, TopSkillsChart } from './AnalyticsComponents';
import { recruiterAPI } from '../../services/api';

const RecruiterDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // NEW: real jobs state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  
// Static recruiter id for now
  const RECRUITER_ID = 10; // use 50 to match your create example

// Determine recruiterId
  // Option A: from user context (preferred if available)
  const recruiterId = user?.id || user?.recruiter_id || 10; // fallback to 10 for now


  // ✅ Define handlers BEFORE usage
  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobModal(true);
  };

  const handleViewJobDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };



  // Fetch jobs on mount / when recruiterId changes
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      setJobsError('');
      try {
        const { data } = await recruiterAPI.getJobsByRecruiter(recruiterId);
        // data is an array from FastAPI, transform to frontend shape:
        
        const mapped = (data || []).map(j => ({
          id: j.id,
          title: j.title,
          companyName: j.company,
          description: j.description,
          location: j.location,
          type: j.job_type,
          status: j.job_status,
          created: j.created_at?.slice(0, 10), // YYYY-MM-DD
          applicants: 0,
          strongMatches: 0,
          goodMatches: 0,
        }));
        setJobs(mapped);
      } catch (err) {
        console.error('Failed to load jobs', err);
        setJobsError(
          err?.response?.data?.detail ||
          err?.message ||
          'Failed to load jobs. Please try again.'
        );
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Initialize history state on mount
  useEffect(() => {
    if (!window.history.state?.initialized) {
      window.history.replaceState(
        { initialized: true, tab: activeTab, page: 'recruiter-dashboard' }, 
        '', 
        '/recruiter-dashboard'
      );
    }
  }, []);

  // Handle tab changes - push to history
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    window.history.pushState(
      { tab: newTab, page: 'recruiter-dashboard' }, 
      '', 
      '/recruiter-dashboard'
    );
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.page === 'recruiter-dashboard') {
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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };
  
  const [creatingJob, setCreatingJob] = useState(false); // optional: disable button during submit
  const [createError, setCreateError] = useState('');

  const handleJobSubmit = async (jobData) => {
    
  
  // 1) Normalize the field names coming from CreateJobModal
  const title = jobData?.title;
  const description = jobData?.description;
  const company = jobData?.company || jobData?.companyName; // support either key
  const location = jobData?.location;
  const job_type = jobData?.job_type || jobData?.type;      // support either key
  const job_status = jobData?.job_status || jobData?.status; // support either key

  // 2) Validate required fields (FastAPI expects all)
  const missing = [];
  if (!title) missing.push('title');
  if (!description) missing.push('description');
  if (!company) missing.push('company');
  if (!location) missing.push('location');
  if (!job_type) missing.push('job_type');
  if (!job_status) missing.push('job_status');

  if (missing.length > 0) {
    alert(`Please fill: ${missing.join(', ')}`);
    return;
  }

  // 3) Call API with query params
  try {
    const { data } = await recruiterAPI.createJob({
      recruiter_id: RECRUITER_ID,
      title,
      description,
      company,   // ✅ guaranteed to be present
      location,
      job_type,
      job_status,
    });
    alert(data?.message || 'Job created successfully!');
    setShowJobModal(false);
    setEditingJob(null);
    await fetchJobs();       // re-load jobs for recruiter 50
    setActiveTab('jobs');
  } catch (err) {
    console.error('Failed to create job', err);
    const msg =
      err?.response?.data?.detail ||
      err?.message ||
      'Failed to create job. Please try again.';
    alert(msg);
  }
};



  
  const mockCandidates = [
    {
      id: 1, name: 'John Doe', email: 'john.doe@email.com', phone: '+1 234-567-8900',
      location: 'San Francisco, CA', matchScore: 0.92, experience: '5 years',
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
      education: 'B.S. Computer Science', appliedDate: '2024-01-15',
      status: 'New', jobApplied: 'Senior Full Stack Developer'
    },
    {
      id: 2, name: 'Sarah Smith', email: 'sarah.smith@email.com', phone: '+1 234-567-8901',
      location: 'New York, NY', matchScore: 0.88, experience: '4 years',
      skills: ['React', 'JavaScript', 'MongoDB', 'Express', 'Git'],
      education: 'B.Tech Information Technology', appliedDate: '2024-01-16',
      status: 'Reviewed', jobApplied: 'Senior Full Stack Developer'
    },
    {
      id: 3, name: 'Mike Johnson', email: 'mike.j@email.com', phone: '+1 234-567-8902',
      location: 'Remote', matchScore: 0.85, experience: '6 years',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes'],
      education: 'M.S. Software Engineering', appliedDate: '2024-01-17',
      status: 'Interview Scheduled', jobApplied: 'Backend Engineer'
    },
  ];

  const stats = {
    totalJobs: jobs.length,
    totalApplicants: 105, // if you don’t have this yet, keep a placeholder or compute if available
    avgMatchScore: 78,    // placeholder
    activeJobs: jobs.filter(j => j.status === 'active').length
  };

  const getMatchColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Reviewed': return 'bg-purple-100 text-purple-700';
      case 'Interview Scheduled': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar 
  userType="recruiter"
  userName={user?.name || 'Recruiter'}
  onLogout={handleLogout}
  onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
  showMobileMenu={showMobileMenu}
/>




      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileMenu(false)}>
          <div className="bg-white w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowJobModal(true);
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Post New Job</span>
            </button>

            <nav className="space-y-2">
              <button
                onClick={() => { handleTabChange('overview'); setShowMobileMenu(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => { handleTabChange('jobs'); setShowMobileMenu(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'jobs' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">My Jobs</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex gap-4 lg:gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <button
                onClick={() => setShowJobModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Post New Job</span>
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => handleTabChange('overview')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </button>
                <button
                  onClick={() => handleTabChange('jobs')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'jobs' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">My Jobs</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                
                {/* Stats Cards */}
                {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <StatCard 
                    title="Total Jobs" 
                    value={mockStats.totalJobs} 
                    icon={Briefcase}
                    bgColor="bg-blue-100"
                    iconColor="text-blue-600"
                  />
                  <StatCard 
                    title="Applicants" 
                    value={mockStats.totalApplicants} 
                    icon={Users}
                    bgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                  <StatCard 
                    title="Avg Match" 
                    value={`${mockStats.avgMatchScore}%`} 
                    icon={TrendingUp}
                    bgColor="bg-purple-100"
                    iconColor="text-purple-600"
                  />
                  <StatCard 
                    title="Active Jobs" 
                    value={mockStats.activeJobs} 
                    icon={FileText}
                    bgColor="bg-yellow-100"
                    iconColor="text-yellow-600"
                  />
                </div> */}

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <MatchDistributionChart />
                  <TopSkillsChart />
                </div>

                {/* Overall Pipeline */}
                <AnalyticsPipeline />
              </div>
            )}

            
            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Posted Jobs</h1>

                {/* Loading / Error states */}
                {jobsLoading && <p className="text-gray-600">Loading jobs...</p>}
                {jobsError && <p className="text-red-600">{jobsError}</p>}

                <div className="space-y-3 sm:space-y-4">
                  {!jobsLoading && !jobsError && jobs.length === 0 && (
                    <p className="text-gray-600">No jobs posted yet.</p>
                  )}
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onViewDetails={handleViewJobDetails}
                      onEdit={handleEditJob}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Candidates {selectedJob && `for ${selectedJob.title}`}
                  </h1>
                  <span className="text-gray-600 text-sm">{mockCandidates.length} candidates</span>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {mockCandidates.map((candidate) => (
                    <div key={candidate.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{candidate.name}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm">{candidate.experience} experience</p>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1 truncate">Applied for: {candidate.jobApplied}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getMatchColor(candidate.matchScore)}`}>
                            {Math.round(candidate.matchScore * 100)}%
                          </span>
                          <p className={`mt-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm">
                        <div className="flex items-center space-x-2 text-gray-600 min-w-0">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{candidate.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{candidate.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate">{candidate.education}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {candidate.skills.map((skill, index) => (
                          <span key={index} className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                        <button className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center space-x-2">
                          <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Download Resume</span>
                        </button>
                        <button className="flex-1 px-3 sm:px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium">
                          Schedule Interview
                        </button>
                        <button className="sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium">
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <CreateJobModal 
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setEditingJob(null);
        }}
        onSubmit={handleJobSubmit}
        initialData={editingJob}
      />

      <JobDetailsModal 
        isOpen={showJobDetailsModal}
        onClose={() => setShowJobDetailsModal(false)}
        job={selectedJob}
      />
    </div>
  );
};

export default RecruiterDashboard;
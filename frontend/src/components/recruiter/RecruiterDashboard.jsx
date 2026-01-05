import React, { useState } from 'react';
import { 
  Briefcase, Users, TrendingUp, LogOut, Plus, Eye, MessageSquare, 
  BarChart3, FileText, User, Mail, MapPin, Phone, Download, X, Menu
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: '',
    type: 'Full-time'
  });

  const handleLogout = () => {
    // Clear any stored authentication tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    sessionStorage.clear();
    

    window.location.href = '/login';
  };

  const handleJobSubmit = (e) => {
    e.preventDefault();
    alert('Job posted successfully!');
    setShowJobModal(false);
    setJobForm({
      title: '',
      description: '',
      location: '',
      type: 'Full-time'
    });
  };

  // Mock data
  const mockJobs = [
    { id: 1, title: 'Senior Full Stack Developer', applicants: 45, strongMatches: 12, goodMatches: 18, created: '2024-01-15' },
    { id: 2, title: 'Backend Engineer', applicants: 32, strongMatches: 8, goodMatches: 15, created: '2024-01-20' },
    { id: 3, title: 'DevOps Engineer', applicants: 28, strongMatches: 10, goodMatches: 12, created: '2024-01-22' },
  ];

  const mockCandidates = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 234-567-8900',
      location: 'San Francisco, CA',
      matchScore: 0.92,
      experience: '5 years',
      skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
      education: 'B.S. Computer Science',
      appliedDate: '2024-01-15',
      status: 'New',
      jobApplied: 'Senior Full Stack Developer'
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah.smith@email.com',
      phone: '+1 234-567-8901',
      location: 'New York, NY',
      matchScore: 0.88,
      experience: '4 years',
      skills: ['React', 'JavaScript', 'MongoDB', 'Express', 'Git'],
      education: 'B.Tech Information Technology',
      appliedDate: '2024-01-16',
      status: 'Reviewed',
      jobApplied: 'Senior Full Stack Developer'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      phone: '+1 234-567-8902',
      location: 'Remote',
      matchScore: 0.85,
      experience: '6 years',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes'],
      education: 'M.S. Software Engineering',
      appliedDate: '2024-01-17',
      status: 'Interview Scheduled',
      jobApplied: 'Backend Engineer'
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '+1 234-567-8903',
      location: 'Austin, TX',
      matchScore: 0.78,
      experience: '3 years',
      skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'AWS'],
      education: 'B.S. Computer Engineering',
      appliedDate: '2024-01-18',
      status: 'New',
      jobApplied: 'Senior Full Stack Developer'
    },
    {
      id: 5,
      name: 'David Chen',
      email: 'david.chen@email.com',
      phone: '+1 234-567-8904',
      location: 'Seattle, WA',
      matchScore: 0.91,
      experience: '7 years',
      skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins'],
      education: 'B.S. Computer Science',
      appliedDate: '2024-01-19',
      status: 'Reviewed',
      jobApplied: 'DevOps Engineer'
    },
  ];

  const mockStats = {
    totalJobs: mockJobs.length,
    totalApplicants: 105,
    avgMatchScore: 78,
    activeJobs: mockJobs.length
  };

  const chartData = [
    { name: 'Strong Match', value: 30, color: '#10b981' },
    { name: 'Good Match', value: 45, color: '#f59e0b' },
    { name: 'Weak Match', value: 30, color: '#ef4444' },
  ];

  const skillsData = [
    { skill: 'React', count: 38 },
    { skill: 'Python', count: 42 },
    { skill: 'Node.js', count: 35 },
    { skill: 'SQL', count: 40 },
    { skill: 'Docker', count: 28 },
  ];

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
      {/* Top Bar */}
      <div className="bg-blue-600 text-white py-3 sm:py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold">Welcome back, Kankav!</h1>
              <p className="text-blue-100 text-xs sm:text-sm">Recruiter Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

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
                onClick={() => { setActiveTab('overview'); setShowMobileMenu(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                onClick={() => { setActiveTab('jobs'); setShowMobileMenu(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'jobs' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">My Jobs</span>
              </button>
              <button
                onClick={() => { setActiveTab('analytics'); setShowMobileMenu(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Analytics</span>
              </button>
            </nav>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
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
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'jobs' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">My Jobs</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-xs sm:text-sm">Total Jobs</p>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mockStats.totalJobs}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-xs sm:text-sm">Applicants</p>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mockStats.totalApplicants}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-xs sm:text-sm">Avg Match</p>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mockStats.avgMatchScore}%</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-xs sm:text-sm">Active</p>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                        </div>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{mockStats.activeJobs}</p>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Match Distribution</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Top Skills</h2>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={skillsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Posted Jobs</h1>
                
                <div className="space-y-3 sm:space-y-4">
                  {mockJobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                      <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">{job.title}</h3>
                          <p className="text-gray-600 text-xs sm:text-sm">Posted on {new Date(job.created).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-1 sm:space-x-2 ml-2">
                          <button 
                            onClick={() => {
                              setSelectedJob(job);
                              setActiveTab('candidates');
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <p className="text-lg sm:text-2xl font-bold text-gray-900">{job.applicants}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Total</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                          <p className="text-lg sm:text-2xl font-bold text-green-600">{job.strongMatches}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Strong</p>
                        </div>
                        <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                          <p className="text-lg sm:text-2xl font-bold text-yellow-600">{job.goodMatches}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Good</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setSelectedJob(job);
                          setActiveTab('candidates');
                        }}
                        className="w-full px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                      >
                        View Candidates
                      </button>
                    </div>
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

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics & Insights</h1>
                
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Hiring Pipeline</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-gray-700 text-sm sm:text-base">Applied</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
                          <div className="h-3 sm:h-4 bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">105</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-gray-700 text-sm sm:text-base">Screened</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
                          <div className="h-3 sm:h-4 bg-green-600 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">63</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-gray-700 text-sm sm:text-base">Interviewed</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
                          <div className="h-3 sm:h-4 bg-yellow-600 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">32</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-gray-700 text-sm sm:text-base">Offered</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
                          <div className="h-3 sm:h-4 bg-purple-600 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">16</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Job Creation Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowJobModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Post New Job</h2>
              <button
                onClick={() => setShowJobModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., Senior Full Stack Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  required
                  rows="6"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Describe the role, responsibilities, required skills, and qualifications..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., Remote, New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  Post Job
                </button>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="flex-1 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
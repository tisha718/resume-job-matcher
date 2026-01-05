import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, Brain, Target, Loader, AlertCircle, CheckCircle, X } from 'lucide-react';
import { resumeAPI, candidateAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import InterviewPrep from './InterviewPrep';
import SkillAnalysis from './SkillAnalysis';

const JobRecommendations = () => {
  const { user } = useAuth();
  const [expandedJob, setExpandedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalJobsToFetch, setTotalJobsToFetch] = useState('20');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;
  
  // Data states
  const [availableResumes, setAvailableResumes] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumesLoading, setResumesLoading] = useState(true);
  
  // View states
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);
  const [showSkillAnalysis, setShowSkillAnalysis] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState(null);

  // Fetch user's resumes and applied jobs on mount
  useEffect(() => {
    fetchUserResumes();
    fetchAppliedJobs();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchUserResumes = async () => {
    try {
      setResumesLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;
      const response = await resumeAPI.getAllResumes(userId);
      const resumes = response.data.resumes || [];
      setAvailableResumes(resumes.map(r => ({
        id: r.resume_id,
        name: r.filename,
        uploadedAt: r.uploaded_at
      })));
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load your resumes. Please try again.');
    } finally {
      setResumesLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;
      const response = await candidateAPI.getApplications(userId);
      const applications = response.data.applications || [];
      const appliedJobIds = new Set(
        applications
          .filter(app => app.resume_id === selectedResumeId)
          .map(app => `${app.job_id}-${app.resume_id}`)
      );
      setAppliedJobs(appliedJobIds);
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };

  // Refetch applied jobs when resume changes
  useEffect(() => {
    if (selectedResumeId) {
      fetchAppliedJobs();
    }
  }, [selectedResumeId]);

  const fetchRecommendedJobs = async () => {
    if (!selectedResumeId || !totalJobsToFetch) {
      setError('Please select a resume and specify number of jobs');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;
      const limit = parseInt(totalJobsToFetch) || 20;

      if (limit < 1 || limit > 50) {
        setError('Number of jobs must be between 1 and 50');
        setLoading(false);
        return;
      }

      const response = await candidateAPI.getRecommendedJobs(userId, selectedResumeId, limit);
      const jobsData = response.data.recommended_jobs || [];
      
      // Debug: Log the raw data to see what we're getting
      console.log('Raw jobs data:', jobsData);
      
      const normalizedJobs = jobsData.map(job => {
        // Backend bug: it sends "job status" with a space instead of "job_status"
        const jobStatus = job['job status'] || job.job_status || job.status || 'active';
        const companyName = job.company || job.company_name || job.companyName || 'Company Name';
        
        return {
          ...job,
          fit_score: Math.round(job.fit_score),
          company_name: companyName,
          job_status: jobStatus
        };
      });
      setAllJobs(normalizedJobs);
      
      if (normalizedJobs.length === 0) {
        setError('No matching jobs found for this resume.');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.detail || 'Failed to load job recommendations. Please try again.');
      setAllJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAnalysis = async (job) => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;
      
      const response = await candidateAPI.getJobSkillAnalysis(job.job_id, userId, selectedResumeId);
      const jobWithAnalysis = {
        ...job,
        ...response.data
      };
      
      setSelectedJob(jobWithAnalysis);
      setShowSkillAnalysis(true);
    } catch (err) {
      console.error('Error fetching skill analysis:', err);
      alert('Failed to load skill analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewPrep = (job) => {
    const jobWithCompany = {
      ...job,
      resumeId: selectedResumeId
    };
    setSelectedJob(jobWithCompany);
    setShowInterviewPrep(true);
  };

  const handleApply = async (job) => {
    const jobResumeKey = `${job.job_id}-${selectedResumeId}`;
    
    if (appliedJobs.has(jobResumeKey)) {
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;
      
      const response = await candidateAPI.applyForJob(job.job_id, userId, selectedResumeId);
      
      setAppliedJobs(prev => new Set([...prev, jobResumeKey]));
      
      setApplicationDetails({
        jobTitle: job.title,
        company: job.company_name,
        applicationId: response.data.application_id
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error applying for job:', err);
      alert(err.response?.data?.detail || 'Failed to submit application. Please try again.');
    }
  };

  const toggleExpanded = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const filteredJobs = allJobs.filter(job =>
    job.job_id.toString().includes(searchQuery) ||
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.company_name && job.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'active') {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded text-xs font-medium">
          Active
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded text-xs font-medium">
          Closed
        </span>
      );
    }
  };

  const isJobApplied = (jobId) => {
    return appliedJobs.has(`${jobId}-${selectedResumeId}`);
  };

  // Success Modal Component
  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 mb-0">

      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={() => setShowSuccessModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">Your application has been successfully submitted</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Job Title</p>
                <p className="font-semibold text-gray-900">{applicationDetails?.jobTitle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="font-semibold text-gray-900">{applicationDetails?.company}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Application ID</p>
                <p className="font-mono text-sm text-blue-600">{applicationDetails?.applicationId}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  if (showInterviewPrep && selectedJob) {
    return (
      <InterviewPrep 
        selectedJob={selectedJob} 
        onClose={() => {
          setShowInterviewPrep(false);
          setSelectedJob(null);
        }} 
      />
    );
  }

  if (showSkillAnalysis && selectedJob) {
    return (
      <SkillAnalysis 
        selectedJob={selectedJob} 
        onClose={() => {
          setShowSkillAnalysis(false);
          setSelectedJob(null);
        }} 
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Matches</h1>
          <p className="text-gray-600 text-sm mt-1">
            {allJobs.length > 0
              ? `Showing ${indexOfFirstJob + 1}-${Math.min(indexOfLastJob, filteredJobs.length)} of ${filteredJobs.length} positions`
              : 'Select a resume to get started'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedResumeId}
            onChange={(e) => {
              setSelectedResumeId(e.target.value);
              setAllJobs([]);
              setCurrentPage(1);
            }}
            disabled={resumesLoading || availableResumes.length === 0}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
              selectedResumeId === '' ? 'text-gray-400' : 'text-gray-900'
            } ${(resumesLoading || availableResumes.length === 0) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="" disabled hidden className="text-gray-400">
              {resumesLoading ? 'Loading resumes...' : availableResumes.length === 0 ? 'No resumes uploaded' : 'Select Resume'}
            </option>
            {availableResumes.map((resume) => (
              <option key={resume.id} value={resume.id} className="text-gray-900">
                {resume.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            max="50"
            value={totalJobsToFetch}
            onChange={(e) => setTotalJobsToFetch(e.target.value)}
            placeholder="Number of jobs (max 50)"
            disabled={!selectedResumeId}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <button
            onClick={fetchRecommendedJobs}
            disabled={!selectedResumeId || !totalJobsToFetch || loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Jobs</span>
              </>
            )}
          </button>
        </div>

        {allJobs.length > 0 && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs (title/location/company/id)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {!selectedResumeId && availableResumes.length > 0 && (
          <p className="text-xs text-blue-600 mt-3">💡 Step 1: Select a resume to get started</p>
        )}
        {selectedResumeId && allJobs.length === 0 && !loading && (
          <p className="text-xs text-blue-600 mt-3">💡 Step 2: Enter number of jobs (1-50) and click "Find Jobs"</p>
        )}
        {availableResumes.length === 0 && !resumesLoading && (
          <p className="text-xs text-orange-600 mt-3">⚠️ Please upload a resume first to get job recommendations</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Loader className="w-12 h-12 mx-auto mb-3 text-blue-600 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Finding Best Matches...</h3>
          <p className="text-sm text-gray-600">Analyzing your resume against available positions</p>
        </div>
      )}

      {!loading && allJobs.length > 0 && (
        <>
          <div className="space-y-3">
            {currentJobs.length > 0 ? (
              currentJobs.map((job) => {
                const isExpanded = expandedJob === job.job_id;
                const hasApplied = isJobApplied(job.job_id);
                const isClosed = job.job_status?.toLowerCase() === 'closed';

                return (
                  <div
                    key={job.job_id}
                    className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all overflow-hidden"
                  >
                    <div className="p-4 cursor-pointer" onClick={() => toggleExpanded(job.job_id)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getMatchColor(job.fit_score)}`}>
                              {job.fit_score}%
                            </span>
                            {getStatusBadge(job.job_status)}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 font-medium">
                            {job.company_name || job.companyName || job.company || 'No Company Name'}
                          </p>
                          
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{job.job_type}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">About the Role</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkillAnalysis(job);
                            }}
                            disabled={isClosed}
                            className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <Target className="w-4 h-4" />
                            Skill Analysis
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInterviewPrep(job);
                            }}
                            disabled={isClosed}
                            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            <Brain className="w-4 h-4" />
                            Interview Prep
                          </button>
                          
                          <div className="relative group">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!hasApplied && !isClosed) {
                                  handleApply(job);
                                }
                              }}
                              disabled={hasApplied || isClosed}
                              className={`w-full px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                                hasApplied
                                  ? 'bg-green-100 text-green-700 border border-green-200 cursor-not-allowed'
                                  : isClosed
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {hasApplied ? 'Applied ✓' : isClosed ? 'Closed' : 'Apply Now'}
                            </button>
                            
                            {hasApplied && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Already applied with this resume
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No jobs found</h3>
                <p className="text-sm text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const showPage =
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                if (!showPage) {
                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return <span key={pageNumber} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`min-w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {!loading && !selectedResumeId && availableResumes.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Find Your Perfect Job?</h3>
          <p className="text-gray-600 mb-4">Select a resume from the dropdown above to get job recommendations</p>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;
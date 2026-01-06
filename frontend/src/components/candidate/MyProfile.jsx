import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Loader, X, Download, Briefcase, AlertCircle, Calendar, MapPin, DollarSign } from 'lucide-react';
import { resumeAPI, candidateAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MyProfile = ({ onDeleteResume }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // Applied Jobs state
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  // Resume delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  // Application withdraw modal state
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchResumes();
    fetchAppliedJobs();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;

      const response = await resumeAPI.getAllResumes(userId);
      setResumes(response.data.resumes || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to fetch resumes'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      setApplicationsLoading(true);
      setApplicationsError(null);

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;

      console.log('Fetching applications for user:', userId);
      const response = await candidateAPI.getAppliedJobs(userId);
      const applicationsData = response.data || [];
      
      console.log('Applications data:', applicationsData);

      // Fetch job details for each application
      const applicationsWithJobDetails = await Promise.all(
        applicationsData.map(async (app) => {
          try {
            console.log(`Fetching job details for job_id: ${app.job_id}`);
            const jobResponse = await candidateAPI.getJobDetails(app.job_id);
            console.log(`Job details for ${app.job_id}:`, jobResponse.data);
            
            return {
              ...app,
              job_title: jobResponse.data.title || jobResponse.data.job_title || 'Job Title Unavailable',
              company_name: jobResponse.data.company || jobResponse.data.company_name || 'Company Name Unavailable',
              location: jobResponse.data.location,
              salary: jobResponse.data.salary,
              employment_type: jobResponse.data.employment_type,
            };
          } catch (err) {
            console.error(`Failed to fetch job details for job_id ${app.job_id}:`, err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            return {
              ...app,
              job_title: 'Job Title Unavailable',
              company_name: 'Company Name Unavailable',
            };
          }
        })
      );

      console.log('Applications with job details:', applicationsWithJobDetails);
      setApplications(applicationsWithJobDetails);
    } catch (err) {
      console.error('Failed to fetch applied jobs:', err);
      setApplicationsError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to fetch applied jobs'
      );
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (resume, e) => {
    e.stopPropagation();
    
    const resumeId = resume.resume_id || resume.id;
    
    try {
      setDownloadingId(resumeId);
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;

      const response = await resumeAPI.downloadResume(resumeId, userId);
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = resume.filename || 'resume.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to download resume'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteClick = (resume, e) => {
    e.stopPropagation();
    setResumeToDelete(resume);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;

    const resumeId = resumeToDelete.resume_id || resumeToDelete.id;

    try {
      setDeletingId(resumeId);

      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;

      await resumeAPI.deleteResume(resumeId, userId);

      setResumes(prev =>
        prev.filter(r => (r.resume_id || r.id) !== resumeId)
      );

      onDeleteResume?.(resumeId);

      setShowDeleteModal(false);
      setResumeToDelete(null);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to delete resume'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleWithdrawClick = (application, e) => {
    e.stopPropagation();
    setApplicationToWithdraw(application);
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    if (!applicationToWithdraw) return;

    const applicationId = applicationToWithdraw.id;

    try {
      setWithdrawingId(applicationId);

      await candidateAPI.withdrawApplication(applicationId);

      setApplications(prev =>
        prev.filter(app => app.id !== applicationId)
      );

      setShowWithdrawModal(false);
      setApplicationToWithdraw(null);
    } catch (err) {
      setApplicationsError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to withdraw application'
      );
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadgeColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    const colors = {
      'applied': 'bg-blue-100 text-blue-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'under_review': 'bg-purple-100 text-purple-800',
      'shortlisted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'accepted': 'bg-emerald-100 text-emerald-800',
      'interview_scheduled': 'bg-indigo-100 text-indigo-800',
    };
    return colors[statusLower] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading && applicationsLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Resume Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Delete Resume</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setResumeToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-700 mb-2">
              Are you sure you want to delete this resume?
            </p>

            <p className="bg-gray-100 rounded p-2 text-sm font-semibold text-gray-900 mb-4">
              {resumeToDelete?.filename || 'Resume'}
            </p>

            <p className="text-sm text-red-600 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setResumeToDelete(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deletingId === (resumeToDelete?.resume_id || resumeToDelete?.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {deletingId === (resumeToDelete?.resume_id || resumeToDelete?.id) ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Withdraw Application</h3>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setApplicationToWithdraw(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-700 mb-2">
              Are you sure you want to withdraw your application for:
            </p>

            <p className="bg-gray-100 rounded p-3 text-sm font-semibold text-gray-900 mb-4">
              {applicationToWithdraw?.job_title || 'This Job'}
              <span className="block text-xs text-gray-600 mt-1">
                at {applicationToWithdraw?.company_name || 'Company'}
              </span>
            </p>

            <p className="text-sm text-red-600 mb-6">
              This action cannot be undone. You will need to reapply if you change your mind.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setApplicationToWithdraw(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmWithdraw}
                disabled={withdrawingId === applicationToWithdraw?.id}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {withdrawingId === applicationToWithdraw?.id ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESUME LIST */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your resumes...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={fetchResumes}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : resumes.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Uploaded Resumes</h2>
            <button
              onClick={fetchResumes}
              className="text-sm text-blue-600"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3">
            {resumes.map((resume) => {
              const id = resume.resume_id || resume.id;

              return (
                <div
                  key={id}
                  className="flex justify-between items-center p-4 border border-gray-300 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {resume.filename || 'Resume'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDownload(resume, e)}
                      disabled={downloadingId === id}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download resume"
                    >
                      {downloadingId === id ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDeleteClick(resume, e)}
                      disabled={deletingId === id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete resume"
                    >
                      {deletingId === id ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold">No Resumes Uploaded</h3>
          <p className="text-gray-600">Upload a resume to get started.</p>
        </div>
      )}

      {/* APPLIED JOBS SECTION */}
      {applicationsLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      ) : applicationsError ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-4">{applicationsError}</p>
          <button
            onClick={fetchAppliedJobs}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : applications.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
              <p className="text-gray-600 text-sm mt-1">
                {applications.length} {applications.length === 1 ? 'application' : 'applications'} submitted
              </p>
            </div>
            <button
              onClick={fetchAppliedJobs}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-4">
            {applications.map((application) => {
              const appId = application.id;

              return (
                <div
                  key={appId}
                  className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {application.job_title || 'Job Title'}
                          </h3>
                          <p className="text-gray-600 font-medium mb-3">
                            {application.company_name || 'Company Name'}
                          </p>

                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                            {application.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{application.location}</span>
                              </div>
                            )}
                            {application.employment_type && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                <span>{application.employment_type}</span>
                              </div>
                            )}
                            {application.applied_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                application.application_status || 'pending'
                              )}`}
                            >
                              {formatStatus(application.application_status || 'pending')}
                            </span>
                            {application.fit_score && (
                              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                                Match: {Math.round(application.fit_score)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleWithdrawClick(application, e)}
                      disabled={withdrawingId === appId}
                      className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                      title="Withdraw application"
                    >
                      {withdrawingId === appId ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Withdrawing...</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          <span>Withdraw</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No Applications Yet</h3>
          <p className="text-gray-600">Start applying to jobs to see them here.</p>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
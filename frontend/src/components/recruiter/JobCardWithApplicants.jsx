import React, { useState, useEffect } from 'react';
import { Edit, Users, ArrowLeft, Download, Save, Check } from 'lucide-react';
import { resumeAPI, applicationAPI } from '../../services/api';

// JobApplicantsView Component
const JobApplicantsView = ({ job, onBack }) => {
  const [downloading, setDownloading] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusChanges, setStatusChanges] = useState({});
  const [savingStatus, setSavingStatus] = useState({});
  const [successMessage, setSuccessMessage] = useState({});

  const statusOptions = ['applied', 'shortlisted', 'interviewed', 'offered', 'rejected'];

  useEffect(() => {
    fetchApplicants();
  }, [job?.id]);

  const fetchApplicants = async () => {
    if (!job?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await applicationAPI.getApplicationsForJob(job.id);
      setApplicants(response.data.applications || []);
    } catch (err) {
      console.error('Error fetching applicants:', err);
      setError('Failed to load applicants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      offered: "bg-green-100 text-green-800 border-green-200",
      interviewed: "bg-blue-100 text-blue-800 border-blue-200",
      shortlisted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      applied: "bg-gray-100 text-gray-800 border-gray-200",
      rejected: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const handleStatusChange = (userId, newStatus) => {
    setStatusChanges(prev => ({
      ...prev,
      [userId]: newStatus
    }));
    // Clear success message when changing status again
    setSuccessMessage(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const handleSaveStatus = async (applicant) => {
    const newStatus = statusChanges[applicant.user_id];
    if (!newStatus || newStatus === applicant.application_status) {
      return;
    }

    const applicationId = applicant.user_id;

    setSavingStatus(prev => ({ ...prev, [applicant.user_id]: true }));
    
    try {
      await applicationAPI.updateApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplicants(prev => prev.map(app => 
        app.user_id === applicant.user_id 
          ? { ...app, application_status: newStatus }
          : app
      ));
      
      // Clear the pending change
      setStatusChanges(prev => {
        const updated = { ...prev };
        delete updated[applicant.user_id];
        return updated;
      });
      
      // Show success message
      setSuccessMessage(prev => ({ ...prev, [applicant.user_id]: true }));
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(prev => {
          const updated = { ...prev };
          delete updated[applicant.user_id];
          return updated;
        });
      }, 3000);
      
    } catch (err) {
      console.error('Error updating status:', err);
      // You could add error state here if needed
    } finally {
      setSavingStatus(prev => ({ ...prev, [applicant.user_id]: false }));
    }
  };

  const handleDownloadResume = async (applicant) => {
    setDownloading(applicant.user_id);
    try {
      const response = await resumeAPI.downloadResume(applicant.resume_id, applicant.user_id);
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `User_${applicant.user_id}_Resume.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Jobs</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchApplicants}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Jobs</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Applicants for {job?.title || "Job Position"}
          </h1>
          <p className="text-gray-600 mt-2">
            {applicants.length} total applicants
          </p>
        </div>

        {/* Applicants List */}
        {applicants.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No applicants yet for this job.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((applicant) => {
              const currentStatus = statusChanges[applicant.user_id] || applicant.application_status;
              const hasUnsavedChanges = statusChanges[applicant.user_id] && 
                                        statusChanges[applicant.user_id] !== applicant.application_status;

              return (
                <div key={applicant.user_id} className="bg-white rounded-lg p-5 hover:shadow-lg transition-shadow border border-gray-200">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">User ID: {applicant.user_id}</h3>
                      <p className="text-sm text-gray-500">Applied on {formatDate(applicant.applied_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Status Dropdown */}
                      <div className="relative">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(applicant.user_id, e.target.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 ${getStatusColor(currentStatus)} cursor-pointer transition-colors appearance-none pr-8`}
                          style={{ minWidth: '140px' }}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>

                      {/* Save Button - Only show if there are unsaved changes */}
                      {hasUnsavedChanges && (
                        <button
                          onClick={() => handleSaveStatus(applicant)}
                          disabled={savingStatus[applicant.user_id]}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Save Status"
                        >
                          <Save className="w-4 h-4" />
                          {savingStatus[applicant.user_id] ? 'Saving...' : 'Save'}
                        </button>
                      )}

                      {/* Success Message */}
                      {successMessage[applicant.user_id] && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Status updated!</span>
                        </div>
                      )}

                      {/* Download Resume Button */}
                      <button
                        onClick={() => handleDownloadResume(applicant)}
                        disabled={downloading === applicant.user_id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download Resume"
                      >
                        <Download className="w-4 h-4" />
                        {downloading === applicant.user_id ? 'Downloading...' : 'Resume'}
                      </button>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Fit Score</p>
                      <p className="text-2xl font-bold text-blue-600">{applicant.fit_score.toFixed(2)}%</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Skill Score</p>
                      <p className="text-2xl font-bold text-green-600">{applicant.skill_score.toFixed(2)}%</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Semantic Score</p>
                      <p className="text-2xl font-bold text-purple-600">{applicant.semantic_score.toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-3">
                    {applicant.matched_skills && applicant.matched_skills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Matched Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {applicant.matched_skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {applicant.missing_skills && applicant.missing_skills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Missing Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {applicant.missing_skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// JobCard Component
const JobCard = ({ job, onViewDetails, onEdit, onViewApplicants }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 wrap-break-word">
                {job.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Posted on {new Date(job.created).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onEdit(job)}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Edit Job"
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button 
          onClick={() => onViewDetails(job)}
          className="flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
        >
          View Job Details
        </button>
        <button 
          onClick={() => onViewApplicants(job)}
          className="flex-1 px-4 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          View Applicants
        </button>
      </div>
    </div>
  );
};

// Main Component with integrated functionality
const JobCardWithApplicants = ({ job, onViewDetails, onEdit }) => {
  const [showApplicantsView, setShowApplicantsView] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleViewApplicants = (job) => {
    setSelectedJob(job);
    setShowApplicantsView(true);
  };

  const handleBack = () => {
    setShowApplicantsView(false);
    setSelectedJob(null);
  };

  // If showing applicants view, render that instead
  if (showApplicantsView && selectedJob) {
    return <JobApplicantsView job={selectedJob} onBack={handleBack} />;
  }

  return (
    <JobCard 
      job={job}
      onViewDetails={onViewDetails}
      onEdit={onEdit}
      onViewApplicants={handleViewApplicants}
    />
  );
};

export default JobCardWithApplicants;
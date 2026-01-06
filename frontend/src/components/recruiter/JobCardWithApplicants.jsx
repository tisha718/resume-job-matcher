import React, { useState } from 'react';
import { Edit, Users, ArrowLeft, Download, Trash } from 'lucide-react';

// JobApplicantsView Component
const JobApplicantsView = ({ job, onBack }) => {
  // Mock applicants data
  const mockApplicants = [
    { user_id: 34, job_id: job?.id || 1, fit_score: 85.4, skill_score: 100, semantic_score: 63.5, matched_skills: ["azure", "aws", "docker", "gcp"], missing_skills: [], application_status: "offered", applied_at: "14-04-2024" },
    { user_id: 37, job_id: job?.id || 1, fit_score: 67.04, skill_score: 75, semantic_score: 55.09, matched_skills: ["css", "html", "react"], missing_skills: ["javascript"], application_status: "interviewed", applied_at: "03-06-2024" },
    { user_id: 25, job_id: job?.id || 1, fit_score: 81.1, skill_score: 100, semantic_score: 52.74, matched_skills: ["html", "javascript", "react", "css"], missing_skills: [], application_status: "offered", applied_at: "01-04-2024" },
    { user_id: 49, job_id: job?.id || 1, fit_score: 71.86, skill_score: 83.33, semantic_score: 54.65, matched_skills: ["django", "git", "rest api", "python", "fastapi"], missing_skills: ["postgresql"], application_status: "offered", applied_at: "30-04-2024" },
    { user_id: 48, job_id: job?.id || 1, fit_score: 77.38, skill_score: 100, semantic_score: 43.44, matched_skills: ["azure", "aws", "docker", "gcp"], missing_skills: [], application_status: "applied", applied_at: "18-05-2024" },
    { user_id: 35, job_id: job?.id || 1, fit_score: 73.5, skill_score: 80, semantic_score: 63.74, matched_skills: ["data analysis", "tableau", "sql", "python", "excel", "numpy", "pandas", "google sheets"], missing_skills: ["power bi", "data visualization"], application_status: "offered", applied_at: "28-02-2024" },
    { user_id: 32, job_id: job?.id || 1, fit_score: 67.49, skill_score: 66.67, semantic_score: 68.73, matched_skills: ["javascript", "python", "fastapi", "postgresql"], missing_skills: ["git", "react"], application_status: "shortlisted", applied_at: "24-05-2024" },
    { user_id: 30, job_id: job?.id || 1, fit_score: 71.06, skill_score: 80, semantic_score: 57.66, matched_skills: ["python", "pandas", "excel", "data visualization", "numpy", "power bi", "sql", "data analysis"], missing_skills: ["tableau", "google sheets"], application_status: "offered", applied_at: "09-04-2024" }
  ];

  const getStatusColor = (status) => {
    const colors = {
      offered: "bg-green-100 text-green-800",
      interviewed: "bg-blue-100 text-blue-800",
      shortlisted: "bg-yellow-100 text-yellow-800",
      applied: "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleDownloadResume = (userId) => {
    // Mock download - in real app, this would fetch from backend
    console.log(`Downloading resume for user ${userId}`);
    // You can replace this with actual API call later
    alert(`Resume download started for User ID: ${userId}`);
  };

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
            {mockApplicants.length} total applicants
          </p>
        </div>

        {/* Applicants List */}
        <div className="space-y-4">
          {mockApplicants.map((applicant) => (
            <div key={applicant.user_id} className="bg-white rounded-lg p-5 hover:shadow-lg transition-shadow border border-gray-200">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">User ID: {applicant.user_id}</h3>
                  <p className="text-sm text-gray-500">Applied on {applicant.applied_at}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(applicant.application_status)}`}>
                    {applicant.application_status.charAt(0).toUpperCase() + applicant.application_status.slice(1)}
                  </span>
                  <button
                    onClick={() => handleDownloadResume(applicant.user_id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm font-medium"
                    title="Download Resume"
                  >
                    <Download className="w-4 h-4" />
                    Resume
                  </button>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Fit Score</p>
                  <p className="text-2xl font-bold text-blue-600">{applicant.fit_score}%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Skill Score</p>
                  <p className="text-2xl font-bold text-green-600">{applicant.skill_score}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Semantic Score</p>
                  <p className="text-2xl font-bold text-purple-600">{applicant.semantic_score}%</p>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
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
                {applicant.missing_skills.length > 0 && (
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
          ))}
        </div>
      </div>
    </div>
  );
};

// JobCard Component
const JobCard = ({ job, onViewDetails, onEdit, onViewApplicants, onDelete }) => {
  const handleDeleteClick = () => {
    const ok = window.confirm('Are you sure you want to delete this job? This action cannot be undone.');
    if (ok && typeof onDelete === 'function') {
      onDelete(job);
    }
  };

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

        {/* Delete */}
        <button
          onClick={handleDeleteClick}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Job"
        >
          <Trash className="w-5 h-5" />
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
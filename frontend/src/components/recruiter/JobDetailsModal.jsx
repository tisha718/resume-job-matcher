import React from 'react';
import { X, Building, MapPin, Briefcase, Calendar, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { applicationAPI } from '../../services/api';

const JobDetailsModal = ({ isOpen, onClose, job }) => {
  const [analytics, setAnalytics] = useState(null);
  const [fitScoreDistribution, setFitScoreDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!job?.id) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch applications summary
        const summaryResponse = await applicationAPI.getApplicationsSummary(job.id);
        setAnalytics(summaryResponse.data);

        // Fetch fit score distribution
        const fitScoreResponse = await applicationAPI.getFitScoreDistribution(job.id);
        setFitScoreDistribution(fitScoreResponse.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        // Set default values on error
        setAnalytics({
          total_applications: 0,
          applied: 0,
          shortlisted: 0,
          interviewed: 0,
          offered: 0,
          rejected: 0
        });
        setFitScoreDistribution({
          job_id: job.id,
          fit_score_distribution: {}
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [job]);

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-gray-100 text-gray-700';
  };

  if (!isOpen || !job) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{job.title}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status === 'active' ? 'Active' : 'Closed'}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Posted on {new Date(job.created).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Company Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Building className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Company Information</h3>
            </div>
            <p className="text-gray-700 text-lg font-medium">{job.companyName || 'Not specified'}</p>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="text-gray-900 font-medium">{job.location}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Briefcase className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Job Type</p>
                <p className="text-gray-900 font-medium">{job.type}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Posted Date</p>
                <p className="text-gray-900 font-medium">{new Date(job.created).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Activity className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-gray-900 font-medium capitalize">{job.status}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {job.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Application Statistics */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Application Statistics</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{analytics?.total_applications || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Total Applications</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {fitScoreDistribution?.fit_score_distribution?.['strong (>=80)'] || 
                   fitScoreDistribution?.fit_score_distribution?.['Strong (>=80)'] || 
                   0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Strong Matches</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {fitScoreDistribution?.fit_score_distribution?.['good (60-79)'] || 
                   fitScoreDistribution?.fit_score_distribution?.['Good (60-79)'] || 
                   0}
                </p>
                <p className="text-xs text-gray-600 mt-1">Good Matches</p>
              </div>
            </div>
          </div>

          {/* Hiring Pipeline */}
          {analytics && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Hiring Pipeline</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Total Applications</span>
                  <div className="flex items-center space-x-2 flex-1 max-w-[60%]">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-2.5 bg-indigo-600 rounded-full" 
                        style={{ width: '100%' }}
                      />
                    </div>
                    <span className="text-gray-900 font-semibold w-10 text-right">
                      {analytics.total_applications}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Applied</span>
                  <div className="flex items-center space-x-2 flex-1 max-w-[60%]">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-2.5 bg-blue-600 rounded-full" 
                        style={{ width: `${analytics.total_applications ? (analytics.applied / analytics.total_applications * 100) : 0}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-semibold w-10 text-right">
                      {analytics.applied}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Shortlisted</span>
                  <div className="flex items-center space-x-2 flex-1 max-w-[60%]">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-2.5 bg-green-600 rounded-full" 
                        style={{ 
                          width: `${analytics.total_applications ? (analytics.shortlisted / analytics.total_applications * 100) : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-gray-900 font-semibold w-10 text-right">
                      {analytics.shortlisted}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Interviewed</span>
                  <div className="flex items-center space-x-2 flex-1 max-w-[60%]">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-2.5 bg-yellow-600 rounded-full" 
                        style={{ 
                          width: `${analytics.total_applications ? (analytics.interviewed / analytics.total_applications * 100) : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-gray-900 font-semibold w-10 text-right">
                      {analytics.interviewed}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Offered</span>
                  <div className="flex items-center space-x-2 flex-1 max-w-[60%]">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-2.5 bg-purple-600 rounded-full" 
                        style={{ 
                          width: `${analytics.total_applications ? (analytics.offered / analytics.total_applications * 100) : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-gray-900 font-semibold w-10 text-right">
                      {analytics.offered}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Rejected</span>
                  <div className="flex items-center space-x-2 flex-1 max-w-[60%]">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-2.5 bg-red-600 rounded-full" 
                        style={{ 
                          width: `${analytics.total_applications ? (analytics.rejected / analytics.total_applications * 100) : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-gray-900 font-semibold w-10 text-right">
                      {analytics.rejected}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Loader, X, Download } from 'lucide-react';
import { resumeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';


const MyProfile = ({ onDeleteResume }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // 🔥 Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchResumes();
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

  // Handle download
  const handleDownload = async (resume, e) => {
    e.stopPropagation();
    
    const resumeId = resume.resume_id || resume.id;
    
    try {
      setDownloadingId(resumeId);
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;

      // Call the download API
      const response = await resumeAPI.downloadResume(resumeId, userId);
      
      // Create blob from response
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from content-disposition header or use default
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
      
      // Cleanup
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

  // Open modal instead of window.confirm
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading your resumes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchResumes}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto ">

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
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

      {/* RESUME LIST */}
      {resumes.length > 0 ? (
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
                  className="flex justify-between items-center p-4 border border-gray-300  rounded-lg"
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
                    {/* Download Button */}
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

                    {/* Delete Button */}
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
    </div>
  );
};

export default MyProfile;
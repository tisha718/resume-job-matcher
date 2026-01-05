import React, { useState } from 'react';
import { Upload, FileText, Award, Zap, AlertCircle } from 'lucide-react';
import { resumeAPI } from '../../services/api';

const ResumeUpload = ({ onResumeUploaded, onNavigateToJobs }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadSteps, setUploadSteps] = useState({
    upload: 'pending',
    processing: 'pending',
    matching: 'pending'
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError(null);
    setUploadSuccess(false);
    
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setResumeFile(file);
    } else {
      setError('Please upload a PDF or DOC file');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadSteps({ upload: 'pending', processing: 'pending', matching: 'pending' });

    try {
      // Step 1: Upload (0-30%)
      setUploadSteps(s => ({ ...s, upload: 'processing' }));
      setUploadProgress(10);

      // Get user ID from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id || userData.user_id || 1;

      // Upload to backend
      const response = await resumeAPI.uploadResume(resumeFile, userId);
      
      setUploadProgress(30);
      setUploadSteps(s => ({ ...s, upload: 'complete' }));

      // Step 2: Processing (30-60%)
      setUploadSteps(s => ({ ...s, processing: 'processing' }));
      setUploadProgress(45);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(60);
      setUploadSteps(s => ({ ...s, processing: 'complete' }));

      // Step 3: Matching (60-100%)
      setUploadSteps(s => ({ ...s, matching: 'processing' }));
      setUploadProgress(75);

      // Simulate matching time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadProgress(100);
      setUploadSteps(s => ({ ...s, matching: 'complete' }));

      // Success! Format response data
      const newResume = {
        id: response.data.resume_id,
        fileName: response.data.filename,
        uploadDate: response.data.uploaded_at || new Date().toISOString(),
        fileUrl: response.data.file_url,
        skills: response.data.skills || [],
        totalSkills: response.data.total_skills_found || 0
      };

      // Call parent callback to refresh resume count
      if (onResumeUploaded) {
        onResumeUploaded(newResume);
      }

      // Show success message (don't auto-hide)
      setUploadSuccess(true);
      setUploading(false);

    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        'Upload failed. Please try again.'
      );
      setUploading(false);
      setUploadProgress(0);
      setUploadSuccess(false);
      setUploadSteps({ upload: 'pending', processing: 'pending', matching: 'pending' });
    }
  };

  const handleUploadAnother = () => {
    setResumeFile(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadSteps({ upload: 'pending', processing: 'pending', matching: 'pending' });
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
          <p className="text-gray-600">Our AI will automatically parse and analyze your resume</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">Resume Uploaded Successfully! 🎉</h3>
            <p className="text-green-700 mb-6">Your resume has been processed and is ready to match with jobs.</p>
            
            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={onNavigateToJobs}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Go to Job Matches
              </button>
              <button
                onClick={handleUploadAnother}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
              >
                Upload Another Resume
              </button>
            </div>
          </div>
        )}

        {!uploading && !resumeFile && !uploadSuccess && (
          <>
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-16 text-center bg-blue-50 hover:bg-blue-100 transition-colors">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your resume here</h3>
              <p className="text-gray-600 mb-6">or</p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                <Upload className="w-5 h-5" />
                <span>Browse Files</span>
              </label>
              <p className="text-sm text-gray-500 mt-4">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Smart Parsing</h4>
                <p className="text-sm text-gray-600">Extracts all key information</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">OCR Support</h4>
                <p className="text-sm text-gray-600">Works with scanned documents</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Secure Upload</h4>
                <p className="text-sm text-gray-600">Stored in Azure Blob</p>
              </div>
            </div>
          </>
        )}

        {resumeFile && !uploading && !uploadSuccess && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{resumeFile.name}</h3>
            <p className="text-gray-600 mb-2">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <p className="text-gray-500 mb-6">Ready to upload</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleResumeUpload}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Upload Resume
              </button>
              <button
                onClick={() => {
                  setResumeFile(null);
                  setError(null);
                }}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{resumeFile.name}</h3>
            <p className="text-blue-600 mb-6">Processing with AI...</p>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-4 text-left max-w-md mx-auto">
              {[
                { key: 'upload', label: 'Uploading to Azure Blob', desc: 'Uploading your resume securely to cloud storage' },
                { key: 'processing', label: 'AI Processing & Parsing', desc: 'Extracting text and parsing information with AI' },
                { key: 'matching', label: 'Job Matching', desc: 'Finding the best job opportunities for you' }
              ].map((step) => (
                <div key={step.key} className={`flex items-center space-x-3 p-4 rounded-lg ${uploadSteps[step.key] === 'complete' ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${uploadSteps[step.key] === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {uploadSteps[step.key] === 'complete' ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{step.label}</p>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
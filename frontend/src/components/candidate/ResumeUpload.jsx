import React, { useState } from 'react';
import { Upload, FileText, Award, Zap } from 'lucide-react';

const ResumeUpload = ({ onResumeUploaded }) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSteps, setUploadSteps] = useState({
    upload: 'pending',
    processing: 'pending',
    matching: 'pending'
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      setResumeFile(file);
    } else {
      alert('Please upload a PDF or DOC file');
    }
  };

  const handleResumeUpload = () => {
    if (!resumeFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadSteps({ upload: 'pending', processing: 'pending', matching: 'pending' });

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          

          const newResume = {
            id: Date.now().toString(), 
            fileName: resumeFile.name,
            uploadDate: new Date().toISOString(),
            profile: {
              skills: ['Python', 'FastAPI', 'React', 'SQL', 'Docker'],
              experience: [
                {
                  title: 'Senior Full Stack Developer',
                  company: 'Tech Corp',
                  period: '2021 - Present',
                  description: 'Led development of microservices architecture using FastAPI and React'
                },
                {
                  title: 'Full Stack Developer',
                  company: 'StartupXYZ',
                  period: '2018 - 2021',
                  description: 'Built and maintained web applications using modern tech stack'
                }
              ],
              education: {
                degree: 'Bachelor of Science in Computer Science',
                university: 'Stanford University',
                year: '2018'
              },
              certifications: [
                { name: 'Azure Fundamentals', provider: 'Microsoft', year: '2023' },
                { name: 'AWS Solutions Architect', provider: 'Amazon', year: '2022' },
                { name: 'Python Professional', provider: 'Python Institute', year: '2021' }
              ]
            }
          };
          
          setTimeout(() => {
            onResumeUploaded(newResume);
            setResumeFile(null);
            setUploadProgress(0);
            setUploadSteps({ upload: 'pending', processing: 'pending', matching: 'pending' });
          }, 2000);
          return 100;
        }
        
        const newProgress = prev + 10;
        if (newProgress >= 30) setUploadSteps(s => ({ ...s, upload: 'complete' }));
        if (newProgress >= 60) setUploadSteps(s => ({ ...s, processing: 'complete' }));
        if (newProgress >= 90) setUploadSteps(s => ({ ...s, matching: 'complete' }));
        
        return newProgress;
      });
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
          <p className="text-gray-600">Our AI will automatically parse and analyze your resume</p>
        </div>

        {!uploading && !resumeFile && (
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
                <p className="text-sm text-gray-600">AI extracts all key information</p>
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

        {resumeFile && !uploading && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{resumeFile.name}</h3>
            <p className="text-gray-600 mb-6">Ready to upload</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleResumeUpload}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Upload Resume
              </button>
              <button
                onClick={() => setResumeFile(null)}
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
              {['upload', 'processing', 'matching'].map((step) => (
                <div key={step} className={`flex items-center space-x-3 p-4 rounded-lg ${uploadSteps[step] === 'complete' ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${uploadSteps[step] === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {uploadSteps[step] === 'complete' ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {step === 'upload' ? 'Uploading to Azure Blob' : step === 'processing' ? 'AI Processing & Parsing' : 'Job Matching'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {step === 'upload' ? 'Uploading your resume securely to cloud storage' : 
                       step === 'processing' ? 'Extracting text and parsing information with AI' : 
                       'Finding the best job opportunities for you'}
                    </p>
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
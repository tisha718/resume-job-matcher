import React from 'react';
import { FileText, Trash2 } from 'lucide-react';

const MyProfile = ({ uploadedResumes, onDeleteResume }) => {

  const handleDeleteResume = (resumeId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this resume?')) {
      onDeleteResume(resumeId);
    }
  };

  const uniqueResumes = Array.from(
    new Map(uploadedResumes.map(resume => [resume.id, resume])).values()
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {uniqueResumes.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Resumes</h2>
          <div className="space-y-3">
            {uniqueResumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{resume.fileName}</p>
                    <p className="text-sm text-gray-600">
                      Uploaded {new Date(resume.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteResume(resume.id, e)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Resumes Uploaded</h3>
          <p className="text-gray-600">Upload a resume to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MyProfile;

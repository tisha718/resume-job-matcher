import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, FileText, Star, Download, Eye } from 'lucide-react';

const ViewCandidates = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filterMatch, setFilterMatch] = useState('all');

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
      status: 'New'
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
      status: 'Reviewed'
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
      status: 'Interview Scheduled'
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
      status: 'New'
    },
  ];

  const getMatchColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getMatchLabel = (score) => {
    if (score >= 0.8) return 'Strong Match';
    if (score >= 0.6) return 'Good Match';
    return 'Partial Match';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Reviewed': return 'bg-purple-100 text-purple-700';
      case 'Interview Scheduled': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredCandidates = mockCandidates.filter(candidate => {
    if (filterMatch === 'all') return true;
    if (filterMatch === 'strong') return candidate.matchScore >= 0.8;
    if (filterMatch === 'good') return candidate.matchScore >= 0.6 && candidate.matchScore < 0.8;
    return candidate.matchScore < 0.6;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
        <div className="flex items-center space-x-3">
          <select 
            value={filterMatch}
            onChange={(e) => setFilterMatch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Candidates</option>
            <option value="strong">Strong Match</option>
            <option value="good">Good Match</option>
            <option value="partial">Partial Match</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              onClick={() => setSelectedCandidate(candidate)}
              className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer ${
                selectedCandidate?.id === candidate.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>
                    <p className="text-gray-600 text-sm">{candidate.experience} experience</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchColor(candidate.matchScore)}`}>
                    {Math.round(candidate.matchScore * 100)}% Match
                  </span>
                  <p className={`mt-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{candidate.location}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {candidate.skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
                {candidate.skills.length > 4 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    +{candidate.skills.length - 4}
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">Applied on {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Candidate Detail Sidebar */}
        <div className="lg:col-span-1">
          {selectedCandidate ? (
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCandidate.name}</h2>
                <p className="text-gray-600">{selectedCandidate.experience} experience</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </h3>
                  <p className="text-gray-700 text-sm">{selectedCandidate.email}</p>
                  <p className="text-gray-700 text-sm">{selectedCandidate.phone}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location
                  </h3>
                  <p className="text-gray-700 text-sm">{selectedCandidate.location}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Education
                  </h3>
                  <p className="text-gray-700 text-sm">{selectedCandidate.education}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Match Score</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-green-500 to-blue-500 rounded-full"
                        style={{ width: `${selectedCandidate.matchScore * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(selectedCandidate.matchScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download Resume</span>
                </button>
                <button className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                  Schedule Interview
                </button>
                <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Send Message
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
              <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Select a candidate to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewCandidates;
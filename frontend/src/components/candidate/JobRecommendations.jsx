import React, { useState } from 'react';
import { MapPin, Clock, ChevronDown, ChevronUp, Search, Brain, Sparkles, Target } from 'lucide-react';
import InterviewPrep from './InterviewPrep';
import SkillAnalysis from './SkillAnalysis';

const JobRecommendations = () => {
  const [expandedJob, setExpandedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchesPerPage, setMatchesPerPage] = useState('10');
  const [selectedResume, setSelectedResume] = useState("");

  const [showInterviewPrep, setShowInterviewPrep] = useState(false);
  const [showSkillAnalysis, setShowSkillAnalysis] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const mockJobs = [
    { 
      id: 1, 
      title: 'Senior Full Stack Developer', 
      company: 'TechCorp Inc.', 
      location: 'Remote', 
      type: 'Full-time',
      matchScore: 0.92, 
      posted: '2 days ago',
      description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will work on cutting-edge projects using React, Node.js, and cloud technologies.',
      skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      // Backend response fields
      fit_score: 0.92,
      skill_score: 0.85,
      semantic_score: 0.88,
      matched_skills: ['React', 'Node.js'],
      missing_skills: ['MongoDB', 'AWS']
    },
    { 
      id: 2, 
      title: 'Backend Engineer', 
      company: 'StartupXYZ', 
      location: 'San Francisco', 
      type: 'Full-time',
      matchScore: 0.85, 
      posted: '1 week ago',
      description: 'Join our fast-growing startup as a Backend Engineer. Build scalable APIs and microservices that power our platform.',
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes'],
      fit_score: 0.85,
      skill_score: 0.80,
      semantic_score: 0.82,
      matched_skills: ['Python', 'Docker'],
      missing_skills: ['FastAPI', 'PostgreSQL', 'Kubernetes']
    },
    { 
      id: 3, 
      title: 'DevOps Engineer', 
      company: 'CloudSystems', 
      location: 'New York', 
      type: 'Contract',
      matchScore: 0.78, 
      posted: '3 days ago',
      description: 'Help us build and maintain our cloud infrastructure. Automate deployments and ensure high availability.',
      skills: ['Kubernetes', 'Jenkins', 'Terraform', 'AWS'],
      fit_score: 0.78,
      skill_score: 0.75,
      semantic_score: 0.80,
      matched_skills: ['Docker'],
      missing_skills: ['Kubernetes', 'Jenkins', 'Terraform', 'AWS']
    },
    { 
      id: 4, 
      title: 'Frontend Developer', 
      company: 'DesignCo', 
      location: 'Remote', 
      type: 'Part-time',
      matchScore: 0.75, 
      posted: '5 days ago',
      description: 'Create beautiful, responsive user interfaces using modern frontend technologies.',
      skills: ['React', 'Tailwind CSS', 'JavaScript', 'Figma'],
      fit_score: 0.75,
      skill_score: 0.70,
      semantic_score: 0.78,
      matched_skills: ['React'],
      missing_skills: ['Tailwind CSS', 'JavaScript', 'Figma']
    },
  ];

  const availableResumes = [
    { id: 'resume1', name: 'Resume_2024_General.pdf' },
    { id: 'resume2', name: 'Resume_Senior_Developer.pdf' },
    { id: 'resume3', name: 'Resume_Technical_Lead.pdf' }
  ];

  // Filter jobs based on search query
  const filteredJobs = mockJobs.filter(job => 
    job.id.toString().includes(searchQuery) ||
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Limit jobs based on matches per page
  const displayedJobs = filteredJobs.slice(0, parseInt(matchesPerPage) || filteredJobs.length);

  const getMatchColor = (score) => {
    if (score >= 0.8) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-orange-100 text-orange-700 border-orange-200';
  };

  const handleInterviewPrep = (job) => {
    setSelectedJob(job);
    setShowInterviewPrep(true);
  };

  const handleSkillAnalysis = (job) => {
    setSelectedJob(job);
    setShowSkillAnalysis(true);
  };

  const toggleExpanded = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  // If showing interview prep, render only that component
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

  // If showing skill analysis, render only that component
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Matches</h1>
          <p className="text-gray-600 text-sm mt-1">{displayedJobs.length} positions found</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">AI Matched</span>
        </div>
      </div>

      {/* Filters - Minimal Design */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs (company name/id)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Show Count */}
          <input
            type="number"
            min="1"
            max="50"
            onChange={(e) => setMatchesPerPage(e.target.value)}
            placeholder="Number of matches"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Resume Select */}
         <select
  value={selectedResume}
  onChange={(e) => setSelectedResume(e.target.value)}
  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white 
    ${selectedResume === "" ? "text-gray-400" : "text-gray-900"}
  `}
>
  <option value="" disabled hidden className="text-gray-400">
    Select Resume
  </option>

  {availableResumes.map((resume) => (
    <option key={resume.id} value={resume.id} className="text-gray-900">
      {resume.name}
    </option>
  ))}
</select>

        </div>
      </div>
      
      {/* Job Cards */}
      <div className="space-y-3">
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => {
            const isExpanded = expandedJob === job.id;
            
            return (
              <div
                key={job.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all overflow-hidden"
              >
                {/* Collapsed View */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpanded(job.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getMatchColor(job.matchScore)}`}>
                          {Math.round(job.matchScore * 100)}%
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{job.company}</p>
                      
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{job.type}</span>
                        </div>
                        <span>• Posted {job.posted}</span>
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

                {/* Expanded View */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">About the Role</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSkillAnalysis(job);
                        }}
                        className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        Skill Analysis
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInterviewPrep(job);
                        }}
                        className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Brain className="w-4 h-4" />
                        Interview Prep
                      </button>
                      <button className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        Apply Now
                      </button>
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
    </div>
  );
};

export default JobRecommendations;
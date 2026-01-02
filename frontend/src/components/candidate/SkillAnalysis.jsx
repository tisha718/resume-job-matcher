import React from 'react';
import { ArrowLeft, Target, TrendingUp, Award, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

const SkillAnalysis = ({ selectedJob, onClose }) => {
  // Calculate percentages for visual representation
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 0.8) return 'bg-green-100';
    if (score >= 0.6) return 'bg-yellow-100';
    return 'bg-orange-100';
  };

  const getProgressColor = (score) => {
    if (score >= 0.8) return 'bg-green-600';
    if (score >= 0.6) return 'bg-yellow-600';
    return 'bg-orange-600';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border-gray-200 rounded-lg p-6 text-black">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-black/90 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Job Matches</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Skill Analysis</h1>
            </div>
            <h2 className="text-xl font-semibold mb-1">{selectedJob.title}</h2>
            <p className="text-black">{selectedJob.company}</p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Analyzed</span>
          </div>
        </div>
      </div>

      {/* Overall Fit Score - Large Display */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Award className="w-12 h-12 text-orange-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Fit Score</h2>
        <div className="text-6xl font-bold text-orange-600 mb-2">
          {Math.round(selectedJob.fit_score * 100)}%
        </div>
        <p className="text-gray-600">
          {selectedJob.fit_score >= 0.8 ? 'Excellent Match!' : 
           selectedJob.fit_score >= 0.6 ? 'Good Match' : 
           'Fair Match'}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Skill Score */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${getScoreBgColor(selectedJob.skill_score)} rounded-full flex items-center justify-center`}>
                <Target className={`w-6 h-6 ${getScoreColor(selectedJob.skill_score)}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Skill Score</h3>
                <p className="text-sm text-gray-600">Technical match</p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(selectedJob.skill_score)}`}>
              {Math.round(selectedJob.skill_score * 100)}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${getProgressColor(selectedJob.skill_score)}`}
              style={{ width: `${selectedJob.skill_score * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Semantic Score */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${getScoreBgColor(selectedJob.semantic_score)} rounded-full flex items-center justify-center`}>
                <TrendingUp className={`w-6 h-6 ${getScoreColor(selectedJob.semantic_score)}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Semantic Score</h3>
                <p className="text-sm text-gray-600">Context match</p>
              </div>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(selectedJob.semantic_score)}`}>
              {Math.round(selectedJob.semantic_score * 100)}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${getProgressColor(selectedJob.semantic_score)}`}
              style={{ width: `${selectedJob.semantic_score * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matched Skills */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Matched Skills</h3>
              <p className="text-sm text-gray-600">{selectedJob.matched_skills.length} skills you have</p>
            </div>
          </div>

          {selectedJob.matched_skills.length > 0 ? (
            <div className="space-y-2">
              {selectedJob.matched_skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <span className="text-sm font-medium text-green-900">{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No matching skills found</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Missing Skills</h3>
              <p className="text-sm text-gray-600">{selectedJob.missing_skills.length} skills to learn</p>
            </div>
          </div>

          {selectedJob.missing_skills.length > 0 ? (
            <div className="space-y-2">
              {selectedJob.missing_skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span className="text-sm font-medium text-red-900">{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">You have all required skills!</p>
          )}
        </div>
      </div>



      
    </div>
  );
};

export default SkillAnalysis;
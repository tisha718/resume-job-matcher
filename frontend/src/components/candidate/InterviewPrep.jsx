import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Brain, CheckCircle, Lightbulb, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { candidateAPI } from '../../services/api';

const InterviewPrep = ({ selectedJob, onClose }) => {
  const [step, setStep] = useState('configure'); // 'configure' or 'questions'
  const [difficulty, setDifficulty] = useState('');
  const [generating, setGenerating] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [error, setError] = useState(null);

  // Generate questions using real API
  const generateQuestions = async () => {
    if (!difficulty) {
      alert('Please select a difficulty level');
      return;
    }

    setGenerating(true);
    setError(null);
    
    try {
      // Call the real API endpoint
      const response = await candidateAPI.generateInterviewQuestions(
        selectedJob.job_id, 
        difficulty
      );
      
      // Format the response to match our UI structure
      const formattedData = {
        technical: response.data.technical_questions.map((q, index) => ({
          question: q,
          difficulty: difficulty,
          number: index + 1
        })),
        behavioral: response.data.behavioral_questions.map((q, index) => ({
          question: q,
          framework: "STAR Method",
          number: index + 1
        }))
      };
      
      setInterviewData(formattedData);
      setStep('questions');
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err.response?.data?.detail || 'Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const studyGuide = {
    mustKnow: [
      "Your resume - be ready to explain every project and technology",
      `${selectedJob.company}'s products, mission, and recent news`,
      "Your salary expectations and career goals",
      "Your availability for follow-ups"
    ],
    dayBefore: [
      "Review your resume and practice explaining projects",
      "Prepare questions to ask the interviewer",
      "Test your equipment (camera, mic, internet)",
      "Get a good night's sleep"
    ],
    during: [
      "Think out loud - explain your reasoning",
      "Ask clarifying questions before diving in",
      "Use the STAR method for behavioral questions",
      "Show enthusiasm and cultural fit"
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-white/90 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back to Job Matches</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Interview Preparation</h1>
            </div>
            <h2 className="text-xl font-semibold mb-1">{selectedJob.title}</h2>
            <p className="text-purple-100">{selectedJob.company}</p>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Configuration Step */}
      {step === 'configure' && (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Configuration Options */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Difficulty Selection - MANDATORY */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Difficulty Level <span className="text-red-600">*</span>
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className={`w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white ${
                    !difficulty ? 'border-gray-300' : 'border-purple-500'
                  }`}
                >
                  <option value="">-- Select Difficulty Level --</option>
                  <option value="Easy">Easy - Beginner friendly questions</option>
                  <option value="Medium">Medium - Intermediate level questions</option>
                  <option value="Hard">Hard - Advanced technical questions</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateQuestions}
                disabled={!difficulty || generating}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                  !difficulty || generating
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                }`}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Questions with DeepSeek AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Generate Interview Questions</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">AI-Powered Questions</p>
              <p>Our system uses DeepSeek AI to generate customized interview questions based on the job requirements and your selected difficulty level.</p>
            </div>
          </div>
        </>
      )}

      {/* Questions Display Step */}
      {step === 'questions' && interviewData && (
        <>
          {/* Action Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {difficulty} Level
              </span>
              <span className="text-sm text-gray-600">
                {interviewData.technical.length + interviewData.behavioral.length} Questions Generated
              </span>
            </div>

            <button
              onClick={() => {
                setStep('configure');
                setInterviewData(null);
                setDifficulty('');
              }}
              className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              Change difficulty level
            </button>
          </div>

          {/* Technical Questions */}
          {interviewData.technical.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Technical Questions</h2>
                  <p className="text-sm text-gray-600">{interviewData.technical.length} questions</p>
                </div>
              </div>

              <div className="space-y-4">
                {interviewData.technical.map((q, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <p className="text-base text-gray-900 leading-relaxed">
                        {q.question}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Behavioral Questions */}
          {interviewData.behavioral.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Behavioral Questions</h2>
                  <p className="text-sm text-gray-600">{interviewData.behavioral.length} questions with STAR method</p>
                </div>
              </div>

              <div className="space-y-4">
                {interviewData.behavioral.map((q, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base text-gray-900 leading-relaxed mb-2">
                          {q.question}
                        </p>
                        <div className="inline-flex items-center px-2 py-1 bg-green-50 rounded text-xs font-medium text-green-700">
                          💡 Use STAR Method
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* STAR Method Explanation */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">STAR Method Framework:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="font-bold text-green-800">S</span>
                    <span className="text-green-700">ituation</span>
                  </div>
                  <div>
                    <span className="font-bold text-green-800">T</span>
                    <span className="text-green-700">ask</span>
                  </div>
                  <div>
                    <span className="font-bold text-green-800">A</span>
                    <span className="text-green-700">ction</span>
                  </div>
                  <div>
                    <span className="font-bold text-green-800">R</span>
                    <span className="text-green-700">esult</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Study Guide */}
          <div className="bg-linear-to-r from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Lightbulb className="w-6 h-6 text-orange-600" />
              <span>Interview Preparation Checklist</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Must Know</h3>
                <ul className="space-y-2">
                  {studyGuide.mustKnow.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Day Before</h3>
                <ul className="space-y-2">
                  {studyGuide.dayBefore.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">During Interview</h3>
                <ul className="space-y-2">
                  {studyGuide.during.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InterviewPrep;
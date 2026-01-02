import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Brain, CheckCircle, Lightbulb, Sparkles, Zap, Settings } from 'lucide-react';

const InterviewPrep = ({ selectedJob, onClose }) => {
  const [step, setStep] = useState('configure'); // 'configure' or 'questions'
  const [difficulty, setDifficulty] = useState('');
  const [numQuestions, setNumQuestions] = useState('5');
  const [generating, setGenerating] = useState(false);
  const [interviewData, setInterviewData] = useState(null);

  // Generate questions (will be replaced with DeepSeek AI API call)
  const generateQuestions = async () => {
    if (!difficulty) {
      alert('Please select a difficulty level');
      return;
    }

    setGenerating(true);
    
    try {
    
      // Mock API call - simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data (replace with actual API response)
      setInterviewData(getMockQuestions());
      setStep('questions');
    } catch (err) {
      console.error('Error generating questions:', err);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };


  const getMockQuestions = () => {
    const questionCount = parseInt(numQuestions);
    const technical = [];
    const behavioral = [];
    
    // Generate technical questions based on job skills
    for (let i = 0; i < Math.ceil(questionCount * 0.6); i++) {
      technical.push({
        question: `Technical question ${i + 1} about ${selectedJob.skills[i % selectedJob.skills.length]} for ${selectedJob.title}?`,
        difficulty: difficulty,
        topic: selectedJob.skills[i % selectedJob.skills.length]
      });
    }
    
    // Generate behavioral questions
    for (let i = 0; i < Math.floor(questionCount * 0.4); i++) {
      behavioral.push({
        question: `Behavioral question ${i + 1}: Describe a situation relevant to ${selectedJob.title} role?`,
        framework: "STAR Method"
      });
    }
    
    return { technical, behavioral };
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
      "Questions to ask the interviewer",
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
                    <span>Generating Questions with AI...</span>
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
                    <div className="flex items-start justify-between mb-3">
                      
                 
                    </div>
                    
                    <p className="text-base font-medium text-gray-900">
                      Q{index + 1}: {q.question}
                    </p>
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
                  <p className="text-sm text-gray-600">{interviewData.behavioral.length} questions </p>
                </div>
              </div>

              <div className="space-y-4">
                {interviewData.behavioral.map((q, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow">
                
                    <p className="text-base font-medium text-gray-900">
                      Q{index + 1}: {q.question}
                    </p>


                  </div>
                ))}
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
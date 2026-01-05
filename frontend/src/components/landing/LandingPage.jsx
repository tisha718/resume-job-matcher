import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, Zap, FileText, TrendingUp } from 'lucide-react';

// ✅ IMPORT COMMON COMPONENTS
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const LandingPage = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Smart Resume Parsing",
      description: "AI-powered extraction of skills, experience, and qualifications from any resume format."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Intelligent Matching",
      description: "Advanced algorithms match candidates to jobs based on skills, experience, and cultural fit."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Get real-time insights on candidate pipeline, match scores, and hiring metrics."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Auto-Generated Questions",
      description: "AI creates relevant interview questions based on job requirements and candidate profiles."
    }
  ];

  const stats = [
    { value: "95%", label: "Match Accuracy" },
    { value: "70%", label: "Time Saved" },
    { value: "10x", label: "Faster Screening" }
  ];

  return (
    <div className="min-h-screen w-screen bg-linear-to-br from-blue-50 to-indigo-50">
      
     
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Hire Smarter with
            <span className="text-blue-600"> AI-Powered</span> Recruitment
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your hiring process with intelligent resume screening,
            automated candidate matching, and data-driven insights.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup?role=recruiter"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              For Recruiters
            </Link>
            <Link
              to="/signup?role=candidate"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              For Candidates
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need for modern recruitment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div
                className={`text-blue-600 mb-4 transition-transform duration-300 ${
                  hoveredFeature === index ? 'scale-110' : ''
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of recruiters and candidates using SmartRecruit
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* ✅ REUSABLE FOOTER */}
      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

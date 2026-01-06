import React from 'react';
import { Briefcase, User, LogOut, Menu } from 'lucide-react';

const DashboardNavbar = ({ userType, userName, onLogout, onMenuToggle, showMobileMenu }) => {
  return (
    <div className="bg-blue-600 text-white py-3 sm:py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
            {userType === 'recruiter' ? (
              <Briefcase className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            ) : (
              <User className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold">
              Welcome back, {userName}!
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              {userType === 'recruiter' ? 'Recruiter' : 'Candidate'} Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {userType === 'recruiter' && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={onLogout}
            className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
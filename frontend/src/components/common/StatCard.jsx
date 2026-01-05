import React from 'react';

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, onClick }) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 ${
        onClick ? 'transform hover:scale-105 transition-transform cursor-pointer' : ''
      }`}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-xs sm:text-sm">{title}</p>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 ${bgColor} rounded-full flex items-center justify-center`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </Component>
  );
};

export default StatCard;
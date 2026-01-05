import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Overall Analytics Pipeline Component
export const AnalyticsPipeline = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Mock data - no backend integration yet
      setAnalytics({
        total_applications: 105,
        applied: 105,
        screened: 80,
        interviewed: 45,
        offered: 20,
        rejected: 15
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        total_applications: 105,
        applied: 105,
        screened: 80,
        interviewed: 45,
        offered: 20,
        rejected: 15
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Overall Hiring Pipeline</h2>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Overall Hiring Pipeline</h2>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-gray-700 text-sm sm:text-base">Total Applications</span>
          <div className="flex items-center space-x-2">
            <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
              <div className="h-3 sm:h-4 bg-indigo-600 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">
              {analytics.total_applications}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-gray-700 text-sm sm:text-base">Applied</span>
          <div className="flex items-center space-x-2">
            <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
              <div 
                className="h-3 sm:h-4 bg-blue-600 rounded-full" 
                style={{ width: `${(analytics.applied / analytics.total_applications * 100)}%` }}
              ></div>
            </div>
            <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">
              {analytics.applied}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-gray-700 text-sm sm:text-base">Screened</span>
          <div className="flex items-center space-x-2">
            <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
              <div 
                className="h-3 sm:h-4 bg-green-600 rounded-full" 
                style={{ width: `${(analytics.screened / analytics.total_applications * 100)}%` }}
              ></div>
            </div>
            <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">
              {analytics.screened}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-gray-700 text-sm sm:text-base">Interviewed</span>
          <div className="flex items-center space-x-2">
            <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
              <div 
                className="h-3 sm:h-4 bg-yellow-600 rounded-full" 
                style={{ width: `${(analytics.interviewed / analytics.total_applications * 100)}%` }}
              ></div>
            </div>
            <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">
              {analytics.interviewed}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-gray-700 text-sm sm:text-base">Offered</span>
          <div className="flex items-center space-x-2">
            <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
              <div 
                className="h-3 sm:h-4 bg-purple-600 rounded-full" 
                style={{ width: `${(analytics.offered / analytics.total_applications * 100)}%` }}
              ></div>
            </div>
            <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">
              {analytics.offered}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-gray-700 text-sm sm:text-base">Rejected</span>
          <div className="flex items-center space-x-2">
            <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
              <div 
                className="h-3 sm:h-4 bg-red-600 rounded-full" 
                style={{ width: `${(analytics.rejected / analytics.total_applications * 100)}%` }}
              ></div>
            </div>
            <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">
              {analytics.rejected}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Match Distribution Chart Component
export const MatchDistributionChart = () => {
  const chartData = [
    { name: 'Strong Match', value: 30, color: '#10b981' },
    { name: 'Good Match', value: 45, color: '#f59e0b' },
    { name: 'Weak Match', value: 30, color: '#ef4444' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Match Distribution</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Top Skills Chart Component
export const TopSkillsChart = () => {
  const skillsData = [
    { skill: 'React', count: 38 },
    { skill: 'Python', count: 42 },
    { skill: 'Node.js', count: 35 },
    { skill: 'SQL', count: 40 },
    { skill: 'Docker', count: 28 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Top Skills</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={skillsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
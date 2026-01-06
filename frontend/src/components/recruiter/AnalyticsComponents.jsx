import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';

/* =========================
   Overall Hiring Pipeline
========================= */
export const AnalyticsPipeline = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        'http://127.0.0.1:8001/application/analytics/summary'
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        total_applications: 0,
        applied: 0,
        shortlisted: 0,
        interviewed: 0,
        offered: 0,
        rejected: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Overall Hiring Pipeline
        </h2>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        Overall Hiring Pipeline
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {[
          ['Total Applications', analytics.total_applications, 'bg-indigo-600', 100],
          ['Applied', analytics.applied, 'bg-blue-600'],
          ['Shortlisted', analytics.shortlisted, 'bg-green-600'],
          ['Interviewed', analytics.interviewed, 'bg-yellow-600'],
          ['Offered', analytics.offered, 'bg-purple-600'],
          ['Rejected', analytics.rejected, 'bg-red-600'],
        ].map(([label, value, color, fixed]) => (
          <div
            key={label}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span className="text-gray-700 text-sm sm:text-base">{label}</span>
            <div className="flex items-center space-x-2">
              <div className="flex-1 sm:w-48 lg:w-64 h-3 sm:h-4 bg-gray-200 rounded-full">
                <div
                  className={`h-3 sm:h-4 rounded-full ${color}`}
                  style={{
                    width: fixed
                      ? '100%'
                      : `${analytics.total_applications
                        ? (value / analytics.total_applications) * 100
                        : 0}%`
                  }}
                />
              </div>
              <span className="text-gray-900 font-semibold text-sm sm:text-base w-8 text-right">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================
   Match Distribution Chart
========================= */
export const MatchDistributionChart = () => {
  const [fitData, setFitData] = useState(null);

  useEffect(() => {
    axios
      .get(
        encodeURI(
          'http://127.0.0.1:8001/application/analytics/Overall job fit-score-distribution'
        )
      )
      .then(res => setFitData(res.data))
      .catch(err => console.error('Fit score error:', err));
  }, []);

  if (!fitData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Match Distribution
        </h2>
        <p className="text-gray-600">Loading match distribution...</p>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Strong Match',
      value: fitData.fit_score_distribution?.['strong (>=80)'] || 0,
      color: '#10b981'
    },
    {
      name: 'Good Match',
      value: fitData.fit_score_distribution?.['good (60-79)'] || 0,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        Match Distribution
      </h2>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={60}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/* =========================
   Top Skills Chart (UNCHANGED)
========================= */
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
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
        Top Skills
      </h2>

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
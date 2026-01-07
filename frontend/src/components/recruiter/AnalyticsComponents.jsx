import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import api from '../../services/api';

/* =====================================================
   1️⃣ OVERALL HIRING PIPELINE
===================================================== */
export const AnalyticsPipeline = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/analytics/summary');
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics summary error:', err);
        setAnalytics({
          total_applications: 0,
          applied: 0,
          shortlisted: 0,
          interviewed: 0,
          offered: 0,
          rejected: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Overall Hiring Pipeline</h2>
        <p className="text-gray-600">Loading analytics…</p>
      </div>
    );
  }

  const pipeline = [
    ['Applied', analytics.applied, 'bg-blue-600'],
    ['Shortlisted', analytics.shortlisted, 'bg-green-600'],
    ['Interviewed', analytics.interviewed, 'bg-yellow-600'],
    ['Offered', analytics.offered, 'bg-purple-600'],
    ['Rejected', analytics.rejected, 'bg-red-600'],
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Overall Hiring Pipeline</h2>

      <div className="space-y-3">
        <div className="flex justify-between font-semibold">
          <span>Total Applications</span>
          <span>{analytics.total_applications}</span>
        </div>

        {pipeline.map(([label, value, color]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-28 text-sm">{label}</span>
            <div className="flex-1 h-3 bg-gray-200 rounded-full">
              <div
                className={`h-3 rounded-full ${color}`}
                style={{
                  width: analytics.total_applications
                    ? `${(value / analytics.total_applications) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <span className="w-8 text-right font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =====================================================
   2️⃣ MATCH DISTRIBUTION (FIT SCORE)
===================================================== */
export const MatchDistributionChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        const res = await api.get(
          '/analytics/overall-job-fit-score-distribution'
        );
        setData(res.data);
      } catch (err) {
        console.error('Fit distribution error:', err);
      }
    };

    fetchDistribution();
  }, []);

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Match Distribution</h2>
        <p className="text-gray-600">Loading match data…</p>
      </div>
    );
  }

  const chartData = [
    {
      name: 'Strong Match',
      value: data.fit_score_distribution?.['strong (>=80)'] || 0,
      color: '#10b981',
    },
    {
      name: 'Good Match',
      value: data.fit_score_distribution?.['good (60-79)'] || 0,
      color: '#f59e0b',
    },
    {
      name: 'Average Match',
      value: data.fit_score_distribution?.['average (<60)'] || 0,
      color: '#ef4444',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Match Distribution</h2>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) =>
              `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
            }
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

/* =====================================================
   3️⃣ TOP SKILLS (STATIC FOR NOW)
===================================================== */
export const TopSkillsChart = () => {
  const skillsData = [
    { skill: 'React', count: 38 },
    { skill: 'Python', count: 42 },
    { skill: 'Node.js', count: 35 },
    { skill: 'SQL', count: 40 },
    { skill: 'Docker', count: 28 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-4">Top Skills</h2>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={skillsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="skill" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

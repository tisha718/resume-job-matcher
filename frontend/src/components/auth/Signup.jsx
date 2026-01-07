import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'candidate';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.signup({
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      const token = res.data.access_token;

      // AuthContext handles decoding + role
      login(token);

      navigate(
        formData.role === 'recruiter'
          ? '/recruiter/dashboard'
          : '/candidate/dashboard'
      );
    } catch (err) {
      setError(
        err?.response?.data?.detail || 'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Briefcase className="w-10 h-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">SmartRecruit</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join us and start your journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'candidate' })}
                  className={`p-3 rounded-lg border-2 ${
                    formData.role === 'candidate'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto mb-1" />
                  Candidate
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                  className={`p-3 rounded-lg border-2 ${
                    formData.role === 'recruiter'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300'
                  }`}
                >
                  <Briefcase className="w-5 h-5 mx-auto mb-1" />
                  Recruiter
                </button>
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <input
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="p-3 border rounded-lg"
              />
              <input
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="p-3 border rounded-lg"
              />
            </div>

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg"
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

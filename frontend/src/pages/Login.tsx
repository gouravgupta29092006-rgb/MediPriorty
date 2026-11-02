import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { AuthResponse, User } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>('/auth/login', { 
        email: trimmedEmail, 
        password 
      });
      const authData = response.data;
      const user: User = {
        userId: authData.userId,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
        active: true,
        createdAt: new Date().toISOString(),
      };
      login(authData.token, user);
      navigate('/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError('Unable to reach server. Please ensure the backend service is running on port 8080.');
      } else if (err.response.status === 401) {
        setError(err.response.data?.message || 'Invalid email or password. Please try again.');
      } else if (err.response.status === 403) {
        setError(err.response.data?.message || 'Access denied. Your account may be deactivated.');
      } else if (err.response.status === 400 && err.response.data?.fieldErrors) {
        const firstField = Object.values(err.response.data.fieldErrors)[0];
        setError(typeof firstField === 'string' ? firstField : 'Please provide valid login details.');
      } else {
        setError(err.response.data?.message || 'An unexpected error occurred during authentication.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5F3] via-[#F3F8F7] to-[#E0EFED] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Ambient background shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-light)] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--success-light)] rounded-full blur-3xl opacity-40 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent shadow-lg mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">MediPriority</h1>
          <p className="text-sm text-text-secondary mt-1">
            Intelligent Emergency Triage &amp; Resource Allocation System
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-surface rounded-2xl p-7 border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-md)' }}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Sign In to Command Center</h2>
            <p className="text-xs text-text-secondary mt-0.5">Enter authorized clinical credentials</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[var(--critical-light)] border border-[var(--critical)] flex items-start gap-2.5 text-xs text-[var(--critical)]">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@medipriority.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg-surface-2 border border-[var(--border)] rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-accent hover:bg-accent-hover active:bg-accent-hover disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate &amp; Enter →</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-accent" />
              <span>Quick Demo Credentials</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoRole('admin@medipriority.com', 'Admin@123')}
                className="py-1.5 px-2 bg-bg-surface-2 hover:bg-accent-light border border-[var(--border)] hover:border-[var(--accent)] rounded text-[11px] font-medium text-text-secondary hover:text-text-primary transition-all text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('dispatcher@medipriority.com', 'Dispatch@123')}
                className="py-1.5 px-2 bg-bg-surface-2 hover:bg-[var(--warning-light)] border border-[var(--border)] hover:border-[var(--warning)] rounded text-[11px] font-medium text-text-secondary hover:text-text-primary transition-all text-center"
              >
                Dispatcher
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('doctor@medipriority.com', 'Doctor@123')}
                className="py-1.5 px-2 bg-bg-surface-2 hover:bg-[var(--success-light)] border border-[var(--border)] hover:border-[var(--success)] rounded text-[11px] font-medium text-text-secondary hover:text-text-primary transition-all text-center"
              >
                Doctor
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-text-secondary mt-6">
          MediPriority Clinical Decision Support Platform • Spring Boot + React
        </p>
      </div>
    </div>
  );
};

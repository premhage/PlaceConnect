import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Lock,
  Mail,
  GraduationCap,
  Building2,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (result.user.role === 'admin') navigate('/admin/dashboard');
        else if (result.user.role === 'recruiter') navigate('/recruiter/dashboard');
        else navigate('/student/dashboard');
      }
    } else {
      setErrorMessage(result.message || 'Invalid credentials.');
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8">
          <div className="pc-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div
                className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '56px', height: '56px' }}
              >
                <Briefcase size={28} />
              </div>
              <h3 className="fw-bold mb-1">PlaceConnect Login</h3>
              <p className="text-muted small">Sign in to your university placement portal</p>
            </div>

            {errorMessage && (
              <div className="alert alert-danger py-2 small mb-3">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail size={16} className="text-muted" />
                  </span>
                  <input
                    type="email"
                    required
                    className="form-control bg-light border-start-0"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold mb-0">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Lock size={16} className="text-muted" />
                  </span>
                  <input
                    type="password"
                    required
                    className="form-control bg-light border-start-0"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-pc-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Viva & Evaluation Demo Quick-Fill Section */}
            <div className="p-3 rounded-3 bg-light border mt-4">
              <div className="d-flex align-items-center gap-1 small fw-bold text-dark mb-2">
                <Sparkles size={14} className="text-primary" />
                <span>Quick-Fill Demo Credentials (Academic Evaluation)</span>
              </div>
              <div className="d-grid gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@placeconnect.edu', 'Admin@123456')}
                  className="btn btn-sm btn-outline-secondary text-start d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-1">
                    <Shield size={14} className="text-danger" /> Admin (Placement Officer)
                  </span>
                  <span className="badge bg-secondary">Fill</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('aarav.sharma@student.edu', 'Password@123')}
                  className="btn btn-sm btn-outline-secondary text-start d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-1">
                    <GraduationCap size={14} className="text-primary" /> Student (Aarav - Placed)
                  </span>
                  <span className="badge bg-secondary">Fill</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('recruiter.msft@microsoft.com', 'Password@123')}
                  className="btn btn-sm btn-outline-secondary text-start d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-1">
                    <Building2 size={14} className="text-info" /> Recruiter (Microsoft)
                  </span>
                  <span className="badge bg-secondary">Fill</span>
                </button>
              </div>
            </div>

            <div className="text-center mt-4 small text-muted">
              Don't have an account?{' '}
              <Link to="/register/student" className="fw-semibold text-primary">
                Register as Student
              </Link>{' '}
              or{' '}
              <Link to="/register/recruiter" className="fw-semibold text-primary">
                Recruiter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, ArrowRight, User, Mail, Lock, Phone, BookOpen, Award } from 'lucide-react';

export const RegisterStudentPage = () => {
  const { registerStudent } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    PRN: '',
    phone: '',
    branch: 'Computer Engineering',
    graduationYear: 2026,
    CGPA: '',
    backlogs: 0,
    skills: '',
    bio: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic frontend checks
    const cgpaVal = parseFloat(formData.CGPA);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      setErrorMessage('CGPA must be a valid number between 0.00 and 10.00');
      return;
    }

    setSubmitting(true);
    const result = await registerStudent(formData);
    setSubmitting(false);

    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setErrorMessage(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="pc-card p-4 p-md-5">
            <div className="text-center mb-4">
              <div
                className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '56px', height: '56px' }}
              >
                <GraduationCap size={28} />
              </div>
              <h3 className="fw-bold mb-1">Student Registration</h3>
              <p className="text-muted small">Create your student profile to access campus recruitment drives</p>
            </div>

            {errorMessage && (
              <div className="alert alert-danger py-2 small mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Full Name */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    className="form-control"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email Address *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    className="form-control"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    name="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                {/* PRN */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">PRN (Permanent Reg. No.) *</label>
                  <input
                    type="text"
                    required
                    name="PRN"
                    className="form-control font-monospace"
                    placeholder="e.g. PRN2022001"
                    value={formData.PRN}
                    onChange={handleChange}
                  />
                </div>

                {/* Phone */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    className="form-control"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Engineering Branch */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Engineering Branch *</label>
                  <select
                    name="branch"
                    className="form-select"
                    value={formData.branch}
                    onChange={handleChange}
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Telecommunication">Electronics & Telecom (ENTC)</option>
                    <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Graduation Year */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Graduation Year *</label>
                  <input
                    type="number"
                    required
                    min={2024}
                    max={2032}
                    name="graduationYear"
                    className="form-control"
                    value={formData.graduationYear}
                    onChange={handleChange}
                  />
                </div>

                {/* CGPA */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Current CGPA (0 - 10) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    required
                    name="CGPA"
                    className="form-control"
                    placeholder="e.g. 8.75"
                    value={formData.CGPA}
                    onChange={handleChange}
                  />
                </div>

                {/* Active Backlogs */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Active Backlogs *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    name="backlogs"
                    className="form-control"
                    value={formData.backlogs}
                    onChange={handleChange}
                  />
                </div>

                {/* Skills */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Key Skills (Comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    className="form-control"
                    placeholder="e.g. React, Node.js, Python, SQL, C++"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                  <small className="text-muted">Used for automatic skill-matching algorithms on job postings.</small>
                </div>

                {/* Bio / Summary */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Professional Summary / Objective</label>
                  <textarea
                    rows={2}
                    name="bio"
                    className="form-control"
                    placeholder="Brief 1-2 sentence academic summary..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-pc-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <span>Complete Student Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4 small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-primary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

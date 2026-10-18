import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ArrowRight, ShieldCheck, Mail, Lock, Globe, MapPin } from 'lucide-react';

export const RegisterRecruiterPage = () => {
  const { registerRecruiter } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    industry: 'Information Technology & Software',
    location: '',
    description: '',
    website: '',
    contactPerson: '',
    contactPhone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    const result = await registerRecruiter(formData);
    setSubmitting(false);

    if (result.success) {
      navigate('/recruiter/dashboard');
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
                className="p-3 rounded-circle bg-info bg-opacity-10 text-info d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: '56px', height: '56px' }}
              >
                <Building2 size={28} />
              </div>
              <h3 className="fw-bold mb-1">Recruiter & Company Registration</h3>
              <p className="text-muted small">Register your organization to hire campus engineering talent</p>
            </div>

            <div className="alert alert-primary py-2 small d-flex align-items-center gap-2 mb-4">
              <ShieldCheck size={18} className="flex-shrink-0" />
              <span>
                Company registrations undergo validation by the Placement Cell before job postings become visible to students.
              </span>
            </div>

            {errorMessage && (
              <div className="alert alert-danger py-2 small mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">1. Primary Recruiter Representative</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Representative Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    className="form-control"
                    placeholder="e.g. Aditi Rao"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Official Corporate Email *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    className="form-control"
                    placeholder="aditi.rao@company.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Account Password *</label>
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

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={formData.contactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">2. Corporate & Entity Profile</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Company / Organization Legal Name *</label>
                  <input
                    type="text"
                    required
                    name="companyName"
                    className="form-control"
                    placeholder="e.g. Microsoft Corporation India"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Industry Sector *</label>
                  <input
                    type="text"
                    required
                    name="industry"
                    className="form-control"
                    placeholder="e.g. Software & Cloud Computing"
                    value={formData.industry}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Headquarters / Office Location *</label>
                  <input
                    type="text"
                    required
                    name="location"
                    className="form-control"
                    placeholder="e.g. Bengaluru, Karnataka"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Website URL</label>
                  <input
                    type="url"
                    name="website"
                    className="form-control"
                    placeholder="https://careers.company.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Company Overview / Description *</label>
                  <textarea
                    rows={3}
                    required
                    name="description"
                    className="form-control"
                    placeholder="Briefly describe your company culture, technology stack, and engineering mission..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-3 border-top">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-pc-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <span>Submit Recruiter Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4 small text-muted">
              Already registered?{' '}
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

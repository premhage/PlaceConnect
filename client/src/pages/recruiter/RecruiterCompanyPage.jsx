import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Building2, Save, Globe, MapPin, Mail, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';

export const RecruiterCompanyPage = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    location: '',
    description: '',
    website: '',
    logoUrl: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await api.get('/companies/me');
      if (res.data.success) {
        const c = res.data.data;
        setCompany(c);
        setFormData({
          companyName: c.companyName || '',
          industry: c.industry || '',
          location: c.location || '',
          description: c.description || '',
          website: c.website || '',
          logoUrl: c.logoUrl || '',
          contactPerson: c.contactInformation?.contactPerson || '',
          contactEmail: c.contactInformation?.contactEmail || '',
          contactPhone: c.contactInformation?.contactPhone || '',
        });
      }
    } catch (err) {
      toast.error('Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/companies/me', formData);
      if (res.data.success) {
        toast.success('Company profile updated successfully.');
        setCompany(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update company.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading company profile..." />;

  return (
    <div className="recruiter-company-page">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Company Profile & Verification</h3>
        <p className="text-muted small mb-0">
          Maintain your organization details displayed to student applicants and placement officers.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="pc-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
              <h5 className="fw-bold mb-0">Corporate Information</h5>
              <div className="d-flex align-items-center gap-2">
                <span className="small text-muted">Verification Status:</span>
                <StatusBadge status={company?.approvalStatus} />
              </div>
            </div>

            {company?.approvalStatus === 'rejected' && (
              <div className="alert alert-danger small mb-4">
                <strong>Rejection Reason from Placement Cell:</strong>{' '}
                {company.rejectionReason || 'Please contact the placement cell to rectify required documentation.'}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Company Name *</label>
                  <input
                    type="text"
                    required
                    name="companyName"
                    className="form-control"
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
                    value={formData.industry}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">HQ / Office Location *</label>
                  <input
                    type="text"
                    required
                    name="location"
                    className="form-control"
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
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Company Overview / Culture *</label>
                  <textarea
                    rows={4}
                    required
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <h6 className="fw-bold text-dark pt-3 border-top mb-1">Campus Outreach Representative Contact</h6>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    className="form-control"
                    value={formData.contactPerson}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="form-control"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    className="form-control"
                    value={formData.contactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-pc-primary d-inline-flex align-items-center gap-2"
                >
                  {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={16} />}
                  <span>Save Company Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="pc-card p-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <span>Campus Recruitment Guidelines</span>
            </h6>
            <p className="text-muted small mb-3">
              Placement Cell policy requires all recruiters to maintain accurate compensation breakdowns (Fixed vs. Performance Bonus) and adhere to non-discrimination hiring guidelines.
            </p>
            <div className="p-3 bg-light rounded-3 border small">
              <div className="fw-bold text-dark mb-1">Approval SLA:</div>
              <div className="text-muted">
                Initial company verifications are typically reviewed by the Placement Officer within 24 business hours.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

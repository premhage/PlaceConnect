import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  FileText,
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const { user, role, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && role === 'student' && job) {
      checkStudentEligibility();
    }
  }, [isAuthenticated, role, job]);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.data.success) {
        setJob(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const checkStudentEligibility = async () => {
    setCheckingEligibility(true);
    try {
      const res = await api.get(`/jobs/${id}/eligibility`);
      if (res.data.success) {
        setEligibility(res.data.data);
        if (res.data.data.alreadyApplied) {
          setHasApplied(true);
        }
      }
    } catch (err) {
      console.warn('Eligibility check warning:', err.message);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const res = await api.post('/applications', {
        jobId: job._id,
        coverLetter,
      });

      if (res.data.success) {
        toast.success('Application submitted successfully!');
        setHasApplied(true);
        setApplyModalOpen(false);
        // Refresh eligibility state
        checkStudentEligibility();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.';
      toast.error(msg);
      if (err.response?.data?.reasons) {
        err.response.data.reasons.forEach((r) => toast.warning(r));
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Loading job specifications..." />;
  if (!job) {
    return (
      <div className="container py-5 text-center">
        <h4>Job posting not found</h4>
        <Link to="/jobs" className="btn btn-primary btn-sm mt-3">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div className="container py-4 py-md-5">
      {/* Back button */}
      <div className="mb-3">
        <Link to="/jobs" className="btn btn-sm btn-link text-muted p-0 text-decoration-none d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to all listings
        </Link>
      </div>

      <div className="row g-4">
        {/* Main Job Information Column */}
        <div className="col-lg-8">
          <div className="pc-card p-4 mb-4">
            {/* Header */}
            <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 pb-3 border-bottom mb-4">
              <div>
                <span className="badge bg-light text-primary border mb-2 fw-semibold">
                  {job.jobType}
                </span>
                <h3 className="fw-bold mb-2">{job.title}</h3>
                <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                  <div className="d-flex align-items-center gap-1">
                    <Building2 size={16} className="text-primary" />
                    <span className="fw-semibold text-dark">{job.companyId?.companyName}</span>
                  </div>
                  <span>&bull;</span>
                  <div className="d-flex align-items-center gap-1">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>

              <div className="text-lg-end">
                <div className="fs-4 fw-bold text-success">
                  {job.salaryRange?.min} - {job.salaryRange?.max} {job.salaryRange?.period}
                </div>
                <small className="text-muted">Annual Compensation CTC</small>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h5 className="fw-bold mb-2">Job Overview</h5>
              <p className="text-muted" style={{ lineHeight: '1.7' }}>
                {job.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-bold mb-3">Key Responsibilities</h5>
                <ul className="list-unstyled d-flex flex-column gap-2 text-muted small">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="d-flex align-items-start gap-2">
                      <CheckCircle size={16} className="text-primary mt-1 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="mb-4">
                <h5 className="fw-bold mb-3">Technical & Foundational Skills</h5>
                <div className="d-flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="badge bg-light text-dark border px-3 py-2 fw-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Profile Brief */}
            {job.companyId && (
              <div className="p-3 rounded-3 bg-light border mt-4">
                <h6 className="fw-bold mb-1">About {job.companyId.companyName}</h6>
                <p className="text-muted small mb-2">{job.companyId.description}</p>
                {job.companyId.website && (
                  <a
                    href={job.companyId.website}
                    target="_blank"
                    rel="noreferrer"
                    className="small text-primary d-inline-flex align-items-center gap-1 text-decoration-none fw-medium"
                  >
                    Visit Corporate Careers Website <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Eligibility & Application Action */}
        <div className="col-lg-4">
          <div className="pc-card p-4 sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold mb-3">Eligibility Criteria</h5>

            {/* Criteria Breakdown */}
            <div className="d-flex flex-column gap-2 mb-4 pb-3 border-bottom small">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Eligible Branches:</span>
                <span className="fw-semibold text-end" style={{ maxWidth: '180px' }}>
                  {job.eligibleBranches?.join(', ') || 'All Branches'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Minimum CGPA:</span>
                <span className="fw-bold text-dark">{job.minimumCGPA ? job.minimumCGPA.toFixed(2) : 'Open'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Max Backlogs:</span>
                <span className="fw-bold text-dark">{job.maximumBacklogs !== undefined ? job.maximumBacklogs : 0}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Graduation Year:</span>
                <span className="fw-semibold text-dark">
                  {job.eligibleGraduationYears?.join(', ') || 'Current Batch'}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Application Deadline:</span>
                <span className="fw-bold text-danger">
                  {new Date(job.applicationDeadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Automated Student Eligibility Status Card */}
            {isAuthenticated && role === 'student' ? (
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-bold">Your Verification Status</span>
                  {checkingEligibility && <span className="spinner-border spinner-border-sm text-primary" />}
                </div>

                {eligibility && (
                  <div
                    className={`p-3 rounded-3 border ${
                      eligibility.isEligible ? 'bg-success bg-opacity-10 border-success' : 'bg-danger bg-opacity-10 border-danger'
                    }`}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2">
                      {eligibility.isEligible ? (
                        <>
                          <CheckCircle size={20} className="text-success" />
                          <span className="fw-bold text-success small">Eligible to Apply</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={20} className="text-danger" />
                          <span className="fw-bold text-danger small">Not Eligible</span>
                        </>
                      )}
                    </div>

                    {!eligibility.isEligible && eligibility.reasons?.length > 0 && (
                      <ul className="mb-0 ps-3 small text-danger" style={{ fontSize: '0.75rem' }}>
                        {eligibility.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : !isAuthenticated ? (
              <div className="alert alert-info small mb-4">
                <div className="fw-bold mb-1">Checking your eligibility?</div>
                <div>Log in as a student to see your branch and CGPA match in real time.</div>
                <Link to="/login" className="btn btn-sm btn-outline-primary mt-2">Log In to Apply</Link>
              </div>
            ) : (
              <div className="alert alert-secondary small mb-4">
                You are currently signed in as <strong>{role}</strong>. Applications are submitted by student accounts.
              </div>
            )}

            {/* Action Button */}
            {hasApplied ? (
              <div className="p-3 rounded bg-light border text-center">
                <CheckCircle size={24} className="text-success mb-2" />
                <div className="fw-bold small text-success">Application Submitted</div>
                <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                  Track status timeline and interview updates in your dashboard.
                </p>
                <Link to="/student/applications" className="btn btn-sm btn-outline-primary w-100">
                  View My Applications
                </Link>
              </div>
            ) : role === 'student' ? (
              <button
                onClick={() => setApplyModalOpen(true)}
                disabled={eligibility && !eligibility.isEligible}
                className="btn btn-pc-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              >
                <Send size={16} />
                <span>Submit Campus Application</span>
              </button>
            ) : !isAuthenticated ? (
              <Link to="/login" className="btn btn-pc-primary w-100 py-2 text-center">
                Log In to Apply
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {applyModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Apply for {job.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setApplyModalOpen(false)}
                />
              </div>
              <form onSubmit={handleApply}>
                <div className="modal-body">
                  <div className="p-3 rounded bg-light border mb-3 small">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <FileText size={16} className="text-primary" />
                      <span className="fw-semibold">Resume Submission</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      PlaceConnect will automatically attach your active uploaded resume from your profile to this application.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Cover Note / Remarks (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Highlight relevant projects, technologies, and reasons for your interest..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setApplyModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying}
                    className="btn btn-sm btn-pc-primary d-flex align-items-center gap-2"
                  >
                    {applying ? <span className="spinner-border spinner-border-sm" /> : <Send size={14} />}
                    <span>Confirm Application</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

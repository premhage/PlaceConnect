import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';

export const RecruiterDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/recruiter/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recruiter dashboard..." />;

  const { company, metrics, jobMetrics = [], upcomingInterviews = [] } = dashboardData || {};
  const isApproved = company?.approvalStatus === 'approved';

  return (
    <div className="recruiter-dashboard">
      {/* Header Banner */}
      <div className="pc-card p-4 mb-4 bg-white border">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                CAMPUS RECRUITER
              </span>
              <StatusBadge status={company?.approvalStatus || 'pending'} />
            </div>
            <h3 className="fw-bold mb-1">{company?.companyName || 'Corporate Recruiter'}</h3>
            <p className="text-muted small mb-0">
              {company?.industry} &bull; {company?.location} &bull; Representative: {user?.name}
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link
              to="/recruiter/jobs/new"
              className={`btn btn-pc-primary btn-sm d-flex align-items-center gap-1 ${!isApproved ? 'disabled' : ''}`}
            >
              <PlusCircle size={16} /> Post New Campus Drive
            </Link>
            <Link to="/recruiter/company" className="btn btn-pc-outline btn-sm">
              Company Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Approval Warning if Pending */}
      {!isApproved && (
        <div className="alert alert-warning d-flex align-items-center gap-3 p-3 mb-4">
          <AlertTriangle size={24} className="text-warning flex-shrink-0" />
          <div className="small">
            <strong>Company Verification Pending:</strong> Your company registration is currently being reviewed by the Placement Cell. Once approved by the placement administrator, your job postings will be published to eligible students.
          </div>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Active Jobs */}
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
              <Briefcase size={24} />
            </div>
            <div>
              <div className="text-muted small">Active Postings</div>
              <h3 className="fw-bold mb-0">{metrics?.activeJobs || 0}</h3>
            </div>
          </div>
        </div>

        {/* Total Applicants */}
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info">
              <Users size={24} />
            </div>
            <div>
              <div className="text-muted small">Total Applicants</div>
              <h3 className="fw-bold mb-0">{metrics?.totalApplicants || 0}</h3>
            </div>
          </div>
        </div>

        {/* Shortlisted Candidates */}
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-muted small">Shortlisted Candidates</div>
              <h3 className="fw-bold mb-0">{metrics?.shortlistedCandidates || 0}</h3>
            </div>
          </div>
        </div>

        {/* Final Selections */}
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="text-muted small">Offers Released</div>
              <h3 className="fw-bold mb-0">{metrics?.selectedCandidates || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Job Wise Applicants Overview */}
        <div className="col-lg-8">
          <div className="pc-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0">Posted Recruitment Drives</h5>
              <Link to="/recruiter/jobs" className="small text-primary fw-semibold text-decoration-none">
                Manage All &rarr;
              </Link>
            </div>

            {jobMetrics.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No jobs published yet.{' '}
                <Link to="/recruiter/jobs/new" className="text-primary fw-semibold">
                  Create your first job posting
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Job Title</th>
                      <th>Approval Status</th>
                      <th>Total Applicants</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {jobMetrics.map((job) => (
                      <tr key={job.jobId}>
                        <td>
                          <div className="fw-bold text-dark">{job.title}</div>
                          <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                            {job.status}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={job.approvalStatus} />
                        </td>
                        <td>
                          <span className="fw-bold text-dark fs-6">{job.applicantCount}</span> applicants
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/recruiter/jobs/${job.jobId}/applicants`}
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Review Applicants
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Scheduled Interviews */}
        <div className="col-lg-4">
          <div className="pc-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Calendar size={18} className="text-primary" />
                <span>Scheduled Interviews</span>
              </h5>
              <Link to="/recruiter/interviews" className="small text-primary text-decoration-none fw-semibold">
                Manage
              </Link>
            </div>

            {upcomingInterviews.length === 0 ? (
              <p className="text-muted small mb-0">No upcoming interviews scheduled for your company drives.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {upcomingInterviews.map((item) => (
                  <div key={item._id} className="p-3 rounded-3 bg-light border small">
                    <div className="fw-bold text-dark mb-1">{item.roundName}</div>
                    <div className="text-muted mb-2">
                      {item.jobId?.title} &bull; {new Date(item.scheduledAt).toLocaleString()}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-light text-dark border">{item.mode}</span>
                      <Link
                        to="/recruiter/interviews"
                        className="small text-primary fw-semibold text-decoration-none"
                      >
                        Update Result &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApproveCompany = async (companyId) => {
    try {
      const res = await api.patch(`/admin/companies/${companyId}/approval`, {
        status: 'approved',
      });
      if (res.data.success) {
        toast.success('Company approved.');
        fetchAdminDashboard();
      }
    } catch (err) {
      toast.error('Failed to approve company.');
    }
  };

  const handleQuickApproveJob = async (jobId) => {
    try {
      const res = await api.patch(`/admin/jobs/${jobId}/approval`, {
        status: 'approved',
      });
      if (res.data.success) {
        toast.success('Job posting approved and published.');
        fetchAdminDashboard();
      }
    } catch (err) {
      toast.error('Failed to approve job.');
    }
  };

  if (loading) return <LoadingSpinner message="Calculating placement cell statistics..." />;

  const { summary, charts, pendingApprovals } = dashboardData || {};
  const branchData = charts?.branchPlacements || [];
  const outcomeData = charts?.applicationOutcomes || [];

  const chartColors = ['#1e3a8a', '#0284c7', '#0d9488', '#16a34a', '#d97706', '#8b5cf6'];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 mb-1">
            EXECUTIVE OVERSIGHT
          </span>
          <h3 className="fw-bold mb-0">Placement Officer Admin Dashboard</h3>
          <p className="text-muted small mb-0">
            Real-time campus placement metrics, institutional approval pipelines, and branch performance statistics.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/drives" className="btn btn-pc-primary btn-sm">
            Announce Placement Drive
          </Link>
          <Link to="/admin/reports" className="btn btn-outline-secondary btn-sm">
            Generate Reports
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Total Students */}
        <div className="col-lg-2 col-md-4 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
              <Users size={22} />
            </div>
            <div>
              <div className="text-muted small">Registered Students</div>
              <h4 className="fw-bold mb-0">{summary?.totalStudents || 0}</h4>
            </div>
          </div>
        </div>

        {/* Approved Companies */}
        <div className="col-lg-2 col-md-4 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
              <Building2 size={22} />
            </div>
            <div>
              <div className="text-muted small">Companies Approved</div>
              <h4 className="fw-bold mb-0">{summary?.approvedCompanies || 0}</h4>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="col-lg-2 col-md-4 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning">
              <Clock size={22} />
            </div>
            <div>
              <div className="text-muted small">Pending Approvals</div>
              <h4 className="fw-bold mb-0">{summary?.pendingCompanies || 0}</h4>
            </div>
          </div>
        </div>

        {/* Published Jobs */}
        <div className="col-lg-2 col-md-4 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info">
              <Briefcase size={22} />
            </div>
            <div>
              <div className="text-muted small">Published Jobs</div>
              <h4 className="fw-bold mb-0">{summary?.publishedJobs || 0}</h4>
            </div>
          </div>
        </div>

        {/* Total Applications */}
        <div className="col-lg-2 col-md-4 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-secondary bg-opacity-10 text-dark">
              <FileText size={22} />
            </div>
            <div>
              <div className="text-muted small">Total Applications</div>
              <h4 className="fw-bold mb-0">{summary?.totalApplications || 0}</h4>
            </div>
          </div>
        </div>

        {/* Placed Students */}
        <div className="col-lg-2 col-md-4 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
              <Award size={22} />
            </div>
            <div>
              <div className="text-muted small">Offers Accepted</div>
              <h4 className="fw-bold mb-0 text-success">{summary?.selectedStudents || 0}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="row g-4 mb-4">
        {/* Branch-wise Placements Chart */}
        <div className="col-lg-7">
          <div className="pc-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Branch-Wise Selected Students</h5>
                <small className="text-muted">Offers recorded in database by student engineering department</small>
              </div>
              <span className="badge bg-light text-primary border">Recharts Live</span>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="branch"
                    angle={-25}
                    textAnchor="end"
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val) => [`${val} Placed`, 'Candidates']}
                  />
                  <Bar dataKey="placements" fill="#1e3a8a" radius={[4, 4, 0, 0]}>
                    {branchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Application Outcome Breakdown */}
        <div className="col-lg-5">
          <div className="pc-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h5 className="fw-bold mb-0">Recruitment Funnel Outcomes</h5>
                <small className="text-muted">Aggregate volume across all pipeline stages</small>
              </div>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={outcomeData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val) => [`${val} Applications`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approval Queues */}
      <div className="row g-4">
        {/* Pending Companies Queue */}
        <div className="col-lg-6">
          <div className="pc-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0">Pending Company Registrations</h5>
              <Link to="/admin/companies" className="small text-primary fw-semibold text-decoration-none">
                View All &rarr;
              </Link>
            </div>

            {pendingApprovals?.companies?.length === 0 ? (
              <p className="text-muted small py-3 mb-0 text-center">
                All recruiting companies have been reviewed and verified.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Company</th>
                      <th>Sector</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals?.companies?.map((comp) => (
                      <tr key={comp._id}>
                        <td>
                          <div className="fw-bold text-dark">{comp.companyName}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{comp.location}</div>
                        </td>
                        <td className="text-muted">{comp.industry}</td>
                        <td className="text-end">
                          <button
                            onClick={() => handleQuickApproveCompany(comp._id)}
                            className="btn btn-sm btn-success py-1 px-2"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Job Postings Queue */}
        <div className="col-lg-6">
          <div className="pc-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0">Pending Job Openings</h5>
              <Link to="/admin/jobs" className="small text-primary fw-semibold text-decoration-none">
                View All &rarr;
              </Link>
            </div>

            {pendingApprovals?.jobs?.length === 0 ? (
              <p className="text-muted small py-3 mb-0 text-center">
                No job postings currently pending review.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Opening Title</th>
                      <th>Company</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals?.jobs?.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <div className="fw-bold text-dark">{job.title}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{job.jobType}</div>
                        </td>
                        <td className="text-muted">{job.companyId?.companyName}</td>
                        <td className="text-end">
                          <button
                            onClick={() => handleQuickApproveJob(job._id)}
                            className="btn btn-sm btn-pc-primary py-1 px-2"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Approve & Publish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

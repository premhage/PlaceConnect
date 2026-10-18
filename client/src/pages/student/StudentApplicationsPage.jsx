import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Building2,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Ban,
  ArrowRight,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';

export const StudentApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [withdrawingId, setWithdrawingId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be reversed.')) {
      return;
    }

    setWithdrawingId(applicationId);
    try {
      const res = await api.patch(`/applications/${applicationId}/withdraw`);
      if (res.data.success) {
        toast.info('Application withdrawn successfully.');
        setApplications((prev) =>
          prev.map((app) => (app._id === applicationId ? res.data.data : app))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];

  const getStageIndex = (status) => {
    if (status === 'Selected') return 4;
    if (status === 'Interview Scheduled') return 3;
    if (status === 'Shortlisted') return 2;
    if (status === 'Under Review') return 1;
    if (status === 'Applied') return 0;
    return -1;
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === 'All') return true;
    return app.status === filterStatus;
  });

  if (loading) return <LoadingSpinner message="Loading your applications..." />;

  return (
    <div className="student-applications-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">My Application History & Timeline</h3>
          <p className="text-muted small mb-0">
            Monitor the progress of your submitted campus recruitment applications.
          </p>
        </div>

        {/* Filter Status Dropdown */}
        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted fw-semibold">Filter:</span>
          <select
            className="form-select form-select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses ({applications.length})</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications submitted yet"
          description="Browse campus recruitment postings and apply to jobs that match your academic criteria."
          action={
            <Link to="/jobs" className="btn btn-sm btn-pc-primary">
              Explore Active Jobs
            </Link>
          }
        />
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-5 text-muted small">
          No applications found with status "{filterStatus}".
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {filteredApplications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isTerminalNegative = ['Rejected', 'Withdrawn'].includes(app.status);
            const canWithdraw = ['Applied', 'Under Review'].includes(app.status);
            const isExpanded = expandedAppId === app._id;

            return (
              <div key={app._id} className="pc-card p-4">
                {/* Header Information */}
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-light text-primary border fw-semibold">
                        {app.jobId?.jobType || 'Full-Time'}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <h5 className="fw-bold mb-1">
                      <Link to={`/jobs/${app.jobId?._id}`} className="text-dark text-decoration-none">
                        {app.jobId?.title || 'Job Opening'}
                      </Link>
                    </h5>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <Building2 size={14} />
                      <span className="fw-medium text-dark">{app.jobId?.companyId?.companyName}</span>
                      <span>&bull;</span>
                      <span>{app.jobId?.location}</span>
                    </div>
                  </div>

                  <div className="text-md-end">
                    <div className="fw-bold text-success fs-6">
                      {app.jobId?.salaryRange?.min} - {app.jobId?.salaryRange?.max} {app.jobId?.salaryRange?.period}
                    </div>
                    <div className="text-muted small">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Visual Recruitment Stage Stepper (Unless Rejected/Withdrawn) */}
                {!isTerminalNegative ? (
                  <div className="status-timeline my-4">
                    {stages.map((stageName, idx) => {
                      const isCompleted = idx < currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div
                          key={idx}
                          className={`status-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                        >
                          <div className="step-indicator">
                            {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                          </div>
                          <div className="step-title">{stageName}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="alert alert-secondary py-2 small my-3 d-flex align-items-center gap-2">
                    <Ban size={16} className="text-danger" />
                    <span>
                      Application closed with status: <strong>{app.status}</strong>
                    </span>
                  </div>
                )}

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <button
                    onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                    className="btn btn-sm btn-link text-muted p-0 text-decoration-none d-flex align-items-center gap-1"
                  >
                    <span>Recruitment Audit Log & History ({app.statusHistory?.length || 0})</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <div className="d-flex gap-2">
                    {canWithdraw && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        disabled={withdrawingId === app._id}
                        className="btn btn-sm btn-outline-danger"
                      >
                        {withdrawingId === app._id ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    )}
                    <Link to={`/jobs/${app.jobId?._id}`} className="btn btn-sm btn-outline-primary">
                      View Job Specs
                    </Link>
                  </div>
                </div>

                {/* Collapsible Status History Timeline */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-top bg-light p-3 rounded-3">
                    <h6 className="fw-bold mb-3 small text-dark">Recruitment Status Audit Trail</h6>
                    {app.statusHistory && app.statusHistory.length > 0 ? (
                      <div className="d-flex flex-column gap-2">
                        {app.statusHistory.map((item, idx) => (
                          <div key={idx} className="p-2 bg-white rounded border small d-flex align-items-start gap-2">
                            <Clock size={16} className="text-primary mt-1 flex-shrink-0" />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <span className="fw-bold text-dark">{item.status}</span>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {new Date(item.changedAt).toLocaleString()}
                                </span>
                              </div>
                              {item.note && <div className="text-muted small mt-1">{item.note}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted small">No status change events logged.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

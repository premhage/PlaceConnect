import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Briefcase, CheckCircle2, XCircle, Search, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';

export const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalFilter, setApprovalFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const toast = useToast();

  useEffect(() => {
    fetchJobs();
  }, [page, approvalFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (approvalFilter !== 'All') params.approvalStatus = approvalFilter;

      const res = await api.get('/admin/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load campus job postings.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      const res = await api.patch(`/admin/jobs/${jobId}/approval`, {
        status: 'approved',
      });
      if (res.data.success) {
        toast.success('Job posting approved and visible to eligible students.');
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, approvalStatus: 'approved' } : j))
        );
      }
    } catch (err) {
      toast.error('Failed to approve job.');
    }
  };

  const handleReject = async (jobId) => {
    const reason = window.prompt('Specify reason for rejecting this job posting (optional):');
    try {
      const res = await api.patch(`/admin/jobs/${jobId}/approval`, {
        status: 'rejected',
        rejectionReason: reason || '',
      });
      if (res.data.success) {
        toast.info('Job posting marked as rejected.');
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, approvalStatus: 'rejected' } : j))
        );
      }
    } catch (err) {
      toast.error('Failed to reject job.');
    }
  };

  return (
    <div className="admin-jobs-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Campus Job Openings & Approvals</h3>
          <p className="text-muted small mb-0">
            Review recruiter job descriptions and eligibility parameters before campus publication.
          </p>
        </div>

        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={approvalFilter}
          onChange={(e) => {
            setApprovalFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Approval Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved & Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading job postings..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job postings found"
          description="Job postings created by recruiting companies will appear here for administrative oversight."
        />
      ) : (
        <div className="pc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Job Title & Company</th>
                  <th>CTC Package</th>
                  <th>Min CGPA / Backlogs</th>
                  <th>Eligible Branches</th>
                  <th>Applicants</th>
                  <th>Approval Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div className="fw-bold text-dark">{job.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {job.companyId?.companyName} &bull; {job.location}
                      </div>
                    </td>
                    <td>
                      <span className="fw-semibold text-success">
                        {job.salaryRange?.min} - {job.salaryRange?.max} {job.salaryRange?.period}
                      </span>
                    </td>
                    <td>
                      <div>CGPA: <strong>{job.minimumCGPA ? job.minimumCGPA.toFixed(1) : 'Open'}</strong></div>
                      <small className="text-muted">Max Backlogs: {job.maximumBacklogs}</small>
                    </td>
                    <td>
                      <span className="text-dark fw-medium">
                        {job.eligibleBranches?.length > 2
                          ? `${job.eligibleBranches[0]} +${job.eligibleBranches.length - 1} more`
                          : job.eligibleBranches?.join(', ') || 'All'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {job.applicantsCount || 0} candidates
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={job.approvalStatus} />
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        {job.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => handleApprove(job._id)}
                            className="btn btn-sm btn-success py-1 px-2"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Approve
                          </button>
                        )}
                        {job.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => handleReject(job._id)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Reject
                          </button>
                        )}
                        <Link
                          to={`/jobs/${job._id}`}
                          className="btn btn-sm btn-outline-secondary py-1 px-2"
                          style={{ fontSize: '0.75rem' }}
                          title="View public posting"
                        >
                          Specs
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

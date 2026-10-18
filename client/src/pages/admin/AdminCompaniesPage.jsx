import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Building2, CheckCircle2, XCircle, Search, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';
import { Pagination } from '../../components/Pagination';

export const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Reject modal
  const [rejectingCompany, setRejectingCompany] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetchCompanies();
  }, [page, statusFilter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/admin/companies', { params });
      if (res.data.success) {
        setCompanies(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (companyId) => {
    try {
      const res = await api.patch(`/admin/companies/${companyId}/approval`, {
        status: 'approved',
      });
      if (res.data.success) {
        toast.success('Company approved successfully.');
        setCompanies((prev) =>
          prev.map((c) => (c._id === companyId ? res.data.data : c))
        );
      }
    } catch (err) {
      toast.error('Failed to approve company.');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingCompany) return;

    setSubmittingAction(true);
    try {
      const res = await api.patch(`/admin/companies/${rejectingCompany._id}/approval`, {
        status: 'rejected',
        rejectionReason,
      });
      if (res.data.success) {
        toast.info('Company registration marked as rejected.');
        setCompanies((prev) =>
          prev.map((c) => (c._id === rejectingCompany._id ? res.data.data : c))
        );
        setRejectingCompany(null);
        setRejectionReason('');
      }
    } catch (err) {
      toast.error('Failed to reject company.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="admin-companies-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Company & Recruiter Approvals</h3>
          <p className="text-muted small mb-0">
            Vet recruiting organizations before granting permissions to publish campus job postings.
          </p>
        </div>

        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="All">All Verification Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading company applications..." />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No company registrations found"
          description="Organizations registering through the portal will appear here for review."
        />
      ) : (
        <div className="pc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Company Name & Location</th>
                  <th>Industry Sector</th>
                  <th>Representative Contact</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((comp) => {
                  const isPending = comp.approvalStatus === 'pending';

                  return (
                    <tr key={comp._id}>
                      <td>
                        <div className="fw-bold text-dark">{comp.companyName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{comp.location}</div>
                      </td>
                      <td>{comp.industry}</td>
                      <td>
                        <div className="text-dark fw-medium">
                          {comp.contactInformation?.contactPerson || comp.ownerUserId?.name}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {comp.contactInformation?.contactEmail || comp.ownerUserId?.email}
                        </div>
                      </td>
                      <td>
                        {comp.website ? (
                          <a
                            href={comp.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                          >
                            <span>Link</span> <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-muted">&mdash;</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={comp.approvalStatus} />
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          {comp.approvalStatus !== 'approved' && (
                            <button
                              onClick={() => handleApprove(comp._id)}
                              className="btn btn-sm btn-success py-1 px-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Approve
                            </button>
                          )}
                          {comp.approvalStatus !== 'rejected' && (
                            <button
                              onClick={() => {
                                setRejectingCompany(comp);
                                setRejectionReason('');
                              }}
                              className="btn btn-sm btn-outline-danger py-1 px-2"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Rejection Modal */}
      {rejectingCompany && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Reject Company Registration</h5>
                <button type="button" className="btn-close" onClick={() => setRejectingCompany(null)} />
              </div>
              <form onSubmit={handleRejectSubmit}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    Company: <strong>{rejectingCompany.companyName}</strong>. Specify the reason to notify the recruiter:
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Rejection *</label>
                    <textarea
                      rows={3}
                      required
                      className="form-control"
                      placeholder="e.g. Incomplete tax ID, unverified corporate email domain, or non-engineering profile..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRejectingCompany(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingAction} className="btn btn-sm btn-danger">
                    {submittingAction ? 'Submitting...' : 'Confirm Rejection'}
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

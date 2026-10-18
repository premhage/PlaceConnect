import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Filter, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const toast = useToast();

  useEffect(() => {
    fetchStudents();
  }, [page, branchFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (branchFilter !== 'All') params.branch = branchFilter;
      if (searchQuery) params.q = searchQuery;

      const res = await api.get('/admin/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load students directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/students/${userId}/status`, {
        status: nextStatus,
      });

      if (res.data.success) {
        toast.info(`Student account status set to ${nextStatus}.`);
        setStudents((prev) =>
          prev.map((s) =>
            s.userId?._id === userId
              ? { ...s, userId: { ...s.userId, accountStatus: nextStatus } }
              : s
          )
        );
      }
    } catch (err) {
      toast.error('Failed to update student account status.');
    }
  };

  return (
    <div className="admin-students-page">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Student Placement Directory</h3>
        <p className="text-muted small mb-0">
          Manage enrolled engineering candidates, monitor academic credentials, and oversee placement statuses.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="pc-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search student by PRN, phone, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">Search</button>
              </div>
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Engineering Branches</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Telecommunication">Electronics & Telecom</option>
                <option value="AIDS">AI & Data Science (AIDS)</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading registered candidates..." />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No student records found"
          description="Try broadening your search query or branch filter."
        />
      ) : (
        <div className="pc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Student Name & Email</th>
                  <th>PRN</th>
                  <th>Branch & Year</th>
                  <th>CGPA</th>
                  <th>Backlogs</th>
                  <th>Applications</th>
                  <th>Placement Status</th>
                  <th>Account</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const u = student.userId;
                  const isSuspended = u?.accountStatus === 'suspended';

                  return (
                    <tr key={student._id}>
                      <td>
                        <div className="fw-bold text-dark">{u?.name || 'Student'}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u?.email}</div>
                      </td>
                      <td>
                        <span className="font-monospace fw-semibold">{student.PRN}</span>
                      </td>
                      <td>
                        <div>{student.branch}</div>
                        <small className="text-muted">Batch {student.graduationYear}</small>
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{student.CGPA?.toFixed(2)}</span>
                      </td>
                      <td>
                        <span className={student.backlogs > 0 ? 'text-danger fw-bold' : 'text-success'}>
                          {student.backlogs}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {student.applicationsCount || 0} applied
                        </span>
                      </td>
                      <td>
                        {student.isPlaced ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success">
                            Placed (Offer Received)
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border">
                            Actively Applying
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${isSuspended ? 'bg-danger' : 'bg-success'}`}>
                          {u?.accountStatus || 'active'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleToggleStatus(u?._id, u?.accountStatus)}
                          className={`btn btn-sm ${
                            isSuspended ? 'btn-outline-success' : 'btn-outline-danger'
                          } py-0 px-2`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
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
    </div>
  );
};

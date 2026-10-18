import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { BarChart3, Award, TrendingUp, Printer, Download, Users, Building2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const AdminReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('All');
  const toast = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports/placements');
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load placement reports.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Generating institutional placement report..." />;

  const { metrics, placements = [] } = reportData || {};

  const filteredPlacements = placements.filter((item) => {
    if (branchFilter === 'All') return true;
    return item.studentId?.branch === branchFilter;
  });

  return (
    <div className="admin-reports-page">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 mb-1">
            ANNUAL PLACEMENT AUDIT
          </span>
          <h3 className="fw-bold mb-0">Campus Placement Report & Offer Registry</h3>
          <p className="text-muted small mb-0">
            Official university records of corporate offers released and department-wise compensation data.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button onClick={handlePrint} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <Printer size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Metric CTC Highlights */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
              <Award size={24} />
            </div>
            <div>
              <div className="text-muted small">Total Placed</div>
              <h3 className="fw-bold mb-0 text-success">{metrics?.totalPlaced || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-muted small">Highest CTC</div>
              <h3 className="fw-bold mb-0 text-primary">{metrics?.highestPackageLPA || 0} LPA</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info">
              <BarChart3 size={24} />
            </div>
            <div>
              <div className="text-muted small">Average Campus CTC</div>
              <h3 className="fw-bold mb-0 text-dark">{metrics?.averagePackageLPA || 0} LPA</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-secondary bg-opacity-10 text-secondary">
              <Building2 size={24} />
            </div>
            <div>
              <div className="text-muted small">Lowest / Base CTC</div>
              <h3 className="fw-bold mb-0 text-dark">{metrics?.lowestPackageLPA || 0} LPA</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Branch */}
      <div className="pc-card p-3 mb-4 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <span className="small fw-semibold text-muted">Department Filter:</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All Engineering Departments</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Telecommunication">Electronics & Telecom</option>
            <option value="AIDS">AIDS</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
          </select>
        </div>

        <span className="small text-muted">
          Showing <strong>{filteredPlacements.length}</strong> confirmed placement records
        </span>
      </div>

      {/* Report Table */}
      {filteredPlacements.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No placement records found"
          description="Candidates moving into the 'Selected' status stage will automatically appear in this institutional report."
        />
      ) : (
        <div className="pc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Candidate Name</th>
                  <th>PRN</th>
                  <th>Engineering Branch</th>
                  <th>Hiring Company</th>
                  <th>Job Designation</th>
                  <th>Offered CTC (LPA)</th>
                  <th>Selection Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlacements.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="fw-bold text-dark">{item.studentId?.userId?.name || 'Candidate'}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.studentId?.userId?.email}</div>
                    </td>
                    <td>
                      <span className="font-monospace fw-semibold">{item.studentId?.PRN}</span>
                    </td>
                    <td>{item.studentId?.branch}</td>
                    <td>
                      <span className="fw-semibold text-dark">{item.jobId?.companyId?.companyName || 'Company'}</span>
                    </td>
                    <td>{item.jobId?.title}</td>
                    <td>
                      <span className="fw-bold text-success fs-6">
                        {item.jobId?.salaryRange?.max} LPA
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(item.updatedAt || item.appliedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

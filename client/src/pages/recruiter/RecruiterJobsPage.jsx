import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';

export const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/recruiter/jobs');
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load company job postings.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (jobId) => {
    try {
      const res = await api.patch(`/jobs/${jobId}/publish`);
      if (res.data.success) {
        toast.success(res.data.message);
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: res.data.data.status } : j))
        );
      }
    } catch (err) {
      toast.error('Failed to update job status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        toast.info('Job posting deleted.');
        setJobs((prev) => prev.filter((j) => j._id !== jobId));
      }
    } catch (err) {
      toast.error('Failed to delete job posting.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading job postings..." />;

  return (
    <div className="recruiter-jobs-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Manage Campus Recruitment Drives</h3>
          <p className="text-muted small mb-0">
            Publish job postings, configure branch eligibility criteria, and manage candidate funnels.
          </p>
        </div>

        <Link to="/recruiter/jobs/new" className="btn btn-pc-primary btn-sm d-flex align-items-center gap-2">
          <PlusCircle size={16} /> Post New Campus Opening
        </Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No campus jobs posted yet"
          description="Create your first job posting with salary and eligibility criteria to start receiving verified student applications."
          action={
            <Link to="/recruiter/jobs/new" className="btn btn-sm btn-pc-primary">
              Post New Opening
            </Link>
          }
        />
      ) : (
        <div className="pc-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Job Title & Location</th>
                  <th>Job Type & CTC</th>
                  <th>Admin Approval</th>
                  <th>Funnel Statistics</th>
                  <th>Recruitment Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <div className="fw-bold text-dark">{job.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {job.location} &bull; Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border mb-1">
                        {job.jobType}
                      </span>
                      <div className="fw-semibold text-success" style={{ fontSize: '0.8rem' }}>
                        {job.salaryRange?.min} - {job.salaryRange?.max} {job.salaryRange?.period}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={job.approvalStatus} />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          to={`/recruiter/jobs/${job._id}/applicants`}
                          className="btn btn-sm btn-light border py-1 px-2 d-inline-flex align-items-center gap-1"
                        >
                          <Users size={14} className="text-primary" />
                          <span className="fw-bold">{job.totalApplicants || 0}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Applicants</span>
                        </Link>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(job._id)}
                        className={`btn btn-sm ${
                          job.status === 'active' ? 'btn-outline-success' : 'btn-outline-secondary'
                        } py-0 px-2`}
                        style={{ fontSize: '0.75rem' }}
                        title="Toggle active/closed status"
                      >
                        {job.status === 'active' ? 'Active (Open)' : 'Closed'}
                      </button>
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <Link
                          to={`/recruiter/jobs/${job._id}/applicants`}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Applicants
                        </Link>
                        <Link
                          to={`/recruiter/jobs/${job._id}/edit`}
                          className="btn btn-sm btn-outline-secondary p-1"
                          title="Edit Job"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="btn btn-sm btn-outline-danger p-1"
                          title="Delete Job"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

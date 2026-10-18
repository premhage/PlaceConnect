import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowLeft,
  Mail,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { StatusBadge } from '../../components/StatusBadge';

export const RecruiterApplicantsPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  // Status update modal
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Interview scheduling modal
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Technical Round 1',
    scheduledAt: '',
    mode: 'Online',
    locationOrMeetingLink: 'https://meet.google.com/xyz',
    instructions: 'Please be ready with your development environment and webcam enabled.',
  });
  const [schedulingInterview, setSchedulingInterview] = useState(false);

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        api.get(`/jobs/${jobId}`),
        api.get(`/jobs/${jobId}/applications`),
      ]);

      if (jobRes.data.success) setJob(jobRes.data.data);
      if (appsRes.data.success) setApplications(appsRes.data.data);
    } catch (err) {
      toast.error('Failed to load job applicants.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (studentId, studentName) => {
    try {
      const res = await api.get(`/students/${studentId}/resume`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName?.replace(/\s+/g, '_')}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Could not download candidate resume.');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalApp) return;

    setUpdatingStatus(true);
    try {
      const res = await api.patch(`/applications/${statusModalApp._id}/status`, {
        status: newStatus,
        note: statusNote,
      });

      if (res.data.success) {
        toast.success(`Application status marked as ${newStatus}.`);
        setApplications((prev) =>
          prev.map((app) => (app._id === statusModalApp._id ? res.data.data : app))
        );
        setStatusModalApp(null);
        setNewStatus('');
        setStatusNote('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!interviewModalApp) return;

    setSchedulingInterview(true);
    try {
      const res = await api.post('/interviews', {
        applicationId: interviewModalApp._id,
        roundName: interviewForm.roundName,
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString(),
        mode: interviewForm.mode,
        locationOrMeetingLink: interviewForm.locationOrMeetingLink,
        instructions: interviewForm.instructions,
      });

      if (res.data.success) {
        toast.success('Interview scheduled and invitation sent to student.');
        setInterviewModalApp(null);
        fetchJobAndApplicants(); // Refresh statuses
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setSchedulingInterview(false);
    }
  };

  const filteredApplicants = applications.filter((app) => {
    const student = app.studentId;
    const nameMatch = student?.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const prnMatch = student?.PRN?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = !searchQuery || nameMatch || prnMatch;

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner message="Loading candidate applications..." />;

  return (
    <div className="recruiter-applicants-page">
      <div className="mb-3">
        <Link to="/recruiter/jobs" className="btn btn-sm btn-link text-muted p-0 text-decoration-none d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to Job Management
        </Link>
      </div>

      {/* Header Info */}
      <div className="pc-card p-4 mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-light text-primary border">{job?.jobType}</span>
              <StatusBadge status={job?.approvalStatus} />
            </div>
            <h3 className="fw-bold mb-1">{job?.title}</h3>
            <p className="text-muted small mb-0">
              Min CGPA: <strong>{job?.minimumCGPA?.toFixed(1)}</strong> &bull; Max Backlogs:{' '}
              <strong>{job?.maximumBacklogs}</strong> &bull; Package:{' '}
              <strong>{job?.salaryRange?.min} - {job?.salaryRange?.max} {job?.salaryRange?.period}</strong>
            </p>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="p-3 bg-light rounded-3 border text-center">
              <div className="text-muted small">Total Candidates</div>
              <div className="fs-4 fw-bold text-dark">{applications.length}</div>
            </div>
            <div className="p-3 bg-light rounded-3 border text-center">
              <div className="text-muted small">Shortlisted</div>
              <div className="fs-4 fw-bold text-warning">
                {applications.filter((a) => a.status === 'Shortlisted').length}
              </div>
            </div>
            <div className="p-3 bg-light rounded-3 border text-center">
              <div className="text-muted small">Selected</div>
              <div className="fs-4 fw-bold text-success">
                {applications.filter((a) => a.status === 'Selected').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="pc-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search candidate by name or PRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Application Stages ({applications.length})</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applicants List */}
      {filteredApplicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="No student applications matching your current search or status filter."
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredApplicants.map((app) => {
            const student = app.studentId;
            const studentUser = student?.userId;

            return (
              <div key={app._id} className="pc-card p-4">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="fw-bold mb-0 text-dark">{studentUser?.name || 'Applicant'}</h5>
                      <span className="badge bg-light text-muted border font-monospace" style={{ fontSize: '0.75rem' }}>
                        {student?.PRN}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                      <div className="d-flex align-items-center gap-1">
                        <GraduationCap size={14} />
                        <span>{student?.branch}</span>
                      </div>
                      <span>&bull;</span>
                      <div>
                        CGPA: <strong className="text-dark">{student?.CGPA?.toFixed(2)}</strong>
                      </div>
                      <span>&bull;</span>
                      <div>
                        Backlogs: <strong className="text-dark">{student?.backlogs}</strong>
                      </div>
                      <span>&bull;</span>
                      <div className="d-flex align-items-center gap-1">
                        <Mail size={14} />
                        <span>{studentUser?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    {/* Download Resume Button */}
                    {student?._id && (
                      <button
                        onClick={() => handleDownloadResume(student._id, studentUser?.name)}
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        title="Download verified resume document"
                      >
                        <Download size={14} /> <span>Resume</span>
                      </button>
                    )}

                    {/* Schedule Interview Button */}
                    <button
                      onClick={() => {
                        setInterviewModalApp(app);
                        setInterviewForm((prev) => ({
                          ...prev,
                          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                        }));
                      }}
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    >
                      <Calendar size={14} /> <span>Schedule Round</span>
                    </button>

                    {/* Change Status Button */}
                    <button
                      onClick={() => {
                        setStatusModalApp(app);
                        setNewStatus(app.status);
                      }}
                      className="btn btn-sm btn-pc-primary"
                    >
                      Update Status
                    </button>
                  </div>
                </div>

                {/* Candidate Skills */}
                {student?.skills && student.skills.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {student.skills.map((skill, idx) => (
                      <span key={idx} className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cover Letter Quote */}
                {app.coverLetter && (
                  <div className="p-2 rounded bg-light border text-muted small mt-2" style={{ fontSize: '0.8rem' }}>
                    <strong>Cover Note:</strong> "{app.coverLetter}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status Transition Modal */}
      {statusModalApp && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Recruitment Status</h5>
                <button type="button" className="btn-close" onClick={() => setStatusModalApp(null)} />
              </div>
              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    Candidate: <strong>{statusModalApp.studentId?.userId?.name}</strong> &bull; Current Status:{' '}
                    <StatusBadge status={statusModalApp.status} />
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">New Recruitment Stage *</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Note / Remarks (Dispatched to Student)</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="e.g. Cleared technical assessment, recommended for managerial round..."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setStatusModalApp(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={updatingStatus} className="btn btn-sm btn-pc-primary">
                    {updatingStatus ? 'Updating...' : 'Save Status Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduling Modal */}
      {interviewModalApp && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Schedule Interview Round</h5>
                <button type="button" className="btn-close" onClick={() => setInterviewModalApp(null)} />
              </div>
              <form onSubmit={handleScheduleInterview}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    Candidate: <strong>{interviewModalApp.studentId?.userId?.name}</strong> ({interviewModalApp.studentId?.PRN})
                  </p>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Interview Round Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Technical Round 1 / System Design"
                      value={interviewForm.roundName}
                      onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-semibold">Scheduled Date & Time *</label>
                      <input
                        type="datetime-local"
                        required
                        className="form-control"
                        value={interviewForm.scheduledAt}
                        onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold">Mode *</label>
                      <select
                        className="form-select"
                        value={interviewForm.mode}
                        onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                      >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Meeting URL / Room Location *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="https://meet.google.com/xyz or Room 402"
                      value={interviewForm.locationOrMeetingLink}
                      onChange={(e) => setInterviewForm({ ...interviewForm, locationOrMeetingLink: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Candidate Instructions</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      placeholder="Candidate should keep preferred IDE ready..."
                      value={interviewForm.instructions}
                      onChange={(e) => setInterviewForm({ ...interviewForm, instructions: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setInterviewModalApp(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={schedulingInterview} className="btn btn-sm btn-pc-primary">
                    {schedulingInterview ? 'Scheduling...' : 'Confirm & Notify Student'}
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

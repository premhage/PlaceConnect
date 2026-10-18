import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Video,
  User,
  GraduationCap,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const RecruiterInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [resultForm, setResultForm] = useState({ result: 'Cleared', feedback: '' });
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews/recruiter');
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load interviews.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResult = async (e) => {
    e.preventDefault();
    if (!selectedInterview) return;

    setUpdating(true);
    try {
      const res = await api.patch(`/interviews/${selectedInterview._id}`, resultForm);
      if (res.data.success) {
        toast.success(`Interview marked as ${resultForm.result}.`);
        setInterviews((prev) =>
          prev.map((i) => (i._id === selectedInterview._id ? res.data.data : i))
        );
        setSelectedInterview(null);
      }
    } catch (err) {
      toast.error('Failed to update interview outcome.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (interviewId) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;

    try {
      const res = await api.delete(`/interviews/${interviewId}`);
      if (res.data.success) {
        toast.info('Interview cancelled.');
        setInterviews((prev) => prev.filter((i) => i._id !== interviewId));
      }
    } catch (err) {
      toast.error('Failed to delete interview.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading scheduled interviews..." />;

  return (
    <div className="recruiter-interviews-page">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Company Interview Management</h3>
        <p className="text-muted small mb-0">
          Review scheduled assessment rounds, evaluate student outcomes, and publish candidate feedback.
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled yet"
          description="Go to Manage Jobs &rarr; Review Applicants to schedule technical assessments or HR rounds."
        />
      ) : (
        <div className="row g-4">
          {interviews.map((item) => {
            const student = item.studentId;
            const studentUser = student?.userId;

            return (
              <div key={item._id} className="col-lg-6">
                <div className="pc-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                    <div>
                      <span className="badge bg-light text-primary border mb-1">
                        {item.mode} Round
                      </span>
                      <h5 className="fw-bold mb-1">{item.roundName}</h5>
                      <div className="text-muted small">
                        Job: <strong>{item.jobId?.title}</strong>
                      </div>
                    </div>

                    <span
                      className={`badge ${
                        item.result === 'Cleared'
                          ? 'bg-success'
                          : item.result === 'Failed'
                          ? 'bg-danger'
                          : 'bg-info text-dark'
                      }`}
                    >
                      {item.result}
                    </span>
                  </div>

                  {/* Candidate Details */}
                  <div className="p-3 bg-light rounded-3 border mb-3 small">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <User size={16} className="text-primary" />
                      <span className="fw-bold text-dark">{studentUser?.name}</span>
                      <span className="text-muted">({student?.PRN})</span>
                    </div>
                    <div className="text-muted">
                      {student?.branch} &bull; CGPA: <strong>{student?.CGPA?.toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Timing & Location */}
                  <div className="mb-3 small d-flex flex-column gap-1 text-muted">
                    <div className="d-flex align-items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      <span>{new Date(item.scheduledAt).toLocaleString()}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Video size={14} className="text-primary" />
                      <span className="text-truncate" style={{ maxWidth: '280px' }}>
                        {item.locationOrMeetingLink}
                      </span>
                    </div>
                  </div>

                  {item.feedback && (
                    <div className="p-2 rounded bg-white border text-muted small mb-3">
                      <strong>Feedback:</strong> {item.feedback}
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn btn-sm btn-link text-danger p-0 text-decoration-none"
                    >
                      Cancel Interview
                    </button>
                    <button
                      onClick={() => {
                        setSelectedInterview(item);
                        setResultForm({ result: item.result || 'Cleared', feedback: item.feedback || '' });
                      }}
                      className="btn btn-sm btn-pc-primary"
                    >
                      Update Result / Feedback
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Result Update Modal */}
      {selectedInterview && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Interview Outcome</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedInterview(null)} />
              </div>
              <form onSubmit={handleUpdateResult}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Interview Outcome Result *</label>
                    <select
                      className="form-select"
                      value={resultForm.result}
                      onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
                    >
                      <option value="Cleared">Cleared (Passed)</option>
                      <option value="Failed">Failed (Not Recommended)</option>
                      <option value="Rescheduled">Rescheduled</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Interviewer Feedback & Notes</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="e.g. Demonstrated strong problem-solving in DSA and clear communication..."
                      value={resultForm.feedback}
                      onChange={(e) => setResultForm({ ...resultForm, feedback: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedInterview(null)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={updating} className="btn btn-sm btn-pc-primary">
                    {updating ? 'Saving...' : 'Save & Publish Result'}
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

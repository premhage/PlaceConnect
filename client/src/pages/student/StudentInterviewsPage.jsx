import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Building2,
  Clock,
  Video,
  MapPin,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const StudentInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews/my');
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load interview schedule.');
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (result) => {
    switch (result) {
      case 'Cleared':
        return <span className="badge bg-success bg-opacity-10 text-success border border-success">Cleared</span>;
      case 'Failed':
        return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Not Cleared</span>;
      case 'Cancelled':
        return <span className="badge bg-secondary bg-opacity-10 text-secondary border">Cancelled</span>;
      case 'Rescheduled':
        return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">Rescheduled</span>;
      default:
        return <span className="badge bg-info bg-opacity-10 text-info border border-info">Scheduled (Pending)</span>;
    }
  };

  if (loading) return <LoadingSpinner message="Loading your interview schedule..." />;

  return (
    <div className="student-interviews-page">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Campus Interview Schedule</h3>
        <p className="text-muted small mb-0">
          Access your confirmed interview rounds, video conference meeting links, and recruiter instructions.
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled yet"
          description="Once recruiters review and shortlist your applications, interview schedules and meeting links will appear here."
        />
      ) : (
        <div className="row g-4">
          {interviews.map((interview) => (
            <div key={interview._id} className="col-lg-6">
              <div className="pc-card p-4 h-100 d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div>
                    <span className="badge bg-light text-primary border mb-1 fw-semibold">
                      {interview.mode || 'Online'}
                    </span>
                    <h5 className="fw-bold mb-1">{interview.roundName}</h5>
                    <div className="text-muted small">
                      {interview.jobId?.title} &bull; {interview.jobId?.companyId?.companyName}
                    </div>
                  </div>
                  {getResultBadge(interview.result)}
                </div>

                <div className="p-3 bg-light rounded-3 border mb-3 small d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <Clock size={16} className="text-primary flex-shrink-0" />
                    <div>
                      <span className="fw-bold text-dark">
                        {new Date(interview.scheduledAt).toLocaleString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Video size={16} className="text-primary flex-shrink-0" />
                    <span className="text-muted">Location / Link:</span>
                    <span className="fw-medium text-dark text-truncate" style={{ maxWidth: '240px' }}>
                      {interview.locationOrMeetingLink}
                    </span>
                  </div>
                </div>

                {interview.instructions && (
                  <div className="mb-4">
                    <div className="small fw-semibold text-dark mb-1">Recruiter Instructions:</div>
                    <div className="p-2 rounded bg-white border text-muted small" style={{ fontSize: '0.8rem' }}>
                      {interview.instructions}
                    </div>
                  </div>
                )}

                {interview.feedback && (
                  <div className="mb-4">
                    <div className="small fw-semibold text-dark mb-1">Interviewer Feedback:</div>
                    <div className="p-2 rounded bg-white border text-muted small" style={{ fontSize: '0.8rem' }}>
                      {interview.feedback}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                  <small className="text-muted">
                    Assigned by Placement & Corporate Relations
                  </small>
                  {interview.locationOrMeetingLink && (
                    <a
                      href={interview.locationOrMeetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-pc-primary d-inline-flex align-items-center gap-1"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

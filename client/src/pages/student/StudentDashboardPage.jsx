import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Award,
  Bell,
  Upload,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profRes, appRes, intRes, notifRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/applications/my'),
          api.get('/interviews/my'),
          api.get('/notifications'),
        ]);

        if (profRes.data.success) setProfile(profRes.data.data);
        if (appRes.data.success) setApplications(appRes.data.data);
        if (intRes.data.success) setInterviews(intRes.data.data);
        if (notifRes.data.success) setNotifications(notifRes.data.data.notifications || []);
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading student dashboard..." />;

  // Calculate profile completeness
  let completeness = 0;
  if (profile) {
    if (profile.branch) completeness += 20;
    if (profile.CGPA) completeness += 20;
    if (profile.skills && profile.skills.length > 0) completeness += 20;
    if (profile.resume && profile.resume.filePath) completeness += 25;
    if (profile.projects && profile.projects.length > 0) completeness += 15;
  }

  // Check if student has been Selected
  const selectedApplication = applications.find((a) => a.status === 'Selected');
  const upcomingInterviews = interviews.filter(
    (i) => new Date(i.scheduledAt) >= new Date() && i.result === 'Pending'
  );

  return (
    <div className="student-dashboard">
      {/* Welcome Banner */}
      <div className="pc-card p-4 mb-4 bg-white border">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary mb-2 fw-semibold">
              ACADEMIC YEAR 2025-26
            </span>
            <h3 className="fw-bold mb-1">Welcome back, {user?.name}!</h3>
            <p className="text-muted small mb-0">
              PRN: <span className="font-monospace fw-semibold text-dark">{profile?.PRN || 'Pending'}</span> &bull;{' '}
              {profile?.branch || 'Branch Pending'} &bull; CGPA: <strong className="text-dark">{profile?.CGPA?.toFixed(2) || 'N/A'}</strong>
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link to="/jobs" className="btn btn-pc-primary btn-sm d-flex align-items-center gap-1">
              <Briefcase size={16} /> Browse Campus Jobs
            </Link>
            <Link to="/student/profile" className="btn btn-pc-outline btn-sm">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Selected Offer Celebration Banner (If Placed) */}
      {selectedApplication && (
        <div className="p-4 rounded-3 mb-4 bg-success text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-white bg-opacity-20 flex-shrink-0">
              <Award size={32} />
            </div>
            <div>
              <span className="badge bg-white text-success fw-bold text-uppercase mb-1">Placement Confirmed</span>
              <h4 className="fw-bold mb-1">Congratulations on Your Selection!</h4>
              <p className="mb-0 text-white-50 small">
                You have received an offer for <strong>{selectedApplication.jobId?.title}</strong> at{' '}
                <strong>{selectedApplication.jobId?.companyId?.companyName}</strong>. Check your email for formal onboarding guidelines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Total Applications */}
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
              <FileText size={24} />
            </div>
            <div>
              <div className="text-muted small">Total Applications</div>
              <h3 className="fw-bold mb-0">{applications.length}</h3>
            </div>
          </div>
        </div>

        {/* Shortlisted / Under Review */}
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-muted small">In Review / Shortlist</div>
              <h3 className="fw-bold mb-0">
                {applications.filter((a) => ['Under Review', 'Shortlisted'].includes(a.status)).length}
              </h3>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-purple bg-opacity-10 text-info">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-muted small">Interviews Scheduled</div>
              <h3 className="fw-bold mb-0">{upcomingInterviews.length}</h3>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="col-md-3 col-sm-6">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-grow-1">
              <div className="text-muted small d-flex justify-content-between">
                <span>Profile Ready</span>
                <span className="fw-bold">{completeness}%</span>
              </div>
              <div className="progress mt-1" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resume missing warning */}
      {(!profile?.resume || !profile.resume.filePath) && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between p-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <AlertCircle size={20} className="text-warning flex-shrink-0" />
            <div>
              <strong>Resume Missing:</strong> You must upload your resume before submitting applications to campus drives.
            </div>
          </div>
          <Link to="/student/profile" className="btn btn-sm btn-warning fw-semibold">
            Upload Now
          </Link>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Recent Applications */}
        <div className="col-lg-8">
          <div className="pc-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0">My Active Applications</h5>
              <Link to="/student/applications" className="small text-primary fw-semibold text-decoration-none">
                View All &rarr;
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                You haven't submitted any job applications yet.{' '}
                <Link to="/jobs" className="text-primary fw-semibold">
                  Browse open job postings
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Job Title & Company</th>
                      <th>Applied Date</th>
                      <th>Current Stage</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app._id}>
                        <td>
                          <div className="fw-bold text-dark">{app.jobId?.title || 'Job Posting'}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {app.jobId?.companyId?.companyName || 'Company'} &bull; {app.jobId?.location}
                          </div>
                        </td>
                        <td className="text-muted">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="text-end">
                          <Link
                            to="/student/applications"
                            className="btn btn-sm btn-outline-secondary"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Timeline
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scheduled Interviews & Notifications */}
        <div className="col-lg-4">
          {/* Upcoming Interview Card */}
          <div className="pc-card p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>Upcoming Interviews</span>
            </h5>

            {upcomingInterviews.length === 0 ? (
              <p className="text-muted small mb-0">No upcoming interviews scheduled at this time.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {upcomingInterviews.slice(0, 3).map((interview) => (
                  <div key={interview._id} className="p-3 rounded-3 bg-light border">
                    <div className="fw-bold text-dark small mb-1">{interview.roundName}</div>
                    <div className="text-muted small mb-2">
                      {interview.jobId?.title} &bull; {new Date(interview.scheduledAt).toLocaleString()}
                    </div>
                    {interview.locationOrMeetingLink && (
                      <a
                        href={interview.locationOrMeetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Join Meeting Link <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent In-App Notifications */}
          <div className="pc-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Bell size={18} className="text-primary" />
                <span>Recent Updates</span>
              </h5>
              <Link to="/student/notifications" className="small text-muted text-decoration-none">
                All
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p className="text-muted small mb-0">No notifications yet.</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {notifications.slice(0, 4).map((notif) => (
                  <div key={notif._id} className="p-2 rounded bg-light border small">
                    <div className="fw-semibold text-dark">{notif.title}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{notif.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

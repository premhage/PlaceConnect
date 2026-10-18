import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  CheckCheck,
  Clock,
  Briefcase,
  Calendar,
  Building2,
  Megaphone,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const StudentNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.data.success) {
        toast.success('All notifications marked as read.');
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: new Date() }))
        );
      }
    } catch (err) {
      toast.error('Could not mark notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'application':
        return <Briefcase size={18} className="text-primary" />;
      case 'interview':
        return <Calendar size={18} className="text-info" />;
      case 'company':
        return <Building2 size={18} className="text-warning" />;
      case 'announcement':
        return <Megaphone size={18} className="text-danger" />;
      default:
        return <Bell size={18} className="text-secondary" />;
    }
  };

  if (loading) return <LoadingSpinner message="Loading notifications..." />;

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="student-notifications-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Notifications & Alerts</h3>
          <p className="text-muted small mb-0">
            Real-time updates regarding your job applications, interview calls, and placement announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          >
            <CheckCheck size={16} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are fully caught up! New updates on application statuses and interview schedules will appear here."
        />
      ) : (
        <div className="pc-card p-3">
          <div className="d-flex flex-column gap-2">
            {notifications.map((n) => {
              const isUnread = !n.readAt;

              return (
                <div
                  key={n._id}
                  className={`p-3 rounded-3 border d-flex align-items-start gap-3 transition ${
                    isUnread ? 'bg-white border-primary border-opacity-50 shadow-sm' : 'bg-light'
                  }`}
                >
                  <div className="p-2 rounded bg-light border mt-1">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className={`fw-bold small ${isUnread ? 'text-dark' : 'text-muted'}`}>
                          {n.title}
                        </span>
                        {isUnread && (
                          <span className="badge bg-primary" style={{ fontSize: '0.6rem' }}>
                            NEW
                          </span>
                        )}
                      </div>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(n.createdAt).toLocaleDateString()} &bull;{' '}
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-muted small mb-0">{n.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

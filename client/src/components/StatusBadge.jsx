import React from 'react';
import {
  Clock,
  Eye,
  Star,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'applied':
      return (
        <span className="badge-status badge-applied">
          <Clock size={12} /> Applied
        </span>
      );
    case 'under review':
      return (
        <span className="badge-status badge-under-review">
          <Eye size={12} /> Under Review
        </span>
      );
    case 'shortlisted':
      return (
        <span className="badge-status badge-shortlisted">
          <Star size={12} /> Shortlisted
        </span>
      );
    case 'interview scheduled':
      return (
        <span className="badge-status badge-interview">
          <Calendar size={12} /> Interview Scheduled
        </span>
      );
    case 'selected':
      return (
        <span className="badge-status badge-selected">
          <CheckCircle2 size={12} /> Selected
        </span>
      );
    case 'rejected':
      return (
        <span className="badge-status badge-rejected">
          <XCircle size={12} /> Rejected
        </span>
      );
    case 'withdrawn':
      return (
        <span className="badge-status badge-withdrawn">
          <AlertCircle size={12} /> Withdrawn
        </span>
      );
    case 'approved':
      return (
        <span className="badge-status badge-selected">
          <CheckCircle2 size={12} /> Approved
        </span>
      );
    case 'pending':
      return (
        <span className="badge-status badge-shortlisted">
          <Clock size={12} /> Pending Review
        </span>
      );
    case 'active':
      return (
        <span className="badge-status badge-selected">
          Active
        </span>
      );
    case 'closed':
      return (
        <span className="badge-status badge-applied">
          Closed
        </span>
      );
    default:
      return (
        <span className="badge-status badge-applied">
          {status}
        </span>
      );
  }
};

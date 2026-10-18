import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center min-vh-75 d-flex align-items-center justify-content-center">
      <div className="p-5 pc-card" style={{ maxWidth: '500px' }}>
        <h1 className="display-1 fw-bold text-primary mb-2">404</h1>
        <h4 className="fw-bold mb-2">Page Not Found</h4>
        <p className="text-muted small mb-4">
          The requested URL does not exist or has been moved to another section of PlaceConnect.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to="/" className="btn btn-pc-primary d-inline-flex align-items-center gap-2">
            <Home size={16} /> Return to Home
          </Link>
          <Link to="/jobs" className="btn btn-pc-outline d-inline-flex align-items-center gap-2">
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
};

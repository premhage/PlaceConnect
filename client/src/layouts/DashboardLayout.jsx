import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  Briefcase,
  Bell,
  LogOut,
  User,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="bg-dark text-white h-100 p-3"
            style={{ width: '280px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary border-opacity-25">
              <span className="fw-bold">PlaceConnect</span>
              <button
                className="btn btn-sm btn-link text-white"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="small text-muted mb-2">Logged in as {user?.name} ({role})</div>
            {/* Sidebar content */}
            <div className="d-flex flex-column gap-2">
              <Link
                to={role === 'admin' ? '/admin/dashboard' : role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard'}
                className="btn btn-primary btn-sm text-start"
                onClick={() => setMobileSidebarOpen(false)}
              >
                Dashboard
              </Link>
              {role === 'student' && (
                <>
                  <Link to="/student/profile" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>My Profile</Link>
                  <Link to="/jobs" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Browse Jobs</Link>
                  <Link to="/student/applications" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>My Applications</Link>
                  <Link to="/student/interviews" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Interviews</Link>
                </>
              )}
              {role === 'recruiter' && (
                <>
                  <Link to="/recruiter/company" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Company Profile</Link>
                  <Link to="/recruiter/jobs" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Manage Jobs</Link>
                  <Link to="/recruiter/jobs/new" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Post Job</Link>
                  <Link to="/recruiter/interviews" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Interviews</Link>
                </>
              )}
              {role === 'admin' && (
                <>
                  <Link to="/admin/students" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Students</Link>
                  <Link to="/admin/companies" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Companies</Link>
                  <Link to="/admin/jobs" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Jobs</Link>
                  <Link to="/admin/reports" className="btn btn-outline-light btn-sm text-start" onClick={() => setMobileSidebarOpen(false)}>Reports</Link>
                </>
              )}
              <hr className="border-secondary border-opacity-25" />
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm text-start">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top bar for mobile and quick user info */}
        <header className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between sticky-top z-1">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-sm btn-light border d-lg-none"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h5 className="mb-0 fw-bold d-none d-sm-block text-capitalize">
              {role} Dashboard
            </h5>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-sm btn-outline-secondary d-none d-md-flex align-items-center gap-1">
              Public Portal
            </Link>
            <div className="d-flex align-items-center gap-2 border-start ps-3">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="d-none d-sm-block">
                <div className="small fw-semibold text-dark text-truncate" style={{ maxWidth: '140px' }}>
                  {user?.name}
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Content */}
        <div className="p-3 p-md-4 flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

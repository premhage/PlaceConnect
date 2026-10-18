import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Briefcase,
  GraduationCap,
  Building2,
  Shield,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get('/notifications')
        .then((res) => {
          if (res.data.success) {
            setUnreadNotifications(res.data.data.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'recruiter') return '/recruiter/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2">
      <div className="container">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark fs-5">
          <div
            className="p-2 rounded bg-primary text-white d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px' }}
          >
            <Briefcase size={20} />
          </div>
          <div>
            Place<span className="text-primary">Connect</span>
            <span className="d-none d-sm-inline-block ms-2 badge bg-light text-muted border font-monospace" style={{ fontSize: '0.65rem' }}>
              CAMPUS RECRUITMENT
            </span>
          </div>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop & Collapsible Links */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`} id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
            <li className="nav-item">
              <Link to="/jobs" className={`nav-link fw-medium ${location.pathname === '/jobs' ? 'text-primary fw-bold' : ''}`}>
                Browse Jobs
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className={`nav-link fw-medium ${location.pathname === '/about' ? 'text-primary fw-bold' : ''}`}>
                About & Cell Info
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <Link
                  to={role === 'student' ? '/student/notifications' : role === 'recruiter' ? '/recruiter/dashboard' : '/admin/dashboard'}
                  className="btn btn-light position-relative p-2 rounded-circle border"
                  title="Notifications"
                >
                  <Bell size={18} className="text-muted" />
                  {unreadNotifications > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                      {unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* Dashboard button */}
                <Link to={getDashboardPath()} className="btn btn-pc-primary btn-sm d-flex align-items-center gap-2">
                  <User size={16} />
                  <span>Dashboard ({role})</span>
                </Link>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="d-none d-md-inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-pc-outline btn-sm">
                  Log In
                </Link>

                <div className="dropdown">
                  <button
                    className="btn btn-pc-primary btn-sm dropdown-toggle"
                    type="button"
                    id="registerMenuBtn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Register
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border p-2" aria-labelledby="registerMenuBtn">
                    <li>
                      <Link to="/register/student" className="dropdown-item d-flex align-items-center gap-2 py-2 rounded">
                        <GraduationCap size={18} className="text-primary" />
                        <div>
                          <div className="fw-semibold">Student Account</div>
                          <small className="text-muted">Apply for jobs & drives</small>
                        </div>
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <Link to="/register/recruiter" className="dropdown-item d-flex align-items-center gap-2 py-2 rounded">
                        <Building2 size={18} className="text-primary" />
                        <div>
                          <div className="fw-semibold">Recruiter / Employer</div>
                          <small className="text-muted">Post jobs & schedule interviews</small>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

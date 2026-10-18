import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Calendar,
  Bell,
  Building2,
  PlusCircle,
  Users,
  CheckSquare,
  BarChart3,
  Megaphone,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, role, logout } = useAuth();

  const renderStudentLinks = () => (
    <>
      <div className="px-3 py-2 text-uppercase text-secondary small fw-bold" style={{ fontSize: '0.65rem' }}>
        Student Portal
      </div>
      <NavLink to="/student/dashboard" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/student/profile" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <User size={18} />
        <span>My Profile & Resume</span>
      </NavLink>
      <NavLink to="/jobs" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Briefcase size={18} />
        <span>Browse Jobs</span>
      </NavLink>
      <NavLink to="/student/applications" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <FileText size={18} />
        <span>My Applications</span>
      </NavLink>
      <NavLink to="/student/interviews" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={18} />
        <span>Interview Schedule</span>
      </NavLink>
      <NavLink to="/student/notifications" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Bell size={18} />
        <span>Notifications</span>
      </NavLink>
    </>
  );

  const renderRecruiterLinks = () => (
    <>
      <div className="px-3 py-2 text-uppercase text-secondary small fw-bold" style={{ fontSize: '0.65rem' }}>
        Recruiter Portal
      </div>
      <NavLink to="/recruiter/dashboard" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/recruiter/company" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Building2 size={18} />
        <span>Company Profile</span>
      </NavLink>
      <NavLink to="/recruiter/jobs" end className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Briefcase size={18} />
        <span>Manage Jobs</span>
      </NavLink>
      <NavLink to="/recruiter/jobs/new" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <PlusCircle size={18} />
        <span>Post New Job</span>
      </NavLink>
      <NavLink to="/recruiter/interviews" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Calendar size={18} />
        <span>Interviews</span>
      </NavLink>
    </>
  );

  const renderAdminLinks = () => (
    <>
      <div className="px-3 py-2 text-uppercase text-secondary small fw-bold" style={{ fontSize: '0.65rem' }}>
        Placement Officer Admin
      </div>
      <NavLink to="/admin/dashboard" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutDashboard size={18} />
        <span>Admin Dashboard</span>
      </NavLink>
      <NavLink to="/admin/students" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Users size={18} />
        <span>Student Directory</span>
      </NavLink>
      <NavLink to="/admin/companies" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Building2 size={18} />
        <span>Company Approvals</span>
      </NavLink>
      <NavLink to="/admin/jobs" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <CheckSquare size={18} />
        <span>Job Approvals</span>
      </NavLink>
      <NavLink to="/admin/drives" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <Megaphone size={18} />
        <span>Placement Drives</span>
      </NavLink>
      <NavLink to="/admin/reports" className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}>
        <BarChart3 size={18} />
        <span>Placement Reports</span>
      </NavLink>
    </>
  );

  return (
    <aside className="dashboard-sidebar p-3 d-none d-lg-flex">
      {/* Brand */}
      <div className="mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <Link to="/" className="text-white text-decoration-none d-flex align-items-center gap-2">
          <div className="p-2 rounded bg-primary text-white d-flex align-items-center justify-content-center">
            <Briefcase size={18} />
          </div>
          <div>
            <div className="fw-bold fs-6">PlaceConnect</div>
            <small className="text-secondary" style={{ fontSize: '0.7rem' }}>Campus Recruitment</small>
          </div>
        </Link>
      </div>

      {/* Navigation links based on role */}
      <nav className="flex-grow-1 overflow-auto">
        {role === 'student' && renderStudentLinks()}
        {role === 'recruiter' && renderRecruiterLinks()}
        {role === 'admin' && renderAdminLinks()}

        <hr className="my-3 border-secondary border-opacity-25" />
        <Link to="/" className="dashboard-nav-item">
          <ExternalLink size={16} />
          <span>View Public Portal</span>
        </Link>
      </nav>

      {/* User profile section at bottom */}
      <div className="pt-3 border-top border-secondary border-opacity-25 mt-auto">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="overflow-hidden me-2">
            <div className="text-white small fw-bold text-truncate">{user?.name}</div>
            <div className="text-secondary small text-truncate" style={{ fontSize: '0.7rem' }}>
              {user?.email}
            </div>
          </div>
          <span className="badge bg-primary text-uppercase" style={{ fontSize: '0.65rem' }}>
            {role}
          </span>
        </div>
        <button
          onClick={logout}
          className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 mt-2"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

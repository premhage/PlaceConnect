import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Shield, Code, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-5">
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="p-2 rounded bg-primary text-white d-flex align-items-center justify-content-center">
                <Briefcase size={20} />
              </div>
              <span className="fw-bold fs-5 text-dark">
                Place<span className="text-primary">Connect</span>
              </span>
            </div>
            <p className="text-muted small mb-3">
              Online Placement & Campus Recruitment Portal connecting engineering undergraduates, tier-1 recruiting companies, and the Training & Placement Cell.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <Shield size={16} className="text-success" />
              <span>Verified Campus Recruitment Partner</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold mb-3 text-dark">Students</h6>
            <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
              <li><Link to="/jobs" className="text-muted">Browse Jobs</Link></li>
              <li><Link to="/register/student" className="text-muted">Register Profile</Link></li>
              <li><Link to="/login" className="text-muted">Student Login</Link></li>
              <li><Link to="/about" className="text-muted">Eligibility Rules</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="fw-bold mb-3 text-dark">Recruiters</h6>
            <ul className="list-unstyled small text-muted d-flex flex-column gap-2 mb-0">
              <li><Link to="/register/recruiter" className="text-muted">Register Company</Link></li>
              <li><Link to="/login" className="text-muted">Recruiter Login</Link></li>
              <li><Link to="/about" className="text-muted">Campus Hiring Drives</Link></li>
              <li><Link to="/about" className="text-muted">Hiring Guidelines</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold mb-3 text-dark">Academic Project Context</h6>
            <div className="p-3 rounded bg-light border">
              <div className="d-flex align-items-center gap-2 mb-1">
                <Award size={16} className="text-primary" />
                <span className="fw-semibold small">Third-Year B.Tech Computer Engineering</span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                Course: Web Technology (WT) Project Demonstration. Built with ReactJS, Vite, Bootstrap 5, Express.js, and MongoDB.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <small className="text-muted">
            &copy; {new Date().getFullYear()} PlaceConnect Portal. All rights reserved.
          </small>
          <small className="text-muted d-flex align-items-center gap-1">
            Built with modern MERN stack architecture.
          </small>
        </div>
      </div>
    </footer>
  );
};

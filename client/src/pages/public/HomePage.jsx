import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Briefcase,
  Search,
  CheckCircle,
  GraduationCap,
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Award,
} from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({
    activeJobs: 4,
    totalPlaced: 12,
    partnerCompanies: 8,
    highestPackage: '44 LPA',
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch active published jobs
    api
      .get('/jobs?limit=4')
      .then((res) => {
        if (res.data.success) {
          setFeaturedJobs(res.data.data);
          if (res.data.pagination) {
            setStats((prev) => ({
              ...prev,
              activeJobs: res.data.pagination.total || prev.activeJobs,
            }));
          }
        }
      })
      .catch((err) => console.warn('Could not load featured jobs:', err.message))
      .finally(() => setLoading(false));

    // Fetch placement report summary
    api
      .get('/drives')
      .then((res) => {
        // Can read drive data if needed
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="homepage-wrapper">
      {/* Hero Section */}
      <section className="bg-white border-bottom py-5 py-lg-6">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-semibold mb-3">
                CENTRALIZED PLACEMENT ECOSYSTEM
              </span>
              <h1 className="display-5 fw-bold text-dark lh-tight mb-3">
                Bridge College Talent With <span className="text-primary">Industry Opportunities</span>
              </h1>
              <p className="lead text-muted mb-4 fs-6">
                PlaceConnect streamlines engineering campus recruitment. Transparent eligibility evaluation, verified candidate resumes, automated interview scheduling, and real-time recruitment pipeline tracking for students, recruiters, and placement officers.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="p-2 rounded-3 bg-white border shadow-sm d-flex flex-column flex-sm-row gap-2 mb-4" style={{ maxWidth: '580px' }}>
                <div className="d-flex align-items-center gap-2 flex-grow-1 px-3">
                  <Search size={18} className="text-muted" />
                  <input
                    type="text"
                    className="form-control border-0 shadow-none ps-0"
                    placeholder="Search by role, company, skills (e.g. SDE, React)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-pc-primary px-4 d-flex align-items-center justify-content-center gap-2">
                  <span>Search Jobs</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick Trust Badges */}
              <div className="d-flex flex-wrap gap-4 pt-2 text-muted small">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={18} className="text-success" />
                  <span>Verified Recruiter Accounts</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle size={18} className="text-primary" />
                  <span>Rule-Based Eligibility Engine</span>
                </div>
              </div>
            </div>

            {/* Hero Graphic Card */}
            <div className="col-lg-5">
              <div className="p-4 rounded-4 bg-light border shadow-sm position-relative">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="p-2 rounded bg-primary text-white">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">Live Placement Highlights</h6>
                      <small className="text-muted">Academic Year 2025 - 2026</small>
                    </div>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                    Drive Active
                  </span>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-white rounded-3 border">
                      <div className="text-muted small mb-1">Highest Package</div>
                      <div className="fs-4 fw-bold text-primary">44.0 LPA</div>
                      <small className="text-muted">Microsoft SDE 1</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-white rounded-3 border">
                      <div className="text-muted small mb-1">Active Job Drives</div>
                      <div className="fs-4 fw-bold text-dark">{stats.activeJobs} Published</div>
                      <small className="text-muted">Tier-1 & Core IT</small>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-white rounded-3 border d-flex align-items-center justify-content-between">
                      <div>
                        <div className="text-muted small">Average Campus CTC</div>
                        <div className="fs-5 fw-bold text-dark">18.5 LPA</div>
                      </div>
                      <Link to="/jobs" className="btn btn-sm btn-outline-primary">
                        View Drives
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Feature Cards Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-1 rounded-pill fw-semibold mb-2">
              DESIGNED FOR EVERY STAKEHOLDER
            </span>
            <h2 className="fw-bold">How PlaceConnect Powers Campus Hiring</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Eliminate email confusion and spreadsheet tracking with role-tailored portals.
            </p>
          </div>

          <div className="row g-4">
            {/* Student Card */}
            <div className="col-md-4">
              <div className="pc-card h-100 p-4 d-flex flex-column">
                <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary mb-3">
                  <GraduationCap size={28} />
                </div>
                <h5 className="fw-bold mb-2">For Students</h5>
                <p className="text-muted small mb-4 flex-grow-1">
                  Build your verified academic portfolio, upload your resume, automatically verify job eligibility with branch and CGPA checks, and receive status updates and interview invites.
                </p>
                <Link to="/register/student" className="btn btn-outline-primary btn-sm mt-auto d-flex align-items-center justify-content-between">
                  <span>Register as Student</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Recruiter Card */}
            <div className="col-md-4">
              <div className="pc-card h-100 p-4 d-flex flex-column">
                <div className="stat-icon-wrapper bg-info bg-opacity-10 text-info mb-3">
                  <Building2 size={28} />
                </div>
                <h5 className="fw-bold mb-2">For Recruiting Companies</h5>
                <p className="text-muted small mb-4 flex-grow-1">
                  Publish campus job openings with custom eligibility criteria, review applicant resumes, move candidates through recruitment stages, and schedule interview rounds with meeting links.
                </p>
                <Link to="/register/recruiter" className="btn btn-outline-primary btn-sm mt-auto d-flex align-items-center justify-content-between">
                  <span>Register as Recruiter</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Admin Card */}
            <div className="col-md-4">
              <div className="pc-card h-100 p-4 d-flex flex-column">
                <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success mb-3">
                  <Award size={28} />
                </div>
                <h5 className="fw-bold mb-2">For Placement Officers</h5>
                <p className="text-muted small mb-4 flex-grow-1">
                  Approve visiting company registrations, inspect job openings before publication, oversee recruitment pipelines, and generate placement charts and statistical branch-wise reports.
                </p>
                <Link to="/login" className="btn btn-outline-primary btn-sm mt-auto d-flex align-items-center justify-content-between">
                  <span>Placement Officer Portal</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruitment Workflow Stepper */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="text-center mb-5">
            <h3 className="fw-bold">Seamless 5-Stage Recruitment Workflow</h3>
            <p className="text-muted small">Standardized end-to-end recruitment process executed in PlaceConnect</p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-lg col-md-4 col-6">
              <div className="p-3">
                <div className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                  1
                </div>
                <h6 className="fw-bold mb-1">Company Approval</h6>
                <small className="text-muted">Placement officer verifies company credentials</small>
              </div>
            </div>
            <div className="col-lg col-md-4 col-6">
              <div className="p-3">
                <div className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                  2
                </div>
                <h6 className="fw-bold mb-1">Job Publication</h6>
                <small className="text-muted">Recruiter posts criteria & admin publishes drive</small>
              </div>
            </div>
            <div className="col-lg col-md-4 col-6">
              <div className="p-3">
                <div className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                  3
                </div>
                <h6 className="fw-bold mb-1">Eligibility Engine</h6>
                <small className="text-muted">Automated branch, CGPA, and backlog validation</small>
              </div>
            </div>
            <div className="col-lg col-md-4 col-6">
              <div className="p-3">
                <div className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                  4
                </div>
                <h6 className="fw-bold mb-1">Interview Rounds</h6>
                <small className="text-muted">Shortlisting, video links & schedule notifications</small>
              </div>
            </div>
            <div className="col-lg col-md-4 col-6">
              <div className="p-3">
                <div className="rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px' }}>
                  5
                </div>
                <h6 className="fw-bold mb-1">Final Selection</h6>
                <small className="text-muted">Offer tracking and automated branch analytics</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h3 className="fw-bold mb-1">Recent Campus Job Openings</h3>
              <p className="text-muted small mb-0">Explore verified drives open for eligible applicants</p>
            </div>
            <Link to="/jobs" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
              <span>View All Openings</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="row g-4">
            {featuredJobs.map((job) => (
              <div key={job._id} className="col-md-6">
                <div className="pc-card p-4 h-100 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                    <div>
                      <span className="badge bg-light text-dark border mb-1">
                        {job.jobType}
                      </span>
                      <h5 className="fw-bold mb-1">
                        <Link to={`/jobs/${job._id}`} className="text-dark">
                          {job.title}
                        </Link>
                      </h5>
                      <div className="text-muted small fw-medium">
                        {job.companyId?.companyName || 'Recruiting Company'} &bull; {job.location}
                      </div>
                    </div>
                    <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1">
                      {job.salaryRange?.min} - {job.salaryRange?.max} {job.salaryRange?.period}
                    </span>
                  </div>

                  <p className="text-muted small line-clamp-2 mb-3">
                    {job.description}
                  </p>

                  <div className="d-flex flex-wrap gap-1 mb-4">
                    {job.requiredSkills?.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <small className="text-muted">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </small>
                    <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-pc-primary">
                      View Details & Apply
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

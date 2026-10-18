import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  CheckCircle,
  X,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Pagination } from '../../components/Pagination';

export const BrowseJobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Filters from URL
  const query = searchParams.get('q') || '';
  const branch = searchParams.get('branch') || 'All';
  const jobType = searchParams.get('jobType') || 'All';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
      };
      if (query) params.q = query;
      if (branch !== 'All') params.branch = branch;
      if (jobType !== 'All') params.jobType = jobType;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.get('/jobs', { params });
      if (res.data.success) {
        setJobs(res.data.data);
        setPagination({
          page: res.data.pagination.page,
          totalPages: res.data.pagination.totalPages,
          total: res.data.pagination.total,
        });
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container py-4 py-md-5">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Browse Campus Recruitment Drives</h2>
        <p className="text-muted small mb-0">
          Search and filter verified campus job opportunities matching your engineering branch and criteria.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="pc-card p-3 p-md-4 mb-4">
        <div className="row g-3">
          {/* Search Box */}
          <div className="col-lg-4 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search job title, skills..."
                value={query}
                onChange={(e) => updateFilter('q', e.target.value)}
              />
              {query && (
                <button
                  className="btn btn-light border border-start-0"
                  onClick={() => updateFilter('q', '')}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Branch Filter */}
          <div className="col-lg-3 col-md-6">
            <select
              className="form-select"
              value={branch}
              onChange={(e) => updateFilter('branch', e.target.value)}
            >
              <option value="All">All Engineering Branches</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Telecommunication">Electronics & Telecom</option>
              <option value="AIDS">AI & Data Science (AIDS)</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="col-lg-3 col-md-6">
            <select
              className="form-select"
              value={jobType}
              onChange={(e) => updateFilter('jobType', e.target.value)}
            >
              <option value="All">All Job Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Internship">Internship</option>
              <option value="Internship + PPO">Internship + PPO</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="col-lg-2 col-md-6">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="deadline">Approaching Deadline</option>
              <option value="salary">Highest Package</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="small text-muted">
          Showing <span className="fw-bold text-dark">{jobs.length}</span> of{' '}
          <span className="fw-bold text-dark">{pagination.total}</span> active postings
        </span>
        {(query || branch !== 'All' || jobType !== 'All') && (
          <button onClick={clearFilters} className="btn btn-sm btn-link text-danger p-0 text-decoration-none">
            Reset Filters
          </button>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching campus jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs matching your filter criteria"
          description="Try broadening your branch selection or clearing search keywords to view other open placements."
          action={
            <button onClick={clearFilters} className="btn btn-sm btn-primary">
              Clear All Filters
            </button>
          }
        />
      ) : (
        <div className="row g-4">
          {jobs.map((job) => (
            <div key={job._id} className="col-lg-6">
              <div className="pc-card p-4 h-100 d-flex flex-column">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                  <div>
                    <span className="badge bg-light text-primary border mb-1 fw-semibold">
                      {job.jobType}
                    </span>
                    <h5 className="fw-bold mb-1">
                      <Link to={`/jobs/${job._id}`} className="text-dark text-decoration-none">
                        {job.title}
                      </Link>
                    </h5>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                      <Building2 size={14} />
                      <span className="fw-medium text-dark">{job.companyId?.companyName || 'Company'}</span>
                      <span>&bull;</span>
                      <MapPin size={14} />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="fw-bold text-success fs-6">
                      {job.salaryRange?.min} - {job.salaryRange?.max} {job.salaryRange?.period}
                    </div>
                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Package CTC
                    </small>
                  </div>
                </div>

                <p className="text-muted small my-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>

                {/* Key Eligibility Highlights */}
                <div className="p-2 rounded bg-light border mb-3 small d-flex flex-wrap gap-3">
                  <div>
                    <span className="text-muted">Min CGPA:</span>{' '}
                    <span className="fw-bold text-dark">{job.minimumCGPA ? job.minimumCGPA.toFixed(1) : 'Open'}</span>
                  </div>
                  <div>
                    <span className="text-muted">Max Backlogs:</span>{' '}
                    <span className="fw-bold text-dark">{job.maximumBacklogs !== undefined ? job.maximumBacklogs : 'None'}</span>
                  </div>
                  <div>
                    <span className="text-muted">Branches:</span>{' '}
                    <span className="fw-semibold text-dark">
                      {job.eligibleBranches?.length > 2
                        ? `${job.eligibleBranches[0]} +${job.eligibleBranches.length - 1} more`
                        : job.eligibleBranches?.join(', ') || 'All'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-1 text-muted small">
                    <Calendar size={14} />
                    <span>Apply by {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                  <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-pc-primary">
                    View Details & Apply
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Briefcase, ArrowLeft, Save, PlusCircle, CheckSquare } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const RecruiterJobFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const branchOptions = [
    'Computer Engineering',
    'Information Technology',
    'Electronics & Telecommunication',
    'AIDS',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'All Branches',
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    eligibleBranches: ['Computer Engineering', 'Information Technology'],
    minimumCGPA: 7.0,
    maximumBacklogs: 0,
    eligibleGraduationYears: '2026',
    location: '',
    jobType: 'Full-Time',
    salaryMin: '',
    salaryMax: '',
    salaryPeriod: 'LPA',
    applicationDeadline: '',
  });

  useEffect(() => {
    if (isEditMode) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.data.success) {
        const j = res.data.data;
        setFormData({
          title: j.title || '',
          description: j.description || '',
          responsibilities: j.responsibilities ? j.responsibilities.join('\n') : '',
          requiredSkills: j.requiredSkills ? j.requiredSkills.join(', ') : '',
          eligibleBranches: j.eligibleBranches || [],
          minimumCGPA: j.minimumCGPA !== undefined ? j.minimumCGPA : 6.0,
          maximumBacklogs: j.maximumBacklogs !== undefined ? j.maximumBacklogs : 0,
          eligibleGraduationYears: j.eligibleGraduationYears ? j.eligibleGraduationYears.join(', ') : '2026',
          location: j.location || '',
          jobType: j.jobType || 'Full-Time',
          salaryMin: j.salaryRange?.min || '',
          salaryMax: j.salaryRange?.max || '',
          salaryPeriod: j.salaryRange?.period || 'LPA',
          applicationDeadline: j.applicationDeadline ? j.applicationDeadline.split('T')[0] : '',
        });
      }
    } catch (err) {
      toast.error('Failed to load job details for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBranchToggle = (branchName) => {
    setFormData((prev) => {
      let updated = [...prev.eligibleBranches];
      if (branchName === 'All Branches') {
        updated = updated.includes('All Branches') ? [] : ['All Branches'];
      } else {
        updated = updated.filter((b) => b !== 'All Branches');
        if (updated.includes(branchName)) {
          updated = updated.filter((b) => b !== branchName);
        } else {
          updated.push(branchName);
        }
      }
      return { ...prev, eligibleBranches: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      responsibilities: formData.responsibilities
        ? formData.responsibilities.split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
      requiredSkills: formData.requiredSkills
        ? formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      eligibleBranches: formData.eligibleBranches,
      minimumCGPA: parseFloat(formData.minimumCGPA) || 0,
      maximumBacklogs: parseInt(formData.maximumBacklogs, 10) || 0,
      eligibleGraduationYears: formData.eligibleGraduationYears
        ? formData.eligibleGraduationYears.split(',').map((y) => parseInt(y.trim(), 10)).filter(Boolean)
        : [2026],
      location: formData.location,
      jobType: formData.jobType,
      salaryRange: {
        min: parseFloat(formData.salaryMin),
        max: parseFloat(formData.salaryMax),
        currency: 'INR',
        period: formData.salaryPeriod,
      },
      applicationDeadline: new Date(formData.applicationDeadline).toISOString(),
    };

    try {
      if (isEditMode) {
        const res = await api.patch(`/jobs/${id}`, payload);
        if (res.data.success) {
          toast.success('Job posting updated successfully.');
          navigate('/recruiter/jobs');
        }
      } else {
        const res = await api.post('/jobs', payload);
        if (res.data.success) {
          toast.success('Job posting submitted for placement cell review.');
          navigate('/recruiter/jobs');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading job posting details..." />;

  return (
    <div className="recruiter-job-form-page">
      <div className="mb-3">
        <Link to="/recruiter/jobs" className="btn btn-sm btn-link text-muted p-0 text-decoration-none d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to Job Management
        </Link>
      </div>

      <div className="pc-card p-4 p-md-5">
        <div className="mb-4 pb-2 border-bottom">
          <h3 className="fw-bold mb-1">
            {isEditMode ? 'Edit Campus Job Posting' : 'Create New Campus Recruitment Opening'}
          </h3>
          <p className="text-muted small mb-0">
            Define role parameters, required qualifications, and criteria tested by the automated eligibility engine.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* 1. Job Essentials */}
            <div className="col-12">
              <h5 className="fw-bold text-dark mb-3">1. Role Information</h5>
            </div>

            <div className="col-md-8">
              <label className="form-label small fw-semibold">Job Title *</label>
              <input
                type="text"
                required
                name="title"
                className="form-control"
                placeholder="e.g. Software Development Engineer - Campus 2026"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Employment Type *</label>
              <select
                name="jobType"
                className="form-select"
                value={formData.jobType}
                onChange={handleChange}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Internship + PPO">Internship + PPO</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Work Location / Headquarters *</label>
              <input
                type="text"
                required
                name="location"
                className="form-control"
                placeholder="e.g. Bengaluru, Karnataka / Hybrid"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Application Deadline Date *</label>
              <input
                type="date"
                required
                name="applicationDeadline"
                className="form-control"
                value={formData.applicationDeadline}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Detailed Job Description *</label>
              <textarea
                rows={4}
                required
                name="description"
                className="form-control"
                placeholder="Describe team mission, daily responsibilities, and work environment..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Key Responsibilities (One per line)</label>
              <textarea
                rows={3}
                name="responsibilities"
                className="form-control"
                placeholder="Build scalable cloud microservices&#10;Optimize database indexing&#10;Participate in code reviews"
                value={formData.responsibilities}
                onChange={handleChange}
              />
            </div>

            {/* 2. Compensation */}
            <div className="col-12 pt-3 border-top">
              <h5 className="fw-bold text-dark mb-3">2. Compensation Package (CTC)</h5>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Minimum Salary / Stipend *</label>
              <input
                type="number"
                step="0.1"
                required
                name="salaryMin"
                className="form-control"
                placeholder="e.g. 12.0"
                value={formData.salaryMin}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Maximum Salary / Stipend *</label>
              <input
                type="number"
                step="0.1"
                required
                name="salaryMax"
                className="form-control"
                placeholder="e.g. 18.0"
                value={formData.salaryMax}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Compensation Period</label>
              <select
                name="salaryPeriod"
                className="form-select"
                value={formData.salaryPeriod}
                onChange={handleChange}
              >
                <option value="LPA">LPA (Lakhs Per Annum)</option>
                <option value="Per Month">Per Month (Internship Stipend)</option>
              </select>
            </div>

            {/* 3. Eligibility Criteria */}
            <div className="col-12 pt-3 border-top">
              <h5 className="fw-bold text-dark mb-1">3. Automated Eligibility Criteria</h5>
              <p className="text-muted small mb-3">
                Criteria configured here will be strictly evaluated by the PlaceConnect Eligibility Engine.
              </p>
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Minimum CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                max={10}
                required
                name="minimumCGPA"
                className="form-control"
                value={formData.minimumCGPA}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Maximum Allowed Backlogs</label>
              <input
                type="number"
                min={0}
                required
                name="maximumBacklogs"
                className="form-control"
                value={formData.maximumBacklogs}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Eligible Graduation Years</label>
              <input
                type="text"
                name="eligibleGraduationYears"
                className="form-control"
                placeholder="e.g. 2026"
                value={formData.eligibleGraduationYears}
                onChange={handleChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold d-block mb-2">Eligible Engineering Branches</label>
              <div className="d-flex flex-wrap gap-2">
                {branchOptions.map((branch) => {
                  const isChecked = formData.eligibleBranches.includes(branch);
                  return (
                    <button
                      key={branch}
                      type="button"
                      onClick={() => handleBranchToggle(branch)}
                      className={`btn btn-sm ${
                        isChecked ? 'btn-primary' : 'btn-outline-secondary'
                      } rounded-pill px-3`}
                    >
                      {branch}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Required Technical Skills (Comma-separated)</label>
              <input
                type="text"
                name="requiredSkills"
                className="form-control"
                placeholder="e.g. React, Node.js, Python, SQL, Cloud"
                value={formData.requiredSkills}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-top d-flex justify-content-end gap-2">
            <Link to="/recruiter/jobs" className="btn btn-outline-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-pc-primary d-inline-flex align-items-center gap-2"
            >
              {submitting ? <span className="spinner-border spinner-border-sm" /> : <Save size={16} />}
              <span>{isEditMode ? 'Update Job Posting' : 'Publish Job for Approval'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

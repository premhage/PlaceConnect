import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  GraduationCap,
  FileText,
  Upload,
  Download,
  CheckCircle,
  Save,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const StudentProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    branch: '',
    graduationYear: 2026,
    CGPA: '',
    backlogs: 0,
    skills: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    projects: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/me');
      if (res.data.success) {
        const p = res.data.data;
        setProfile(p);
        setFormData({
          name: p.userId?.name || user?.name || '',
          phone: p.phone || '',
          branch: p.branch || 'Computer Engineering',
          graduationYear: p.graduationYear || 2026,
          CGPA: p.CGPA !== undefined ? p.CGPA : '',
          backlogs: p.backlogs !== undefined ? p.backlogs : 0,
          skills: p.skills ? p.skills.join(', ') : '',
          bio: p.bio || '',
          linkedinUrl: p.linkedinUrl || '',
          githubUrl: p.githubUrl || '',
          projects: p.projects || [],
        });
      }
    } catch (err) {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        CGPA: parseFloat(formData.CGPA),
        backlogs: parseInt(formData.backlogs, 10),
        graduationYear: parseInt(formData.graduationYear, 10),
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await api.patch('/students/me', payload);
      if (res.data.success) {
        toast.success('Academic profile updated successfully.');
        setProfile(res.data.data);
        refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.warning('Please select a PDF or DOC resume file first.');
      return;
    }

    setUploadingResume(true);
    const data = new FormData();
    data.append('resume', resumeFile);

    try {
      const res = await api.post('/students/me/resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Resume uploaded successfully.');
        setProfile((prev) => ({
          ...prev,
          resume: res.data.data.resume,
        }));
        setResumeFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDownloadResume = async () => {
    if (!profile || !profile._id) return;
    try {
      const response = await api.get(`/students/${profile._id}/resume`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', profile.resume?.originalName || 'resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Could not download resume file.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div className="student-profile-page">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">My Student Profile & Resume</h3>
        <p className="text-muted small mb-0">
          Maintain your academic credentials and verified resume to meet job eligibility requirements.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Academic & Personal Form */}
        <div className="col-lg-8">
          <div className="pc-card p-4 mb-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2">Academic & Personal Credentials</h5>

            <form onSubmit={handleProfileSave}>
              <div className="row g-3">
                {/* Full Name */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* PRN (Read Only) */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">PRN (Permanent Registration No.)</label>
                  <input
                    type="text"
                    disabled
                    className="form-control bg-light font-monospace text-muted"
                    value={profile?.PRN || ''}
                  />
                  <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                    Assigned by college university registrar.
                  </small>
                </div>

                {/* Email (Read Only) */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <input
                    type="email"
                    disabled
                    className="form-control bg-light text-muted"
                    value={user?.email || ''}
                  />
                </div>

                {/* Phone */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Engineering Branch */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Engineering Branch *</label>
                  <select
                    name="branch"
                    className="form-select"
                    value={formData.branch}
                    onChange={handleChange}
                  >
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Telecommunication">Electronics & Telecom (ENTC)</option>
                    <option value="AIDS">Artificial Intelligence & Data Science (AIDS)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Graduation Year */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Graduation Year *</label>
                  <input
                    type="number"
                    required
                    min={2024}
                    max={2035}
                    name="graduationYear"
                    className="form-control"
                    value={formData.graduationYear}
                    onChange={handleChange}
                  />
                </div>

                {/* CGPA */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Cumulative CGPA (0 - 10) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={10}
                    required
                    name="CGPA"
                    className="form-control"
                    value={formData.CGPA}
                    onChange={handleChange}
                  />
                </div>

                {/* Active Backlogs */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Active Backlogs *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    name="backlogs"
                    className="form-control"
                    value={formData.backlogs}
                    onChange={handleChange}
                  />
                </div>

                {/* Skills */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Technical Skills (Comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    className="form-control"
                    placeholder="e.g. React, Node.js, Python, MongoDB, Docker, AWS"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Separating skills by commas lets the Eligibility Engine check skill requirements automatically.
                  </small>
                </div>

                {/* LinkedIn & GitHub */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    className="form-control"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">GitHub Profile URL</label>
                  <input
                    type="url"
                    name="githubUrl"
                    className="form-control"
                    placeholder="https://github.com/username"
                    value={formData.githubUrl}
                    onChange={handleChange}
                  />
                </div>

                {/* Bio */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Bio / Professional Summary</label>
                  <textarea
                    rows={3}
                    name="bio"
                    className="form-control"
                    placeholder="Write a brief professional summary..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-pc-primary d-inline-flex align-items-center gap-2"
                >
                  {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={16} />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Resume Management */}
        <div className="col-lg-4">
          <div className="pc-card p-4 mb-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
              <FileText size={18} className="text-primary" />
              <span>Resume Document</span>
            </h5>

            {profile?.resume && profile.resume.filePath ? (
              <div className="p-3 rounded-3 bg-light border mb-3">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-success" />
                  <span className="fw-bold small text-dark">Active Resume On File</span>
                </div>
                <div className="text-muted small mb-1 text-truncate">
                  {profile.resume.originalName}
                </div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Uploaded on: {new Date(profile.resume.uploadedAt || Date.now()).toLocaleDateString()}
                </div>

                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="btn btn-sm btn-outline-primary w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
                >
                  <Download size={14} /> Download Current Resume
                </button>
              </div>
            ) : (
              <div className="alert alert-warning small mb-3">
                No resume uploaded yet. You cannot apply for jobs without an active resume on file.
              </div>
            )}

            <form onSubmit={handleResumeUpload}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  {profile?.resume ? 'Replace Resume (.pdf, .doc, .docx)' : 'Upload Resume (.pdf, .doc, .docx)'}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="form-control form-control-sm"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                  Maximum file size: 5MB.
                </small>
              </div>

              <button
                type="submit"
                disabled={uploadingResume || !resumeFile}
                className="btn btn-sm btn-pc-primary w-100 d-flex align-items-center justify-content-center gap-2"
              >
                {uploadingResume ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Upload Resume</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

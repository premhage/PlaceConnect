import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Megaphone, PlusCircle, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';

export const AdminDrivesPage = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eligibilityCriteria: 'All regular third/final year students with minimum 6.0 CGPA and approved profiles.',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/drives');
      if (res.data.success) {
        setDrives(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load placement drives.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/drives', formData);
      if (res.data.success) {
        toast.success('Placement drive announced and broadcast to student accounts!');
        setDrives((prev) => [res.data.data, ...prev]);
        setModalOpen(false);
        setFormData({
          title: '',
          description: '',
          eligibilityCriteria: 'All regular third/final year students with minimum 6.0 CGPA and approved profiles.',
          startDate: '',
          endDate: '',
        });
      }
    } catch (err) {
      toast.error('Failed to create placement drive.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this placement drive announcement?')) return;

    try {
      const res = await api.delete(`/drives/${driveId}`);
      if (res.data.success) {
        toast.info('Drive announcement removed.');
        setDrives((prev) => prev.filter((d) => d._id !== driveId));
      }
    } catch (err) {
      toast.error('Failed to delete drive.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading placement drive announcements..." />;

  return (
    <div className="admin-drives-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1">Campus Placement Drives & Announcements</h3>
          <p className="text-muted small mb-0">
            Publish official university recruitment circulars and broadcast announcements to student portals.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              startDate: new Date().toISOString().split('T')[0],
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }));
            setModalOpen(true);
          }}
          className="btn btn-pc-primary btn-sm d-flex align-items-center gap-2"
        >
          <PlusCircle size={16} /> Broadcast New Drive
        </button>
      </div>

      {drives.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No drives published yet"
          description="Create your first placement drive announcement to inform students about visiting corporate pools."
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {drives.map((drive) => (
            <div key={drive._id} className="pc-card p-4">
              <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                      Campus Announcement
                    </span>
                    <span className="badge bg-success bg-opacity-10 text-success">
                      Published
                    </span>
                  </div>
                  <h5 className="fw-bold mb-1 text-dark">{drive.title}</h5>
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <Calendar size={14} />
                    <span>
                      Duration: {new Date(drive.startDate).toLocaleDateString()} &mdash;{' '}
                      {new Date(drive.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteDrive(drive._id)}
                  className="btn btn-sm btn-outline-danger p-1"
                  title="Delete Announcement"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-muted small mb-3">{drive.description}</p>

              <div className="p-2 rounded bg-light border text-muted small">
                <strong>Eligibility Criteria:</strong> {drive.eligibilityCriteria}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Broadcast Placement Drive</h5>
                <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
              </div>
              <form onSubmit={handleCreateDrive}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Drive / Notice Title *</label>
                    <input
                      type="text"
                      required
                      name="title"
                      className="form-control"
                      placeholder="e.g. Phase-2 Campus Recruitment Season 2026"
                      value={formData.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Date *</label>
                      <input
                        type="date"
                        required
                        name="startDate"
                        className="form-control"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Date *</label>
                      <input
                        type="date"
                        required
                        name="endDate"
                        className="form-control"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Eligibility Notice *</label>
                    <input
                      type="text"
                      required
                      name="eligibilityCriteria"
                      className="form-control"
                      value={formData.eligibilityCriteria}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Detailed Circular / Instructions *</label>
                    <textarea
                      rows={4}
                      required
                      name="description"
                      className="form-control"
                      placeholder="Provide information regarding dress code, resume copies, and schedule..."
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn btn-sm btn-pc-primary">
                    {submitting ? 'Broadcasting...' : 'Broadcast to All Students'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

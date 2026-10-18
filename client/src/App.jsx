import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { BrowseJobsPage } from './pages/public/BrowseJobsPage';
import { JobDetailsPage } from './pages/public/JobDetailsPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterStudentPage } from './pages/public/RegisterStudentPage';
import { RegisterRecruiterPage } from './pages/public/RegisterRecruiterPage';
import { AboutPage } from './pages/public/AboutPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Student Pages
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentApplicationsPage } from './pages/student/StudentApplicationsPage';
import { StudentInterviewsPage } from './pages/student/StudentInterviewsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';

// Recruiter Pages
import { RecruiterDashboardPage } from './pages/recruiter/RecruiterDashboardPage';
import { RecruiterCompanyPage } from './pages/recruiter/RecruiterCompanyPage';
import { RecruiterJobsPage } from './pages/recruiter/RecruiterJobsPage';
import { RecruiterJobFormPage } from './pages/recruiter/RecruiterJobFormPage';
import { RecruiterApplicantsPage } from './pages/recruiter/RecruiterApplicantsPage';
import { RecruiterInterviewsPage } from './pages/recruiter/RecruiterInterviewsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { AdminDrivesPage } from './pages/admin/AdminDrivesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

export const App = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<BrowseJobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/student" element={<RegisterStudentPage />} />
        <Route path="/register/recruiter" element={<RegisterRecruiterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* Student Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="applications" element={<StudentApplicationsPage />} />
        <Route path="interviews" element={<StudentInterviewsPage />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
      </Route>

      {/* Recruiter Portal */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboardPage />} />
        <Route path="company" element={<RecruiterCompanyPage />} />
        <Route path="jobs" element={<RecruiterJobsPage />} />
        <Route path="jobs/new" element={<RecruiterJobFormPage />} />
        <Route path="jobs/:id/edit" element={<RecruiterJobFormPage />} />
        <Route path="jobs/:jobId/applicants" element={<RecruiterApplicantsPage />} />
        <Route path="interviews" element={<RecruiterInterviewsPage />} />
      </Route>

      {/* Admin / Placement Cell Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="companies" element={<AdminCompaniesPage />} />
        <Route path="jobs" element={<AdminJobsPage />} />
        <Route path="drives" element={<AdminDrivesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Catch-All */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default App;

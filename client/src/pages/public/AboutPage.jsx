import React from 'react';
import { Mail, Phone, MapPin, Award, CheckCircle, HelpCircle } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="container py-5">
      {/* Title */}
      <div className="text-center mb-5">
        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill fw-semibold mb-2">
          CAMPUS TRAINING & PLACEMENT CELL
        </span>
        <h2 className="fw-bold">About PlaceConnect Portal</h2>
        <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
          Dedicated to bridging academic engineering excellence with premier technology and industrial organizations.
        </p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-lg-6">
          <div className="pc-card p-4 h-100">
            <h4 className="fw-bold mb-3">Our Mission & Mandate</h4>
            <p className="text-muted" style={{ lineHeight: '1.7' }}>
              PlaceConnect was architected as part of the Third-Year B.Tech Computer Engineering Web Technology curriculum to modernize the conventional, fragmented campus hiring process.
            </p>
            <p className="text-muted" style={{ lineHeight: '1.7' }}>
              By centralizing candidate profile verifications, rule-driven automated eligibility filtering, recruiter job publishing, and real-time status notifications, the portal guarantees transparency, saves hundreds of administrative hours, and delivers verified recruitment metrics to academic evaluators.
            </p>
            <div className="d-flex flex-column gap-2 mt-4 text-muted small">
              <div className="d-flex align-items-center gap-2">
                <CheckCircle size={16} className="text-success" />
                <span>Single source of truth for all campus hiring records</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle size={16} className="text-success" />
                <span>Zero duplicate applications through compound database indexing</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle size={16} className="text-success" />
                <span>Secure role-based access for Students, Recruiters, and Placement Administrators</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="pc-card p-4 h-100 bg-primary text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' }}>
            <h4 className="fw-bold mb-3 text-white">Placement Cell Contact Office</h4>
            <p className="text-light opacity-75 small mb-4">
              For corporate recruitment inquiries, pool campus requests, or student eligibility queries, please connect with the training and placement office.
            </p>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded bg-white bg-opacity-10">
                  <Mail size={18} />
                </div>
                <div>
                  <small className="text-light opacity-75 d-block">Placement Inquiries</small>
                  <span className="fw-semibold">placements@placeconnect.edu</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded bg-white bg-opacity-10">
                  <Phone size={18} />
                </div>
                <div>
                  <small className="text-light opacity-75 d-block">Placement Office Phone</small>
                  <span className="fw-semibold">+91 (020) 2420-2000 / Ext 401</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded bg-white bg-opacity-10">
                  <MapPin size={18} />
                </div>
                <div>
                  <small className="text-light opacity-75 d-block">Location</small>
                  <span className="fw-semibold">Central Placement Cell, Ground Floor, Academic Complex</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Placement Policy FAQ */}
      <div className="pc-card p-4 mb-5">
        <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <HelpCircle size={22} className="text-primary" />
          <span>Placement Policies & Frequently Asked Questions</span>
        </h4>

        <div className="accordion accordion-flush" id="faqAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                How does the automated eligibility engine decide whether I can apply?
              </button>
            </h2>
            <div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body text-muted small">
                The eligibility engine inspects your verified student branch, active graduation year, cumulative CGPA, and active backlogs directly against the minimum criteria specified by the recruiter. If your CGPA is below threshold, backlogs exceed maximum allowed, or branch is excluded, the server explicitly prevents application submission.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="headingTwo">
              <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                Can I edit or withdraw my application after submitting?
              </button>
            </h2>
            <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body text-muted small">
                Students can withdraw an application as long as its recruitment status remains in the <strong>Applied</strong> or <strong>Under Review</strong> stages. Once an application has been shortlisted or an interview has been scheduled, voluntary withdrawal is disabled to honor corporate schedules.
              </div>
            </div>
          </div>

          <div className="accordion-item">
            <h2 className="accordion-header" id="headingThree">
              <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                Why is my company registration in "Pending Review" status?
              </button>
            </h2>
            <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
              <div className="accordion-body text-muted small">
                To protect students against unverified recruiters and fraud, all company accounts must be formally vetted and approved by the Placement Officer administrator. Once approved, the recruiter unlocks the full suite for job creation, candidate shortlisting, and interview scheduling.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

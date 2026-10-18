import { Application } from '../models/Application.js';

/**
 * Checks a student's eligibility for a specific job posting.
 *
 * @param {Object} studentProfile - The StudentProfile document
 * @param {Object} job - The Job document (or populated object)
 * @param {Boolean} checkAlreadyApplied - Whether to query if student has applied
 * @returns {Promise<{ isEligible: boolean, reasons: string[], criteriaChecks: object, alreadyApplied: boolean }>}
 */
export const checkEligibility = async (studentProfile, job, checkAlreadyApplied = true) => {
  const criteriaChecks = {
    profileComplete: true,
    jobActive: true,
    jobApproved: true,
    deadlineValid: true,
    branchMatch: true,
    graduationYearMatch: true,
    cgpaValid: true,
    backlogsValid: true,
    skillsMatch: true,
    notAlreadyApplied: true,
  };

  const reasons = [];

  // 1. Explicit Student Profile existence & completeness check
  if (!studentProfile) {
    criteriaChecks.profileComplete = false;
    reasons.push('Student profile has not been created yet.');
    return {
      isEligible: false,
      reasons,
      criteriaChecks,
      alreadyApplied: false,
    };
  }

  if (
    !studentProfile.branch ||
    studentProfile.graduationYear === undefined ||
    studentProfile.CGPA === undefined ||
    studentProfile.backlogs === undefined
  ) {
    criteriaChecks.profileComplete = false;
    reasons.push('Student academic profile is incomplete (missing branch, graduation year, CGPA, or backlog record).');
  }

  // 2. Job approval and status
  if (job.status !== 'active') {
    criteriaChecks.jobActive = false;
    reasons.push(`Job posting is currently ${job.status} (applications closed).`);
  }

  if (job.approvalStatus !== 'approved') {
    criteriaChecks.jobApproved = false;
    reasons.push('Job posting has not yet been approved by the Placement Cell.');
  }

  // 3. Application deadline
  const now = new Date();
  if (job.applicationDeadline && new Date(job.applicationDeadline) < now) {
    criteriaChecks.deadlineValid = false;
    reasons.push(`Application deadline expired on ${new Date(job.applicationDeadline).toLocaleDateString()}.`);
  }

  // If profile is incomplete, return immediately with reasons
  if (!criteriaChecks.profileComplete) {
    return {
      isEligible: false,
      reasons,
      criteriaChecks,
      alreadyApplied: false,
    };
  }

  // 4. Branch match
  if (
    job.eligibleBranches &&
    job.eligibleBranches.length > 0 &&
    !job.eligibleBranches.includes('All Branches')
  ) {
    const branchMatched = job.eligibleBranches.some(
      (b) => b.trim().toLowerCase() === studentProfile.branch.trim().toLowerCase()
    );
    if (!branchMatched) {
      criteriaChecks.branchMatch = false;
      reasons.push(
        `Your branch (${studentProfile.branch}) is not in the eligible branches list: [${job.eligibleBranches.join(', ')}].`
      );
    }
  }

  // 5. Graduation Year match
  if (
    job.eligibleGraduationYears &&
    job.eligibleGraduationYears.length > 0
  ) {
    const yearMatched = job.eligibleGraduationYears.includes(Number(studentProfile.graduationYear));
    if (!yearMatched) {
      criteriaChecks.graduationYearMatch = false;
      reasons.push(
        `Graduation year ${studentProfile.graduationYear} is not eligible. Required year(s): [${job.eligibleGraduationYears.join(', ')}].`
      );
    }
  }

  // 6. Minimum CGPA
  if (job.minimumCGPA !== undefined && job.minimumCGPA > 0) {
    if (studentProfile.CGPA < job.minimumCGPA) {
      criteriaChecks.cgpaValid = false;
      reasons.push(
        `Your CGPA (${studentProfile.CGPA.toFixed(2)}) is below the required minimum (${job.minimumCGPA.toFixed(2)}).`
      );
    }
  }

  // 7. Maximum Backlogs
  if (job.maximumBacklogs !== undefined) {
    if (studentProfile.backlogs > job.maximumBacklogs) {
      criteriaChecks.backlogsValid = false;
      reasons.push(
        `Your active backlogs (${studentProfile.backlogs}) exceed the maximum permitted (${job.maximumBacklogs}).`
      );
    }
  }

  // 8. Required Skills
  if (job.requiredSkills && job.requiredSkills.length > 0) {
    const studentSkillsLower = (studentProfile.skills || []).map((s) => s.toLowerCase().trim());
    const missingSkills = job.requiredSkills.filter(
      (skill) => !studentSkillsLower.includes(skill.toLowerCase().trim())
    );
    // Notice: we can check if student has at least one or all required skills. If all or some are required:
    // If job has required skills, let's check missing skills:
    if (missingSkills.length > 0 && missingSkills.length === job.requiredSkills.length) {
      criteriaChecks.skillsMatch = false;
      reasons.push(`Missing key required skill(s): ${missingSkills.slice(0, 3).join(', ')}.`);
    }
  }

  // 9. Check already applied
  let alreadyApplied = false;
  if (checkAlreadyApplied && studentProfile._id && job._id) {
    const existing = await Application.findOne({
      studentId: studentProfile._id,
      jobId: job._id,
    });
    if (existing) {
      alreadyApplied = true;
      criteriaChecks.notAlreadyApplied = false;
      reasons.push(`You have already applied for this job on ${new Date(existing.appliedAt).toLocaleDateString()} (Current Status: ${existing.status}).`);
    }
  }

  const isEligible =
    criteriaChecks.profileComplete &&
    criteriaChecks.jobActive &&
    criteriaChecks.jobApproved &&
    criteriaChecks.deadlineValid &&
    criteriaChecks.branchMatch &&
    criteriaChecks.graduationYearMatch &&
    criteriaChecks.cgpaValid &&
    criteriaChecks.backlogsValid &&
    criteriaChecks.skillsMatch &&
    criteriaChecks.notAlreadyApplied;

  return {
    isEligible,
    reasons,
    criteriaChecks,
    alreadyApplied,
  };
};

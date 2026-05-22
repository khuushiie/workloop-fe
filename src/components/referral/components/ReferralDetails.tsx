import React from 'react';
import { Modal } from '../../common';
import Badge from '../../common/Badge';

export interface StatusHistory {
  status: string;
  timestamp: string;
  note: string;
  updatedBy: string | null;
}

export interface ResumeDetails {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  college: string | null;
  graduationYear: number | null;
  skills: string[];
  certification: string[];
  experience: number | null;
  internExperience: {
    duration_months: number;
    roles: string[];
    durations: string[];
    companies: string[];
    locations: string[];
  } | null;
  sourceFile: string | null;
}

export interface JobDetails {
  id: number;
  title: string;
  description: string;
  location: string;
  companyName: string | null;
  experienceRequired: string;
  rounds: {
    id: number;
    title: string;
  }[];
  totalRounds: number;
}

export interface ReferralDetailsData {
  referenceId: string;
  currentStatus: string;
  candidateName: string;
  candidateEmail: string;
  referredAt: string;
  lastActedAt: string;
  hrmsUserId: string;
  totalRounds: number;
  statusHistory: StatusHistory[];
  resumeDetails: ResumeDetails;
  jobDetails: JobDetails;
}

interface ReferralDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  referralObj: ReferralDetailsData | null;
}
// Render Badge helper
const getStatusBadge = (status: string) => {
  const lowerStatus = status?.toLowerCase() || "";
  let variant: "green" | "red" | "yellow" | "blue" | "gray" = "gray";
  
  if (lowerStatus.includes("hired") || lowerStatus.includes("success") || lowerStatus.includes("selected")) {
    variant = "green";
  } else if (lowerStatus.includes("reject")) {
    variant = "red";
  } else if (lowerStatus.includes("progress") || lowerStatus.includes("interview")) {
    variant = "blue";
  } else if (lowerStatus.includes("received") || lowerStatus.includes("pending")) {
    variant = "yellow";
  }

  return <Badge variant={variant}>{status}</Badge>;
};

// Formatting dates safely
const formatDate = (isoStr?: string) => {
  if (!isoStr) return "N/A";
  const d = new Date(isoStr);
  return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const ReferralDetails: React.FC<ReferralDetailsProps> = ({ isOpen, onClose, isLoading, referralObj }) => {
  const data = referralObj;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Referral Details"
      size="2xl"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-[#5b52cc] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data ? (
        <div className="space-y-6 text-slate-900 p-2">

          {/* Header: Name and Status */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-800">{data.candidateName}</h3>
              <p className="text-sm text-slate-500 mt-1">Referred on: {formatDate(data.referredAt)}</p>
            </div>
            {getStatusBadge(data.currentStatus)}
          </div>

          {/* Candidate Details Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 tracking-wide">Candidate Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-slate-800 break-all">{data.resumeDetails?.email || data.candidateEmail || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-semibold text-slate-800">{data.resumeDetails?.phone || "N/A"}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Education</p>
                <p className="text-sm font-semibold text-slate-800">
                  {data.resumeDetails?.college ? `${data.resumeDetails.college} (${data.resumeDetails.graduationYear})` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Total Experience</p>
                <p className="text-sm font-semibold text-slate-800">
                  {data.resumeDetails?.experience !== null ? `${data.resumeDetails.experience} Years` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Resume</p>
                {data.resumeDetails?.sourceFile ? (
                  <span className="text-sm font-semibold text-primary-600">
                    {data.resumeDetails.sourceFile}
                  </span>
                ) : (
                  <span className="text-sm text-slate-500">Not provided</span>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                 <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Skills</p>
                 <div className="flex flex-wrap gap-2 mt-1">
                   {data.resumeDetails?.skills?.length ? (
                      data.resumeDetails.skills.map((skill, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-md">
                          {skill}
                        </span>
                      ))
                   ) : (
                     <span className="text-sm text-slate-500">N/A</span>
                   )}
                 </div>
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3 tracking-wide">Job Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="col-span-1 sm:col-span-2">
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Job Title</p>
                <p className="text-sm font-semibold text-slate-800">{data.jobDetails?.title || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Job ID</p>
                <p className="text-sm font-semibold text-slate-800">{data.jobDetails?.id ? `REQ-${data.jobDetails.id}` : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Location</p>
                <p className="text-sm font-semibold text-slate-800">{data.jobDetails?.location || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Experience Required</p>
                <p className="text-sm font-semibold text-slate-800">{data.jobDetails?.experienceRequired ? `${data.jobDetails.experienceRequired} Years` : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Total Rounds</p>
                <p className="text-sm font-semibold text-slate-800">{data.jobDetails?.totalRounds ?? "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Status History Section */}
          {data.statusHistory && data.statusHistory.length > 0 && (
             <div>
               <h4 className="text-sm font-bold text-slate-900 mb-3 tracking-wide">Status History</h4>
               <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                  {data.statusHistory.map((history, idx) => (
                     <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                           <div className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-1.5 border-2 border-primary-100" />
                           {idx !== data.statusHistory.length - 1 && (
                              <div className="w-0.5 flex-1 bg-slate-200 mt-2 min-h-[30px]" />
                           )}
                        </div>
                        <div className="flex-1 pb-2">
                           <p className="text-sm font-semibold text-slate-800">{history.status}</p>
                           <p className="text-xs text-slate-500 mb-1">{formatDate(history.timestamp)}</p>
                           {history.note && (
                              <p className="text-sm text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 mt-2 shadow-sm">
                                {history.note}
                              </p>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
             </div>
          )}

        </div>
      ) : (
        <div className="py-10 text-center text-slate-500">
           No referral details found.
        </div>
      )}
    </Modal>
  );
};

export default ReferralDetails;
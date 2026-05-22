import React from 'react';
import { Button, Modal } from '../../common';
import { UserPlus, MapPin, Clock, Calendar } from 'lucide-react';
import { JobDescriptionItem } from '../../../store/apis/jobDescription.api';
import { cn } from '../../../utils/cn';

const JobDetails = ({
  jobDetailsJd,
  setJobDetailsJd,
  handleReferFromCard,
  getAvatarTheme,
}: {
  jobDetailsJd: any | null, // Note: You may need to update JobDescriptionItem interface in your API types to include 'description' and 'created_at'
  setJobDetailsJd: (jobDetailsJd: any | null) => void,
  handleReferFromCard: (jobDetailsJd: any) => void,
  getAvatarTheme: (companyName: string) => string,
}) => {
  
  // Helper to safely format dates from AI output
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  // Helper to safely format experience (handles both strings "3" and numbers 3)
  const formatExperience = (exp?: string | number | null) => {
    if (exp == null || exp === '') return "Not Specified";
    const expStr = String(exp).trim();
    if (expStr === '0' || expStr.toLowerCase() === 'fresher') return "Fresher";
    if (expStr.toLowerCase().includes('year')) return expStr; // Avoids "3 years Years"
    return `${expStr} Years`;
  };

  return (
    <Modal
      isOpen={!!jobDetailsJd}
      onClose={() => setJobDetailsJd(null)}
      title="Job Opening Details"
      size="2xl"
    >
      {jobDetailsJd && (
        <div className="space-y-6 text-gray-900 p-1">
          <div className="border-b border-gray-100">
            {/* Title Fallback */}
            <h3 className="text-2xl font-semibold text-gray-900">
              {jobDetailsJd.title || "Untitled Role"}
            </h3>
            
            {/* Skills Fallback
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {jobDetailsJd.required_skills && typeof jobDetailsJd.required_skills === 'string'
                ? jobDetailsJd.required_skills.split(",").map((skill: string, i: number) => (
                  <span
                    key={i}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-md",
                      getAvatarTheme(skill.trim())
                    )}
                  >
                    {skill.trim()}
                  </span>
                ))
                : (
                  <span className="text-xs text-gray-400">No Skills Specified</span>
                )
              }
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-md">
                <MapPin className="w-3.5 h-3.5" />
                {jobDetailsJd.location || "Not Specified"}
              </span>
              
              <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                {formatExperience(jobDetailsJd.experience_required)}
              </span>

              {jobDetailsJd.created_at && (
                <span className="flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5" />
                  Posted: {formatDate(jobDetailsJd.created_at) || "Unknown Date"}
                </span>
              )}
            </div> */}
          </div>

          {/* Description / Role Fallback */}
          {(jobDetailsJd.description || jobDetailsJd.role) && (
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Description</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {jobDetailsJd.description || jobDetailsJd.role}
              </p>
            </div>
          )}
          {!(jobDetailsJd.description || jobDetailsJd.role) && (
             <div>
               <p className="text-sm font-semibold text-gray-900 mb-2">Description</p>
               <p className="text-sm text-gray-400 italic">No description provided.</p>
             </div>
          )}

          {/* Rounds Fallback */}
          {Array.isArray(jobDetailsJd.rounds) && jobDetailsJd.rounds.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Interview Process</p>
              <div className="space-y-3">
                {jobDetailsJd.rounds.map((r: any, idx: number) => (
                  <div key={r.id || idx} className="flex items-center gap-3 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-[#5b52cc] text-[#5b52cc] flex items-center justify-center text-xs font-semibold shadow-sm mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm mb-0">
                        {r.title || `Round ${idx + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
            <Button
              appearance="primary"
              onClick={() => {
                handleReferFromCard(jobDetailsJd);
                setJobDetailsJd(null);
              }}
              className="bg-[#5b52cc] hover:bg-[#4a42ab] text-white rounded-md px-5 py-2.5 flex items-center gap-2 font-medium shadow-sm border-0 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Refer for this opening
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default JobDetails;
import React, { useState, useRef, useMemo } from "react";
import {
  FileText,
  Briefcase,
  UserPlus,
  ChevronRight,
  UploadCloud,
  Zap
} from "lucide-react";
import toast from "react-hot-toast";
import { Button, Select, Modal, SearchInput } from "../common";
import { cn } from "../../utils/cn";
import FilterWrapper from "../common/FilterWrapper";
import { useSubmitReferralMutation } from "../../store/apis/referral.api";
import { useGetJobDescriptionsQuery, type JobDescriptionItem } from "../../store/apis/jobDescription.api";
import JobDetails from "./components/JobDetails";
import { useDebounce } from "../../utils/debounce";

// Helper to generate soft, enterprise-friendly avatar themes
const getAvatarTheme = (name: string) => {
  const themes = [
    "bg-blue-50 text-blue-600 border-blue-100",
    "bg-emerald-50 text-emerald-600 border-emerald-100",
    "bg-purple-50 text-purple-600 border-purple-100",
    "bg-amber-50 text-amber-600 border-amber-100"
  ];
  return themes[(name?.length || 0) % themes.length];
};

const ReferralManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: jobDescriptions, isLoading: isLoadingJds } = useGetJobDescriptionsQuery(
    debouncedSearchQuery.trim() ? { search: debouncedSearchQuery.trim() } : undefined
  );
  
  const [submitReferral, { isLoading: isSubmitting }] = useSubmitReferralMutation();
  const [jobDetailsJd, setJobDetailsJd] = useState<any | null>(null);
  const [referModalOpen, setReferModalOpen] = useState(false);
  const [referJobId, setReferJobId] = useState("");
  const [referResumeFile, setReferResumeFile] = useState<File | null>(null);
  const referFileInputRef = useRef<HTMLInputElement>(null);

  const filteredJobs = useMemo(() => {
    return jobDescriptions?.jobDescriptions || [];
  }, [jobDescriptions]);

  const handleReferFromCard = (jd?: any) => {
    setReferJobId(jd ? String(jd.id) : "");
    setReferResumeFile(null);
    if (referFileInputRef.current) referFileInputRef.current.value = "";
    setReferModalOpen(true);
  };

  const handleReferFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReferResumeFile(file);
  };

  const handleReferSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!referResumeFile) {
      toast.error("Please select a resume file.");
      return;
    }
    try {
      await submitReferral({ jobId: referJobId, resume: referResumeFile }).unwrap();
      toast.success(`Referral submitted successfully!`);
      setReferModalOpen(false);
      setReferJobId("");
      setReferResumeFile(null);
      if (referFileInputRef.current) referFileInputRef.current.value = "";
    } catch (err: any) {
      const errorMessage = err?.data?.message || "Failed to submit referral. Please try again.";
      toast.error(errorMessage);
    }
  };

  const renderJobOpenings = () => {
    if (isLoadingJds) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 h-[180px] animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                <div className="w-16 h-5 bg-gray-100 rounded-md" />
              </div>
              <div className="space-y-3">
                <div className="w-3/4 h-5 bg-gray-100 rounded-md" />
                <div className="w-full h-4 bg-gray-50 rounded-md" />
                <div className="w-5/6 h-4 bg-gray-50 rounded-md" />
              </div>
              <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between">
                <div className="w-20 h-4 bg-gray-50 rounded-md" />
                <div className="w-16 h-8 bg-indigo-50 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (!jobDescriptions?.jobDescriptions || jobDescriptions?.jobDescriptions?.length === 0 ) {
      return (
        <div className="py-20 bg-white rounded-xl border border-gray-200 text-center flex flex-col items-center gap-4 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <p className="text-gray-900 text-lg font-medium">No job openings found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search criteria or check back later.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs?.map((jd: any) => (
          <div 
            key={jd.id} 
            className="group bg-white rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-[#5b52cc]/30 border border-gray-200 flex flex-col h-full"
          >
            {/* Card Header: Avatar & Badge */}
            <div className="flex justify-between items-start mb-4">
              {/* <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border",
                getAvatarTheme(jd.company_name || "")
              )}>
                {jd.company_name ? jd.company_name.charAt(0).toUpperCase() : "J"}
              </div> */}
              {/* <span className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-md border border-green-100">
                <Zap className="w-3 h-3 fill-green-600 text-green-600" /> Active
              </span> */}
            </div>

            {/* Card Body: Title & Details */}
            <div className="flex-grow">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2 group-hover:text-[#5b52cc] transition-colors line-clamp-2">
                {jd.title || "Untitled Role"}
              </h3>

              {/* Description fallback mimicking the modal logic, allowing 3 lines instead of 2 since badges were removed */}
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                {jd.description || jd.role || "No description provided."}
              </p>
            </div>

            {/* Card Footer: Actions */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setJobDetailsJd(jd)}
                className="text-sm font-medium text-gray-500 hover:text-[#5b52cc] flex items-center gap-1 transition-colors group/btn"
              >
                View Details
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <Button
                appearance="primary"
                size="small"
                onClick={() => handleReferFromCard(jd)}
                className="bg-[#5b52cc] hover:bg-[#4a42ab] text-white text-sm font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors px-4 py-2 border-0 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Refer
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 mx-auto space-y-6 bg-[#f8f9fc] min-h-screen">
      
      {/* Header Area */}
      <div className="sticky top-0 z-50 bg-[#f8f9fc] px-4 md:px-6 pt-6 pb-4 -mx-4 md:-mx-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 md:text-3xl tracking-tight">
            Refer Candidate
          </h1>
        </div>
        <Button
          appearance="primary"
          onClick={() => handleReferFromCard()}
          className="bg-[#5b52cc] hover:bg-[#4a42ab] text-white rounded-lg flex items-center gap-2 px-5 py-2.5 font-medium border-0 shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" aria-hidden />
          General Referral
        </Button>
      </div>
    </div>

      <FilterWrapper>
        <SearchInput
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search for jobs..."
          className="bg-white border-gray-200"
        />
      </FilterWrapper>

      {/* Main Content Area */}
      <section aria-labelledby="job-openings-heading">
        <h2 className="sr-only" id="job-openings-heading">Available Job Openings</h2>

        {renderJobOpenings()}
      </section>

      {/* Job Details Modal */}
      <JobDetails
        jobDetailsJd={jobDetailsJd}
        setJobDetailsJd={setJobDetailsJd}
        handleReferFromCard={handleReferFromCard}
        getAvatarTheme={getAvatarTheme}
      />

      {/* Refer Modal */}
      <Modal
        isOpen={referModalOpen}
        onClose={() => {
          setReferModalOpen(false);
          setReferJobId("");
          setReferResumeFile(null);
        }}
        title="Submit Referral"
        size="lg"
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              appearance="secondary"
              onClick={() => setReferModalOpen(false)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium px-4"
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              form="refer-form"
              appearance="primary"
              loading={isSubmitting}
              disabled={isSubmitting || !referResumeFile}
              className="bg-[#5b52cc] hover:bg-[#4a42ab] text-white border-0 rounded-md font-medium px-5 shadow-sm"
            >
              Submit Referral
            </Button>
          </div>
        }
      >
        <form id="refer-form" onSubmit={handleReferSubmit} className="space-y-5 p-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Job Opening
            </label>
            <Select
              id="refer-job-select"
              placeholder="General Application"
              options={[
                { value: "", label: "General Application (No specific role)" },
                ...(filteredJobs?.map((jd: any) => ({
                  value: String(jd.id),
                  label: jd.title + (jd.company_name ? ` - ${jd.company_name}` : ""),
                })) || []),
              ]}
              value={referJobId}
              onChange={(v) => setReferJobId(String(v ?? ""))}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#5b52cc] focus:border-[#5b52cc]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Resume <span className="text-red-500">*</span>
            </label>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer",
                referResumeFile ? "border-[#5b52cc] bg-indigo-50/50" : "border-gray-300"
              )}
              onClick={() => referFileInputRef.current?.click()}
            >
              <input
                ref={referFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleReferFileChange}
                className="sr-only"
              />
              <div className="flex flex-col items-center justify-center gap-3">
                {referResumeFile ? (
                  <>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                      <FileText className="w-5 h-5 text-[#5b52cc]" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-gray-900 truncate max-w-xs mb-0.5">
                        {referResumeFile.name}
                      </span>
                      <span className="text-xs text-[#5b52cc] font-medium">
                        Click to change file
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <UploadCloud className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <span className="block text-sm font-medium text-[#5b52cc] mb-0.5">
                        Click to upload <span className="text-gray-500 font-normal">or drag and drop</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        Supported formats: PDF, DOC, DOCX
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReferralManagement;
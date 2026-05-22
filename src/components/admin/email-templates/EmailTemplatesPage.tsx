import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Maximize2, Minimize2, Plus } from "lucide-react";
import { EmailTemplateBuilder } from "@ayush-tsm/email-template-builder";
import "@ayush-tsm/email-template-builder/styles.css";
import FilterWrapper from "../../common/FilterWrapper";
import SearchInput from "../../common/SearchInput";
import type {
  Template,
  Variable,
  ImageUploadResult,
} from "@ayush-tsm/email-template-builder";
import {
  useGetEmailTemplatesQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  useDuplicateEmailTemplateMutation,
  useSendTestEmailMutation,
} from "../../../store/apis/emailTemplate.api";
import { useUploadEmailTemplateImageMutation } from "../../../store/apis/uploads.api";
import toast from "react-hot-toast";
import { Button } from "../../common";

const HRMS_VARIABLES: Variable[] = [
  // --- GENERAL & EMPLOYEE ---
  { key: "userName", label: "Employee Name", sampleValue: "John Doe", required: true, group: "General" },
  { key: "firstName", label: "First Name", sampleValue: "John", group: "General" },
  { key: "lastName", label: "Last Name", sampleValue: "Doe", group: "General" },
  { key: "recipientName", label: "Recipient Name (HR/Manager)", sampleValue: "Sarah Connor", group: "General" },
  { key: "managerName", label: "Manager Name", sampleValue: "Jane Smith", group: "General" },

  // --- LEAVE MODUE ---
  { key: "leaveDates", label: "Leave Dates", sampleValue: "15 Apr - 17 Apr 2026", group: "Leave" },
  { key: "leaveType", label: "Leave Type", sampleValue: "Casual Leave", group: "Leave" },
  { key: "rejectionReason", label: "Rejection Reason", sampleValue: "Insufficient balance", group: "Leave" },
  { key: "leaveApprovalsUrl", label: "Leave Approvals URL", sampleValue: "https://org.stackmentalist.com/admin/leave-approvals", group: "Leave" },

  // --- ATTENDANCE REGULARIZATION ---
  { key: "date", label: "Attendance Date", sampleValue: "17 Apr 2026", group: "Attendance" },
  { key: "checkInTime", label: "Check-In Time", sampleValue: "09:00 AM", group: "Attendance" },
  { key: "checkOutTime", label: "Check-Out Time", sampleValue: "06:00 PM", group: "Attendance" },
  { key: "regularizationType", label: "Regularization Type", sampleValue: "Work From Home", group: "Attendance" },
  { key: "regularizationReason", label: "Regularization Reason", sampleValue: "Forgot to check in", group: "Attendance" },

  // --- REMINDERS & LISTS ---
  { key: "arRequestDetails", label: "AR Details List", sampleValue: "List of requests", group: "Reminders" },
  { key: "timesheetDetails", label: "Timesheet Details List", sampleValue: "List of entries", group: "Reminders" },

  // --- EVENTS ---
  { key: "years", label: "Years of Service", sampleValue: "3", group: "Events" },

  // --- CONDITIONAL FLAGS (For {{#if ...}}) ---
  { key: "isApplicant", label: "If Email is to Applicant", sampleValue: "true", group: "Conditionals" },
  { key: "isHR", label: "If Email is to HR/Manager", sampleValue: "false", group: "Conditionals" },
  { key: "isAutoApproved", label: "If Leave was Auto-Approved", sampleValue: "true", group: "Conditionals" },

  // --- SYSTEM & AUTH ---
  { key: "otp", label: "OTP Code", sampleValue: "482901", group: "Auth" },
  { key: "orgName", label: "Organization Name", sampleValue: "Acme Corp", group: "System Admin" },
  { key: "orgEmail", label: "Organization Email", sampleValue: "admin@acme.com", group: "System Admin" },
  { key: "requestedCount", label: "Requested User License Count", sampleValue: "50", group: "System Admin" },
  { key: "requesterName", label: "License Requester Name", sampleValue: "John Admin", group: "System Admin" },
  { key: "requesterEmail", label: "License Requester Email", sampleValue: "john@acme.com", group: "System Admin" },
  { key: "requestedAt", label: "Request Timestamp", sampleValue: "18 Apr 2026", group: "System Admin" },
];

/**
 * Maps a backend email template document to the MFE's Template shape.
 */
function toMfeTemplate(doc: Record<string, unknown>): Template {
  return {
    id: (doc._id as string) ?? (doc.id as string),
    name: doc.name as string,
    subject: doc.subject as string,
    htmlContent: doc.htmlContent as string,
    designJson: doc.designJson as Template["designJson"],
    category: doc.category as string | undefined,
    thumbnail: doc.thumbnail as string | undefined,
    createdAt: doc.createdAt as string | undefined,
    updatedAt: doc.updatedAt as string | undefined,
  };
}

/**
 * Wraps the `@ayush-tsm/email-template-builder` MFE, bridging its callback
 * props to HRMS RTK Query mutations for persistence.
 */
export default function EmailTemplatesPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const builderRef = useRef<HTMLDivElement>(null);
  const { data: rawTemplates, isLoading } = useGetEmailTemplatesQuery();
  const [createTpl] = useCreateEmailTemplateMutation();
  const [updateTpl] = useUpdateEmailTemplateMutation();
  const [deleteTpl] = useDeleteEmailTemplateMutation();
  const [duplicateTpl] = useDuplicateEmailTemplateMutation();
  const [sendTest] = useSendTestEmailMutation();
  const [uploadImage] = useUploadEmailTemplateImageMutation();

  const templates: Template[] = useMemo(
    () => (rawTemplates ?? []).map(toMfeTemplate),
    [rawTemplates],
  );

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t?.name?.toLowerCase()?.includes(q) ||
        (t?.subject ?? "").toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  const handleAddNew = useCallback(() => {
    // Hacky but necessary since the package doesn't expose an external onCreate trigger
    const buttons = document.querySelectorAll(".etb-root button");
    for (const btn of buttons) {
      const text = btn.textContent || "";
      if (
        text.includes("New Template") ||
        text.includes("Create your first template")
      ) {
        (btn as HTMLButtonElement).click();
        return;
      }
    }
  }, []);

  const handleBack = useCallback(() => {
    // Try to find the back button in the builder's toolbar
    // It's typically the first button in the toolbar's left section
    const toolbar = document.querySelector('.etb-root [class*="h-14"]');
    const internalBackBtn = toolbar?.querySelector('button');

    if (internalBackBtn) {
      (internalBackBtn as HTMLButtonElement).click();
    } else {
      // Fallback: Search all buttons for the chevron-left icon
      const allButtons = document.querySelectorAll(".etb-root button");
      for (const btn of allButtons) {
        if (
          btn.querySelector(".lucide-chevron-left") ||
          btn.innerHTML.includes("chevron-left")
        ) {
          (btn as HTMLButtonElement).click();
          return;
        }
      }
    }
  }, []);

  // Monitor the builder's internal state to detect if we're in Edit mode
  useEffect(() => {
    if (!builderRef.current) return;

    const checkMode = () => {
      // The search input is only present in the TemplateList view of the package
      const hasSearch = !!builderRef.current?.querySelector(
        'input[placeholder*="Search templates"]',
      );
      const newIsEditMode = !hasSearch;

      setIsEditMode((prev) => {
        // If we were in edit mode and now we're back in list mode, exit fullscreen
        if (prev && !newIsEditMode) {
          setIsFullscreen(false);
        }
        return newIsEditMode;
      });
    };

    const observer = new MutationObserver(checkMode);
    observer.observe(builderRef.current, { childList: true, subtree: true });

    // Initial check
    checkMode();

    return () => observer.disconnect();
  }, []);

  const handleSave = useCallback(
    async (
      tpl: Omit<Template, "id" | "createdAt" | "updatedAt">,
    ): Promise<void> => {
      try {
        await createTpl({
          name: tpl.name,
          subject: tpl.subject,
          htmlContent: tpl.htmlContent,
          designJson: tpl.designJson as Record<string, unknown>,
          category: tpl.category,
          thumbnail: tpl.thumbnail,
          applicationId: "hrms",
        }).unwrap();
        toast.success("Template saved");
      } catch {
        toast.error("Failed to save template");
      }
    },
    [createTpl],
  );

  const handleUpdate = useCallback(
    async (id: string, partial: Partial<Template>): Promise<void> => {
      try {
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...body } = partial;
        await updateTpl({
          id,
          body: body as Record<string, unknown>,
        }).unwrap();
        toast.success("Template updated");
      } catch {
        toast.error("Failed to update template");
      }
    },
    [updateTpl],
  );

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteTpl(id).unwrap();
        toast.success("Template deleted");
      } catch {
        toast.error("Failed to delete template");
      }
    },
    [deleteTpl],
  );

  const handleDuplicate = useCallback(
    async (id: string): Promise<void> => {
      try {
        await duplicateTpl(id).unwrap();
        toast.success("Template duplicated");
      } catch {
        toast.error("Failed to duplicate template");
      }
    },
    [duplicateTpl],
  );

  const handleImageUpload = useCallback(
    async (file: File): Promise<ImageUploadResult> => {
      const res = await uploadImage({ file }).unwrap();
      return {
        url: res.signedUrl || res.fileUrl,
      };
    },
    [uploadImage],
  );

  const handleSendTest = useCallback(
    async (
      template: Template,
      testEmail: string,
      variables: Record<string, string>,
    ): Promise<void> => {
      try {
        await sendTest({
          id: template.id,
          testEmail,
          variables,
        }).unwrap();
        toast.success(`Test email sent to ${testEmail}`);
      } catch {
        toast.error("Failed to send test email");
      }
    },
    [sendTest],
  );

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] bg-white flex flex-col"
          : "p-4 sm:p-6 bg-slate-50 min-h-screen"
      }
    >
      <div
        className={
          isFullscreen
            ? "flex-1 flex flex-col min-h-0 w-full"
            : "max-w-full mx-auto"
        }
      >
        {/* Header */}
        {!isFullscreen && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Email Templates
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {!isEditMode ? (
                <Button onClick={handleAddNew} appearance="primary">
                  <Plus className="w-4 h-4" /> New Template
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleBack}
                    appearance="secondary"
                    className="!px-3 !py-2 h-auto"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Templates
                  </Button>
                  <Button
                    onClick={() => setIsFullscreen(true)}
                    appearance="secondary"
                    className="!px-3 !py-2 h-auto"
                  >
                    <Maximize2 className="w-4 h-4" /> Full Screen
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {isFullscreen && (
          <Button
            onClick={() => setIsFullscreen(false)}
            appearance="primary"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] !rounded-full !px-6 !py-3 shadow-lg"
          >
            <Minimize2 className="w-4 h-4" /> Exit Full Screen
          </Button>
        )}

        {/* Filters */}
        {!isFullscreen && !isEditMode && (
          <FilterWrapper>
            <div className="max-w-md">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search templates by name or subject..."
                label="Search Templates"
              />
            </div>
          </FilterWrapper>
        )}

        {/* Builder Container */}
        <div
          ref={builderRef}
          className={`bg-[#f8fafc] overflow-hidden ${isFullscreen
            ? "flex-1 min-h-0 overflow-y-auto"
            : isEditMode
              ? "h-[calc(100vh-140px)] rounded-xl shadow-soft border border-slate-200"
              : "min-h-[calc(100vh-250px)] rounded-xl shadow-soft border border-slate-200"
            }`}
        >
          <style>
            {`
              /* Force full height and matching background for the whole builder area */
              .etb-root, .etb-root .bg-canvas {
                min-height: 100% !important;
                height: 100% !important;
                background-color: #f8fafc !important;
              }

              /* Hide TemplateList header (search bar, title, etc.) */
              .etb-root .flex.items-center.justify-between.border-b.py-4 {
                display: none !important;
              }

              /* Hide the internal Back button in the Toolbar using a method that keeps it clickable programmatically */
              .etb-root .relative.flex.h-14 .flex.items-center.gap-3 button {
                position: absolute !important;
                opacity: 0 !important;
                pointer-events: none !important;
                left: -9999px !important;
                width: 0 !important;
                height: 0 !important;
              }
              
              .etb-root .lucide-chevron-left {
                display: none !important;
              }
              
              /* Vertical Card UI with Top-Left Icon */
              .etb-root .group.relative.flex.flex-col.overflow-hidden.rounded-xl.border {
                background-color: #ffffff !important;
                border-color: #e2e8f0 !important;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
              }

              /* Premium hover effect */
              .etb-root .group.relative.flex.flex-col.overflow-hidden.rounded-xl.border:hover {
                transform: translateY(-4px) !important;
                box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
                border-color: #6366f1 !important; /* indigo-500 focus */
              }

              /* Preview area styling */
              .etb-root .aspect-\\[4\\/5\\] {
                background-color: #f1f5f9 !important; /* slate-100 */
                border-bottom: 1px solid #e2e8f0 !important;
              }

              /* Typography improvements */
              .etb-root h3 {
                font-size: 0.95rem !important;
                font-weight: 700 !important;
                color: #0f172a !important; /* slate-900 */
                margin-bottom: 2px !important;
              }

              .etb-root p.text-muted-foreground {
                font-size: 0.75rem !important;
                color: #64748b !important; /* slate-500 */
              }

              /* Action buttons styling */
              .etb-root .group .flex.items-center.gap-1 button {
                padding: 6px !important;
                border-radius: 8px !important;
                transition: all 0.2s !important;
                background-color: #f8fafc !important;
                border: 1px solid #e2e8f0 !important;
                color: #64748b !important;
              }

              .etb-root .group .flex.items-center.gap-1 button:hover {
                background-color: #eff6ff !important;
                border-color: #3b82f6 !important;
                color: #2563eb !important;
              }

              /* Special styling for delete button on hover */
              .etb-root .group .flex.items-center.gap-1 button[class*="text-destructive"]:hover {
                background-color: #fef2f2 !important;
                border-color: #ef4444 !important;
                color: #dc2626 !important;
              }

              /* Vertical Card UI with Top-Left Icon - Ultra Compact */
              .etb-root .group.relative.flex.flex-col {
                overflow: hidden !important;
                margin-top: 0 !important;
                padding: 16px !important;
                min-height: 140px !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
                background-color: #ffffff !important;
                border-color: #e2e8f0 !important;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important;
                transition: all 0.3s ease !important;
                border-radius: 12px !important;
              }

              .etb-root .group.relative.flex.flex-col:hover {
                transform: translateY(-2px) !important;
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1) !important;
                border-color: #2563eb !important;
              }

              /* Hide the bulky preview area */
              .etb-root .aspect-\\[4\\/5\\] {
                display: none !important;
              }

              /* Icon properly at the top-left - Compact */
              .etb-root .group.relative.flex.flex-col::before {
                content: "";
                position: relative !important;
                display: block !important;
                margin-bottom: 10px !important;
                z-index: 30;
                width: 40px;
                height: 40px;
                background-color: #eff6ff !important;
                border-radius: 10px;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='20' height='16' x='2' y='4' rx='2'/%3E%3Cpath d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: center;
                border: 1px solid #dbeafe !important;
                transition: all 0.2s ease !important;
              }

              .etb-root .group.relative.flex.flex-col:hover::before {
                background-color: #2563eb !important;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='20' height='16' x='2' y='4' rx='2'/%3E%3Cpath d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7'/%3E%3C/svg%3E");
              }

              /* Adjust the content area (Title/Subject/Buttons) - Compact */
              .etb-root .flex.items-center.justify-between.p-4 {
                /* Aggressively target the p-4 the user mentioned and remove it */
                padding: 0 !important;
                padding-left: 2px !important; 
                margin: 0 !important;
                width: 100% !important;
                flex-direction: column !important;
                align-items: flex-start !important;
                flex: 1 !important;
              }

              .etb-root .min-w-0.flex-1 {
                padding: 0 !important;
                margin: 0 !important;
              }

              .etb-root h3 {
                font-size: 1.1rem !important;
                font-weight: 700 !important;
                color: #0f172a !important;
                margin-bottom: 2px !important;
                padding: 0 !important;
              }

              .etb-root p.text-muted-foreground {
                font-size: 0.85rem !important;
                color: #64748b !important;
                margin-bottom: 12px !important;
                padding: 0 !important;
              }

              /* Buttons container at the bottom */
              .etb-root .flex.items-center.gap-1 {
                margin-top: auto !important;
                width: 100% !important;
                display: flex !important;
                justify-content: flex-start !important;
                gap: 8px !important;
                border-top: 1px solid #f1f5f9 !important;
                padding-top: 16px !important;
                margin-left: 0 !important;
              }

              /* List container background */
              .etb-root .bg-canvas {
                background-color: #f8fafc !important;
                padding-top: 16px !important;
              }
            `}
          </style>
          <EmailTemplateBuilder
            applicationId="hrms"
            templates={filteredTemplates}
            loading={isLoading}
            variables={HRMS_VARIABLES}
            onSave={handleSave}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onImageUpload={handleImageUpload}
            onSendTest={handleSendTest}
            theme={{
              primaryColor: "#4F46E5",
              secondaryColor: "#7C3AED",
              borderRadius: 8,
              fontFamily: "Plus Jakarta Sans, Inter, sans-serif",
            }}
          />
        </div>
      </div>
    </div>
  );
}

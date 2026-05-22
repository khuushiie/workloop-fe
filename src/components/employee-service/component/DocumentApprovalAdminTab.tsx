import React, { useState } from "react";
import { useAuth } from "../../../store/hooks/useAuth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import toast from "react-hot-toast";
import { CheckCircle, ChevronDown, ChevronUp, Download, Eye, X } from "lucide-react";
import { ApiError } from "../../../store/utils/apiError";
import {
  useGetAdminPendingDocumentsQuery,
  useGetAdminDocumentHistoryQuery,
  usePerformDocumentActionMutation,
  useLazyGetDocumentDownloadUrlQuery,
} from "../../../store/apis/userDocuments.api";
import type { UserDocumentItem } from "../../../store/apis/userDocuments.api";
import {
  Modal,
  SimpleTooltip,
  ConfigurableTable,
  Pagination,
} from "../../common";
import type { TableColumn } from "../../common/Table";
import Badge from "../../common/Badge";
import RejectionModal from "../../leave/modals/RejectionModal";
import { UserDocumentStatus, DocumentApprovalStatus } from "../../../constants/userDocuments";
import { TimesheetManagementSkeleton } from "../../timesheet/Skeleton";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Admin tab for approving/rejecting user document changes.
 * Mirrors the GameBookingAdminTab pattern with pending + history accordions.
 */
interface AdminTabProps {
  hideHistory?: boolean;
  hideFilters?: boolean;
}

const DocumentApprovalAdminTab: React.FC<AdminTabProps> = ({ hideHistory, hideFilters }) => {
  const { user } = useAuth();
  const currentUserId = user?.id ?? "";
  const userTimezone = dayjs.tz.guess();

  const [activeAccordion, setActiveAccordion] = useState<"pending" | "history">(
    "pending",
  );

  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(10);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);

  const [processing, setProcessing] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<UserDocumentItem | null>(null);

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: pendingResponse, isLoading: pendingLoading } =
    useGetAdminPendingDocumentsQuery({
      page: pendingPage,
      limit: pendingLimit,
    });

  const { data: historyResponse, isLoading: historyLoading } =
    useGetAdminDocumentHistoryQuery({
      page: historyPage,
      limit: historyLimit,
    });

  const [performAction] = usePerformDocumentActionMutation();
  const [triggerDownload] = useLazyGetDocumentDownloadUrlQuery();

  const pendingDocs = pendingResponse?.data ?? [];
  const pendingTotal = pendingResponse?.total ?? 0;
  const historyDocs = historyResponse?.data ?? [];
  const historyTotal = historyResponse?.total ?? 0;

  const formatDate = (dateStr: string) =>
    dayjs(dateStr).tz(userTimezone).format("DD/MM/YYYY");

  const getStatusBadge = (status: string | null | undefined) => {
    if (!status || status === "null") {
      return <Badge variant="gray" size="middle">Pending</Badge>;
    }

    const lowerStatus = status.toLowerCase();

    if (lowerStatus.includes(DocumentApprovalStatus.APPROVED) || lowerStatus === UserDocumentStatus.ACTIVE) {
      return <Badge variant="green" size="middle">{status}</Badge>;
    }

    if (lowerStatus.includes(DocumentApprovalStatus.REJECTED)) {
      return <Badge variant="red" size="middle">{status}</Badge>;
    }

    if (lowerStatus.includes(DocumentApprovalStatus.PENDING)) {
      return <Badge variant="yellow" size="middle">{status}</Badge>;
    }

    if (lowerStatus === UserDocumentStatus.ARCHIVED) {
      return <Badge variant="gray" size="middle">Archived</Badge>;
    }

    return <Badge variant="gray" size="middle">{status}</Badge>;
  };

  const handleApprove = async (docId: string) => {
    try {
      setProcessing(docId);
      await performAction({ id: docId, decision: DocumentApprovalStatus.APPROVED }).unwrap();
      toast.success("Document approved successfully.");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || "Failed to approve document.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      toast.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (docId: string) => {
    setRejectTarget(docId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    try {
      setProcessing(rejectTarget);
      await performAction({
        id: rejectTarget,
        decision: DocumentApprovalStatus.REJECTED,
        remarks: rejectionReason,
      }).unwrap();
      toast.success("Document rejected successfully.");
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectionReason("");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || "Failed to reject document.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      toast.error(errorMessage);
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = (doc: UserDocumentItem) => {
    setSelectedDoc(doc);
    setDetailsModalOpen(true);
  };

  const handleDownload = async (doc: UserDocumentItem) => {
    try {
      // The backend now correctly handles returning the pending (signed) file URL 
      // if the status is pending_update, so we can use the standard trigger.
      const url = await triggerDownload(doc.id).unwrap();
      if (url) window.open(url, "_blank");
    } catch {
      toast.error("Failed to get download link");
    }
  };

  const buildColumns = (
    isPendingTable: boolean,
  ): TableColumn<UserDocumentItem>[] => [
      {
        key: "employeeName",
        title: "Employee",
        label: "Employee",
        render: (_, r) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900 leading-none mb-1">
              {r.employeeName || "N/A"}
            </span>
            <span className="text-xs text-slate-500 truncate max-w-[150px]">
              {r.employeeEmail || ""}
            </span>
          </div>
        ),
      },
      {
        key: "documentTypeName",
        title: "Document Type",
        label: "Document Type",
        render: (_, r) => (
          <span className="text-sm font-medium text-slate-900">
            {r.documentTypeName}
          </span>
        ),
      },
      {
        key: "fileName",
        title: "File Name",
        label: "File Name",
        render: (_, r) => {
          const isUpdate = r.status === UserDocumentStatus.PENDING_UPDATE;
          const isNew = r.status === UserDocumentStatus.PENDING_NEW;
          const fileName = r.fileName;
          return (
            <div className="flex items-center gap-2 max-w-[200px]">
              <span
                className="text-sm text-slate-900 truncate font-medium"
                title={fileName}
              >
                {fileName}
              </span>
              {isUpdate && (
                <span className="flex-shrink-0 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">
                  Update
                </span>
              )}
              {isNew && (
                <span className="flex-shrink-0 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold uppercase">
                  New
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        label: "Status",
        render: (_, r) => getStatusBadge(r.approvalStatusLabel || r.status),
      },
      {
        key: "createdAt",
        title: "Submitted On",
        label: "Submitted On",
        render: (_, r) => (
          <span className="text-sm text-slate-900">{formatDate(r.createdAt)}</span>
        ),
      },
      {
        key: "actions",
        title: "Actions",
        label: "Actions",
        required: true,
        render: (_, r) => (
          <div className="flex items-center gap-2">
            <SimpleTooltip label="View" side="top" className="inline-block">
              <button
                onClick={() => handleViewDetails(r)}
                disabled={!!processing}
                aria-label="View"
                className={`text-primary-600 hover:text-primary-900 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Eye className="w-4 h-4" />
              </button>
            </SimpleTooltip>
            <SimpleTooltip label="Download" side="top" className="inline-block">
              <button
                onClick={() => handleDownload(r)}
                disabled={!!processing}
                aria-label="Download"
                className={`text-primary-600 hover:text-primary-900 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Download className="w-4 h-4" />
              </button>
            </SimpleTooltip>
            {isPendingTable && r.currentActorIds?.includes(currentUserId) && (
              <>
                <SimpleTooltip label="Approve" side="top" className="inline-block">
                  <button
                    onClick={() => handleApprove(r.id)}
                    disabled={!!processing}
                    aria-label="Approve"
                    className={`text-green-600 hover:text-green-800 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </SimpleTooltip>
                <SimpleTooltip label="Reject" side="top" className="inline-block">
                  <button
                    onClick={() => handleRejectClick(r.id)}
                    disabled={!!processing}
                    aria-label="Reject"
                    className={`text-red-600 hover:text-red-800 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </SimpleTooltip>
              </>
            )}
          </div>
        ),
      },
    ];

  return (
    <div className="mt-4">
      {/* Pending Document Approvals Accordion */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200">
        {activeAccordion !== "pending" ? (
          <button
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
            onClick={() => setActiveAccordion("pending")}
          >
            <span className="text-xl font-bold text-slate-900">
              Pending Document Approvals ({pendingTotal})
            </span>
            <ChevronDown className="w-5 h-5" />
          </button>
        ) : (
          <ConfigurableTable
            columns={buildColumns(true)}
            data={pendingDocs}
            loading={pendingLoading}
            skeleton={<TimesheetManagementSkeleton rows={pendingLimit} />}
            emptyMessage="No pending document approvals"
            rowKey={(d) => d.id}
            configOptions={{ persistenceKey: "doc-approval-pending-table" }}
            spacing={0}
            renderColumnSelector={(selector) => (
              <div
                className="w-full text-left px-4 py-3 border-b flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => setActiveAccordion("history")}
              >
                <span className="text-xl font-bold text-slate-900">
                  Pending Document Approvals ({pendingTotal})
                </span>
                <div className="flex items-center gap-4">
                  <div onClick={(e) => e.stopPropagation()}>{selector}</div>
                  <ChevronUp className="w-5 h-5" />
                </div>
              </div>
            )}
          />
        )}

        {activeAccordion === "pending" && (
          <div className="p-6 pt-0">
            <div className="mt-4">
              <Pagination
                currentPage={pendingPage}
                totalItems={pendingTotal}
                itemsPerPage={pendingLimit}
                onPageChange={setPendingPage}
                onItemsPerPageChange={(l) => {
                  setPendingLimit(l);
                  setPendingPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Document Approval History Accordion */}
      {!hideHistory && (
        <div className="bg-white rounded-xl shadow-soft border border-slate-200 mt-6">
          {activeAccordion !== "history" ? (
            <button
              className="w-full text-left p-4 flex items-center justify-between"
              onClick={() => setActiveAccordion("history")}
            >
              <span className="text-xl font-bold text-slate-900">
                Document Approval History ({historyTotal})
              </span>
              <ChevronDown className="w-5 h-5" />
            </button>
          ) : (
            <ConfigurableTable
              columns={buildColumns(false)}
              data={historyDocs}
              loading={historyLoading}
              skeleton={<TimesheetManagementSkeleton rows={historyLimit} />}
              emptyMessage="No document approval history"
              rowKey={(d) => d.id}
              configOptions={{ persistenceKey: "doc-approval-history-table" }}
              spacing={0}
              renderColumnSelector={(selector) => (
                <div
                  className="w-full text-left p-4 border-b flex items-center justify-between cursor-pointer"
                  onClick={() => setActiveAccordion("pending")}
                >
                  <span className="text-xl font-bold text-slate-900">
                    Document Approval History ({historyTotal})
                  </span>
                  <div className="flex items-center gap-4">
                    <div onClick={(e) => e.stopPropagation()}>{selector}</div>
                    <ChevronUp className="w-5 h-5" />
                  </div>
                </div>
              )}
            />
          )}

          {activeAccordion === "history" && (
            <div className="p-6 pt-0">
              <div className="mt-4">
                <Pagination
                  currentPage={historyPage}
                  totalItems={historyTotal}
                  itemsPerPage={historyLimit}
                  onPageChange={setHistoryPage}
                  onItemsPerPageChange={(l) => {
                    setHistoryLimit(l);
                    setHistoryPage(1);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <RejectionModal
          rejectionReason={rejectionReason}
          selectedLeave={rejectTarget}
          confirmReject={confirmReject}
          processing={processing}
          setRejectionReason={setRejectionReason}
          setSelectedLeave={setRejectTarget}
          setShowRejectModal={setShowRejectModal}
          title="Reject Document"
          description="Please provide a reason for rejecting this document change."
        />
      )}

      {/* Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Document Details"
        size="md"
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-900">
              <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-600 text-xs uppercase tracking-wider">Employee</p>
                  <p className="text-base font-bold text-slate-900">{selectedDoc.employeeName || "N/A"}</p>
                </div>
                {selectedDoc.employeeEmail && (
                  <div className="text-right">
                    <p className="font-medium text-slate-600 text-xs uppercase tracking-wider">Email</p>
                    <p className="text-slate-700">{selectedDoc.employeeEmail}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-slate-600">Document Type</p>
                <p>{selectedDoc.documentTypeName}</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">File Name</p>
                <p className="truncate font-semibold text-slate-900">
                  {selectedDoc.fileName}
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Status</p>
                {getStatusBadge(selectedDoc.status)}
              </div>
              <div>
                <p className="font-medium text-slate-600">Submitted Date</p>
                <p>{formatDate(selectedDoc.createdAt)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download {selectedDoc.status === UserDocumentStatus.PENDING_UPDATE ? "New File" : "File"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentApprovalAdminTab;

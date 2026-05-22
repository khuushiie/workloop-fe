import React, { useState } from "react";
import { FileText, Upload, Download, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Select from "../common/Select";
import type { SelectOption } from "../common/Select";
import Badge from "../common/Badge";
import { Pagination } from "../common";
import {
  useGetSelfDocumentsQuery,
  useGetSelfApprovalRequestsQuery,
  useSelfUploadDocumentMutation,
  useSelfUpdateDocumentMutation,
  useLazyGetDocumentDownloadUrlQuery,
} from "../../store/apis/userDocuments.api";
import type { UserDocumentItem } from "../../store/apis/userDocuments.api";
import { useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";
import { MasterConfigCategory } from "../../constants";
import { UserDocumentStatus } from "../../constants/userDocuments";
import dayjs from "dayjs";

interface DocumentsTabProps {
  userId: string;
}

/**
 * Self-service documents tab shown in My Profile.
 * Allows users to view their documents, upload new ones,
 * and update existing ones (triggering approval workflow).
 */
const DocumentsTab: React.FC<DocumentsTabProps> = ({ userId }) => {
  const [activeSubTab, setActiveSubTab] = useState<"documents" | "approvals">(
    "documents",
  );
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [updateDocId, setUpdateDocId] = useState<string | null>(null);
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [approvalPage, setApprovalPage] = useState(1);
  const [approvalLimit, setApprovalLimit] = useState(10);

  const { data: documentTypeOptions = [] } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.DOCUMENT_TYPE,
  );

  const { data: documentsResponse, refetch: refetchDocs } =
    useGetSelfDocumentsQuery({ page, limit });

  const { data: approvalsResponse, refetch: refetchApprovals } =
    useGetSelfApprovalRequestsQuery({ page: approvalPage, limit: approvalLimit });

  const [selfUpload] = useSelfUploadDocumentMutation();
  const [selfUpdate] = useSelfUpdateDocumentMutation();
  const [triggerDownload] = useLazyGetDocumentDownloadUrlQuery();

  const documents = documentsResponse?.data ?? [];
  const totalDocs = documentsResponse?.total ?? 0;
  const approvals = approvalsResponse?.data ?? [];
  const totalApprovals = approvalsResponse?.total ?? 0;

  const docTypeSelectOptions: SelectOption[] = documentTypeOptions
    .filter((opt) => opt.isActive)
    .map((opt) => ({ value: opt.id, label: opt.displayName }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must not exceed 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedDocType) {
      toast.error("Please select a document type");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }
    try {
      setUploading(true);
      await selfUpload({ documentTypeId: selectedDocType, file: selectedFile }).unwrap();
      toast.success("Document uploaded. Pending approval.");
      setSelectedDocType("");
      setSelectedFile(null);
      refetchDocs();
      refetchApprovals();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to upload document";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must not exceed 10MB");
        return;
      }
      setUpdateFile(file);
    }
  };

  const handleUpdate = async () => {
    if (!updateDocId || !updateFile) return;
    try {
      setUpdating(true);
      await selfUpdate({ id: updateDocId, file: updateFile }).unwrap();
      toast.success("Document update submitted. Pending approval.");
      setUpdateDocId(null);
      setUpdateFile(null);
      refetchDocs();
      refetchApprovals();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to update document";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const url = await triggerDownload(docId).unwrap();
      if (url) window.open(url, "_blank");
    } catch {
      toast.error("Failed to get download link");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case UserDocumentStatus.ACTIVE:
        return <Badge variant="green" size="small">Active</Badge>;
      case UserDocumentStatus.PENDING_NEW:
        return <Badge variant="yellow" size="small">Pending New</Badge>;
      case UserDocumentStatus.PENDING_UPDATE:
        return <Badge variant="yellow" size="small">Pending Update</Badge>;
      case UserDocumentStatus.ARCHIVED:
        return <Badge variant="gray" size="small">Archived</Badge>;
      default:
        return <Badge variant="gray" size="small">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-1">
        <button
          className={`text-sm font-medium pb-2 transition-colors ${
            activeSubTab === "documents"
              ? "text-primary-500 border-b-2 border-primary-500"
              : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveSubTab("documents")}
        >
          My Documents
        </button>
        <button
          className={`text-sm font-medium pb-2 transition-colors ${
            activeSubTab === "approvals"
              ? "text-primary-500 border-b-2 border-primary-500"
              : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveSubTab("approvals")}
        >
          Approval Requests {totalApprovals > 0 && `(${totalApprovals})`}
        </button>
      </div>

      {activeSubTab === "documents" && (
        <>
          {/* Upload form */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
            <h4 className="text-sm font-semibold text-slate-700">Upload New Document</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Select
                label="Document Type"
                value={selectedDocType}
                onChange={(val) => setSelectedDocType(val ? String(val) : "")}
                options={docTypeSelectOptions}
                placeholder="Select type"
                searchable
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  File
                </label>
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors text-sm">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-700 truncate max-w-[180px]">
                    {selectedFile ? selectedFile.name : "Choose file"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </label>
                <p className="mt-1 text-xs text-slate-500">
                  PDF, JPG, PNG, DOC. Max 10MB.
                </p>
              </div>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !selectedDocType || !selectedFile}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors h-10 ${
                  uploading || !selectedDocType || !selectedFile
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {/* Document list */}
          {documents.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-2 px-3 font-semibold text-slate-600">Document Type</th>
                      <th className="py-2 px-3 font-semibold text-slate-600">File Name</th>
                      <th className="py-2 px-3 font-semibold text-slate-600">Status</th>
                      <th className="py-2 px-3 font-semibold text-slate-600">Uploaded</th>
                      <th className="py-2 px-3 font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc: UserDocumentItem) => (
                      <tr
                        key={doc.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-2 px-3 text-slate-900">{doc.documentTypeName}</td>
                        <td className="py-2 px-3 text-slate-700 max-w-[200px] truncate">
                          {doc.fileName}
                        </td>
                        <td className="py-2 px-3">{getStatusBadge(doc.status)}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {dayjs(doc.createdAt).format("DD/MM/YYYY")}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDownload(doc.id)}
                              className="text-primary-600 hover:text-primary-800 transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {doc.status === UserDocumentStatus.ACTIVE && (
                              <button
                                type="button"
                                onClick={() => {
                                  setUpdateDocId(doc.id);
                                  setUpdateFile(null);
                                }}
                                className="text-amber-600 hover:text-amber-800 transition-colors"
                                title="Update document"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={page}
                totalItems={totalDocs}
                itemsPerPage={limit}
                onPageChange={setPage}
                onItemsPerPageChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No documents uploaded yet.</p>
            </div>
          )}

          {/* Update modal inline */}
          {updateDocId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Update Document</h3>
                <p className="text-sm text-slate-600">
                  Upload a new version of this document. The change will require approval.
                </p>
                <div>
                  <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors text-sm w-full">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 truncate">
                      {updateFile ? updateFile.name : "Choose new file"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleUpdateFile}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateDocId(null);
                      setUpdateFile(null);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={updating || !updateFile}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      updating || !updateFile
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                  >
                    {updating ? "Submitting..." : "Submit Update"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === "approvals" && (
        <>
          {approvals.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-2 px-3 font-semibold text-slate-600">Document Type</th>
                      <th className="py-2 px-3 font-semibold text-slate-600">File</th>
                      <th className="py-2 px-3 font-semibold text-slate-600">Status</th>
                      <th className="py-2 px-3 font-semibold text-slate-600">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvals.map((doc: UserDocumentItem) => (
                      <tr
                        key={doc.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-2 px-3 text-slate-900">
                          {doc.documentTypeName}
                        </td>
                        <td className="py-2 px-3 text-slate-700 max-w-[200px] truncate">
                          {doc.fileName}
                        </td>
                        <td className="py-2 px-3">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {dayjs(doc.createdAt).format("DD/MM/YYYY")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={approvalPage}
                totalItems={totalApprovals}
                itemsPerPage={approvalLimit}
                onPageChange={setApprovalPage}
                onItemsPerPageChange={(l) => {
                  setApprovalLimit(l);
                  setApprovalPage(1);
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>No approval requests yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentsTab;

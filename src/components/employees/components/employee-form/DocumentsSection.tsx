import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, Upload, Trash2, Download, RefreshCw, X, Eye, FileUp } from "lucide-react";
import Select from "../../../common/Select";
import type { SelectOption } from "../../../common/Select";
import type {
  UserDocumentItem,
} from "../../../../store/apis/userDocuments.api";
import {
  useAdminUploadDocumentMutation,
  useAdminDeleteDocumentMutation,
  useGetDocumentsForUserQuery,
  useGetSelfDocumentsQuery,
  useLazyGetDocumentDownloadUrlQuery,
  useSelfUploadDocumentMutation,
  useSelfUpdateDocumentMutation,
} from "../../../../store/apis/userDocuments.api";
import { useGetMasterConfigByCategoryQuery } from "../../../../store/apis/masterConfig.api";
import { MasterConfigCategory } from "../../../../constants";
import { Button } from "../../../common";
import toast from "react-hot-toast";
import SimpleTooltip from "../../../common/SimpleTooltip";
import Badge from "../../../common/Badge";
import Loading from "../../../common/Loading";
import { UserDocumentStatus, DocumentApprovalStatus } from "../../../../constants/userDocuments";
import { LocalDocument } from "../types";
import { ConfirmationModal } from "../../../common/ConfirmationModal";

interface DocumentsSectionProps {
  userId?: string;
  isViewMode: boolean;
  selfEditMode?: boolean;
  localDocuments?: LocalDocument[];
  onAddLocalDocument?: (doc: LocalDocument) => void;
  onRemoveLocalDocument?: (index: number) => void;
}

/**
 * Documents section embedded in the EmployeeFormModal.
 * Allows admins to view, upload, and remove employee documents.
 */
const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  userId,
  isViewMode,
  selfEditMode = false,
  localDocuments = [],
  onAddLocalDocument,
  onRemoveLocalDocument,
}) => {
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { data: documentTypeOptions = [] } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.DOCUMENT_TYPE,
  );

  // Self-service endpoint: used when user is editing their own profile
  const {
    data: selfDocResponse,
    refetch: refetchSelf,
    isFetching: isFetchingSelf,
  } = useGetSelfDocumentsQuery(undefined, {
    skip: !selfEditMode || !userId,
  });

  // Admin endpoint: used when admin is viewing/editing another user's profile
  const {
    data: adminDocResponse,
    refetch: refetchAdmin,
    isFetching: isFetchingAdmin,
  } = useGetDocumentsForUserQuery(
    { userId: userId ?? "" },
    { skip: selfEditMode || !userId },
  );

  // Unified accessor — pick the right response based on mode
  const documentResponse = selfEditMode ? selfDocResponse : adminDocResponse;
  const refetch = selfEditMode ? refetchSelf : refetchAdmin;
  const isLoadingDocs = selfEditMode ? isFetchingSelf : isFetchingAdmin;

  const allDocs = documentResponse?.data ?? [];
  const activeDocs = allDocs.filter(
    (doc) => doc.status === UserDocumentStatus.ACTIVE || doc.status === UserDocumentStatus.PENDING_NEW
  );
  const archivedDocs = allDocs.filter((doc) => doc.status === UserDocumentStatus.ARCHIVED);
  const displayDocs = showHistory ? archivedDocs : activeDocs;

  const [adminUpload, { isLoading: isUploadingAdmin }] = useAdminUploadDocumentMutation();
  const [adminDelete, { isLoading: isDeletingDoc }] = useAdminDeleteDocumentMutation();
  const [selfUpload, { isLoading: isUploadingSelf }] = useSelfUploadDocumentMutation();
  const [selfUpdate, { isLoading: isUpdatingSelf }] = useSelfUpdateDocumentMutation();
  const [triggerDownload] = useLazyGetDocumentDownloadUrlQuery();

  const [updateDocId, setUpdateDocId] = useState<string | null>(null);
  const [updateDocTypeId, setUpdateDocTypeId] = useState<string | null>(null);
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePreview = (file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    // Revoke after a delay to ensure the browser has time to load it in the new tab
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const docTypeSelectOptions: SelectOption[] = documentTypeOptions
    .filter((opt) => opt.isActive)
    .map((opt) => ({ value: opt.id, label: opt.displayName }));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
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
      toast.error("Please select a file to upload");
      return;
    }

    try {
      if (!userId) {
        // Queue document locally since user doesn't exist yet
        if (onAddLocalDocument) {
          const typeLabel = docTypeSelectOptions.find(o => String(o.value) === selectedDocType)?.label || "Document";
          onAddLocalDocument({
            file: selectedFile,
            documentTypeId: selectedDocType,
            documentTypeName: typeLabel,
          });
          toast.success("Document added to queue");
        }
      } else {
        setUploading(true);
        if (selfEditMode) {
          const existing = allDocs.find(d => d.documentTypeId === selectedDocType && [UserDocumentStatus.ACTIVE, UserDocumentStatus.PENDING_NEW, UserDocumentStatus.PENDING_UPDATE].includes(d.status));

          if (existing) {
            if (existing.status === UserDocumentStatus.ACTIVE) {
              const res = await selfUpdate({
                id: existing.id,
                file: selectedFile,
              }).unwrap();
              toast.success(
                (res as any)?.status === UserDocumentStatus.ACTIVE
                  ? "Document updated successfully"
                  : "Document updated. Pending approval."
              );
            } else {
              toast.error("A request for this document type is already pending approval.");
              setUploading(false);
              return;
            }
          } else {
            const res = await selfUpload({
              documentTypeId: selectedDocType,
              file: selectedFile,
            }).unwrap();
            toast.success(
              (res as any)?.status === UserDocumentStatus.ACTIVE
                ? "Document uploaded successfully"
                : "Document uploaded. Pending approval."
            );
          }
        } else {
          await adminUpload({
            userId,
            documentTypeId: selectedDocType,
            file: selectedFile,
          }).unwrap();
          toast.success("Document uploaded successfully");
        }
      }
      setSelectedDocType("");
      setSelectedFile(null);
      if (userId) refetch();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to upload document";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateDocId || !updateFile) return;
    try {
      setUpdating(true);
      if (selfEditMode) {
        const res = await selfUpdate({ id: updateDocId, file: updateFile }).unwrap();
        toast.success(
          (res as any)?.status === UserDocumentStatus.ACTIVE
            ? "Document updated successfully"
            : "Document updated. Pending approval."
        );
      } else {
        // For admin mode, update is handled by adminUpload with same documentTypeId
        if (!updateDocTypeId || !userId) {
          toast.error("Missing document type or user ID");
          return;
        }
        await adminUpload({
          userId,
          documentTypeId: updateDocTypeId,
          file: updateFile,
        }).unwrap();
        toast.success("Document updated successfully");
      }
      setUpdateDocId(null);
      setUpdateDocTypeId(null);
      setUpdateFile(null);
      refetch();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to submit update";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await adminDelete(docId).unwrap();
      toast.success("Document deleted successfully");
      refetch();
    } catch {
      toast.error("Failed to delete the document");
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const result = await triggerDownload(docId).unwrap();
      if (result) {
        window.open(result, "_blank");
      }
    } catch {
      toast.error("Failed to get download link");
    }
  };

  const getStatusBadge = (doc: UserDocumentItem) => {
    // 1. Explicit Rejection check (Always takes priority)
    if (doc.approvalStatus === DocumentApprovalStatus.REJECTED) {
      return (
        <Badge variant="red" size="small">
          {doc.approvalStatusLabel}
        </Badge>
      );
    }

    // 2. Explicit History check
    if (doc.status === UserDocumentStatus.ARCHIVED) {
      return (
        <Badge variant="gray" size="small">
          Archived
        </Badge>
      );
    }

    // 3. New document check
    if (doc.status === UserDocumentStatus.PENDING_NEW) {
      return (
        <Badge variant="blue" size="small">
          New
        </Badge>
      );
    }

    // 4. Active/Approved/Pending checks for live documents
    const displayStatus = doc.approvalStatus || doc.status;
    if (
      displayStatus === UserDocumentStatus.ACTIVE ||
      displayStatus === DocumentApprovalStatus.APPROVED ||
      (typeof displayStatus === "string" && displayStatus.toLowerCase().includes(DocumentApprovalStatus.PENDING))
    ) {
      return (
        <Badge variant="green" size="small">
          Active
        </Badge>
      );
    }

    return (
      <Badge variant="gray" size="small">
        Archived
      </Badge>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          Documents
        </h4>
        {archivedDocs.length > 0 && (
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw
              className={`w-3 h-3 ${showHistory ? "rotate-180" : ""} transition-transform`}
            />
            {showHistory
              ? "Back to Active"
              : `View History (${archivedDocs.length})`}
          </button>
        )}
      </div>

      <div className="rounded-xl shadow-soft border border-slate-200 overflow-hidden bg-white">
        {/* Upload form area */}
        {!isViewMode && (
          <div className="p-5 bg-slate-50/50 border-b border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Document Type"
                value={selectedDocType}
                onChange={(val) => setSelectedDocType(val ? String(val) : "")}
                options={docTypeSelectOptions}
                placeholder="Select document type"
                searchable
              />
              <div className="flex flex-col">
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Upload File
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    PDF, JPG, PNG (Max 10MB)
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 px-4 h-[41px] w-full bg-white border border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-slate-50 transition-all text-sm group"
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-slate-600 truncate flex-1 leading-none">
                    {selectedFile ? selectedFile.name : "Choose file..."}
                  </span>
                  {selectedFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-1 -mr-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                  )}
                  {!selectedFile && (
                    <span className="text-[11px] text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse
                    </span>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onClick={(e) => (e.currentTarget.value = "")}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              {selectedFile && (
                <Button
                  htmlType="button"
                  appearance="secondary"
                  onClick={() => handlePreview(selectedFile)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              )}
              <Button
                htmlType="button"
                appearance="primary"
                onClick={handleUpload}
                disabled={uploading || !selectedDocType || !selectedFile}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </div>
        )}

        {/* Documents table area */}
        <div className="p-0 min-h-[150px] max-h-[400px] overflow-y-auto">
          {isLoadingDocs || isDeletingDoc ? (
            <div className="h-[212px] flex items-center justify-center">
              <Loading message="Loading documents..." centered={false} />
            </div>
          ) : (!userId ? localDocuments.length > 0 : displayDocs.length > 0) ? (
            <div className="overflow-x-auto scrollbar-hide max-h-[380px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 text-left border-b border-slate-100 backdrop-blur-sm">
                    <th className="py-3 px-6 font-semibold text-slate-600">
                      Type
                    </th>
                    <th className="py-3 px-5 font-semibold text-slate-600">
                      File Name
                    </th>
                    <th className="py-3 px-5 font-semibold text-slate-600 text-center">
                      Status
                    </th>
                    <th className="py-3 px-10 font-semibold text-slate-600 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!userId ? (
                    localDocuments.map((doc, idx) => (
                      <tr key={`local-${idx}`} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3 px-5 text-slate-900 font-medium">{doc.documentTypeName}</td>
                        <td className="py-3 px-5 text-slate-600 max-w-[200px] truncate">{doc.file.name}</td>
                        <td className="py-3 px-5 text-center">
                          <Badge variant="blue" size="small">Queued</Badge>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => handlePreview(doc.file)}
                              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveLocalDocument?.(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    displayDocs.map((doc: UserDocumentItem) => {
                      const hasPendingUpdate = allDocs.some(
                        (d) =>
                          d.documentTypeId === doc.documentTypeId &&
                          (d.status === UserDocumentStatus.PENDING_UPDATE || d.status === UserDocumentStatus.PENDING_NEW) &&
                          d.id !== doc.id
                      );

                      return (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          <td className="py-3 px-5 text-slate-900 font-medium">
                            {doc.documentTypeName}
                          </td>
                          <td className="py-3 px-5 text-slate-600 max-w-[200px] truncate">
                            <div className="flex flex-col">
                              <span className="truncate" title={doc.fileName}>
                                {doc.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-center">
                            {getStatusBadge(doc)}
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex items-center justify-end gap-3">
                              <SimpleTooltip label="Download doc" side="top">
                                <button
                                  type="button"
                                  onClick={() => handleDownload(doc.id)}
                                  className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </SimpleTooltip>

                              {(selfEditMode || !isViewMode) &&
                                (doc.status === UserDocumentStatus.ACTIVE ||
                                  doc.status === UserDocumentStatus.PENDING_UPDATE ||
                                  doc.status === UserDocumentStatus.PENDING_NEW) && (
                                  <SimpleTooltip
                                    label={
                                      (hasPendingUpdate || doc.status !== UserDocumentStatus.ACTIVE)
                                        ? "Pending approval"
                                        : "Update document"
                                    }
                                    side="top"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (doc.status === UserDocumentStatus.ACTIVE) {
                                          setUpdateDocId(doc.id);
                                          setUpdateDocTypeId(doc.documentTypeId);
                                          setUpdateFile(null);
                                        }
                                      }}
                                      disabled={hasPendingUpdate || doc.status !== UserDocumentStatus.ACTIVE}
                                      className={`p-1.5 rounded-lg transition-all ${(hasPendingUpdate || doc.status !== UserDocumentStatus.ACTIVE)
                                        ? "text-amber-500 cursor-not-allowed"
                                        : "text-slate-400 hover:text-green-600"
                                        }`}
                                    >
                                      <FileUp
                                        className={`w-4 h-4 ${(hasPendingUpdate || doc.status !== UserDocumentStatus.ACTIVE) ? "animate-pulse" : ""}`}
                                      />
                                    </button>
                                  </SimpleTooltip>
                                )}

                              {!isViewMode &&
                                !selfEditMode &&
                                doc.status !== UserDocumentStatus.PENDING_NEW &&
                                doc.status !== UserDocumentStatus.PENDING_UPDATE &&
                                !hasPendingUpdate && (
                                  <SimpleTooltip label="Remove document" side="top">
                                    <button
                                      type="button"
                                      onClick={() => setDeleteDocId(doc.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </SimpleTooltip>
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-white h-[212px] flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4 transition-transform hover:scale-110 duration-300">
                <FileText className="w-8 h-8 text-slate-200" />
              </div>
              <h5 className="text-slate-900 font-semibold mb-1">No documents yet</h5>
              <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                {!userId
                  ? "Select a document type and file above to add them to the upload queue."
                  : showHistory
                    ? selfEditMode 
                      ? "Your archived and superseded documents will appear here."
                      : "Archived and superseded documents will appear here."
                    : selfEditMode
                      ? "You haven't uploaded any active documents yet."
                      : "No active documents have been uploaded for this employee."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Update Modal Overlay */}
      {updateDocId && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 !mt-0">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Update Document</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed !mt-0">
              Upload a new version of this document. This will trigger an approval workflow.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col">
                <div
                  className="flex items-center gap-2 px-4 h-[41px] w-full bg-slate-50 border border-slate-300 rounded-lg cursor-pointer hover:border-primary-400 transition-all text-sm group"
                  onClick={() => !updateFile && updateFileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-slate-600 truncate flex-1 leading-none">
                    {updateFile ? updateFile.name : "Choose new file..."}
                  </span>
                  {updateFile && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUpdateFile(null);
                        }}
                        className="p-1 -mr-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                  )}
                  {!updateFile && (
                    <span className="text-[11px] text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse
                    </span>
                  )}
                  <input
                    type="file"
                    ref={updateFileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setUpdateFile(f);
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onClick={(e) => (e.currentTarget.value = "")}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  appearance="secondary"
                  onClick={() => {
                    setUpdateDocId(null);
                    setUpdateFile(null);
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
                {updateFile && (
                  <Button
                    htmlType="button"
                    appearance="secondary"
                    onClick={() => handlePreview(updateFile)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                )}
                <Button
                  appearance="primary"
                  onClick={handleUpdate}
                  loading={updating}
                  disabled={!updateFile}
                >
                  Submit Update
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmationModal
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        onConfirm={() => {
          if (deleteDocId) {
            handleDelete(deleteDocId);
            setDeleteDocId(null);
          }
        }}
        title="Delete Document"
        message="Are you sure you want to remove this document? This action cannot be undone."
        type="danger"
        confirmText="Remove"
        cancelText="Cancel"
      />
    </section>
  );
};

export default DocumentsSection;

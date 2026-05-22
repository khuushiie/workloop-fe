import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  FileDown,
} from "lucide-react";
import {
  useLazyDownloadBulkUserTemplateQuery,
  useBulkUploadUsersMutation,
  type IBulkUploadUserResult,
} from "../../store/apis/user.api";
import { Button, Modal, ModalFooter, ModalButton } from "../common";
import toast from "react-hot-toast";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  success: boolean;
  message: string;
  data?: IBulkUploadUserResult;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [downloadTemplate, { isLoading: isDownloading }] =
    useLazyDownloadBulkUserTemplateQuery();
  const [bulkUploadUsers, { isLoading: isUploading }] =
    useBulkUploadUsersMutation();


  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate().unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const dateStamp = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      link.download = `bulk_user_template_${dateStamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Bulk user upload template downloaded successfully.");
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download template";
      toast.error(errorMessage);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const downloadErrorBlob = useCallback((blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStamp = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    link.download = `bulk_upload_errors_${dateStamp}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast.error("Please upload an Excel file (.xlsx)");
      return;
    }

    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await bulkUploadUsers(formData).unwrap();

      if (result.errorFileBlob) {
        downloadErrorBlob(result.errorFileBlob);
      }

      setUploadResult({
        success: true,
        message: "Bulk upload completed",
        data: result,
      });

      if (result.failed > 0) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const err = error as { data?: { message?: string }; message?: string };
      const errorMessage =
        err?.data?.message || err?.message || "Upload failed";

      setUploadResult({
        success: false,
        message: errorMessage,
      });

      toast.error(errorMessage);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleModalClose = () => {
    if (uploadResult) {
      onSuccess(); // Refetch users/stats when closing after viewing summary
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setUploadResult(null);
      setDragActive(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        title="Bulk Upload Employees"
        size="4xl"
        footer={
          uploadResult ? (
            <ModalFooter>
              <ModalButton
                variant="ghost"
                onClick={() => {
                  setUploadResult(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Upload Another File
              </ModalButton>
              <ModalButton variant="primary" onClick={handleModalClose}>
                Close
              </ModalButton>
            </ModalFooter>
          ) : undefined
        }
      >
        {!uploadResult ? (
            <div className="space-y-6">
              {/* Template Download Section */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <Button
                      htmlType="button"
                      appearance="primary"
                      onClick={handleDownloadTemplate}
                      disabled={isDownloading}
                      icon={<Download className="w-4 h-4" />}
                    >
                      {isDownloading ? "Downloading..." : "Download Template"}
                    </Button>
                    <p className="text-sm text-primary-700 mt-2">
                      Excel template with headers, example row, and reference
                      tables of allowed values.
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">
                  Upload Excel File
                </h3>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isUploading
                      ? "border-primary-300 bg-primary-50"
                      : dragActive
                        ? "border-primary-400 bg-primary-50"
                        : "border-slate-300 hover:border-slate-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <>
                      <div className="mb-4">
                        <div className="w-12 h-12 mx-auto border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      </div>
                      <p className="text-lg font-medium text-slate-900 mb-2">
                        Processing bulk upload...
                      </p>
                      <p className="text-sm text-slate-600">
                        This may take a while.
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-slate-900 mb-2">
                        Drop your Excel file here
                      </p>
                      <p className="text-sm text-slate-600 mb-4">
                        or click to browse files (.xlsx)
                      </p>
                      <Button
                        htmlType="button"
                        appearance="primary"
                        onClick={triggerFileInput}
                        icon={<Upload className="w-4 h-4" />}
                      >
                        Choose File
                      </Button>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-900 mb-2">
                      Important Notes
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Work Email must be unique across all employees</li>
                      <li>• Employee IDs must be unique</li>
                      <li>
                        • Phone and Date of Birth are required for every row
                      </li>
                      <li>
                        • Use template reference labels for Status, Role, Gender,
                        Department, Designation, etc.
                      </li>
                      <li>
                        • Role is required and must exactly match a role name from
                        the template list (invalid or empty Role will not import)
                      </li>
                      <li>
                        • If Employment Type, or Emergency Relationship
                        has a value, it must match the template reference values
                      </li>
                      <li>
                        • The summary after upload describes what succeeded; fix
                        your file and retry if some rows failed
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Results */
            <div className="space-y-6">
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg ${
                  !uploadResult.success
                    ? "bg-red-50 border border-red-200"
                    : uploadResult.data && uploadResult.data.failed > 0
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-green-50 border border-green-200"
                }`}
              >
                {!uploadResult.success ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : uploadResult.data && uploadResult.data.failed > 0 ? (
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                <div>
                  <h3
                    className={`font-medium ${
                      !uploadResult.success
                        ? "text-red-900"
                        : uploadResult.data && uploadResult.data.failed > 0
                          ? "text-amber-900"
                          : "text-green-900"
                    }`}
                  >
                    {!uploadResult.success
                      ? "Upload Failed"
                      : uploadResult.data && uploadResult.data.failed > 0
                        ? "Upload finished with issues"
                        : "Upload completed"}
                  </h3>
                  <p
                    className={`text-sm ${
                      !uploadResult.success
                        ? "text-red-700"
                        : uploadResult.data && uploadResult.data.failed > 0
                          ? "text-amber-800"
                          : "text-green-700"
                    }`}
                  >
                    {uploadResult.success && uploadResult.data
                      ? uploadResult.data.message
                      : uploadResult.message}
                  </p>
                </div>
              </div>

              {uploadResult.data && (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary-900">
                        {uploadResult.data.totalRows}
                      </div>
                      <div className="text-sm text-primary-700">
                        Total Records
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-900">
                        {uploadResult.data.created}
                      </div>
                      <div className="text-sm text-green-700">
                        Successfully Created
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-900">
                        {uploadResult.data.failed}
                      </div>
                      <div className="text-sm text-red-700">Failed</div>
                    </div>
                  </div>

                  {/* Error Report Download Section */}
                  {uploadResult.data.failed > 0 && uploadResult.data.errorFileBlob && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <FileDown className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-amber-900 mb-1">
                            Error Report Downloaded
                          </h3>
                          <p className="text-sm text-amber-800 mb-3">
                            An Excel file with failed rows and field-wise error details has been
                            automatically downloaded. Fix the errors in the file and re-upload it
                            — error annotation rows will be ignored automatically.
                          </p>
                          <Button
                            htmlType="button"
                            appearance="outline"
                            onClick={() => downloadErrorBlob(uploadResult.data!.errorFileBlob!)}
                            icon={<Download className="w-4 h-4" />}
                          >
                            Download Error Report Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
      </Modal>
    </>
  );
};

export default BulkUploadModal;

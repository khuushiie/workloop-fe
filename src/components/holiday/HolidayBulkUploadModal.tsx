import React, { useState, useRef } from "react";
import { X, Download, Upload, AlertCircle, CheckCircle, FileText } from "lucide-react";
import axios from "axios";
import {
  apiService,
  IBulkHolidayUploadError,
  IBulkHolidayUploadResult,
} from "../../services/api";
import { AlertModal } from "../common/AlertModal";

interface HolidayBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Normalised result shown in the modal after an upload attempt.
 * Wraps the backend stats with a boolean success flag and a human message so
 * we can render both HTTP errors and partial-success responses uniformly.
 */
interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    totalRecords: number;
    successfulImports: number;
    failedImports: number;
    duplicates: string[];
    errors: IBulkHolidayUploadError[];
  };
}

/** Shape of the backend error body on 4xx/5xx responses */
interface BackendErrorBody {
  message?: string | string[];
  error?: string;
}

const HolidayBulkUploadModal: React.FC<HolidayBulkUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Toast notification states
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    type: "info",
    title: "",
    message: "",
  });

  const generateCSVTemplate = () => {
    const currentYear = new Date().getFullYear();
    const headers = [
      "Holiday Name",
      "Date (YYYY-MM-DD)",
      "Year",
      "Type (mandatory/optional)",
      "Description"
    ];

    const sampleData = [
      "New Year's Day",
      `${currentYear}-01-01`,
      `${currentYear}`,
      "mandatory",
      "New Year celebration"
    ];

    const csvContent = [
      headers.join(","),
      sampleData.join(","),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "holiday_bulk_upload_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  /**
   * Derive a normalised UploadResult from the backend stats payload.
   * The backend returns a bare stats object; we treat the request as a success
   * when at least one record was imported and no rows errored out.
   */
  const toUploadResult = (stats: IBulkHolidayUploadResult): UploadResult => {
    const hasImports = stats.successfulImports > 0;
    return {
      success: hasImports,
      message:
        stats.summary ||
        (hasImports
          ? `Successfully imported ${stats.successfulImports} out of ${stats.totalRecords} records.`
          : "No records were imported successfully."),
      data: {
        totalRecords: stats.totalRecords,
        successfulImports: stats.successfulImports,
        failedImports: stats.failedImports,
        duplicates: stats.duplicates,
        errors: stats.errors,
      },
    };
  };

  /**
   * Extract a readable message from an axios/HTTP error, covering Nest's
   * default error envelope (`{ message, error }`) and plain Error instances.
   */
  const extractErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      const body = error.response?.data as BackendErrorBody | undefined;
      if (body?.message) {
        return Array.isArray(body.message) ? body.message.join(", ") : body.message;
      }
      if (body?.error) return body.error;
      return error.message || "Upload failed";
    }
    if (error instanceof Error) return error.message;
    return "Upload failed";
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setToastConfig({
        type: "error",
        title: "Invalid File Type",
        message: "Please upload a CSV file",
      });
      setShowToast(true);
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const stats = await apiService.bulkUploadHolidays(formData);
      const result = toUploadResult(stats);
      setUploadResult(result);

      if (result.success) {
        setToastConfig({
          type: "success",
          title: "Upload Successful",
          message: result.message,
        });
        setShowToast(true);
        onSuccess();
      } else {
        setToastConfig({
          type: "error",
          title: "Upload Failed",
          message: result.message,
        });
        setShowToast(true);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = extractErrorMessage(error);

      setUploadResult({
        success: false,
        message: errorMessage,
      });

      setToastConfig({
        type: "error",
        title: "Upload Error",
        message: errorMessage,
      });
      setShowToast(true);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-soft-hover max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Bulk Upload Holidays
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!uploadResult ? (
            <div className="space-y-6">
              {/* Template Download Section */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-primary-600 mt-0.5" />
                  <div className="flex-1">
                    <button
                      onClick={generateCSVTemplate}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-900 mb-3">
                  Upload CSV File
                </h3>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary-400 bg-primary-50"
                      : "border-slate-300 hover:border-slate-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-slate-900 mb-2">
                    {isUploading ? "Uploading..." : "Drop your CSV file here"}
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    or click to browse files
                  </p>
                  <button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isUploading
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? "Uploading..." : "Choose File"}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
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
                      <li>• Holiday names must be unique for the same date and year</li>
                      <li>• Dates must be in YYYY-MM-DD format</li>
                      <li>• Year must be a valid number between 1900 and 2100</li>
                      <li>• Type must be either "mandatory" or "optional"</li>
                      <li>• Description is optional</li>
                      <li>• Duplicate records will be skipped and reported</li>
                      <li>• Invalid data will be flagged with specific error messages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Results */
            <div className="space-y-6">
              <div className={`flex items-center space-x-3 p-4 rounded-lg ${
                uploadResult.success 
                  ? "bg-green-50 border border-green-200" 
                  : "bg-red-50 border border-red-200"
              }`}>
                {uploadResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <h3 className={`font-medium ${
                    uploadResult.success ? "text-green-900" : "text-red-900"
                  }`}>
                    {uploadResult.success ? "Upload Completed" : "Upload Failed"}
                  </h3>
                  <p className={`text-sm ${
                    uploadResult.success ? "text-green-700" : "text-red-700"
                  }`}>
                    {uploadResult.message}
                  </p>
                </div>
              </div>

              {uploadResult.data && (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary-900">
                        {uploadResult.data.totalRecords}
                      </div>
                      <div className="text-sm text-primary-700">Total Records</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-900">
                        {uploadResult.data.successfulImports}
                      </div>
                      <div className="text-sm text-green-700">Successfully Imported</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-900">
                        {uploadResult.data.failedImports}
                      </div>
                      <div className="text-sm text-red-700">Failed Imports</div>
                    </div>
                  </div>

                  {/* Duplicates */}
                  {uploadResult.data.duplicates.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-900 mb-2">
                        Duplicate Records ({uploadResult.data.duplicates.length})
                      </h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        The following holidays already exist in the system:
                      </p>
                      <div className="bg-white border border-yellow-200 rounded p-3 max-h-32 overflow-y-auto">
                        {uploadResult.data.duplicates.map((holiday, index) => (
                          <div key={index} className="text-sm text-yellow-800">
                            {holiday}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {uploadResult.data.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-900 mb-2">
                        Validation Errors ({uploadResult.data.errors.length})
                      </h4>
                      <div className="bg-white border border-red-200 rounded p-3 max-h-48 overflow-y-auto">
                        {uploadResult.data.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-800 mb-2">
                            <span className="font-medium">Row {error.row}:</span> {error.field} - {error.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setUploadResult(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Toast Notification */}
      <AlertModal
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        title={toastConfig.title}
        message={toastConfig.message}
        type={toastConfig.type}
        buttonText="OK"
      />
    </div>
  );
};

export default HolidayBulkUploadModal;

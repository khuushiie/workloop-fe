import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle, Loader2, FileUp } from "lucide-react";
import Modal, { ModalFooter, ModalButton } from "../common/Modal";
import toast from "react-hot-toast";
import { useUploadPaymentProofMutation } from "../../store/apis/billingLicense.api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (result: { fileUrl: string; signedUrl: string }) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProof, { isLoading: isUploading }] =
    useUploadPaymentProofMutation();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (
      dropped &&
      (dropped.type.startsWith("image/") || dropped.type === "application/pdf")
    ) {
      setFile(dropped);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;

    try {
      const result = await uploadProof(file).unwrap();
      toast.success("Payment proof uploaded successfully");
      onUploadSuccess({ fileUrl: result.fileUrl, signedUrl: result.signedUrl });
      handleClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to upload payment proof";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    onClose();
    setFile(null);
  };

  const modalTitle = (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
        <FileUp className="w-5 h-5 text-primary-600" />
      </div>
      <span className="text-lg font-bold text-slate-900">
        Upload Payment Proof
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="md"
      footer={
        <ModalFooter>
          <ModalButton
            variant="secondary"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isUploading || !file}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading…
              </span>
            ) : (
              "Upload Proof"
            )}
          </ModalButton>
        </ModalFooter>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="text-sm text-slate-500 mb-3">
            Upload receipt, transaction screenshot, or payment confirmation
            (PDF, JPG, PNG)
          </p>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? "border-primary-400 bg-primary-50"
                : file
                  ? "border-green-300 bg-green-50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <p className="text-sm font-medium text-green-700">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-slate-400" />
                <p className="text-sm text-slate-600">
                  <span className="text-primary-600 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-slate-400">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;

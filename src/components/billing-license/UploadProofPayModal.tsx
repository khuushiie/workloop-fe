import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  CheckCircle,
  Loader2,
  FileUp,
  Check,
  FileText,
} from "lucide-react";
import Modal, { ModalFooter, ModalButton } from "../common/Modal";
import toast from "react-hot-toast";
import {
  useUploadPaymentProofMutation,
  useMarkBillingPaidMutation,
  type IBillingRecord,
} from "../../store/apis/billingLicense.api";
import dayjs from "dayjs";

interface UploadedProof {
  fileUrl: string;
  signedUrl: string;
}

interface UploadProofPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: IBillingRecord | null;
}

const UploadProofPayModal: React.FC<UploadProofPayModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const [uploadedProof, setUploadedProof] = useState<UploadedProof | null>(
    null,
  );
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProof, { isLoading: isUploading }] =
    useUploadPaymentProofMutation();
  const [markPaid, { isLoading: isMarkingPaid }] = useMarkBillingPaidMutation();

  const uploadFile = useCallback(
    async (file: File) => {
      setLocalFileName(file.name);
      try {
        const result = await uploadProof(file).unwrap();
        setUploadedProof({
          fileUrl: result.fileUrl,
          signedUrl: result.signedUrl,
        });
        toast.success("Proof uploaded successfully");
      } catch (err: unknown) {
        const msg =
          (err as { data?: { message?: string } })?.data?.message ??
          "Failed to upload payment proof";
        toast.error(msg);
        setLocalFileName(null);
      }
    },
    [uploadProof],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (
      dropped &&
      (dropped.type.startsWith("image/") || dropped.type === "application/pdf")
    ) {
      uploadFile(dropped);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) uploadFile(selected);
  };

  const handleRemoveProof = () => {
    setUploadedProof(null);
    setLocalFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMarkPaid = async () => {
    if (!record?.id || !uploadedProof) return;

    try {
      await markPaid({
        id: record.id,
        paymentProofUrls: [uploadedProof.fileUrl],
      }).unwrap();

      toast.success("Billing marked as paid successfully");
      handleClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to mark as paid";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    onClose();
    setUploadedProof(null);
    setLocalFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isImageUrl = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url);

  const modalTitle = (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <FileUp className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <span className="text-lg font-bold text-slate-900">
          Upload Payment Proof
        </span>
      </div>
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
            disabled={isUploading || isMarkingPaid}
          >
            Cancel
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={handleMarkPaid}
            disabled={isMarkingPaid || !uploadedProof}
          >
            {isMarkingPaid ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Marking Paid…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Mark as Paid
              </span>
            )}
          </ModalButton>
        </ModalFooter>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-500">
          Upload a receipt, transaction screenshot, or payment confirmation
          (PDF, JPG, PNG).
        </p>

        {/* Uploading state */}
        {isUploading && (
          <div className="border-2 border-dashed border-primary-300 bg-primary-50 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
              <p className="text-sm font-medium text-primary-700">
                Uploading {localFileName}…
              </p>
            </div>
          </div>
        )}

        {/* Uploaded preview */}
        {!isUploading && uploadedProof && (
          <div className="border border-green-200 bg-green-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Proof uploaded
                </span>
              </div>
              <button
                onClick={handleRemoveProof}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>

            {isImageUrl(uploadedProof.signedUrl) ? (
              <div className="rounded-lg overflow-hidden border border-green-200 bg-white">
                <img
                  src={uploadedProof.signedUrl}
                  alt="Payment proof"
                  className="w-full max-h-64 object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white p-3">
                <FileText className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {localFileName}
                  </p>
                  <a
                    href={uploadedProof.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drop zone — only visible when no proof uploaded and not uploading */}
        {!isUploading && !uploadedProof && (
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer border-slate-200 hover:border-slate-300 bg-slate-50"
            onDragOver={(e) => e.preventDefault()}
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
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <p className="text-sm text-slate-600">
                <span className="text-primary-600 font-medium">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UploadProofPayModal;

import React, { Dispatch, SetStateAction } from 'react'
import { TextArea } from '../../common/TextArea';

export interface RejectionModalProps {
  rejectionReason: string;
  setRejectionReason: Dispatch<SetStateAction<string>>;
  setShowRejectModal: Dispatch<SetStateAction<boolean>>;
  setSelectedLeave: Dispatch<SetStateAction<string | null>>;
  confirmReject: () => void | Promise<void>;
  processing: string | null | boolean;
  selectedLeave: string | null;
  title?: string;
  description?: string;
}

const RejectionModal = ({ rejectionReason, selectedLeave, setRejectionReason, setSelectedLeave, setShowRejectModal, confirmReject, processing, title = "Reject Leave Request", description = "Please provide a reason for rejecting this leave request." }: RejectionModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
            <p className="text-sm text-slate-600 mb-4">{description}</p>
            <TextArea
              value={rejectionReason}
              onChange={(value: string) => setRejectionReason(value)}
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setSelectedLeave(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectionReason.trim() || processing === selectedLeave}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {processing === selectedLeave ? "Processing..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
  )
}

export default RejectionModal
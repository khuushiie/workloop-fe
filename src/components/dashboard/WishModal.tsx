import React, { useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import Modal, { ModalFooter, ModalButton } from "../common/Modal";
import { useSendWishMutation } from "../../store/apis/user.api";

interface WishModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "birthday" | "anniversary";
  targetUserId: string;
  targetName: string;
}

const WishModal: React.FC<WishModalProps> = ({
  isOpen,
  onClose,
  type,
  targetUserId,
  targetName,
}) => {
  const [message, setMessage] = useState("");
  const [sendWish, { isLoading }] = useSendWishMutation();

  const defaultPlaceholder =
    type === "birthday"
      ? `Write your birthday wish...`
      : `Write your work anniversary wish...`;

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please write a message before sending.");
      return;
    }

    try {
      await sendWish({
        targetUserId,
        type,
        message: message.trim(),
      }).unwrap();

      toast.success(
        `${type === "birthday" ? "Birthday" : "Anniversary"} wish sent to ${targetName}!`
      );
      setMessage("");
      onClose();
    } catch {
      toast.error("Failed to send wish. Please try again.");
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  const title =
    type === "birthday"
      ? `Send Birthday Wish`
      : `Send Anniversary Wish`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="md"
      loading={isLoading}
      footer={
        <ModalFooter>
          <ModalButton variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={handleSend}
            loading={isLoading}
            disabled={!message.trim()}
          >
            <Send className="w-4 h-4 mr-1.5" />
            Send Wish
          </ModalButton>
        </ModalFooter>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Write a personalized{" "}
          {type === "birthday" ? "birthday" : "work anniversary"} message for{" "}
          <span className="font-semibold text-slate-800">{targetName}</span>.
        </p>
        <textarea
          className="w-full min-h-[120px] px-3 py-2 border border-slate-300 rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            placeholder:text-slate-400 resize-y"
          placeholder={defaultPlaceholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          disabled={isLoading}
        />
        <p className="text-xs text-slate-400 text-right">{message.length}/200</p>
      </div>
    </Modal>
  );
};

export default WishModal;

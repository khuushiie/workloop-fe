import React, { useState } from "react";
import { Check } from "lucide-react";
import Modal, { ModalFooter, ModalButton } from "../../common/Modal";

interface EmployeeCredentialsModalProps {
  isOpen: boolean;
  name: string;
  workEmail: string;
  password: string;
  onClose: () => void;
}

const EmployeeCredentialsModal: React.FC<EmployeeCredentialsModalProps> = ({
  isOpen,
  name,
  workEmail,
  password,
  onClose,
}) => {
  const [copied, setCopied] = useState<{ workEmail: boolean; password: boolean }>(
    { workEmail: false, password: false }
  );

  const handleCopy = (value: string, key: "workEmail" | "password") => {
    if (copied[key]) return;
    navigator.clipboard.writeText(value);
    setCopied({ workEmail: key === "workEmail", password: key === "password" });
    setTimeout(() => setCopied({ workEmail: false, password: false }), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Created Successfully!"
      size="md"
      bodyClassName="space-y-6"
      footer={
        <ModalFooter justify="end">
          <ModalButton variant="primary" onClick={onClose}>
            Close
          </ModalButton>
        </ModalFooter>
      }
    >
      <div className="text-center space-y-4">
        <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm text-slate-600">
          A user account has been automatically created for {name}.
        </p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 space-y-3">
        <CredentialRow
          label="Work Email"
          value={workEmail}
          copied={copied.workEmail}
          onCopy={() => handleCopy(workEmail, "workEmail")}
        />
        <CredentialRow
          label="Password"
          value={password}
          copied={copied.password}
          onCopy={() => handleCopy(password, "password")}
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">
          Important Notes
        </h4>
        <ul className="text-xs text-yellow-800 space-y-1 text-left">
          <li>• Share these credentials with the employee securely.</li>
          <li>• Employee should change password on first login.</li>
          <li>• Employee can login with work email and password.</li>
        </ul>
      </div>
    </Modal>
  );
};

const CredentialRow: React.FC<{
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}> = ({ label, value, copied, onCopy }) => (
  <div>
    <span className="text-xs font-medium text-primary-700">{label}:</span>
    <div className="flex items-center justify-between bg-white px-3 py-2 rounded border mt-1">
      <span className="text-sm font-mono text-primary-900 break-all">{value}</span>
      <button
        onClick={onCopy}
        className={`text-xs cursor-pointer ${
          copied ? "text-green-600" : "text-primary-600 hover:text-primary-800 cursor-pointer"
        }`}
        disabled={copied}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  </div>
);

export default EmployeeCredentialsModal;


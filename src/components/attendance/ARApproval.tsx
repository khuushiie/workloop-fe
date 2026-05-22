import React from "react";
import RegularizationManagement from "./RegularizationManagement";

const ARApproval: React.FC = () => {
  return (
    <RegularizationManagement
      isManagerView={true}
      title="AR Approvals"
      description="Review and approve attendance regularization requests"
    />
  );
};

export default ARApproval;

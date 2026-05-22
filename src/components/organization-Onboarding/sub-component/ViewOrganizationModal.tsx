// src/components/organisation/sub-component/ViewOrganizationModal.tsx
//
// Pattern mirrors RoleViewModal exactly:
//   - tree and permissionIds are passed in as props from the parent
//   - No internal fetching — parent is responsible for supplying the data
//   - PermissionTree is disabled (read-only)

import React from "react";
import Modal from "../../common/Modal";
import PermissionTree from "../../../components/admin/access-rights/PermissionTree";
import type { IPermission } from "../../../types/rbac";
import type { IOrganizationDetail } from "../../../types/organization.types";
import Badge from "../../common/Badge";
import { getOrganizationOnboardingStatusVariant } from "../../../utils/badgeVariants";
import { CheckCircle, CircleAlert, XCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IViewOrganizationModalProps {
  isOpen: boolean;
  loading: boolean;
  organization: IOrganizationDetail | null;
  /** Full permission tree — pass permissionTreeData?.tree from the parent */
  tree: IPermission[];
  /** Node ids currently assigned to this org — pass org.permissionIds */
  permissions: string[];
  onClose: () => void;
}

// ─── Helper — label + value row (identical pattern to RoleViewModal) ──────────

const InfoField: React.FC<{
  label: string;
  value?: string | React.ReactNode;
}> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="text-base font-medium text-slate-900">{value || "—"}</p>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const ViewOrganizationModal: React.FC<IViewOrganizationModalProps> = ({
  isOpen,
  loading,
  organization,
  tree,
  permissions,
  onClose,
}) => {
  const poc = (
    organization as unknown as {
      poc?: { name?: string; email?: string; phone?: string };
    }
  )?.poc;

  const addr = organization?.address;
  const hasAddress =
    addr && Object.values(addr).some((v) => String(v ?? "").trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        organization
          ? `View Organisation: ${organization.name}`
          : "View Organisation"
      }
      size="3xl"
      loading={loading}
    >
      {organization ? (
        <div className="space-y-6">
          {/* ── Section 1: Organisation Information ─────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField label="Organisation Name" value={organization.name} />
            <InfoField label="Email" value={organization.email} />
            <InfoField
              label="Status"
              value={
                organization.status ? (
                  <Badge
                    variant={getOrganizationOnboardingStatusVariant(
                      organization.status,
                    )}
                    icon={
                      organization.status === "active" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : organization.status === "inactive" ? (
                        <XCircle className="w-3 h-3" />
                      ) : (
                        <CircleAlert className="w-3 h-3" />
                      )
                    }
                  >
                    {organization.status.charAt(0).toUpperCase() +
                      organization.status.slice(1)}
                  </Badge>
                ) : (
                  "—"
                )
              }
            />
            <InfoField label="Website" value={organization.website} />
          </div>

          {/* ── Section 2: Point of Contact ──────────────────────────────── */}
          {poc && (poc?.name || poc?.email || poc?.phone) && (
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">
                Point of Contact
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="POC Name" value={poc?.name} />
                <InfoField label="POC Email" value={poc?.email} />
                <InfoField label="POC Phone" value={poc?.phone} />
              </div>
            </div>
          )}

          {/* ── Section 3: Address ───────────────────────────────────────── */}
          {hasAddress && (
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">Address</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Street" value={addr?.street} />
                <InfoField label="City" value={addr?.city} />
                <InfoField label="State" value={addr?.state} />
                <InfoField label="Country" value={addr?.country} />
                <InfoField label="ZIP / Postal Code" value={addr?.zipCode} />
              </div>
            </div>
          )}

          {/* ── Section 4: Permissions — read-only tree ──────────────────── */}
          <div>
            <p className="text-sm font-medium text-slate-900 mb-2">
              Permissions
            </p>
            <PermissionTree
              tree={tree}
              value={permissions}
              onChange={() => {}} // read-only — no-op
              disabled // greys out all checkboxes
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No organisation data available.</p>
      )}
    </Modal>
  );
};

export default ViewOrganizationModal;



import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Layers } from "lucide-react";
import Modal, { ModalFooter, ModalButton } from "../../common/Modal";
import { PermissionCard } from "../../admin/access-rights/RoleCards";
import { useGetPermissionTreeQuery } from "../../../store/apis/rbac.api";
import { IPermission } from "../../../types/rbac";

const EXCLUDED_ORG_MODULES: Array<{ name?: string; code?: string }> = [
  { name: "Control Center", code: "FEATURE_FLAGS" },
  { name: "Organization Onboarding", code: "ORGANIZATION_ONBOARDING" },
];

function getExcludedModuleNodeIds(tree: IPermission[]): Set<string> {
  const excluded = new Set<string>();
  const isExcluded = (node: IPermission) =>
    EXCLUDED_ORG_MODULES.some(
      (m) =>
        (m.name && node.name === m.name) || (m.code && node.code === m.code)
    );

  const collectWithDescendants = (node: IPermission): string[] => {
    const ids = [node.id];
    (node.children || []).forEach((ch) =>
      ids.push(...collectWithDescendants(ch))
    );
    return ids;
  };

  const walk = (nodes: IPermission[]) => {
    nodes.forEach((n) => {
      if (isExcluded(n)) {
        collectWithDescendants(n).forEach((id) => excluded.add(id));
      }
      if (n.children?.length) walk(n.children);
    });
  };
  walk(tree);
  return excluded;
}

interface ISelectModulesModalProps {
  isOpen: boolean;
  initialSelectedNodeIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  isSubmitting?: boolean;
  onBack: () => void;
  onSuccess: (permissionIds: string[]) => void;
  onClose: () => void;
}

const SelectModulesModal: React.FC<ISelectModulesModalProps> = ({
  isOpen,
  initialSelectedNodeIds = [],
  onSelectionChange,
  onBack,
  onClose,
  isSubmitting = false,
  onSuccess,
}) => {
  //  only call when modal open
  const { data: permissionTreeData, isLoading: treeLoading } =
    useGetPermissionTreeQuery(
      { modulesOnly: true },
      { skip: !isOpen }
    );

  const tree = permissionTreeData?.tree ?? [];

  // Modules that must not be assignable to organizations (Control Center, Organization Onboarding)
  const lockedIds = useMemo(() => getExcludedModuleNodeIds(tree), [tree]);

  // ── Local selection state ─────────────────────────
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const initial = Array.isArray(initialSelectedNodeIds) ? initialSelectedNodeIds : [];
    setSelectedNodeIds(initial.filter((id) => !lockedIds.has(id)));
  }, [isOpen, initialSelectedNodeIds, lockedIds]);

  // ── Smart permission builder (excludes locked module IDs and their descendants) ──
  const buildOrganizationPermissions = useCallback(
    (
      tree: IPermission[],
      selectedIds: string[],
      excludedIds: Set<string>
    ): string[] => {
      const selectedSet = new Set(selectedIds);
      const result: string[] = [];

      const visit = (node: IPermission) => {
        if (excludedIds.has(node.id)) return;

        // leaf node → real permission
        if (!node.children?.length) {
          if (selectedSet.has(node.id)) {
            result.push(node.id);
          }
          return;
        }

        // if module selected → include only non-excluded children
        if (selectedSet.has(node.id)) {
          node.children.forEach((child) => {
            if (excludedIds.has(child.id)) return;
            if (!child.children?.length) {
              result.push(child.id);
            } else {
              visit(child);
            }
          });
          return;
        }

        node.children.forEach(visit);
      };

      tree.forEach(visit);
      return Array.from(new Set(result)).filter((id) => !excludedIds.has(id));
    },
    []
  );
  // ── Submit ───────────────────────────────────────
  const handleSubmit = () => {
    const filtered = selectedNodeIds.filter((id) => !lockedIds.has(id));
    const permissions = buildOrganizationPermissions(tree, filtered, lockedIds);
    onSuccess(permissions);
  };

  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      const filtered = ids.filter((id) => !lockedIds.has(id));
      setSelectedNodeIds(filtered);
      onSelectionChange?.(filtered);
    },
    [onSelectionChange, lockedIds]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Modules - Manage Module"
      size="4xl"
      loading={treeLoading || isSubmitting}
      maskClosable={false}
      closable={!treeLoading}
      bodyClassName="px-0 py-0"
      className="h-[750px]"
      disableBodyScroll={true}
      footer={
        <ModalFooter>
          <ModalButton
            variant="secondary"
            onClick={onBack}
            disabled={treeLoading || isSubmitting}
          >
            Back
          </ModalButton>

          <ModalButton
            variant="primary"
            onClick={handleSubmit}
            disabled={treeLoading || isSubmitting}
          >
            Submit
          </ModalButton>
        </ModalFooter>
      }
    >
      <PermissionCard
        selectedCount={selectedNodeIds.length}
        tree={tree}
        value={selectedNodeIds}
        onChange={handleSelectionChange}
        lockedIds={lockedIds}
        isBusy={treeLoading}
        rounded="rounded-none"
        busyMessage="Loading modules..."
      />
    </Modal>
  );
};

export default SelectModulesModal;


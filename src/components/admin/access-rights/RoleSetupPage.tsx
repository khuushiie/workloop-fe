import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import PermissionGate from "../../common/PermissionGate";
import type { IPermission } from "../../../types/rbac";
import { PermissionNodeType, PermissionCode } from "../../../types/rbac";
import {
  useGetPermissionTreeQuery,
  useCreatePermissionEntityMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useLazyListRolesQuery,
  useLazyGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetUserRoleQuery,
  useAssignRoleMutation,
  useGetAdditionalPermissionsQuery,
  useUpdateAdditionalPermissionsMutation,
  useLazyGetUserAccessUsersQuery,
  useBulkAssignRoleMutation,
} from "../../../store/apis/rbac.api";
import { useGetUsersForFilterQuery } from "../../../store/apis/user.api";
import { PERMISSIONS } from "../../../utils/rbac/permissions";
import toast from "react-hot-toast";
import { SelectOption } from "../../common/Select";
import {
  Eye,
  Edit,
  Trash2,
  Layers,
  Network,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useHasPermission,
  useEffectivePermissions,
} from "../../../store/hooks/useRbac";
import TabSelector, { TabKey } from "./AccessTabs";
import {
  RoleFormCard,
  PermissionCard,
  RoleTableCard,
  UserAssignmentCard,
  OverridesSidebar,
  RoleType,
  RoleRecord,
} from "./RoleCards";
import UserRoleTableSection, { RoleUserRow } from "./UserRoleTableSection";
import {
  RoleViewModal,
  DeleteRoleModal,
  DeleteBlockedModal,
} from "./RoleModals";
import EditModuleModal from "./EditModuleModal";
import AddModuleModal from "./AddModuleModal";
import AddSubmoduleModal from "./AddSubmoduleModal";
import DeletePermissionModal from "./DeletePermissionModal";
import ContextMenu from "./ContextMenu";
import { TableColumn } from "../../common/Table";
import {
  ModuleHierarchySkeleton,
  PermissionCardSkeleton,
  RoleTableCardSkeleton,
  UserRoleTableSkeleton,
} from "./Skeleton";
import Badge from "../../common/Badge";
import { SearchInput, SimpleTooltip } from "../../common";
import { useGetMasterConfigByCategoryQuery } from "../../../store/apis/masterConfig.api";
import { MasterConfigCategory } from "../../../constants";
import { EmployeeStatusEnum } from "../../../utils/constants";
import FilterWrapper from "../../common/FilterWrapper";
import { useDebounce } from "../../../utils/debounce";
import { ApiError } from "../../../store/utils/apiError";

const flattenActionIds = (node: IPermission): string[] => {
  if (!node) return [];
  if (node.type === PermissionNodeType.ACTION) return [node.id];
  return (node.children || []).flatMap(flattenActionIds);
};

const flattenActionCodes = (node: IPermission): string[] => {
  if (!node) return [];
  if (node.type === PermissionNodeType.ACTION) return [node.code];
  return (node.children || []).flatMap(flattenActionCodes);
};

const flattenNodeIds = (node: IPermission): string[] => {
  if (!node) return [];
  const children = (node.children || []).flatMap(flattenNodeIds);
  return [node.id, ...children];
};

const collectSelectedActionIds = (
  tree: IPermission[],
  selected: Set<string>,
): string[] => {
  const ids: string[] = [];
  const visit = (n: IPermission) => {
    if (selected.has(n.id)) {
      ids.push(...flattenActionIds(n));
      return;
    }
    (n.children || []).forEach(visit);
  };
  tree.forEach(visit);
  return Array.from(new Set(ids));
};

const filterModuleTree = (nodes: IPermission[]): IPermission[] => {
  const filtered: IPermission[] = [];
  nodes.forEach((node) => {
    if (node.type === PermissionNodeType.ACTION) return;
    const children = filterModuleTree(node.children || []);
    filtered.push({ ...node, children });
  });
  return filtered;
};

const ModuleTreeView: React.FC<{
  tree: IPermission[];
  onContextMenu?: (node: IPermission | null, event: React.MouseEvent) => void;
}> = ({ tree, onContextMenu }) => {
  const hrmsRoot = useMemo(() => {
    const findHrms = (nodes: IPermission[]): IPermission | null => {
      for (const node of nodes) {
        if (
          node.code === PermissionCode.HRMS &&
          node.type === PermissionNodeType.ROOT
        ) {
          return node;
        }
        if (node.children) {
          const found = findHrms(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findHrms(tree);
  }, [tree]);

  // Build tree with HRMS as root
  const data = useMemo(() => {
    if (hrmsRoot) {
      // HRMS exists, use its children (modules) as data
      return filterModuleTree(hrmsRoot.children || []);
    } else {
      // HRMS doesn't exist yet, show all modules as if they're under HRMS
      const modules = filterModuleTree(tree);
      return modules;
    }
  }, [tree, hrmsRoot]);

  const renderNodes = (
    nodes: IPermission[],
    depth = 0,
    parentIsLast = false,
  ) => {
    return nodes.map((node, idx) => {
      const isLast = idx === nodes.length - 1;
      const linePrefix = depth
        ? Array.from({ length: depth })
            .map((_, index) => {
              if (index === depth - 1) {
                return parentIsLast ? "   " : "│  ";
              }
              return "│  ";
            })
            .join("")
        : "";

      const connector = depth ? `${isLast ? "└─ " : "├─ "}` : "";

      return (
        <li key={node.id} className="py-1">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onContextMenu={(e) => {
              e.preventDefault();
              onContextMenu?.(node, e);
            }}
          >
            <span className="font-mono text-xs text-slate-400">
              {linePrefix}
              {connector}
            </span>
            <div className="flex items-center space-x-2 flex-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-sm font-medium text-slate-700">
                {node.name}
              </span>
            </div>
          </div>
          {node.children && node.children.length > 0 && (
            <ul className="list-none m-0 p-0 ml-4">
              {renderNodes(node.children, depth + 1, isLast)}
            </ul>
          )}
        </li>
      );
    });
  };

  // Create virtual HRMS root if it doesn't exist
  const displayTree = useMemo(() => {
    if (hrmsRoot) {
      return data;
    }
    // If HRMS doesn't exist, we'll show it as root with modules as children
    return data;
  }, [data, hrmsRoot]);

  return (
    <div className="border border-slate-200 rounded-lg bg-white p-0 max-h-[60vh] overflow-hidden shadow-soft">
      <div className="bg-gradient-to-r bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide uppercase mb-0">
              Module Hierarchy
            </h3>
            <p className="text-xs text-white/80 mb-0">Modules & submodules</p>
          </div>
        </div>
      </div>
      <div className="p-0  ">
        <div className="max-h-[55vh] overflow-auto ">
          <ul className="list-none m-0 p-4 pb-12 space-y-1 bg-white ">
            {/* Show HRMS root if it exists, otherwise show modules directly */}
            {hrmsRoot ? (
              <li className="py-1">
                <div
                  className="flex items-center space-x-2 cursor-pointer"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // Pass null for HRMS root to show "Add Module" option
                    onContextMenu?.(null, e);
                  }}
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-2 h-2 rounded-full bg-primary-600"> </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {hrmsRoot.name}
                    </span>
                  </div>
                </div>
                <ul className="list-none m-0 p-0 ml-4">
                  {renderNodes(displayTree, 1, false)}
                </ul>
              </li>
            ) : (
              <>
                {/* Virtual HRMS root */}
                <li className="py-1">
                  <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      onContextMenu?.(null, e);
                    }}
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                      <span className="text-sm font-semibold text-slate-900">
                        HRMS
                      </span>
                    </div>
                  </div>
                  <ul className="list-none m-0 p-0 ml-4">
                    {displayTree.length > 0 ? (
                      renderNodes(displayTree, 1, false)
                    ) : (
                      <li className="py-1 text-sm text-slate-500 pl-4">
                        No modules available
                      </li>
                    )}
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const RoleSetupPage: React.FC = () => {
  const { reload: reloadRbac } = useEffectivePermissions();
  const canManage = useHasPermission(PERMISSIONS.ACCESS_RIGHT_MANAGE);
  const [active, setActive] = useState<TabKey>("roles");

  const { data: permissionTreeData } = useGetPermissionTreeQuery();
  const tree = permissionTreeData?.tree ?? [];

  const { data: employmentStatusList } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.EMPLOYMENT_STATUS,
  );

  const [createPermissionEntity] = useCreatePermissionEntityMutation();
  const [updatePermission] = useUpdatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();
  const [listRolesTrigger] = useLazyListRolesQuery();
  const [getRoleTrigger] = useLazyGetRoleQuery();
  const [createRoleMutation] = useCreateRoleMutation();
  const [updateRoleMutation] = useUpdateRoleMutation();
  const [deleteRoleMutation] = useDeleteRoleMutation();
  const [assignRoleMutation] = useAssignRoleMutation();
  const [updateAdditionalPermissionsMutation] =
    useUpdateAdditionalPermissionsMutation();
  const [getUserAccessUsersTrigger] = useLazyGetUserAccessUsersQuery();
  const { data: filterUsers = [] } = useGetUsersForFilterQuery({
    includeInactive: false,
  });

  const [roleName, setRoleName] = useState("");
  const [roleType, setRoleType] = useState<RoleType | "">("");
  const [roleDesc, setRoleDesc] = useState("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [uiSelectedNodeIds, setUiSelectedNodeIds] = useState<string[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [rolePage, setRolePage] = useState(1);
  const [rolePageSize, setRolePageSize] = useState(10);
  const [roleTotal, setRoleTotal] = useState(0);
  const [roleDirectory, setRoleDirectory] = useState<RoleRecord[]>([]);
  const rolePaginationRef = useRef({ page: 1, size: 10 });
  const roleDirectoryLoadedRef = useRef(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [userTableRows, setUserTableRows] = useState<RoleUserRow[]>([]);
  const [userTablePage, setUserTablePage] = useState(1);
  const [userTablePageSize, setUserTablePageSize] = useState(10);
  const [userTableTotal, setUserTableTotal] = useState(0);
  const [userTableLoading, setUserTableLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>("");

  const [bulkAssignRoleMutation, { isLoading: isBulkAssignLoading }] =
    useBulkAssignRoleMutation();

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    console.log("Selected Users - ", selectedUserIds);
  }, [selectedUserIds]);

  const { data: additionalPermissionsData, isFetching: overridesLoading } =
    useGetAdditionalPermissionsQuery(selectedUserId ?? "", {
      skip: !selectedUserId,
      refetchOnMountOrArgChange: true,
    });
  const { data: userRoleData, isFetching: userRoleLoading } =
    useGetUserRoleQuery(selectedUserId ?? "", { skip: !selectedUserId });

  const userRole = useRef<Record<string, string | null>>({});
  const [overrideUiNodeIds, setOverrideUiNodeIds] = useState<string[]>([]);
  const [overrideBaseNodeIds, setOverrideBaseNodeIds] = useState<string[]>([]);
  const [overrideExtraNodeIds, setOverrideExtraNodeIds] = useState<string[]>(
    [],
  );
  const [overridesSaving, setOverridesSaving] = useState(false);
  const [editModuleModalOpen, setEditModuleModalOpen] = useState(false);
  const [addModuleModalOpen, setAddModuleModalOpen] = useState(false);
  const [addSubmoduleModalOpen, setAddSubmoduleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contextMenuNode, setContextMenuNode] = useState<IPermission | null>(
    null,
  );
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDefaultActions, setNewModuleDefaultActions] = useState(true);
  const [newSubmoduleName, setNewSubmoduleName] = useState("");
  const [addModuleSubmitting, setAddModuleSubmitting] = useState(false);
  const [addModuleError, setAddModuleError] = useState<string | null>(null);
  const [addModuleSuccess, setAddModuleSuccess] = useState<string | null>(null);
  const [addSubmoduleSubmitting, setAddSubmoduleSubmitting] = useState(false);
  const [addSubmoduleError, setAddSubmoduleError] = useState<string | null>(
    null,
  );
  const [addSubmoduleSuccess, setAddSubmoduleSuccess] = useState<string | null>(
    null,
  );
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<IPermission | null>(null);
  const [parentModuleName, setParentModuleName] = useState<string>("");
  const [parentModuleId, setParentModuleId] = useState<string>("");
  const [editModuleSelectedModuleId, setEditModuleSelectedModuleId] =
    useState("");
  const [editModuleSelectedSubmoduleId, setEditModuleSelectedSubmoduleId] =
    useState("");
  const [editModuleNewSubmoduleName, setEditModuleNewSubmoduleName] =
    useState("");
  const [editModuleNewActionName, setEditModuleNewActionName] = useState("");
  const [editingNode, setEditingNode] = useState<IPermission | null>(null);
  const [editModuleName, setEditModuleName] = useState("");
  const userOptions = useMemo<SelectOption[]>(
    () =>
      filterUsers.map((u) => ({
        value: String(u.id),
        label: u.fullName || "Unknown",
      })),
    [filterUsers],
  );

  const roleOptions = useMemo<SelectOption[]>(
    () =>
      roleDirectory.map((r) => ({
        value: r.id,
        label: r.name,
      })),
    [roleDirectory],
  );
  const roleTypeOptions = useMemo<SelectOption[]>(
    () => [
      { value: "Admin", label: "Admin" },
      { value: "HR", label: "HR" },
      { value: "Employee", label: "Employee" },
      { value: "Manager", label: "Manager" },
    ],
    [],
  );
  const [editModuleSubmitting, setEditModuleSubmitting] = useState(false);
  const [editModuleError, setEditModuleError] = useState<string | null>(null);
  const [editModuleSuccess, setEditModuleSuccess] = useState<string | null>(
    null,
  );
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewRole, setViewRole] = useState<RoleRecord | null>(null);
  const [viewNodeIds, setViewNodeIds] = useState<string[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const roleFormRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteBlockedInfo, setDeleteBlockedInfo] = useState<{
    roleName: string;
    assignedUserCount: number;
    assignedUsers: Array<{
      id: string;
      name?: string;
      email?: string;
      workEmail?: string;
      username?: string;
    }>;
  } | null>(null);

  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const debouncedRoleSearch = useDebounce(roleSearchQuery, 500);
  const debouncedUserSearch = useDebounce(userSearchQuery, 500);

  const parentLookup = useMemo(() => {
    const map = new Map<string, string | null>();
    const walk = (node: IPermission, parentId: string | null) => {
      map.set(node.id, parentId);
      (node.children || []).forEach((child) => walk(child, node.id));
    };
    tree.forEach((node) => walk(node, null));
    return map;
  }, [tree]);

  const hrmsRootId = useMemo(() => {
    const findHrms = (nodes: IPermission[]): string | null => {
      for (const node of nodes) {
        if (
          node.code === PermissionCode.HRMS &&
          node.type === PermissionNodeType.ROOT
        ) {
          return node.id;
        }
        if (node.children) {
          const found = findHrms(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    console.log(tree);
    return findHrms(tree);
  }, [tree]);

  const includeAncestorIds = useCallback(
    (ids: string[]) => {
      if (!ids?.length) return [];
      const result = new Set<string>(ids.map(String));
      ids.forEach((rawId) => {
        let currentParent = parentLookup.get(String(rawId)) || null;
        while (currentParent) {
          if (currentParent === hrmsRootId) {
            break;
          }
          result.add(currentParent);
          currentParent = parentLookup.get(currentParent) || null;
        }
      });
      return Array.from(result);
    },
    [parentLookup, hrmsRootId],
  );

  const overrideLockedIds = useMemo(() => {
    const baseLocked = new Set<string>(overrideBaseNodeIds.map(String));
    if (!tree.length) {
      return baseLocked;
    }
    const markAncestors = (node: IPermission): boolean => {
      const children = node.children || [];
      if (!children.length) {
        return baseLocked.has(node.id);
      }
      const allChildrenLocked = children.every((child) => markAncestors(child));
      if (allChildrenLocked) {
        baseLocked.add(node.id);
      }
      return allChildrenLocked;
    };
    tree.forEach((node) => markAncestors(node));
    return baseLocked;
  }, [tree, overrideBaseNodeIds]);

  const availableModules = useMemo(() => {
    return filterModuleTree(tree);
  }, [tree]);

  const getModuleById = useCallback(
    (moduleId: string): IPermission | null => {
      const findNode = (nodes: IPermission[]): IPermission | null => {
        for (const node of nodes) {
          if (node.id === moduleId) return node;
          if (node.children) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findNode(tree);
    },
    [tree],
  );

  const getSubmodulesForModule = useMemo(() => {
    if (!editModuleSelectedModuleId) return [];
    const module = getModuleById(editModuleSelectedModuleId);
    if (!module || module.type !== PermissionNodeType.MODULE) return [];
    return (module.children || []).filter(
      (ch) => ch.type === PermissionNodeType.SUBMODULE,
    );
  }, [editModuleSelectedModuleId, getModuleById]);

  const resetRoleTabState = () => {
    setRoleName("");
    setRoleType("");
    setRoleDesc("");
    setIsActive(true);
    setUiSelectedNodeIds([]);
    setEditingRoleId(null);
  };

  const resetUserTabState = () => {
    setSelectedUserId("");
    setSelectedRoleId("");
  };

  const resetOverrideTabState = () => {
    setSelectedUserId("");
    setOverrideBaseNodeIds([]);
    setOverrideExtraNodeIds([]);
    setOverrideUiNodeIds([]);
  };

  const resetEditModuleModalState = () => {
    setEditModuleSelectedModuleId("");
    setEditModuleSelectedSubmoduleId("");
    setEditModuleNewSubmoduleName("");
    setEditModuleNewActionName("");
    setEditModuleError(null);
    setEditModuleSuccess(null);
    setEditingNode(null);
    setEditModuleName("");
  };

  const closeEditModuleModal = useCallback(() => {
    setEditModuleModalOpen(false);
    resetEditModuleModalState();
  }, []);

  const handleEditNodeClick = useCallback(
    (node: IPermission) => {
      setEditingNode(node);
      setEditModuleName(node.name);

      if (node.type === PermissionNodeType.SUBMODULE) {
        const findParentModule = (
          nodes: IPermission[],
          targetId: string,
          parent: IPermission | null = null,
        ): IPermission | null => {
          for (const n of nodes) {
            if (n.id === targetId) {
              return parent;
            }
            if (n.children && n.children.length > 0) {
              const found = findParentModule(n.children, targetId, n);
              if (found) return found;
            }
          }
          return null;
        };
        const parentModule = findParentModule(tree, node.id);
        if (parentModule) {
          setEditModuleSelectedModuleId(parentModule.id);
        }
      } else {
        setEditModuleSelectedModuleId(node.id);
      }

      setEditModuleModalOpen(true);
    },
    [tree],
  );

  const handleContextMenu = useCallback(
    (node: IPermission | null, event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenuNode(node);
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
    },
    [],
  );

  const handleAddModule = useCallback(() => {
    setContextMenuNode(null);
    setParentModuleId(hrmsRootId ?? "");
    setContextMenuPosition(null);
    setNewModuleName("");
    setAddModuleError(null);
    setAddModuleSuccess(null);
    setAddModuleModalOpen(true);
  }, []);

  const handleAddSubmodule = useCallback(() => {
    if (
      !contextMenuNode ||
      contextMenuNode.type !== PermissionNodeType.MODULE
    ) {
      // If context menu was on HRMS root (node is null), we need to find the module
      // But for now, we'll only allow adding submodules from module nodes
      return;
    }
    // Store the module name and ID before context menu closes
    setParentModuleName(contextMenuNode.name);
    setParentModuleId(contextMenuNode.id);
    setNewSubmoduleName("");
    setAddSubmoduleError(null);
    setAddSubmoduleSuccess(null);
    setAddSubmoduleModalOpen(true);
  }, [contextMenuNode]);

  const handleDeleteNode = useCallback(() => {
    if (!contextMenuNode) return;
    // Store the node separately so it doesn't get cleared when modal closes
    setNodeToDelete(contextMenuNode);
    setContextMenuNode(null);
    setContextMenuPosition(null);
    setDeleteError(null);
    setDeleteModalOpen(true);
  }, [contextMenuNode]);

  const handleCreateModule = useCallback(async () => {
    if (!newModuleName.trim()) {
      setAddModuleError("Module name is required");
      return;
    }
    setAddModuleError(null);
    setAddModuleSuccess(null);
    setAddModuleSubmitting(true);
    try {
      await createPermissionEntity({
        name: newModuleName.trim(),
        parentId: hrmsRootId ?? null,
        entityType: PermissionNodeType.MODULE,
        createDefaultActions: newModuleDefaultActions,
      }).unwrap();
      await reloadRbac();
      setAddModuleSuccess(
        `Module "${newModuleName.trim()}" created successfully`,
      );
      toast.success(`Module "${newModuleName.trim()}" created successfully`);
      setNewModuleName("");
      setNewModuleDefaultActions(true);
      setTimeout(() => {
        setAddModuleModalOpen(false);
        setAddModuleSuccess(null);
      }, 100);
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.data?.message || err?.message || "Failed to create module";
      const errorMessage = Array.isArray(message)
        ? message.join(", ")
        : message;
      setAddModuleError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAddModuleSubmitting(false);
    }
  }, [
    newModuleName,
    newModuleDefaultActions,
    hrmsRootId,
    reloadRbac,
    createPermissionEntity,
  ]);

  const handleCreateSubmodule = useCallback(async () => {
    if (!newSubmoduleName.trim() || !parentModuleId) {
      setAddSubmoduleError("Submodule name is required");
      return;
    }
    setAddSubmoduleError(null);
    setAddSubmoduleSuccess(null);
    setAddSubmoduleSubmitting(true);
    try {
      await createPermissionEntity({
        name: newSubmoduleName.trim(),
        parentId: parentModuleId,
        entityType: PermissionNodeType.SUBMODULE,
      }).unwrap();
      await reloadRbac();
      setAddSubmoduleSuccess(
        `Submodule "${newSubmoduleName.trim()}" created successfully`,
      );
      toast.success(
        `Submodule "${newSubmoduleName.trim()}" created successfully`,
      );
      setNewSubmoduleName("");
      setTimeout(() => {
        setAddSubmoduleModalOpen(false);
        setAddSubmoduleSuccess(null);
      }, 1500);
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.data?.message || err?.message || "Failed to create submodule";
      const errorMessage = Array.isArray(message)
        ? message.join(", ")
        : message;
      setAddSubmoduleError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAddSubmoduleSubmitting(false);
    }
  }, [newSubmoduleName, parentModuleId, reloadRbac, createPermissionEntity]);

  const handleDeletePermission = useCallback(async () => {
    if (!nodeToDelete) {
      console.error("No node to delete");
      return;
    }
    setDeleteError(null);
    setDeleteSubmitting(true);
    try {
      await deletePermission(nodeToDelete.id).unwrap();
      await reloadRbac();
      toast.success(
        `Successfully deleted ${nodeToDelete.type.toLowerCase()} "${
          nodeToDelete.name
        }"`,
      );
      setDeleteModalOpen(false);
      setNodeToDelete(null);
    } catch (error: unknown) {
      const err = error as ApiError;
      const message = err?.data?.message || err?.message || "Failed to delete";
      const errorMessage = Array.isArray(message)
        ? message.join(", ")
        : message;
      setDeleteError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleteSubmitting(false);
    }
  }, [nodeToDelete, reloadRbac, deletePermission]);

  const handleUpdateModuleName = useCallback(async () => {
    if (!editingNode) {
      setEditModuleError("No node selected for editing.");
      return;
    }

    if (!editModuleName.trim()) {
      setEditModuleError("Name cannot be empty.");
      return;
    }

    if (editModuleName.trim() === editingNode.name) {
      setEditModuleError(null);
      setEditModuleSuccess("No changes to save.");
      return;
    }

    setEditModuleError(null);
    setEditModuleSuccess(null);
    setEditModuleSubmitting(true);

    try {
      await updatePermission({
        id: editingNode.id,
        body: { name: editModuleName.trim() },
      }).unwrap();
      await reloadRbac();

      setEditModuleSuccess(
        `Successfully updated ${
          editingNode.type === PermissionNodeType.MODULE
            ? "module"
            : "submodule"
        } name to "${editModuleName.trim()}".`,
      );

      // Close modal after a short delay
      setTimeout(() => {
        closeEditModuleModal();
      }, 1500);
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.data?.message || err?.message || "Failed to update module name.";
      setEditModuleError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setEditModuleSubmitting(false);
    }
  }, [
    editingNode,
    editModuleName,
    closeEditModuleModal,
    updatePermission,
    reloadRbac,
  ]);

  // Note: Backend now handles "View & Edit" -> "Manage" mapping for code generation
  // while preserving "View & Edit" as the display name

  const handleEditModuleSave = useCallback(async () => {
    if (!editModuleSelectedModuleId) {
      setEditModuleError("Please select a module to edit.");
      return;
    }

    const selectedModule = getModuleById(editModuleSelectedModuleId);
    if (!selectedModule) {
      setEditModuleError("Selected module not found.");
      return;
    }

    // Check if we're adding a new submodule or action
    const hasNewSubmodule = editModuleNewSubmoduleName.trim().length > 0;
    const hasNewAction = editModuleNewActionName.trim().length > 0;
    const hasExistingSubmodule = editModuleSelectedSubmoduleId.length > 0;

    // Validation: cannot have both existing submodule and new submodule
    if (hasExistingSubmodule && hasNewSubmodule) {
      setEditModuleError(
        "Cannot create a new submodule when an existing submodule is selected.",
      );
      return;
    }

    if (!hasNewAction) {
      setEditModuleError("Action name is required.");
      return;
    }

    setEditModuleError(null);
    setEditModuleSuccess(null);
    setEditModuleSubmitting(true);

    try {
      // Backend handles "View & Edit" -> "Manage" mapping for code generation
      const actionName = editModuleNewActionName.trim();

      // If adding a new submodule with action: create SUBMODULE then ACTION
      if (hasNewSubmodule && hasNewAction) {
        const subRes = await createPermissionEntity({
          name: editModuleNewSubmoduleName.trim(),
          parentId: selectedModule.id,
          entityType: PermissionNodeType.SUBMODULE,
        }).unwrap();
        const submoduleId = subRes.entity?.id;
        if (submoduleId) {
          await createPermissionEntity({
            name: actionName,
            parentId: submoduleId,
            entityType: PermissionNodeType.ACTION,
            createDefaultActions: false,
          }).unwrap();
        }
        setEditModuleSuccess(
          `Successfully added submodule "${editModuleNewSubmoduleName.trim()}" with action "${editModuleNewActionName.trim()}" to module "${
            selectedModule.name
          }".`,
        );
      }
      // If adding action to existing submodule
      else if (
        !hasNewSubmodule &&
        hasNewAction &&
        editModuleSelectedSubmoduleId
      ) {
        const selectedSubmodule = getModuleById(editModuleSelectedSubmoduleId);
        if (
          !selectedSubmodule ||
          selectedSubmodule.type !== PermissionNodeType.SUBMODULE
        ) {
          setEditModuleError("Selected submodule not found.");
          return;
        }
        await createPermissionEntity({
          name: actionName,
          parentId: selectedSubmodule.id,
          entityType: PermissionNodeType.ACTION,
          createDefaultActions: false,
        }).unwrap();
        setEditModuleSuccess(
          `Successfully added action "${editModuleNewActionName.trim()}" to submodule "${
            selectedSubmodule.name
          }".`,
        );
      }
      // If adding action directly to module (no submodule)
      else if (
        !hasNewSubmodule &&
        hasNewAction &&
        !editModuleSelectedSubmoduleId
      ) {
        await createPermissionEntity({
          name: actionName,
          parentId: selectedModule.id,
          entityType: PermissionNodeType.ACTION,
          createDefaultActions: false,
        }).unwrap();
        setEditModuleSuccess(
          `Successfully added action "${editModuleNewActionName.trim()}" to module "${
            selectedModule.name
          }".`,
        );
      }

      // Reset form fields but keep module selected
      setEditModuleNewSubmoduleName("");
      setEditModuleNewActionName("");
      setEditModuleSelectedSubmoduleId("");
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.data?.message || err?.message || "Failed to update module.";
      setEditModuleError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setEditModuleSubmitting(false);
    }
  }, [
    editModuleSelectedModuleId,
    editModuleSelectedSubmoduleId,
    editModuleNewSubmoduleName,
    editModuleNewActionName,
    getModuleById,
    createPermissionEntity,
  ]);

  const loadRolePage = useCallback(
    async (page?: number, size?: number) => {
      const targetPage =
        typeof page === "number" && page > 0
          ? page
          : rolePaginationRef.current.page;
      const targetSize =
        typeof size === "number" && size > 0
          ? size
          : rolePaginationRef.current.size;

      setTableLoading(true);
      try {
        const result = await listRolesTrigger({
          active: "false",
          page: targetPage,
          limit: targetSize,
          search: debouncedRoleSearch,
        }).unwrap();

        if (
          result &&
          typeof result === "object" &&
          !Array.isArray(result) &&
          "items" in result
        ) {
          const items = result.items ?? [];
          setRoles(items);
          setRoleTotal(result.total ?? 0);
          setRolePage(result.page ?? targetPage);
          setRolePageSize(result.limit ?? targetSize);
          rolePaginationRef.current = {
            page: result.page ?? targetPage,
            size: result.limit ?? targetSize,
          };
        } else {
          const arr: RoleRecord[] = Array.isArray(result)
            ? (result as Array<{ id: string; name: string }>).map((r) => ({
                id: r.id,
                name: r.name,
                permissions: [],
                isActive: true,
              }))
            : [];
          const sorted = [...arr].sort((a, b) =>
            (a?.name || "").localeCompare(b?.name || "", undefined, {
              sensitivity: "base",
            }),
          );
          const start = (targetPage - 1) * targetSize;
          const paged = sorted.slice(start, start + targetSize);
          setRoles(paged);
          setRoleTotal(sorted.length);
          setRolePage(targetPage);
          setRolePageSize(targetSize);
          rolePaginationRef.current = { page: targetPage, size: targetSize };
        }
      } catch (error: unknown) {
        const err = error as ApiError;
        const message =
          err?.data?.message || err?.message || "Failed to load roles.";
        toast.error(Array.isArray(message) ? message.join(", ") : message);
        setRoles([]);
        setRoleTotal(0);
      } finally {
        setTableLoading(false);
      }
    },
    [listRolesTrigger, debouncedRoleSearch],
  );

  useEffect(() => {
    const initializePage = async () => {
      setRolesLoading(true);
      try {
        await loadRolePage();
        await refreshRoleDirectory();
        if (active === "users") {
          await loadUserTablePage(1, userTablePageSize);
        }
      } catch (error) {
        console.error("Failed to initialize page", error);
      } finally {
        setRolesLoading(false);
      }
    };

    initializePage();
  }, []); // Empty dependency array - run once on mount

  const refreshRoleDirectory = useCallback(
    async (force = false) => {
      if (roleDirectoryLoadedRef.current && !force) {
        return;
      }
      try {
        const result = await listRolesTrigger({ active: "true" }).unwrap();
        const sortByName = (list: RoleRecord[]) =>
          [...list].sort((a, b) =>
            (a?.name || "").localeCompare(b?.name || "", undefined, {
              sensitivity: "base",
            }),
          );
        const list: RoleRecord[] = Array.isArray(result)
          ? (result as Array<{ id: string; name: string }>).map((r) => ({
              id: r.id,
              name: r.name,
              permissions: [] as string[],
              isActive: true,
            }))
          : Array.isArray((result as { items?: RoleRecord[] }).items)
            ? (result as { items: RoleRecord[] }).items
            : [];
        const normalized = sortByName(
          list.filter((role) => role.isActive !== false),
        );
        setRoleDirectory(normalized);
        roleDirectoryLoadedRef.current = true;
      } catch (error) {
        console.error("Failed to load active roles", error);
      }
    },
    [listRolesTrigger],
  );

  const handleRolePageChange = useCallback(
    (page: number) => {
      loadRolePage(page, rolePageSize);
    },
    [loadRolePage, rolePageSize],
  );

  const handleRolePageSizeChange = useCallback(
    (size: number) => {
      loadRolePage(1, size);
    },
    [loadRolePage],
  );

  useEffect(() => {
    setRoleSearchQuery("");
    setUserSearchQuery("");
  }, [active]);

  const handleTabChange = (tab: TabKey) => {
    if (tab === active) return;

    switch (tab) {
      case "roles":
        resetRoleTabState();
        void loadRolePage();
        // Only refresh directory if not already loaded
        void refreshRoleDirectory(false);
        break;
      case "users":
        resetUserTabState();
        break;
      case "overrides":
        resetOverrideTabState();
        break;
      case "modules":
        break;
    }
    setActive(tab);
  };

  useEffect(() => {
    if (!selectedUserId) {
      setOverrideBaseNodeIds([]);
      setOverrideExtraNodeIds([]);
      setOverrideUiNodeIds([]);
      setSelectedRoleId("");
      return;
    }
    if (additionalPermissionsData) {
      const base = (additionalPermissionsData.rolePermissions || []).map(
        String,
      );
      const extra = (additionalPermissionsData.additionalPermissions || []).map(
        String,
      );
      setOverrideBaseNodeIds(base);
      setOverrideExtraNodeIds(extra);
      setOverrideUiNodeIds(
        includeAncestorIds(Array.from(new Set([...base, ...extra]))),
      );
    }
  }, [selectedUserId, additionalPermissionsData, includeAncestorIds]);

  useEffect(() => {
    if (!selectedUserId) return;
    const cachedRoleId = userRole.current[selectedUserId];
    if (cachedRoleId !== undefined) {
      setSelectedRoleId(cachedRoleId || "");
      return;
    }
    if (userRoleData) {
      const roleId = userRoleData?.role?.id ? String(userRoleData.role.id) : "";
      userRole.current[selectedUserId] = roleId || null;
      setSelectedRoleId(roleId);
    }
  }, [selectedUserId, userRoleData]);

  const createRole = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required.");
      return;
    }
    if (!roleType) {
      toast.error("Role type is required.");
      return;
    }
    setRoleSaving(true);
    const permissionIds = collectSelectedActionIds(
      tree,
      new Set(uiSelectedNodeIds),
    );
    const payload = {
      name: roleName.trim(),
      type: roleType as RoleType,
      description: roleDesc || undefined,
      permissionIds,
      isActive,
    };
    try {
      if (editingRoleId) {
        await updateRoleMutation({ id: editingRoleId, body: payload }).unwrap();
        toast.success("Role updated successfully.");
      } else {
        await createRoleMutation(payload).unwrap();
        toast.success("Role created successfully.");
      }
      resetRoleTabState();
      await loadRolePage(editingRoleId ? rolePage : 1, rolePageSize);
      await refreshRoleDirectory(true);
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.data?.message ||
        err?.message ||
        (editingRoleId ? "Failed to update role." : "Failed to create role.");
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setRoleSaving(false);
    }
  };

  const loadUserTablePage = useCallback(
    async (page: number, limit: number) => {
      try {
        setUserTableLoading(true);
        const res = await getUserAccessUsersTrigger({
          page,
          limit,
          search: debouncedUserSearch,
          status:
            employmentStatusList?.find(
              (item) => item.filterCode === EmployeeStatusEnum.ACTIVE,
            )?.id || undefined,
        }).unwrap();
        const data = res?.data ?? [];
        const pagination = res?.pagination;
        const total = pagination?.total ?? data.length;
        setUserTableRows(
          data.map((u) => ({
            id: u.id,
            name: u.fullname,
            workEmail: u.workEmail,
            employeeId: u.employeeId,
            department: u.department,
            roleId: u.roleId,
            role: u.role,
            status: u.status,
            reportingManagerName: u.reportingManagerName,
            functionalManagerName: u.functionalManagerName,
          })),
        );
        setUserTableTotal(total);
        setUserTablePage(page);
        setUserTablePageSize(limit);
      } catch (error) {
        console.error("Failed to load paginated assignable users", error);
      } finally {
        setUserTableLoading(false);
      }
    },
    [getUserAccessUsersTrigger, debouncedUserSearch, employmentStatusList],
  );

  useEffect(() => {
    if (active === "roles") {
      loadRolePage(1, rolePageSize);
    }
  }, [debouncedRoleSearch, active, rolePageSize]);

  // Effect for user search
  useEffect(() => {
    if (active === "users") {
      loadUserTablePage(1, userTablePageSize);
    }
  }, [debouncedUserSearch, active, userTablePageSize]);

  const handleUserRowEdit = (user: RoleUserRow) => {
    const userId = String(user.id);
    setSelectedUserId(userId);

    if (user.roleId) {
      const roleId = String(user.roleId);
      setSelectedRoleId(roleId);
      userRole.current[userId] = roleId;
    } else {
      setSelectedRoleId("");
      userRole.current[userId] = null;
    }
  };

  const assignRole = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role.");
      return;
    }
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user.");
      return;
    }
    try {
      await bulkAssignRoleMutation({
        body: { roleId: selectedRoleId, userIds: selectedUserIds },
      }).unwrap();
      toast.success("Role assigned successfully.");
      setSelectedRoleId("");
      setSelectedUserIds([]);
      try {
        await loadUserTablePage(userTablePage, userTablePageSize);
      } catch (refreshError) {
        console.error("Failed to refresh user table", refreshError);
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.data?.message || err?.message || "Failed to assign role.";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    }
  };

  const saveOverrides = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user.");
      return;
    }
    setOverridesSaving(true);
    const selectedActionIds = collectSelectedActionIds(
      tree,
      new Set(overrideUiNodeIds),
    );
    const baseActionSet = new Set(
      collectSelectedActionIds(tree, new Set(overrideBaseNodeIds)).map(String),
    );
    const previousExtras = new Set(overrideExtraNodeIds.map(String));
    const selectedExtras = selectedActionIds.filter(
      (id) => !baseActionSet.has(String(id)),
    );
    const selectedExtraSet = new Set(selectedExtras.map(String));
    const add = selectedExtras.filter((id) => !previousExtras.has(String(id)));
    const remove = Array.from(previousExtras).filter(
      (id) => !selectedExtraSet.has(id),
    );
    try {
      const res = await updateAdditionalPermissionsMutation({
        userId: selectedUserId,
        body: { add, remove },
      }).unwrap();
      setOverrideBaseNodeIds(res.rolePermissions || []);
      setOverrideExtraNodeIds(res.additionalPermissions || []);
      setOverrideUiNodeIds(
        includeAncestorIds(
          Array.from(
            new Set([
              ...(res.rolePermissions || []),
              ...(res.additionalPermissions || []),
            ]),
          ),
        ),
      );
      toast.success("User permissions updated successfully.");
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.data?.message || err?.message || "Failed to save permissions.";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setOverridesSaving(false);
    }
  };

  const closeViewModal = useCallback(() => {
    setViewModalOpen(false);
    setViewRole(null);
    setViewNodeIds([]);
  }, []);

  const handleViewRole = useCallback(
    async (roleId: string) => {
      setViewModalOpen(true);
      setViewLoading(true);
      try {
        const latest = await getRoleTrigger(roleId).unwrap();
        if (!latest) throw new Error("Role not found.");
        setViewRole(latest);
        setViewNodeIds(latest.permissions || []);
      } catch (error: unknown) {
        const err = error as ApiError;
        const message =
          err?.data?.message || err?.message || "Failed to load role details.";
        toast.error(Array.isArray(message) ? message.join(", ") : message);
        closeViewModal();
      } finally {
        setViewLoading(false);
      }
    },
    [getRoleTrigger, closeViewModal],
  );

  const handleEditRole = useCallback(
    async (roleId: string) => {
      try {
        const latest = await getRoleTrigger(roleId).unwrap();
        if (!latest) throw new Error("Role not found.");
        setRoleName(latest.name || "");
        setRoleType(latest.type || "");
        setRoleDesc(latest.description || "");
        setIsActive(latest.isActive !== false);
        setUiSelectedNodeIds(latest.permissions || []);
        setEditingRoleId(roleId);
        setTimeout(() => {
          roleFormRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          const roleNameInput = roleFormRef.current?.querySelector(
            'input[placeholder="Enter role name"]',
          ) as HTMLInputElement;
          if (roleNameInput) roleNameInput.focus();
        }, 100);
      } catch (error: unknown) {
        const err = error as ApiError;
        const message =
          err?.data?.message || err?.message || "Failed to load role details.";
        toast.error(Array.isArray(message) ? message.join(", ") : message);
      }
    },
    [getRoleTrigger],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const roleSnapshot = deleteTarget;
    setDeleteLoading(true);
    try {
      await deleteRoleMutation(roleSnapshot.id).unwrap();
      toast.success("Role has been deleted successfully.");
      setDeleteTarget(null);
      await loadRolePage(rolePage, rolePageSize);
      await refreshRoleDirectory(true);
    } catch (error: unknown) {
      const err = error as ApiError;
      const message =
        err?.data?.message || err?.message || "Failed to delete role.";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setDeleteLoading(false);
    }
  }, [
    deleteTarget,
    loadRolePage,
    refreshRoleDirectory,
    rolePage,
    rolePageSize,
    deleteRoleMutation,
  ]);

  const closeDeleteBlockedInfo = useCallback(() => {
    setDeleteBlockedInfo(null);
  }, []);

  const handleDeleteClick = useCallback((role: RoleRecord) => {
    setDeleteTarget(role);
  }, []);

  const roleColumns = useMemo<TableColumn<RoleRecord>[]>(() => {
    return [
      {
        key: "name",
        title: "Role Name",
        dataIndex: "name",
        width: "30%",
        required: true,
        render: (value: unknown, record: RoleRecord) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">
              {(value as string) || "Untitled"}
            </span>
            {record.description && (
              <span className="text-xs text-slate-500 truncate max-w-sm">
                {record.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "type",
        title: "Role Type",
        dataIndex: "type",
        width: "15%",
        render: (value: unknown) => {
          const roleType = value as RoleType | undefined;
          return roleType ? (
            <Badge size="middle" variant="blue">
              {roleType}
            </Badge>
          ) : (
            <span className="text-slate-500 text-sm">—</span>
          );
        },
      },
      {
        key: "status",
        title: "Status",
        width: "15%",
        render: (_: unknown, record: RoleRecord) => {
          const active = record.isActive !== false;
          return (
            <>
              {active ? (
                <Badge
                  size="middle"
                  variant="green"
                  icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                >
                  Active
                </Badge>
              ) : (
                <Badge
                  size="middle"
                  variant="red"
                  icon={<XCircle className="w-4 h-4 text-red-500" />}
                >
                  Inactive
                </Badge>
              )}
            </>
          );
        },
      },
      {
        key: "actions",
        title: "Actions",
        align: "center",
        width: "20%",
        required: true,
        render: (_: unknown, record: RoleRecord) => (
          <div className="flex items-center justify-center gap-2">
            <SimpleTooltip
              label="View"
              side="top"
              className="inline-block"
              tooltipClassName=" text-xs shadow-soft border-0"
            >
              <button
                type="button"
                aria-label="View"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewRole(record.id);
                }}
                className="text-primary-600 hover:text-primary-800 transition-colors"
              >
                <Eye className="w-4 h-4" aria-hidden="true" />
              </button>
            </SimpleTooltip>

            {canManage && (
              <>
                <SimpleTooltip
                  label="Edit"
                  side="top"
                  className="inline-block"
                  tooltipClassName="text-xs shadow-soft border-0"
                >
                  <button
                    type="button"
                    aria-label="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRole(record.id);
                    }}
                    className="relative group text-green-600 hover:text-green-800 transition-colors"
                  >
                    <Edit className="w-4 h-4" aria-hidden="true" />
                  </button>
                </SimpleTooltip>

                <SimpleTooltip
                  label="Delete"
                  side="top"
                  className="inline-block"
                  tooltipClassName="text-xs shadow-soft border-0"
                >
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(record);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </SimpleTooltip>
              </>
            )}
          </div>
        ),
      },
    ];
  }, [handleViewRole, handleEditRole, handleDeleteClick]);

  return (
    <>
      {/* Header */}
      <div className="bg-surface-muted px-6 pt-6 pb-4">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Access Right Management
          </h1>
        </div>
      <TabSelector active={active} onChange={handleTabChange} />
      </div>
    <div className="min-h-screen bg-surface-muted p-4 sm:p-6 space-y-4">
      
      {active === "roles" && (
        <div className="space-y-6">
          <PermissionGate code={PERMISSIONS.ACCESS_RIGHT_MANAGE}>
            <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,420px),1fr] gap-6">
              <div
                className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 space-y-6"
                ref={roleFormRef}
              >
                <RoleFormCard
                  roleName={roleName}
                  onRoleNameChange={setRoleName}
                  roleType={roleType}
                  roleTypeOptions={roleTypeOptions}
                  onRoleTypeChange={(value) =>
                    setRoleType((value as RoleType) || "")
                  }
                  isActive={isActive}
                  onStatusChange={setIsActive}
                  roleDesc={roleDesc}
                  onRoleDescChange={setRoleDesc}
                  onSubmit={createRole}
                  saving={roleSaving}
                  isEditing={!!editingRoleId}
                  onCancel={editingRoleId ? resetRoleTabState : undefined}
                />
              </div>
              {rolesLoading ? (
                <PermissionCardSkeleton />
              ) : (
                <PermissionCard
                  title="Manage Permissions"
                  icon={<Layers className="w-4 h-4" />}
                  selectedCount={uiSelectedNodeIds.length}
                  tree={tree}
                  value={uiSelectedNodeIds}
                  onChange={setUiSelectedNodeIds}
                />
              )}
            </div>
          </PermissionGate>

          <FilterWrapper>
            <SearchInput
              value={roleSearchQuery}
              onChange={(value) => setRoleSearchQuery(value)}
              placeholder="Search roles..."
            />
          </FilterWrapper>

          {tableLoading ? (
            <RoleTableCardSkeleton />
          ) : (
            <RoleTableCard
              roles={roles}
              totalRoles={roleTotal}
              roleColumns={roleColumns}
              rolesLoading={tableLoading}
              rolePage={rolePage}
              rolePageSize={rolePageSize}
              onRolePageChange={handleRolePageChange}
              onRolePageSizeChange={handleRolePageSizeChange}
            />
          )}
        </div>
      )}

      {active === "users" && (
        <div className="space-y-6">
          <PermissionGate code={PERMISSIONS.ACCESS_RIGHT_MANAGE}>
            <UserAssignmentCard
              userOptions={userOptions}
              roleOptions={roleOptions}
              selectedUserIds={selectedUserIds}
              selectedUserId={selectedUserId}
              setSelectedUserid={setSelectedUserId}
              selectedRoleId={selectedRoleId}
              onUserChange={setSelectedUserIds}
              onRoleChange={setSelectedRoleId}
              onReset={() => {
                setSelectedUserIds([]);
                setSelectedRoleId(undefined);
                setSelectedUserId(undefined);
              }}
              onAssign={assignRole}
              isBulkAssignLoading={isBulkAssignLoading}
              canAssign={!!selectedUserIds.length && !!selectedRoleId}
              rolePrefillLoading={userRoleLoading}
            />
          </PermissionGate>

          <FilterWrapper>
            <SearchInput
              value={userSearchQuery}
              onChange={(value) => setUserSearchQuery(value)}
              placeholder="Search by name, email, or employee ID..."
            />
          </FilterWrapper>

          {userTableLoading ? (
            <UserRoleTableSkeleton />
          ) : (
            <UserRoleTableSection
              users={userTableRows}
              loading={userTableLoading}
              currentPage={userTablePage}
              itemsPerPage={userTablePageSize}
              totalItems={userTableTotal}
              onPageChange={(page) =>
                loadUserTablePage(page, userTablePageSize)
              }
              onItemsPerPageChange={(limit) => loadUserTablePage(1, limit)}
              onEditUser={handleUserRowEdit}
            />
          )}
        </div>
      )}

      {active === "overrides" && (
        <PermissionGate code={PERMISSIONS.ACCESS_RIGHT_VIEW}>
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,420px),1fr] gap-6">
            <OverridesSidebar
              userOptions={userOptions}
              selectedUserId={selectedUserId}
              onUserChange={setSelectedUserId}
              onSubmit={saveOverrides}
              disableSubmit={
                !selectedUserId || overridesLoading || overridesSaving
              }
              overridesSaving={overridesSaving}
            />
            {rolesLoading ? (
              <PermissionCardSkeleton />
            ) : (
              <PermissionCard
                title="Manage Permissions"
                icon={<Layers className="w-5 h-5 text-indigo-500" />}
                selectedCount={overrideUiNodeIds.length}
                tree={tree}
                value={overrideUiNodeIds}
                onChange={setOverrideUiNodeIds}
                lockedIds={overrideLockedIds}
                disabled={overridesLoading || overridesSaving}
                isBusy={overridesLoading || overridesSaving}
                busyMessage={
                  overridesSaving
                    ? "Saving overrides..."
                    : "Loading permissions..."
                }
              />
            )}
          </div>
        </PermissionGate>
      )}

      {active === "modules" && (
        <PermissionGate code={PERMISSIONS.ACCESS_RIGHT_VIEW}>
          <div className="flex-1 flex flex-col">
            {rolesLoading ? (
              <ModuleHierarchySkeleton />
            ) : (
              <ModuleTreeView tree={tree} onContextMenu={handleContextMenu} />
            )}
          </div>
        </PermissionGate>
      )}

      <PermissionGate code={PERMISSIONS.ACCESS_RIGHT_MANAGE}>
        <RoleViewModal
          isOpen={viewModalOpen}
          loading={viewLoading}
          viewRole={viewRole}
          viewNodeIds={viewNodeIds}
          tree={tree}
          onClose={closeViewModal}
        />

        <DeleteRoleModal
          isOpen={!!deleteTarget}
          deleteTarget={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />

        <DeleteBlockedModal
          info={deleteBlockedInfo}
          onClose={closeDeleteBlockedInfo}
        />

        <EditModuleModal
          isOpen={editModuleModalOpen}
          onClose={closeEditModuleModal}
          availableModules={availableModules}
          getSubmodulesForModule={getSubmodulesForModule}
          editModuleSelectedModuleId={editModuleSelectedModuleId}
          onModuleSelect={(value) => {
            setEditModuleSelectedModuleId(value);
            setEditModuleSelectedSubmoduleId("");
            setEditModuleNewSubmoduleName("");
            setEditModuleNewActionName("");
          }}
          editModuleSelectedSubmoduleId={editModuleSelectedSubmoduleId}
          onSubmoduleSelect={(value) => {
            setEditModuleSelectedSubmoduleId(value);
            setEditModuleNewSubmoduleName("");
          }}
          editModuleNewSubmoduleName={editModuleNewSubmoduleName}
          onNewSubmoduleChange={setEditModuleNewSubmoduleName}
          editModuleNewActionName={editModuleNewActionName}
          onNewActionChange={setEditModuleNewActionName}
          onSave={handleEditModuleSave}
          submitting={editModuleSubmitting}
          error={editModuleError}
          success={editModuleSuccess}
          editingNode={editingNode}
          editModuleName={editModuleName}
          onEditModuleNameChange={setEditModuleName}
          onUpdateName={handleUpdateModuleName}
        />

        <AddModuleModal
          isOpen={addModuleModalOpen}
          onClose={() => {
            setAddModuleModalOpen(false);
            setNewModuleName("");
            setNewModuleDefaultActions(true);
            setAddModuleError(null);
            setAddModuleSuccess(null);
          }}
          moduleName={newModuleName}
          onModuleNameChange={setNewModuleName}
          createDefaultActions={newModuleDefaultActions}
          onCreateDefaultActionsChange={setNewModuleDefaultActions}
          onSave={handleCreateModule}
          submitting={addModuleSubmitting}
        />

        <AddSubmoduleModal
          isOpen={addSubmoduleModalOpen}
          onClose={() => {
            setAddSubmoduleModalOpen(false);
            setNewSubmoduleName("");
            setAddSubmoduleError(null);
            setAddSubmoduleSuccess(null);
            setParentModuleName("");
            setParentModuleId("");
          }}
          submoduleName={newSubmoduleName}
          onSubmoduleNameChange={setNewSubmoduleName}
          moduleName={parentModuleName}
          onSave={handleCreateSubmodule}
          submitting={addSubmoduleSubmitting}
        />

        <DeletePermissionModal
          isOpen={deleteModalOpen}
          onClose={() => {
            if (!deleteSubmitting) {
              setDeleteModalOpen(false);
              setNodeToDelete(null);
              setDeleteError(null);
            }
          }}
          node={nodeToDelete}
          onConfirm={handleDeletePermission}
          submitting={deleteSubmitting}
          error={deleteError}
        />

        <ContextMenu
          node={contextMenuNode}
          position={contextMenuPosition}
          onClose={() => {
            setContextMenuNode(null);
            setContextMenuPosition(null);
          }}
          onAddModule={handleAddModule}
          onAddSubmodule={handleAddSubmodule}
          onEdit={() => {
            if (contextMenuNode) {
              handleEditNodeClick(contextMenuNode);
            }
            setContextMenuNode(null);
            setContextMenuPosition(null);
          }}
          onDelete={handleDeleteNode}
          canManage={canManage}
        />
      </PermissionGate>
    </div>
    </>
  );
};

export default RoleSetupPage;

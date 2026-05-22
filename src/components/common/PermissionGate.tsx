import React from "react";
import { useEffectivePermissions } from "../../store/hooks/useRbac";
import { PermissionCode } from "../../utils/rbac/permissions";
import { useAuth } from "../../store/hooks/useAuth";
import { RoleTypeEnum } from "../../utils/constants";

type Props = {
  code: PermissionCode | PermissionCode[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const PermissionGate: React.FC<Props> = ({
  code,
  children,
  fallback = null,
}) => {
  const { isReady, codes } = useEffectivePermissions();
  const { user } = useAuth();
  const requiredCodes = Array.isArray(code) ? code : [code];
  const ok = requiredCodes.some((permission) => codes.has(permission));
  if (!isReady) return null;
  if (user?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase()) {
    return <>{children}</>;
  }
  if (!ok) return <>{fallback}</>;
  return <>{children}</>;
};

export default PermissionGate;

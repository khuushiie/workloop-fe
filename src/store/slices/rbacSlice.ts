import { createSlice } from "@reduxjs/toolkit";
import { rbacApi } from "../apis/rbac.api";
import { logout } from "./authSlice";
import type { IEffectivePermissionHierarchyModule } from "../../types/rbac";

interface RbacState {
  permissionCodes: string[];
  hierarchy: IEffectivePermissionHierarchyModule[];
}

const initialState: RbacState = {
  permissionCodes: [],
  hierarchy: [],
};

const rbacSlice = createSlice({
  name: "rbac",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      .addMatcher(
        rbacApi.endpoints.getEffectivePermissions.matchFulfilled,
        (state, action) => {
          state.permissionCodes = (action.payload.permissions ?? []).map(
            (p) => p.code,
          );
          state.hierarchy = action.payload.hierarchy ?? [];
        },
      );
  },
});

export default rbacSlice.reducer;

// Selectors
export const selectPermissionCodes = (state: { rbac: RbacState }) =>
  state.rbac.permissionCodes;
export const selectRbacHierarchy = (state: { rbac: RbacState }) =>
  state.rbac.hierarchy;

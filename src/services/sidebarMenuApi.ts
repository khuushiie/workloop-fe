import type { IEffectivePermissionHierarchyModule } from "../types/rbac";

/**
 * Optimistic cache for sidebar menu structure
 * Updates immediately when permission names change
 * Note: This service receives data from the rbac slice (via useRbac hooks) to avoid duplicate API calls
 */
class SidebarMenuService {
  private cache: Map<string, IEffectivePermissionHierarchyModule[]> = new Map();
  private cacheTimestamp: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set cache directly (called from useEffectivePermissions when effective permissions load)
   */
  setCache(
    userId: string,
    modules: IEffectivePermissionHierarchyModule[],
  ): void {
    this.cache.set(userId, modules);
    this.cacheTimestamp.set(userId, Date.now());
  }

  /**
   * Get sidebar menu structure with dynamic names from backend
   * Uses cached data from rbac slice / useEffectivePermissions (no API call)
   */
  async getMenuStructure(
    userId: string,
  ): Promise<IEffectivePermissionHierarchyModule[]> {
    const now = Date.now();
    const cached = this.cache.get(userId);
    const timestamp = this.cacheTimestamp.get(userId) || 0;

    // Return cached data if still valid
    if (cached && now - timestamp < this.CACHE_TTL) {
      return cached;
    }

    // If cache is stale or missing, return empty array
    // useEffectivePermissions will refresh it on next load
    return cached || [];
  }

  /**
   * Invalidate cache for a user (call after permission changes)
   */
  invalidateCache(userId: string): void {
    this.cache.delete(userId);
    this.cacheTimestamp.delete(userId);
  }

  /**
   * Optimistically update module/submodule name in cache
   */
  updateName(
    userId: string,
    code: string,
    newName: string,
    type: "MODULE" | "SUBMODULE",
  ): void {
    const cached = this.cache.get(userId);
    if (!cached) return;

    const updated = cached.map((module) => {
      if (type === "MODULE" && module.code === code) {
        return { ...module, name: newName };
      }
      if (type === "SUBMODULE") {
        const updatedSubmodules = module.submodules.map((sub) =>
          sub.code === code ? { ...sub, name: newName } : sub,
        );
        return { ...module, submodules: updatedSubmodules };
      }
      return module;
    });

    this.cache.set(userId, updated);
  }

  /**
   * Get module name by code
   */
  getModuleName(userId: string, code: string): string | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;
    const module = cached.find((m) => m.code === code);
    return module?.name || null;
  }

  /**
   * Get submodule name by code
   */
  getSubmoduleName(
    userId: string,
    moduleCode: string,
    submoduleCode: string,
  ): string | null {
    const cached = this.cache.get(userId);
    if (!cached) return null;
    const module = cached.find((m) => m.code === moduleCode);
    if (!module) return null;
    const submodule = module.submodules.find((s) => s.code === submoduleCode);
    return submodule?.name || null;
  }
}

export const sidebarMenuApi = new SidebarMenuService();

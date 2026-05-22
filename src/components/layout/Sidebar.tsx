import {
  Building,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSidebarMenu, SidebarMenuItem } from "../../hooks/useSidebarMenu";
import { useAuth } from "../../store/hooks/useAuth";
import { useEffectivePermissions } from "../../store/hooks/useRbac";
import { RoleTypeEnum } from "../../utils/constants";
import { getPermissionForPath } from "../../utils/rbac/modulePermissions";
import { SimpleTooltip } from "../common";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { codes, isReady } = useEffectivePermissions();
  const { menuItems } = useSidebarMenu();
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});

  // NEW: State for desktop collapsible sidebar
  const [isCollapsed, setIsCollapsed] = useState(false);
  const WithTooltip = ({ 
    label, 
    children, 
    alwaysShow = false, // Defaults to false so menu items only show tooltip when collapsed
    side = "right",     // Sidebar menu item tooltips should appear to the right
    className = "w-full",
    tooltipClassName

  }: { 
    label: string; 
    children: React.ReactNode;
    alwaysShow?: boolean;
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
    tooltipClassName?: string;

  }) => {
    // Show if the sidebar is collapsed OR if we explicitly force it to always show
    if (!isCollapsed && !alwaysShow) return <>{children}</>;

    return (
      <SimpleTooltip label={label} side={side} className={className} tooltipClassName={tooltipClassName} delay={500}>
        {children}
      </SimpleTooltip>
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isSuperAdmin =
    user?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase();

  const canAccessPath = useMemo(() => {
    return (path?: string) => {
      if (!path) return true;
      const permission = getPermissionForPath(path);
      if (!permission) return true;
      const required = Array.isArray(permission) ? permission : [permission];
      return isSuperAdmin || required.some((code) => codes.has(code));
    };
  }, [codes, isSuperAdmin]);

  const renderMenuItem = (item: SidebarMenuItem, index: number) => {
    const textTransitionClass = `font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:max-w-0 lg:opacity-0 lg:ml-0 delay-150' : 'max-w-[200px] opacity-100 ml-3 delay-0'}`;
    if (item.type === "group") {
      const permittedChildren = (item.items ?? []).filter(
        (subItem: SidebarMenuItem) => subItem.disabled || canAccessPath(subItem.path),
      );
      if (!permittedChildren.length) return null;
      const isExpanded =
        expandedSections[item.label.toLowerCase().replace(/\s+/g, "")];

      return (
        <div key={index} className="space-y-1">
          <WithTooltip label={item.label} delay={500}>

            <button
              onClick={() => {
                if (isCollapsed && window.innerWidth >= 1024) setIsCollapsed(false);
                toggleSection(item.label.toLowerCase().replace(/\s+/g, ""));
              }}
              className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base text-slate-600 hover:bg-primary-50 hover:text-primary-700`}
            >
              <div className="flex items-center">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className={textTransitionClass}>{item.label}</span>
              </div>
              <div className={`transition-all duration-300 overflow-hidden flex-shrink-0 ${isCollapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-[24px] opacity-100'}`}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
            </button>

          </WithTooltip>

          {isExpanded && !isCollapsed && (
            <div className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-0' : 'ml-4'}`}>
              {permittedChildren.map((subItem: SidebarMenuItem) => {
                if (subItem.disabled) {
                  return (
                    <WithTooltip label={subItem.label} key={subItem.code || subItem.label}>
                      <div className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm text-slate-300 cursor-not-allowed">
                        <subItem.icon className="w-4 h-4 flex-shrink-0" />
                        <span className={textTransitionClass}>{subItem.label}</span>
                      </div>
                    </WithTooltip>
                  );
                }
                return (
                  <WithTooltip label={subItem.label} key={subItem.path}>
                    <NavLink
                      to={subItem.path || "#"}
                      onClick={() => { if (window.innerWidth < 1024) onClose();
                       }}
                      className={({ isActive }) =>
                        `flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-300 text-sm ${isActive
                          ? "bg-primary-50 text-primary-700 font-semibold border-r-2 border-primary-600"
                          : "text-slate-500 hover:bg-primary-50/50 hover:text-primary-600"
                        }`
                      }
                    >
                      <subItem.icon className="w-4 h-4 flex-shrink-0" />
                      <span className={textTransitionClass}>{subItem.label}</span>
                    </NavLink>
                  </WithTooltip>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (item.disabled) {
      return (
        <WithTooltip label={item.label} key={item.code || item.label}>
          <div className="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base text-slate-300 cursor-not-allowed">
            <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className={textTransitionClass}>{item.label}</span>
          </div>
        </WithTooltip>
      );
    }

    if (item.path && !canAccessPath(item.path)) return null;

    return (
      <WithTooltip label={item.label} key={item.path}>
        <NavLink
          to={item.path || "#"}
          onClick={() => { if (window.innerWidth < 1024) onClose(); 
          }}
          className={({ isActive }) =>
            `flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-300 text-sm sm:text-base ${isActive
              ? "bg-primary-50 text-primary-700 font-semibold border-r-2 border-primary-600"
              : "text-slate-600 hover:bg-primary-50/50 hover:text-primary-700"
            }`
          }
        >
          <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className={textTransitionClass}>{item.label}</span>
        </NavLink>
      </WithTooltip>
    );
  };

  if (!isReady) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - Appended width override for collapsed state */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-soft border-r border-slate-100
        transform transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "w-64 lg:w-[90px]" : "w-64 lg:w-80"}
      `}
      >
        {/* Header Container relative for toggle positioning */}
        <div className="relative">

          {/* Header */}
        <div className="p-3 sm:p-4 border-b border-slate-100 pl-5 sm:pl-5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-brand-button">
              <Building className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
            </div>
            {
              !isCollapsed && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 truncate my-0 tracking-tight">
                    HRMS
                  </h1>
                </div>
              )
            }
          </div>
        </div>

          {/* Floating Collapse Toggle on Desktop Edge */}
          <WithTooltip
            label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            alwaysShow={true}
            side="top"
            className="hidden lg:flex absolute -right-3 top-7 z-50"
            tooltipClassName={`${isCollapsed ? "ml-12" : "ml-40"}`}
          >
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              // Removed duplicate absolute classes here. The button just needs to be a standard flex container now.
              className="bg-white border border-slate-200 shadow-sm rounded-full w-7 h-7 absolute top-0 -right-[1px] flex items-center justify-center text-slate-400 hover:text-primary-600 transition-transform duration-200 hover:scale-110 cursor-pointer"
            >
              <div className="flex items-center -space-x-1.5">
                <ChevronLeft size={14} />
                <ChevronRight size={14} />
              </div>
            </button>
          </WithTooltip>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto scrollbar-thin overflow-x-hidden">
          <nav className={`space-y-1 sm:space-y-1.5`}>
            {
              menuItems
                .map((item, index) => renderMenuItem(item, index))
                .filter(Boolean) as React.ReactNode[]
            }
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
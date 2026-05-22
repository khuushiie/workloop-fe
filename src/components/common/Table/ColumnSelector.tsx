import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { Settings2, CheckSquare, Square } from "lucide-react";
import { TableColumn } from "../Table";

interface ColumnSelectorProps {
  columns: TableColumn<any>[];

  visibleKeys: string[];

  onToggle: (key: string) => void;

  className?: string;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

const MENU_WIDTH = 256;
const MENU_OFFSET = 8;

/**
 * Renders the column visibility selector trigger and a portaled dropdown
 * that escapes parent overflow/clipping contexts (e.g. table cards using
 * `overflow-hidden`). The dropdown floats above page content but stays below
 * sticky page headers/sidebars.
 */
export const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  visibleKeys,
  onToggle,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Compute the menu position relative to the trigger button using
   * viewport coordinates (for `position: fixed`). Right-aligns the menu
   * with the trigger and clamps within the viewport horizontally.
   */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const top = rect.bottom + MENU_OFFSET;

    let left = rect.right - MENU_WIDTH;
    if (left < MENU_OFFSET) left = MENU_OFFSET;
    const maxLeft = window.innerWidth - MENU_WIDTH - MENU_OFFSET;
    if (left > maxLeft) left = Math.max(MENU_OFFSET, maxLeft);

    setMenuPosition({ top, left, width: MENU_WIDTH });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleReposition = () => updatePosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);
      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={triggerRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex items-center gap-2 px-3 py-2 text-sm font-medium 
          text-slate-700 bg-white border border-slate-200 rounded-lg 
          hover:bg-slate-50 transition-all duration-200 shadow-sm
        "
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Settings2 size={16} className="text-slate-500" />
        <span>Columns</span>
      </button>

      {isOpen &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="
              fixed bg-white border border-slate-200
              rounded-xl shadow-xl py-2 z-30
              animate-in fade-in zoom-in-95 duration-200
            "
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              transformOrigin: "top right",
            }}
          >
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Manage Visibility
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200">
              {columns.map((col) => {
                const isRequired = !!col.required;
                const isVisible = isRequired || visibleKeys.includes(col.key);

                return (
                  <label
                    key={col.key}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors
                      ${isRequired ? "opacity-60 cursor-not-allowed bg-slate-50" : "hover:bg-slate-50 active:bg-slate-100"}
                    `}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isVisible}
                      onChange={() => !isRequired && onToggle(col.key)}
                      disabled={isRequired}
                    />

                    {isVisible ? (
                      <CheckSquare size={18} className="text-primary-600 fill-primary-50" />
                    ) : (
                      <Square size={18} className="text-slate-300" />
                    )}

                    <span
                      className={`flex-1 truncate ${
                        isVisible ? "text-slate-900 font-medium" : "text-slate-500 font-normal"
                      }`}
                    >
                      {col.label || (typeof col.title === "string" ? col.title : col.key)}
                    </span>

                    {isRequired && (
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter shrink-0">
                        Required
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

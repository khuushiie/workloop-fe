import React, { useEffect, useMemo, useState, useRef } from "react";
import type { IPermission } from "../../../types/rbac";

type CheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  label: string;
};

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  label,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate && !checked;
    }
  }, [indeterminate, checked]);

  return (
    <label
      className={`flex items-center space-x-2 ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
};

type TreeItemProps = {
  node: IPermission;
  selected: Set<string>;
  hasSelectedDescendant: (id: string) => boolean;
  lockedIds?: Set<string>;
  toggle: (id: string, v: boolean) => void;
  disabled?: boolean;
};

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  selected,
  hasSelectedDescendant,
  lockedIds,
  toggle,
  disabled = false,
}) => {
  const [open, setOpen] = useState(true);
  const isChecked = selected.has(node.id);
  const isPartial = !isChecked && hasSelectedDescendant(node.id);
  const isLocked = lockedIds?.has(node.id) ?? false;

  return (
    <div className="ml-10">
      <div className="flex items-center space-x-2 py-1">
        {node.children && node.children.length > 0 && (
          <button
            className="text-xs px-1 border rounded"
            onClick={() => setOpen(!open)}
          >
            {open ? "-" : "+"}
          </button>
        )}
        <Checkbox
          checked={isChecked}
          indeterminate={isPartial}
          disabled={isLocked || disabled}
          onChange={(v) => toggle(node.id, v)}
          label={node.name}
        />
      </div>
      {open &&
        (node.children || []).map((ch) => (
          <TreeItem
            key={ch.id}
            node={ch}
            selected={selected}
            hasSelectedDescendant={hasSelectedDescendant}
            lockedIds={lockedIds}
            toggle={toggle}
            disabled={disabled}
          />
        ))}
    </div>
  );
};

type PermissionTreeProps = {
  tree: PermissionNode[];
  value: string[];
  onChange: (selectedNodeIds: string[]) => void;
  lockedIds?: Set<string>;
  disabled?: boolean;
};

const PermissionTree: React.FC<PermissionTreeProps> = ({
  tree,
  value,
  onChange,
  lockedIds,
  disabled = false,
}) => {
  const selected = useMemo(() => new Set<string>(value), [value]);

  const parentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    const walk = (n: IPermission, parentId: string | null) => {
      map.set(n.id, parentId);
      (n.children || []).forEach((ch) => walk(ch, n.id));
    };
    tree.forEach((n) => walk(n, null));
    return map;
  }, [tree]);

  const nodeById = useMemo(() => {
    const map = new Map<string, IPermission>();
    const walk = (n: IPermission) => {
      map.set(n.id, n);
      (n.children || []).forEach(walk);
    };
    tree.forEach(walk);
    return map;
  }, [tree]);

  const hasSelectedDescendant = (id: string): boolean => {
    const node = nodeById.get(id);
    if (!node || !node.children) return false;
    const stack = [...node.children];
    while (stack.length) {
      const n = stack.pop()!;
      if (selected.has(n.id)) return true;
      if (n.children) stack.push(...n.children);
    }
    return false;
  };

  const isNodeFullySelected = (n: IPermission, s: Set<string>): boolean => {
    const children = n.children || [];
    if (!children.length) return s.has(n.id);
    return children.every((ch) => isNodeFullySelected(ch, s));
  };

  const updateAncestors = (startId: string, s: Set<string>) => {
    let p = parentMap.get(startId) || null;
    while (p) {
      const parentNode = nodeById.get(p);
      if (!parentNode) break;
      if (isNodeFullySelected(parentNode, s)) s.add(p);
      else s.delete(p);
      p = parentMap.get(p) || null;
    }
  };

  const toggle = (id: string, v: boolean) => {
    if (disabled) return;
    const s = new Set(selected);
    const n = nodeById.get(id);
    if (!n) return;

    const collectDescendants = (node: IPermission): string[] => {
      const children = node.children || [];
      const ids = children.flatMap(collectDescendants);
      return [node.id, ...ids];
    };

    const descendants = collectDescendants(n);

    if (v) {
      descendants.forEach((nid) => {
        if (!lockedIds?.has(nid)) s.add(nid);
      });
    } else {
      for (const nid of descendants) {
        if (lockedIds?.has(nid)) continue;
        s.delete(nid);
      }
    }

    updateAncestors(id, s);
    onChange(Array.from(s));
  };

  return (
    <div className="border rounded p-2 max-h-[480px] overflow-auto">
      {tree.map((n) => (
        <TreeItem
          key={n.id}
          node={n}
          selected={selected}
          hasSelectedDescendant={hasSelectedDescendant}
          lockedIds={lockedIds}
          toggle={toggle}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default PermissionTree;

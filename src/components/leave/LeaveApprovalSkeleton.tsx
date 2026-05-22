import React from "react";

const ShimmerBlock: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`bg-slate-200 animate-pulse rounded ${className}`}
    aria-hidden="true"
  />
);

export default function LeaveApprovalSkeleton({
  rows = 8,
}: {
  rows?: number;
}) {
  return (
    <div
      className="w-full border border-slate-200 rounded-lg overflow-hidden bg-white"
      role="status"
      aria-busy="true"
    >
      <table className="min-w-full text-sm">
        {/* HEADER (same as real table) */}
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3"><ShimmerBlock className="w-20 h-3" /></th>
            <th className="px-4 py-3"><ShimmerBlock className="w-28 h-3" /></th>
            <th className="px-4 py-3"><ShimmerBlock className="w-32 h-3" /></th>
            <th className="px-4 py-3"><ShimmerBlock className="w-32 h-3" /></th>
            <th className="px-4 py-3 text-center"><ShimmerBlock className="w-8 h-3 mx-auto" /></th>
            <th className="px-4 py-3"><ShimmerBlock className="w-24 h-3" /></th>
            <th className="px-4 py-3"><ShimmerBlock className="w-20 h-3" /></th>
            <th className="px-4 py-3 text-right"><ShimmerBlock className="w-12 h-3 ml-auto" /></th>
          </tr>
        </thead>

        {/* ROWS */}
        <tbody className="divide-y divide-slate-200">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td className="px-4 py-4">
                <ShimmerBlock className="w-16 h-4" />
              </td>

              <td className="px-4 py-4">
                <ShimmerBlock className="w-28 h-4" />
              </td>

              <td className="px-4 py-4">
                <ShimmerBlock className="w-40 h-4" />
              </td>

              <td className="px-4 py-4">
                <ShimmerBlock className="w-36 h-4" />
              </td>

              <td className="px-4 py-4 text-center">
                <ShimmerBlock className="w-8 h-4 mx-auto" />
              </td>

              <td className="px-4 py-4">
                <ShimmerBlock className="w-20 h-4" />
              </td>

              {/* Status badge */}
              <td className="px-4 py-4">
                <ShimmerBlock className="w-24 h-7 rounded-full" />
              </td>

              {/* Actions icon */}
              <td className="px-4 py-4">
                <div className="flex justify-end">
                  <ShimmerBlock className="w-5 h-5 rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

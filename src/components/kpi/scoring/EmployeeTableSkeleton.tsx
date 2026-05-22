import React from "react";
import { ShimmerBlock } from "../../../utils/SkeletonUtils";

export const EmployeeTableSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-soft border border-slate-200">
      
      <div className="px-6 py-4 border-b border-slate-200">
        <ShimmerBlock className="h-6 w-28" /> 
      </div>

      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-slate-200">
          
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3"><ShimmerBlock className="h-4 w-20" /></th>
              <th className="px-4 py-3"><ShimmerBlock className="h-4 w-16" /></th>
              <th className="px-4 py-3"><ShimmerBlock className="h-4 w-24" /></th>
              <th className="px-4 py-3"><ShimmerBlock className="h-4 w-32" /></th>
              <th className="px-4 py-3"><ShimmerBlock className="h-4 w-32" /></th>
              <th className="px-4 py-3"><ShimmerBlock className="h-4 w-24" /></th>
              <th className="px-4 py-3"><ShimmerBlock className="h-4 w-16" /></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="bg-white">
                
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ShimmerBlock className="w-8 h-8 rounded-full flex-shrink-0" />
                    <ShimmerBlock className="h-4 w-32" />
                  </div>
                </td>

                {/* 2. Email */}
                <td className="px-4 py-4">
                  <ShimmerBlock className="h-4 w-40" />
                </td>

                <td className="px-4 py-4">
                  <ShimmerBlock className="h-6 w-24 rounded-full" />
                </td>

                <td className="px-4 py-4">
                  <ShimmerBlock className="h-6 w-32 rounded-full" />
                </td>

                <td className="px-4 py-4">
                  <ShimmerBlock className="h-6 w-32 rounded-full" />
                </td>

                <td className="px-4 py-4">
                  <div className="flex gap-1">
                    <ShimmerBlock className="h-6 w-24 rounded-full" />
                    <ShimmerBlock className="h-6 w-10 rounded-full" />
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <ShimmerBlock className="w-4 h-4 rounded" />
                    <ShimmerBlock className="w-4 h-4 rounded" />
                    <ShimmerBlock className="w-4 h-4 rounded" />
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full bg-white rounded-lg border border-slate-200 p-4 mt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          
          <div className="flex w-full md:w-[31%] items-center gap-4">
            <ShimmerBlock className="h-4 w-48" />
            
            <div className="flex items-center gap-2">
              <ShimmerBlock className="h-4 w-20" />
              <ShimmerBlock className="h-8 w-16 rounded border border-slate-200" />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center lg:justify-end">
            <ShimmerBlock className="h-8 w-16 rounded" />
            
            <div className="flex gap-1 px-2">
               <ShimmerBlock className="h-6 w-6 rounded" />
               <ShimmerBlock className="h-6 w-6 rounded" />
               <ShimmerBlock className="h-6 w-6 rounded" />
            </div>

            <ShimmerBlock className="h-8 w-16 rounded" />
          </div>

        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Users, Mail } from "lucide-react";
import { useGetCelebrationsQuery } from "../../store/apis/user.api";

const RecentJoinersCard: React.FC = () => {
  const { data, isLoading: loading } = useGetCelebrationsQuery();
  const recentJoiners = data?.monthJoiners ?? [];

  if (loading) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem]">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-slate-900 mb-0">
            {new Date().toLocaleDateString("en-US", { month: "long" })}{" "}
            Joiner(s)
          </h2>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-800">
            {recentJoiners.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="flex flex-col flex-1 space-y-3 pr-2 h-full">
          {recentJoiners.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm mb-2">No recent joiners</p>
              <p className="text-slate-400 text-xs">
                No employees joined this month
              </p>
            </div>
          ) : (
            recentJoiners.map((joiner) => (
              <div
                key={joiner.workEmail}
                className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-medium text-sm">
                      {(joiner.name || "?").charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate mb-0">
                        {joiner.name || "—"}
                      </p>
                      <p className="text-xs text-slate-600 truncate mb-0">
                        {joiner.employeeId ? `ID: ${joiner.employeeId}` : "Employee"}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="w-3 h-3 text-primary-500" />
                        <span className="text-xs text-primary-600 truncate">
                          {joiner.workEmail || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentJoinersCard;

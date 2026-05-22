import React, { useState, useRef, useMemo, useEffect } from "react";
import { Users, Search, UserCheck } from "lucide-react";
import { useGetActiveUsersStatusQuery } from "../../store/apis/user.api";
import Badge from "../common/Badge";

// Define the filter types for better TypeScript support
type FilterStatus = "all" | "online" | "break" | "offline";

const EmployeeCard: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // 1. New state to track the clicked filter
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading: loading, isError: hasError, error } = useGetActiveUsersStatusQuery();

  const { employees, onlineCount, offlineCount, breakCount } = useMemo(() => {
    const users = data?.users ?? [];
    const counts = data?.counts ?? {
      not_checked_in: 0,
      checked_in: 0,
      on_break: 0,
      checked_out: 0,
    };
    return {
      employees: users,
      onlineCount: counts.checked_in,
      offlineCount: counts.not_checked_in + counts.checked_out,
      breakCount: counts.on_break,
    };
  }, [data]);

  // 2. Updated filtering logic to handle BOTH search and status clicks
  const filteredEmployees = employees.filter((employee) => {
    // Check Search Query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = (employee.name || "").toLowerCase();
      const employeeId = (employee.employeeId || "").toLowerCase();
      const userId = (employee.userId || "").toLowerCase();
      const email = (employee.email || "").toLowerCase();
      matchesSearch =
        name.includes(query) ||
        employeeId.includes(query) ||
        userId.includes(query) ||
        email.includes(query);
    }

    // Check Status Filter
    let matchesStatus = true;
    if (activeFilter === "online") {
      matchesStatus = employee.status === "checked_in";
    } else if (activeFilter === "break") {
      matchesStatus = employee.status === "on_break";
    } else if (activeFilter === "offline") {
      matchesStatus = employee.status !== "checked_in" && employee.status !== "on_break";
    }

    return matchesSearch && matchesStatus;
  });

  const sortedFilteredEmployees = [...filteredEmployees].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "")
  );

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery("");
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const errorMessage =
    hasError && error && typeof error === "object" && "data" in error
      ? (error.data as { message?: string })?.message
      : "Failed to load employee data";

  if (hasError) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Team Status
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-sm text-slate-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        {!isSearchOpen && (
          <h2 className="text-lg whitespace-nowrap sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary-600" />
            Team Status
          </h2>
        )}
        <div className="flex items-center justify-between w-full gap-2 mb-3">
          <div
            className={`flex items-center border-b border-slate-300 transition-all duration-200 ease-in-out overflow-hidden ${isSearchOpen ? "flex-1 opacity-100" : "w-0 opacity-0"
              }`}
          >
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={handleSearchBlur}
              placeholder="Search by name"
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none py-1"
            />
          </div>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSearchToggle();
            }}
            className="flex items-center justify-center rounded-full hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle team search"
          >
            <Search className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* 3. Status Summary with Clickable Filters */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between px-0.5 py-3 sm:px-3 lg:px-0.5 bg-slate-50 rounded-lg border border-slate-100 overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">

            {/* ALL Filter */}
            <div
              onClick={() => setActiveFilter("all")}
              className={`flex items-center space-x-1 sm:space-x-2 cursor-pointer px-2 py-1 rounded-md transition-colors`}
            >
              <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              <span className="text-sm font-medium text-primary-600">
                {employees.length}
              </span>
              <span className="text-xs text-slate-600">All</span>
            </div>

            {/* ONLINE Filter */}
            <div
              onClick={() => setActiveFilter("online")}
              className={`flex items-center space-x-1 sm:space-x-2 cursor-pointer px-2 py-1 rounded-md transition-colors
    `}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mb-0"></div>
              <span className="text-sm font-medium text-green-600">
                {onlineCount}
              </span>
              <span className="text-xs text-slate-600">Online</span>
            </div>

            {/* BREAK Filter */}
            <div
              onClick={() => setActiveFilter("break")}
              className={`flex items-center space-x-1 sm:space-x-2 cursor-pointer px-2 py-1 rounded-md transition-colors`}
            >
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-orange-600">
                {breakCount}
              </span>
              <span className="text-xs text-slate-600 whitespace-nowrap">On Break</span>
            </div>

            {/* OFFLINE Filter */}
            <div
              onClick={() => setActiveFilter("offline")}
              className={`flex items-center space-x-1 sm:space-x-2 cursor-pointer px-2 py-1 rounded-md transition-colors`}
            >
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">
                {offlineCount}
              </span>
              <span className="text-xs text-slate-600">Offline</span>
            </div>

          </div>
        </div>
      </div>

      {/* Employees List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="space-y-2 sm:space-y-3 pr-2">
          {sortedFilteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {employees.length === 0
                  ? "No Employees Found"
                  : "No Matching Employees"}
              </h3>
              <p className="text-sm text-slate-600">
                {employees.length === 0
                  ? "No employees to display at the moment."
                  : "Try a different search or filter."}
              </p>
            </div>
          ) : (
            sortedFilteredEmployees.map((employee) => {
              const isOnBreak = employee.status === "on_break";
              const isOnline = employee.status === "checked_in";
              const initial = (employee.name || "U").charAt(0).toUpperCase();
              return (
                <div key={employee.userId}>
                  <div className="flex items-center space-x-3 p-1 sm:p-1 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex-shrink-0">
                      <Badge
                        dot
                        size="middle"
                        variant={
                          isOnBreak ? "orange" : isOnline ? "green" : "gray"
                        }
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${isOnBreak
                          ? "bg-orange-100"
                          : isOnline
                            ? "bg-green-100"
                            : "bg-slate-100"
                          }`}
                      >
                        <span
                          className={`text-xs font-medium ${isOnBreak
                            ? "text-orange-600"
                            : isOnline
                              ? "text-green-600"
                              : "text-slate-600"
                            }`}
                        >
                          {initial}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900 truncate mb-0">
                          {employee.name || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-slate-500">
                          EMP ID: {employee.employeeId ?? "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
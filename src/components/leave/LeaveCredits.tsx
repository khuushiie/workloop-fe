import { Select as AntSelect } from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useHasPermission } from "../../store/hooks/useRbac";
import { IUserFilterItem } from "../../types/user.api.types";
import {
  LeaveTypesEnum,
  MONTHS,
  TransactionMode,
} from "../../utils/constants";
import { DEBOUNCE_DELAYS, useDebounce } from "../../utils/debounce";
import { capitalizeWords } from "../../utils/nameUtils";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import {
  Button,
  DatePicker,
  Pagination,
  SearchInput,
  Select,
  ConfigurableTable,
} from "../common";
import { TableColumn } from "../common/Table";
import Badge from "../common/Badge";
import CustomButton from "../common/Button";
import FilterWrapper from "../common/FilterWrapper";
import { ModalFooter } from "../common/Modal"; // Removed unused ModalButton
import { TextArea } from "../common/TextArea";
import { LeaveCreditTableSkeleton } from "./Skeleton";

// --- RTK Query Imports ---
import {
  ILeaveCredit,
  ILeaveTransactionRequest,
  ILeaveTransactionType,
  useCreditLeaveMutation,
  useDebitLeaveMutation,
  useGetLeaveTransactionsQuery,
  ILeaveTransaction,
} from "../../store/apis/leaveCredit.api";
import { useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";
import { useGetUsersForFilterQuery } from "../../store/apis/user.api";

const LeaveCredits: React.FC = () => {
  const canManage = useHasPermission(PERMISSIONS.LEAVE_BALANCES_MANAGE);

  // Removed manual credits state, now derived from RTK Query
  const [employees, setEmployees] = useState<IUserFilterItem[]>([]);
  // Removed manual loading states for credits

  const [showModal, setShowModal] = useState(false);
  const [editingCredit, setEditingCredit] = useState<ILeaveCredit | null>(null);

  // RTK Mutations
  const [creditLeave, { isLoading: isCreditSubmitting }] = useCreditLeaveMutation();
  const [debitLeave, { isLoading: isDebitSubmitting }] = useDebitLeaveMutation();

  const submitting = isCreditSubmitting;
  const debitSubmitting = isDebitSubmitting;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAYS.SEARCH);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [creditPage, setCreditPage] = useState(1);
  const [creditLimit, setCreditLimit] = useState(10);

  const skipNextFetch = useRef(false);

  // --- RTK Query Data Fetching ---
  const {
    data: apiResponse,
    isLoading: isTransactionsLoading,
    isFetching: isTransactionsFetching,
  } = useGetLeaveTransactionsQuery({
    page: creditPage,
    limit: creditLimit,
    userName: debouncedSearchTerm,
    year: filterYear,
    month: filterMonth,
    leaveType: filterLeaveType,
  });

  const {
    data: leaveTypesData,
    isLoading: isLeaveTypesLoading,
    isError: isLeaveTypesError
  } = useGetMasterConfigByCategoryQuery("leave_type");

  // Map RTK Data to Component State Structure
  const credits: ILeaveCredit[] = useMemo(() => {
    const rawData: ILeaveTransaction[] = apiResponse?.data?.data ?? [];
    // Explicitly map API items to the UI model
    return rawData.map((item: ILeaveTransaction, index: number): ILeaveCredit => ({
      id: `${item.createdAt}-${index}`, // Maintain unique ID logic
      userId: item.userId,
      userName: item.username,
      leaveType: item.leaveType,
      transactionDate: item.createdAt,
      month: item.month,
      year: item.year,
      days: item.days,
      type: item.type === "credit" ? ILeaveTransactionType.Credited : ILeaveTransactionType.Debited,
      credited: item.type === "credit" ? item.days : 0,
      debited: item.type === "debit" ? item.days : 0,
    }));
  }, [apiResponse]);

  const creditsTotal = apiResponse?.data?.total ?? 0;

  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
    isError: isEmployeesError
  } = useGetUsersForFilterQuery();

  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData);
    }
  }, [employeesData]);

  const formatName = (name: string = "") => {
    return name
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // --- Employee & Filter Fetching (Kept as Manual API calls) ---
  const leaveTypeOptions = React.useMemo(() => {
    if (!leaveTypesData || isLeaveTypesError) return [];

    return leaveTypesData
      .map((f) => ({
        value: f?.id,
        label: f?.displayName || f?.filterCode,
      }))
      .filter((v) => v.value && v.label);
  }, [leaveTypesData, isLeaveTypesError]);

  const isMobile = window.matchMedia("(max-width: 640px)").matches;

  const resetFilters = () => {
    skipNextFetch.current = true;
    setSearchTerm("");
    setFilterYear("");
    setFilterMonth("");
    setFilterLeaveType("");
    setCreditPage(1);
    setCreditLimit(10);
    // RTK Query automatically refetches when state changes
  };

  const resetForm = () => {
    setFormData({
      employeeIds: [],
      leaveType: "",
      days: 0.5,
      reason: "",
      month: currentMonth,
      year: currentYear,
    });
    setTransactionMode(TransactionMode.CREDIT);
  };

  const handleManageBalance = () => {
    setEditingCredit(null);
    resetForm();
    setTransactionMode(TransactionMode.CREDIT);
    setShowModal(true);
  };

  const [formData, setFormData] = useState({
    employeeIds: [] as string[],
    leaveType: "" as LeaveTypesEnum | "",
    days: 0.5 as number | string,
    reason: "",
    month: currentMonth as number | null,
    year: currentYear as number | null,
  });
  const [transactionMode, setTransactionMode] = useState<TransactionMode>(
    TransactionMode.CREDIT,
  );

  const yearOptions = [
    { value: "", label: "All Years" },
    ...Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => ({
      value: String(year),
      label: String(year),
    })),
  ];

  const monthOptions = [
    { value: "", label: "All Months" },
    ...MONTHS.map((month) => ({
      value: month.value,
      label: month.label,
    })),
  ];

  const handleCredit = async () => {
    const daysValue =
      typeof formData.days === "string"
        ? Number.parseFloat(formData.days) || 0
        : formData.days;

    if (
      formData.employeeIds.length === 0 ||
      !formData.leaveType ||
      daysValue < 0.5 ||
      formData.days === "" ||
      !formData.month ||
      !formData.year
    ) {
      toast.error("Please fill in all required fields with valid values.");
      return;
    }

    if (daysValue % 0.5 !== 0) {
      toast.error(
        "Days must be in increments of 0.5 (e.g., 0.5, 1.0, 1.5, 2.0, 2.5).",
      );
      return;
    }

    const daysStr = daysValue.toString();
    if (daysStr.includes(".")) {
      const decimalPart = daysStr.split(".")[1];
      if (decimalPart && decimalPart.length > 1) {
        toast.error(
          "Days should have only one decimal place (e.g., 2.5, not 2.55).",
        );
        return;
      }
    }

    try {
      const payloadBase: ILeaveTransactionRequest = {
        userIds: formData.employeeIds, // Send all IDs at once
        leaveType: formData.leaveType,
        credited: daysValue, // DTO requires 'credited'
        month: formData.month,
        year: formData.year,
        reason: formData.reason,
        creditedOn: new Date().toISOString(), // Optional
      };

      await creditLeave(payloadBase).unwrap();
      toast.success(
        `${formData.employeeIds.length} Leave balance credited successfully!`,
      );
      resetFilters();
      setCreditPage(1); // Reset to page 1 to see new data
      setShowModal(false);
    } catch (err: any) {
      console.error("Error crediting leave balance:", err);
      const message = err?.data?.message || err?.message || "Failed to credit leave balance.";
      toast.error(message);
    }
  };

  const handleDebit = async () => {
    const daysValue =
      typeof formData.days === "string"
        ? Number.parseFloat(formData.days) || 0
        : formData.days;

    if (
      formData.employeeIds.length === 0 ||
      !formData.leaveType ||
      !daysValue ||
      daysValue < 0.5 ||
      formData.days === "" ||
      !formData.month ||
      !formData.year
    ) {
      toast.error(
        "Please fill in all required fields with valid values.",
      );
      return;
    }

    if (daysValue % 0.5 !== 0) {
      toast.error("Days must be in increments of 0.5");
      return;
    }

    const daysStr = daysValue.toString();
    if (daysStr.includes(".")) {
      const decimalPart = daysStr.split(".")[1];
      if (decimalPart && decimalPart.length > 1) {
        toast.error(
          "Days should have only one decimal place (e.g., 2.5, not 2.55).",
        );
        return;
      }
    }

    try {
      const payloadBase: ILeaveTransactionRequest = {
        userIds: formData.employeeIds, // Send all IDs at once
        leaveType: formData.leaveType,
        debited: daysValue,
        month: formData.month,
        year: formData.year,
        reason: formData.reason,
        debitedOn: new Date().toISOString(),
      };

      await debitLeave(payloadBase).unwrap();
      toast.success(
        `${formData.employeeIds.length} Leave balance debited successfully!`,
      );
      resetFilters();
      setCreditPage(1);
      setShowModal(false);
    } catch (err: any) {
      console.error("Error debiting leave balance:", err);
      const message = err?.data?.message || err?.message || "Failed to debit leave balance.";
      toast.error(message);
    }
  };

  const handleClearAll = () => {
    setFormData({
      ...formData,
      employeeIds: [],
      leaveType: "",
      month: null,
      year: null,
      days: "",
      reason: "",
    });
    setTransactionMode(TransactionMode.CREDIT);
  };

  const currentDaysValue = typeof formData.days === "string"
    ? Number.parseFloat(formData.days) || 0
    : formData.days;
  const isDaysLimitExceeded = currentDaysValue > 365;

  const leaveCreditColumns: TableColumn<ILeaveCredit>[] = useMemo(() => [
    {
      key: "employee",
      title: "EMPLOYEE",
      label: "Employee",
      required: true,
      render: (_, r) => (
        <span className="flex items-center space-x-3">
          <span className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">
              {r?.userName?.charAt(0).toUpperCase() || "U"}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <p
              className="text-sm inline font-medium text-slate-900 truncate mb-0"
            >
              {r?.userName ?? 'Unknown'}
            </p>
          </span>
        </span>
      ),
    },
    {
      key: "leave_type",
      title: "LEAVE TYPE",
      label: "Leave Type",
      render: (_, r) => {
        const matchedConfig = leaveTypesData?.find(
          (type: any) => type.id === r.leaveType || type.filterCode === r.leaveType
        );
        const label = matchedConfig?.displayName || r.leaveType || "-";
        return (
          <Badge variant="blue" size="middle">
            {label}
          </Badge>
        );
      },
    },
    {
      key: "dates",
      title: "MONTH/YEAR",
      label: "Month/Year",
      render: (_, r) =>
        r.month && r.year
          ? `${MONTHS[r.month - 1]?.label || ""} ${r.year}`
          : "N/A",
    },
    {
      key: "type",
      title: "TYPE",
      label: "Type",
      render: (_, r) => capitalizeWords(r.type || ILeaveTransactionType.Credited),
    },
    {
      key: "days",
      title: "DAYS",
      label: "Days",
      align: "left",
      render: (_, r) => {
        const days =
          typeof r.days === "number"
            ? r.days
            : r.type === ILeaveTransactionType.Debited
              ? (r.debited ?? 0)
              : (r.credited ?? 0);
        const sign = r.type === ILeaveTransactionType.Debited ? -1 : 1;
        const value = sign * days;
        return (
          <span className="font-medium">{value}</span>
        );
      },
    },
    {
      key: "transaction_date",
      title: "DATE",
      label: "Date",
      render: (_, r) => r.transactionDate ? dayjs(r.transactionDate).format("DD/MM/YYYY") : "-",
    },
  ], [leaveTypesData]);

  return (
    <div className="p-6">
      <div className="flex max-[830px]:flex-col items-start sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Leave Balance
          </h1>
        </div>
        {canManage && (
          <Button
            appearance="primary"
            size="large"
            onClick={handleManageBalance}
          >
            <span>Manage Balance</span>
          </Button>
        )}
      </div>

      <FilterWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Search
            </label>
            <SearchInput
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(newValue) => setSearchTerm(newValue)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Month
            </label>
            <Select
              options={monthOptions}
              value={filterMonth}
              onChange={(value: any) => setFilterMonth(value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Year
            </label>
            <Select
              options={yearOptions}
              value={filterYear}
              onChange={(value: any) => setFilterYear(value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Type
            </label>
            <Select
              value={filterLeaveType}
              onChange={(value: any) => setFilterLeaveType(value)}
              options={[
                { value: "", label: "All Leave Types" },
                ...leaveTypeOptions.map((type) => ({
                  value: type.value,
                  label: type.label,
                })),
              ]}
            />
          </div>
        </div>
      </FilterWrapper>

      {isTransactionsLoading || isTransactionsFetching ? (
        <LeaveCreditTableSkeleton />
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-soft border border-slate-200 overflow-hidden">
            <ConfigurableTable
              columns={leaveCreditColumns}
              data={credits}
              loading={isTransactionsLoading || isTransactionsFetching}
              emptyMessage="No Credited leaves found"
              rowKey={(leaveCredit: ILeaveCredit) => leaveCredit.id}
              spacing={0}
              configOptions={{ persistenceKey: "leave-credits-table" }}
              renderColumnSelector={(selector) => (
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Leave Transactions</h3>
                  <div className="flex items-center gap-2">
                    {selector}
                  </div>
                </div>
              )}
            />
          </div>

          {isTransactionsLoading || isTransactionsFetching ? (
            ""
          ) : (
            <div className="mt-4">
              <Pagination
                currentPage={creditPage}
                totalItems={creditsTotal}
                itemsPerPage={creditLimit}
                onPageChange={(c) => {
                  setCreditPage(c);
                }}
                onItemsPerPageChange={(l) => {
                  setCreditLimit(l);
                  setCreditPage(1);
                }}
              />
            </div>
          )}
        </>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Manage Leave Balance</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between space-x-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Employee(s) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2 mb-1">
                    <CustomButton
                      size="small"
                      appearance="link"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          employeeIds: employees.map((emp) => emp?.id),
                        })
                      }
                    >
                      Select All
                    </CustomButton>
                    <CustomButton
                      size="small"
                      appearance="link"
                      onClick={handleClearAll}
                    >
                      Clear All
                    </CustomButton>
                  </div>
                </div>

                <AntSelect
                  mode="multiple"
                  placeholder="Select employees"
                  showSearch
                  filterOption={(input: string, option: any) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: "100%" }}
                  value={formData.employeeIds}
                  onChange={(selected) =>
                    setFormData({ ...formData, employeeIds: selected })
                  }
                  disabled={!!editingCredit}
                  options={[...employees]
                    .sort((a, b) => {
                      const nameA = `${a?.fullName ?? ""}`.toLowerCase();
                      const nameB = `${b?.fullName ?? ""}`.toLowerCase();
                      return nameA.localeCompare(nameB);
                    })
                    .map((employee) => ({
                      value: employee?.id,
                      label: capitalizeWords(employee?.fullName ?? ""),
                    }))}
                  listHeight={200}
                  maxTagCount="responsive"
                  maxTagTextLength={20}
                />
                {formData?.employeeIds?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-primary-600">
                      {formData?.employeeIds?.length} employee(s) selected
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Select
                  label="Leave Type"
                  value={formData.leaveType}
                  loading={isLeaveTypesLoading}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      leaveType: value as LeaveTypesEnum,
                    })
                  }
                  options={leaveTypeOptions.map((type) => ({
                    value: type.value,
                    label: type.label,
                  }))}
                  placeholder="Select Leave Type"
                  required
                  disabled={!!editingCredit}
                />
              </div>

              <div>
                <DatePicker
                  label="Month & Year"
                  allowClear={!isMobile}
                  required
                  picker="month"
                  format="MMMM YYYY"
                  value={
                    formData.month && formData.year
                      ? dayjs()
                        .year(formData.year)
                        .month(formData.month - 1)
                      : null
                  }
                  onChange={(date: Dayjs | null) => {
                    if (date) {
                      setFormData({
                        ...formData,
                        month: date.month() + 1, // dayjs month is 0-indexed
                        year: date.year(),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        month: null,
                        year: null,
                      });
                    }
                  }}
                  placeholder="Select month and year"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Mode <span className="text-red-500">*</span>
                </label>

                <div className="flex items-center space-x-4">
                  <span
                    className={`text-sm font-medium ${transactionMode === TransactionMode.CREDIT
                      ? "text-primary-600"
                      : "text-slate-500"
                      }`}
                  >
                    Credit
                  </span>

                  {/* Single Toggle */}
                  <div
                    role="switch"
                    onClick={() =>
                      setTransactionMode(
                        transactionMode === TransactionMode.CREDIT
                          ? TransactionMode.DEBIT
                          : TransactionMode.CREDIT,
                      )
                    }
                    className={`relative h-6 w-11 min-w-[44px] cursor-pointer rounded-full transition-colors ${transactionMode === TransactionMode.CREDIT
                      ? "bg-primary-600"
                      : "bg-red-600"
                      }`}
                  >
                    <span
                      className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${transactionMode === TransactionMode.DEBIT
                        ? "translate-x-5"
                        : "translate-x-0"
                        }`}
                    />
                  </div>

                  <span
                    className={`text-sm font-medium ${transactionMode === TransactionMode.DEBIT
                      ? "text-red-600"
                      : "text-slate-500"
                      }`}
                  >
                    Debit
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="days"
                  value={formData.days}
                  max="365"
                  onChange={(e) => {
                    const inputValue = e.target.value;

                    // Allow empty input - keep it as empty string so user can type
                    if (inputValue === "") {
                      setFormData({
                        ...formData,
                        days: "",
                      });
                      return;
                    }

                    // Check if input matches single decimal place pattern
                    // Allows: 1, 1.5, 12, 12.5, but not 1.55, 1.555, etc.
                    const singleDecimalRegex = /^\d+(\.\d)?$/;

                    if (singleDecimalRegex.test(inputValue)) {
                      const value = Number.parseFloat(inputValue);
                      if (!Number.isNaN(value) && value >= 0) {
                        if (value % 0.5 === 0) {
                          setFormData({
                            ...formData,
                            days: value,
                          });
                        }
                      }
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${isDaysLimitExceeded
                      ? "border-red-500 focus:ring-red-500"
                      : "border-slate-300 focus:ring-primary-500"
                    }`}
                  placeholder="Enter days (e.g., 2.5)"
                  min="0.5"
                  step="0.5"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;

                    if (value.includes(".")) {
                      const parts = value.split(".");
                      if (parts[1]?.length > 1) {
                        target.value = parts[0] + "." + parts[1].charAt(0);
                      }

                      if (
                        parts[1]?.length === 1 &&
                        parts[1] !== "0" &&
                        parts[1] !== "5"
                      ) {
                        target.value = parts[0] + ".5";
                      }

                      const correctedValue = Number.parseFloat(target.value);
                      if (
                        !Number.isNaN(correctedValue) &&
                        correctedValue % 0.5 === 0
                      ) {
                        setFormData({
                          ...formData,
                          days: correctedValue,
                        });
                      }
                    }
                  }}
                  required
                />
                {isDaysLimitExceeded ? (
                  <p className="mt-1 text-sm font-medium text-red-600">
                    Leave days cannot exceed 365.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    Must be in increment/decrement of 0.5 (e.g., 0.5, 1.0, 1.5, 2.0, 2.5)
                  </p>
                )}
              </div>

              <div>
                <TextArea
                  label="Reason"
                  value={formData.reason}
                  onChange={(value) =>
                    setFormData({ ...formData, reason: value })
                  }
                  placeholder="Optional reason"
                />
              </div>
            </div>

            <ModalFooter className="flex justify-end space-x-1 mt-4">
              <Button
                appearance="secondary"
                onClick={() => setShowModal(false)}
                disabled={submitting || debitSubmitting}
              >
                Cancel
              </Button>
              {!editingCredit?.id && (
                <Button
                  appearance="primary"
                  onClick={() => {
                    if (transactionMode === TransactionMode.CREDIT) {
                      handleCredit();
                    } else {
                      handleDebit();
                    }
                  }}
                  loading={submitting || debitSubmitting}
                  disabled={submitting || debitSubmitting || isDaysLimitExceeded}
                >
                  Save
                </Button>
              )}
            </ModalFooter>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCredits;
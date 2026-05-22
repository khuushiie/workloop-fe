import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTimezone } from "../../hooks/useTimezone";
import { Button, ConfigurableTable } from "../common";
import Pagination from "../common/Pagination";
import { RegularizationTableSkeleton } from "./Skeleton";
import {
  AccordionSection,
  FiltersBar,
  getHistoryColumns,
  getPendingColumns,
  getRegularizationTypeLabel,
  RejectModal,
  RequestDetailsModal,
  useRegularizationManagement,
  ViewModeTabs,
} from "./regularization-management";

interface RegularizationManagementProps {
  isManagerView?: boolean;
  title?: string;
}

const RegularizationManagement: React.FC<RegularizationManagementProps> = ({
  title = "Regularization Management",
}) => {
  const { formatDate, formatTime } = useTimezone();

  const {
    // User info
    isAdmin,

    // Accordion
    activeAccordion,
    toggleAccordion,

    // Pending Logic
    pendingPage,
    setPendingPage,
    pendingLimit,
    setPendingLimit,
    pendingRequests,
    pendingLoading,
    pendingTotal,
    pendingViewMode,
    setPendingViewMode,
    pendingFilters,
    setPendingFilters,
    handlePendingFilterChange,

    // History Logic
    historyRequests,
    historyLoading,
    historyPage,
    setHistoryPage,
    historyLimit,
    setHistoryLimit,
    historyTotal,
    historyFilters,
    setHistoryFilters,
    historyViewMode,
    setHistoryViewMode,
    handleHistoryFilterChange, // New handler from hook

    // Shared Data
    departments,
    regularizationTypeOptions,

    // Modals & Action State
    selectedRequest,
    showDetailsModal,
    setShowDetailsModal,
    showRejectModal,
    setShowRejectModal,
    showRejectAllModal,
    setShowRejectAllModal,
    rejectReason,
    setRejectReason,

    processing,
    loadingApprove,
    loadingReject,

    // Action Handlers
    handleViewDetails,
    handleApproveClick,
    handleRejectClick,
    handleRejectAll,
    handleModalAllReject,
    handleModalReject,
    canActOnRequest,
    selectedIds,
    setSelectedIds,
    getStatusColor,
    handleApproveAll,
  } = useRegularizationManagement();

  // Slots for portaling each table's "Columns" selector into its accordion header row.
  // We use callback refs (state) so the portal re-renders once the slot DOM node mounts.
  const [pendingColumnsSlot, setPendingColumnsSlot] =
    useState<HTMLDivElement | null>(null);
  const [historyColumnsSlot, setHistoryColumnsSlot] =
    useState<HTMLDivElement | null>(null);

  // --- Columns Configuration ---
  const pendingColumns = getPendingColumns({
    formatDate,
    formatTime,
    getRegularizationTypeLabel,
    getStatusColor,
    handleViewDetails,
    handleApproveClick,
    handleRejectClick,
    canActOnRequest,
    selectedIds,
    setSelectedIds,
    processing,
    data: pendingRequests,
  });

  const historyColumns = getHistoryColumns({
    formatDate,
    formatTime,
    getRegularizationTypeLabel,
    getStatusColor,
    handleViewDetails,
  });

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{title}</h1>
      </div>

      {/* Pending Requests Accordion */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200">
        {/*
          Header is a flex row instead of a single <button> so the "Columns"
          dropdown (rendered via portal into pendingColumnsSlot) can sit on
          the same line as the title without nesting interactive elements.
        */}
        <div className="w-full px-4 py-3 border-b flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex-1 text-left text-xl font-bold text-slate-900"
            onClick={() => toggleAccordion(AccordionSection.PENDING)}
            aria-expanded={activeAccordion === AccordionSection.PENDING}
          >
            Pending Requests ({pendingTotal})
          </button>
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/*
              z-30 keeps the portaled ColumnSelector dropdown beneath the
              app navbar (z-40) while remaining above page/table content.
            */}
            <div ref={setPendingColumnsSlot} className="relative z-30" />
            <button
              type="button"
              className="p-1 -mr-1 text-slate-700"
              onClick={() => toggleAccordion(AccordionSection.PENDING)}
              aria-label={
                activeAccordion === AccordionSection.PENDING
                  ? "Collapse pending requests"
                  : "Expand pending requests"
              }
            >
              {activeAccordion === AccordionSection.PENDING ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {activeAccordion === AccordionSection.PENDING && (
          <div className="px-6 py-4">
            <ConfigurableTable
              columns={pendingColumns}
              data={pendingRequests}
              loading={pendingLoading}
              skeleton={<RegularizationTableSkeleton />}
              emptyMessage="No pending requests found"
              rowKey="id"
              maxHeight="90vh"
              configOptions={{ persistenceKey: "attendance-regularization-pending" }}
              renderColumnSelector={(selector) => (
                <>
                  {/* Teleport the Columns dropdown into the accordion header row */}
                  {pendingColumnsSlot && createPortal(selector, pendingColumnsSlot)}

                  {(isAdmin || selectedIds.length > 0) && (
                    <div
                      className={`flex ${isAdmin ? "justify-between" : "justify-end"} items-center mb-4`}
                    >
                      {isAdmin && (
                        <ViewModeTabs
                          viewMode={pendingViewMode}
                          setViewMode={setPendingViewMode}
                          setPage={setPendingPage}
                        />
                      )}

                      {selectedIds.length > 0 && (
                        <div className="flex gap-2 items-center transition-all duration-300">
                          <Button
                            onClick={() => handleApproveAll(selectedIds)}
                            appearance="primary"
                            size="middle"
                            loading={loadingApprove}
                          >
                            {loadingApprove ? "Approving..." : "Approve All"}
                          </Button>
                          <Button
                            onClick={() => handleRejectAll(selectedIds)}
                            appearance="danger"
                            size="middle"
                            loading={loadingReject}
                          >
                            {loadingReject ? "Rejecting..." : "Reject All"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <FiltersBar
                    setFilters={setPendingFilters}
                    setPage={setPendingPage}
                    searchTerm={pendingFilters.search as string}
                    onSearchChange={(value) =>
                      handlePendingFilterChange("search", value)
                    }
                    filters={pendingFilters}
                    onFilterChange={handlePendingFilterChange}
                    regularizationTypeOptions={regularizationTypeOptions}
                    departments={departments}
                  />
                </>
              )}
            />
            <div className="mt-4">
              <Pagination
                currentPage={pendingPage}
                totalItems={pendingTotal}
                itemsPerPage={pendingLimit}
                onPageChange={setPendingPage}
                onItemsPerPageChange={(l) => {
                  setPendingLimit(l);
                  setPendingPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* History Accordion */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200 mt-6">
        <div className="w-full p-4 border-b flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex-1 text-left text-xl font-bold text-slate-900"
            onClick={() => toggleAccordion(AccordionSection.HISTORY)}
            aria-expanded={activeAccordion === AccordionSection.HISTORY}
          >
            Approval History ({historyTotal})
          </button>
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={setHistoryColumnsSlot} className="relative z-30" />
            <button
              type="button"
              className="p-1 -mr-1 text-slate-700"
              onClick={() => toggleAccordion(AccordionSection.HISTORY)}
              aria-label={
                activeAccordion === AccordionSection.HISTORY
                  ? "Collapse approval history"
                  : "Expand approval history"
              }
            >
              {activeAccordion === AccordionSection.HISTORY ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {activeAccordion === AccordionSection.HISTORY && (
          <div className="px-6 py-4">
            <ConfigurableTable
              columns={historyColumns}
              data={historyRequests}
              loading={historyLoading}
              skeleton={<RegularizationTableSkeleton />}
              emptyMessage="No historical requests found"
              rowKey="id"
              maxHeight="90vh"
              configOptions={{ persistenceKey: "attendance-regularization-history" }}
              renderColumnSelector={(selector) => (
                <>
                  {/* Teleport the Columns dropdown into the accordion header row */}
                  {historyColumnsSlot && createPortal(selector, historyColumnsSlot)}

                  {isAdmin && (
                    <div className="flex justify-between items-center mb-4">
                      <ViewModeTabs
                        viewMode={historyViewMode}
                        setViewMode={setHistoryViewMode}
                        setPage={setHistoryPage}
                      />
                    </div>
                  )}

                  <FiltersBar
                    setFilters={setHistoryFilters}
                    setPage={setHistoryPage}
                    searchTerm={historyFilters.search as string}
                    onSearchChange={(value) => handleHistoryFilterChange("search", value)}
                    filters={historyFilters}
                    onFilterChange={handleHistoryFilterChange}
                    regularizationTypeOptions={regularizationTypeOptions}
                    departments={departments}
                  />
                </>
              )}
            />
            <div className="mt-4">
              <Pagination
                currentPage={historyPage}
                totalItems={historyTotal}
                itemsPerPage={historyLimit}
                onPageChange={setHistoryPage}
                onItemsPerPageChange={(l) => {
                  setHistoryLimit(l);
                  setHistoryPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedRequest && (
        <>
          <RequestDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            request={selectedRequest}
            formatDate={formatDate}
            formatTime={formatTime}
            getRegularizationTypeLabel={getRegularizationTypeLabel}
            getStatusColor={getStatusColor}
          />
          <RejectModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            request={selectedRequest}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            onReject={handleModalReject}
            processing={processing}
            formatDate={formatDate}
          />
        </>
      )}

      <RejectModal
        isOpen={showRejectAllModal}
        onClose={() => setShowRejectAllModal(false)}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onReject={handleModalAllReject}
        processing={processing}
        loading={loadingReject}
        formatDate={formatDate}
      />
    </div>
  );
};

export default RegularizationManagement;
import React, { useCallback } from "react";
import { useState } from "react";
import { CheckCircle, SquarePen, Trash2, X, XCircle } from "lucide-react";
import { ConfirmationModal, Table } from "../../common";
import KpiFormModal, { type KpiData } from "./KpiFormModal";
import toast from "react-hot-toast";
import SimpleTooltip from "../../common/SimpleTooltip";
import { TableColumn } from "../../common/Table";
import Button from "../../common/Button";
import Badge from "../../common/Badge";
import { useUpdateKpiMutation, useDeleteKpiMutation } from "../../../store/apis/kpi.api";
import type { IKpiResponseV2, IUpdateKpiBodyV2 } from "../../../types/kpi.api.types";

interface KpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpis: IKpiResponseV2[];
  onRefresh: () => Promise<void>;
  canManage?: boolean;
  isLoading?: boolean;
}

interface DeleteModalState {
  open: boolean;
  record: IKpiResponseV2 | null;
}

interface ApiError {
  response?: { data?: { message?: string } };
  data?: { message?: string };
  message?: string;
}

const KpiModal: React.FC<KpiModalProps> = ({
  isOpen,
  onClose,
  kpis,
  onRefresh,
  canManage = false,
  isLoading = false,
}) => {
  const [updateKpi] = useUpdateKpiMutation();
  const [deleteKpi] = useDeleteKpiMutation();
  const [editingKpi, setEditingKpi] = useState<IKpiResponseV2 | null>(null);

  const [deleteKpiModal, setDeleteKpiModal] = useState<DeleteModalState>({
    open: false,
    record: null,
  });

  const columns: TableColumn<IKpiResponseV2>[] = [
    {
      key: "name",
      title: "KPI Name",
      dataIndex: "name",
      render: (value: string) => (
        <SimpleTooltip label={value} side="top">
          <span className="font-medium text-slate-900 max-w-[200px] block overflow-hidden text-ellipsis whitespace-nowrap">{value}</span>
        </SimpleTooltip>
      ),
    },
    {
      key: "code",
      title: "Code",
      dataIndex: "code",
      render: (value: string) => (
        <div className="flex items-start justify-start w-[150px]">
          <SimpleTooltip label={value} side="top">
            <span className="text-slate-600 max-w-[150px] block overflow-hidden text-ellipsis whitespace-nowrap ">
              {value}
            </span>
          </SimpleTooltip>
        </div>
      ),
    },
    {
      key: "description",
      title: "Description",
      dataIndex: "description",
      render: (value: string) => (
        <div className="flex items-center w-[250px] ">
          <SimpleTooltip label={value} side="top">
            <span className="text-slate-600 max-w-[250px] block overflow-hidden text-ellipsis whitespace-nowrap">
              {value || "-"}
            </span>
          </SimpleTooltip>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      dataIndex: "category",
      render: (value: string) => (
        <span className="text-slate-600">{value || "-"}</span>
      ),
    },
    {
      key: "Status",
      title: "Status",
      dataIndex: "isActive",
      render: (value: boolean) => {
        return (
         
        <>
            {value ? (
              <Badge size="middle" variant="green" icon={<CheckCircle className="w-4 h-4 text-green-500" />}> 
                Active
              </Badge>
            ) : (
              <Badge size="middle" variant="red" icon={<XCircle className="w-4 h-4 text-red-500" />}>
                Inactive
              </Badge>
            )}
            </>
        );
      },
    },
    ...(canManage
      ? [
          {
            key: "actions",
            title: "Actions",
            render: (_value: unknown, record: IKpiResponseV2) => {
              return (
                <div className="flex gap-2 justify-center">
                 
                  <SimpleTooltip
                    label="Edit"
                    side="top"
                    className="inline-block"
                    tooltipClassName="text-xs shadow-soft border-0"
                  >
                    <button
                      aria-label="Edit"
                      onClick={() => setEditingKpi(record)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <SquarePen className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </SimpleTooltip>

                 
                  <SimpleTooltip
                    label="Delete"
                    side="top"
                    className="inline-block"
                    tooltipClassName=" text-xs shadow-soft border-0"
                  >
                    <button
                      onClick={() => {
                        handleDeleteKpiModal(record);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </SimpleTooltip>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  const handleDeleteKpiModal = useCallback((record: IKpiResponseV2) => {
    setDeleteKpiModal({ open: true, record });
  }, []);

  const handleDeleteKpi = async (record: IKpiResponseV2): Promise<void> => {
    if (!record.id) {
      toast.error("Invalid KPI record: Missing ID");
      return;
    }

    try {
      const result = await deleteKpi(record.id).unwrap();
      toast.success(result.message);
      setDeleteKpiModal({ open: false, record: null });
      await onRefresh?.();
    } catch (error: unknown) {
      console.error("Error deleting KPI:", error);
      const err = error as ApiError;
      const message =
        err?.data?.message ??
        err?.response?.data?.message ??
        err?.message ??
        "An unexpected error occurred while deleting KPI.";
      toast.error(message);
    }
  };

  const handleEditKpiSuccess = useCallback(
    async (data: KpiData) => {
      const id = editingKpi?.id;
      if (!id) {
        toast.error("Invalid KPI: missing ID");
        return;
      }
      const body: IUpdateKpiBodyV2 = {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        isActive: data.isActive ?? editingKpi?.isActive,
      };
      try {
        await updateKpi({ id: String(id), body }).unwrap();
        toast.success("KPI updated successfully");
        setEditingKpi(null);
        await onRefresh();
      } catch (err: unknown) {
        console.error("Failed to update KPI:", err);
        const e = err as ApiError;
        toast.error(e?.data?.message ?? "Failed to update KPI");
      }
    },
    [editingKpi, updateKpi, onRefresh]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ marginTop: 0 }}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">All KPIs</h2>
          <Button
            htmlType="button"
            appearance="secondary"
            onClick={onClose}
            className="p-0 text-slate-500 hover:text-slate-700"
            icon={<X className="w-6 h-6" />}
          />
        </div>

        <div className="flex-1 p-4">
          <Table
            loading={isLoading}
            columns={columns}
            data={kpis}
            emptyMessage="No KPIs found. Create your first KPI to get started."
            maxHeight="60vh"
            stickyHeader
          />
        </div>

        <div className="flex justify-end p-4 border-t border-slate-200">
          <Button
            htmlType="button"
            appearance="primary"
            size="middle"
            onClick={onClose}
            className="px-4 py-2"
          >
            Close
          </Button>
        </div>
      </div>

      <KpiFormModal
        isOpen={!!editingKpi}
        onClose={() => setEditingKpi(null)}
        onSubmit={handleEditKpiSuccess}
        initialData={
          editingKpi
            ? {
                code: editingKpi.code,
                name: editingKpi.name,
                description: editingKpi.description ?? "",
                info: "",
                category: editingKpi.category ?? "",
                id: editingKpi.id,
                isActive: editingKpi.isActive,
              }
            : null
        }
      />

      <ConfirmationModal
        isOpen={deleteKpiModal.open}
        onClose={() => setDeleteKpiModal({ open: false, record: null})}
        onConfirm={() => {
          if (deleteKpiModal?.record) {
            handleDeleteKpi(deleteKpiModal.record);
          }
        }}
        type="danger"
        title="Delete Kpi"
        message="Are you sure you want to delete this Kpi?"
      />

    </div>
  );
};

export default KpiModal;

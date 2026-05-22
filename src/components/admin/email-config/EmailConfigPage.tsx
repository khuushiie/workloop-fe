import { useState, useMemo, useCallback } from "react";
import {
  Mail,
  Settings,
  CheckCircle2,
  XCircle,
  SquarePen,
  RotateCcw,
  Save,
  Layers,
  CheckSquare,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetEmailConfigsQuery,
  useUpsertEmailConfigMutation,
  useDeleteEmailConfigMutation,
  IEmailConfigResponse,
} from "../../../store/apis/emailConfig.api";
import { useGetEmailTemplatesQuery } from "../../../store/apis/emailTemplate.api";
import {
  Button,
  Modal,
  Toggle,
  Loading,
  SearchInput,
  Select,
  Input,
  SimpleTooltip,
  ConfirmationModal,
} from "../../common";
import Table, { TableColumn } from "../../common/Table";

function getTemplateName(config: IEmailConfigResponse): string {
  if (!config.templateId) return "Default (built-in)";
  if (typeof config.templateId === "object" && "name" in config.templateId) {
    return config.templateId.name;
  }
  return "Linked template";
}

function getTemplateId(config: IEmailConfigResponse): string | null {
  if (!config.templateId) return null;
  if (typeof config.templateId === "object" && "_id" in config.templateId) {
    return config.templateId._id;
  }
  if (typeof config.templateId === "string") return config.templateId;
  return null;
}

const EmailConfigSkeleton = () => (
  <div className="p-6 bg-slate-50 min-h-screen animate-pulse">
    <div className="max-w-full mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-9 w-48 bg-slate-200 rounded-md"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-100 rounded"></div>
                <div className="h-8 w-16 bg-slate-200 rounded-md"></div>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Area Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div className="h-10 w-64 bg-slate-100 rounded-lg"></div>
          <div className="h-10 w-24 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="p-5 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 py-1">
              <div className="h-12 w-12 bg-slate-100 rounded-lg shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                <div className="h-3 w-1/3 bg-slate-100 rounded"></div>
              </div>
              <div className="hidden sm:block h-6 w-32 bg-slate-100 rounded-lg"></div>
              <div className="h-8 w-20 bg-slate-100 rounded-lg ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function EmailConfigPage() {
  const { data: configs = [], isLoading } = useGetEmailConfigsQuery();
  const { data: templates = [] } = useGetEmailTemplatesQuery();
  const [upsert, { isLoading: isSaving }] = useUpsertEmailConfigMutation();
  const [deleteConfig, { isLoading: isDeleting }] =
    useDeleteEmailConfigMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editingType, setEditingType] = useState<string | null>(null);
  const [formTemplateId, setFormTemplateId] = useState<string>("");
  const [formSubjectOverride, setFormSubjectOverride] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [resetConfirm, setResetConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = configs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.templateType.toLowerCase().includes(q) ||
          c.label.toLowerCase().includes(q),
      );
    }
    if (statusFilter === "active") {
      result = result.filter((c) => c.isActive);
    } else if (statusFilter === "inactive") {
      result = result.filter((c) => !c.isActive);
    } else if (statusFilter === "configured") {
      result = result.filter((c) => c.templateId);
    } else if (statusFilter === "default") {
      result = result.filter((c) => !c.templateId);
    }
    return result;
  }, [configs, search, statusFilter]);

  const activeCount = useMemo(
    () => configs.filter((c) => c.isActive).length,
    [configs],
  );
  const configuredCount = useMemo(
    () => configs.filter((c) => c.templateId).length,
    [configs],
  );

  const openEditor = useCallback((config: IEmailConfigResponse) => {
    setEditingType(config.templateType);
    setFormTemplateId(getTemplateId(config) ?? "");
    setFormSubjectOverride(config.subjectOverride ?? "");
    setFormIsActive(config.isActive);
  }, []);

  const closeEditor = useCallback(() => {
    setEditingType(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingType) return;
    try {
      await upsert({
        templateType: editingType,
        templateId: formTemplateId || null,
        isActive: formIsActive,
        subjectOverride: formSubjectOverride,
      }).unwrap();
      toast.success("Email config saved");
      closeEditor();
    } catch {
      toast.error("Failed to save email config");
    }
  }, [
    editingType,
    formTemplateId,
    formIsActive,
    formSubjectOverride,
    upsert,
    closeEditor,
  ]);

  const handleResetConfirm = useCallback(async () => {
    if (!resetConfirm) return;
    try {
      await deleteConfig(resetConfirm).unwrap();
      toast.success("Reset to default");
      setResetConfirm(null);
    } catch {
      toast.error("Failed to reset config");
    }
  }, [deleteConfig, resetConfirm]);

  const editingConfig = useMemo(
    () => configs.find((c) => c.templateType === editingType),
    [configs, editingType],
  );

  const templateOptions = useMemo(
    () => [
      { value: "", label: "Default (built-in .hbs)" },
      ...templates.map((tpl) => ({
        value: tpl._id,
        label: tpl.name + (tpl.subject ? ` — ${tpl.subject}` : ""),
      })),
    ],
    [templates],
  );

  const statusOptions = [
    { value: "", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "configured", label: "Configured" },
    { value: "default", label: "Default" },
  ];

  const columns: TableColumn<IEmailConfigResponse>[] = useMemo(
    () => [
      {
        key: "label",
        title: "Template Type",
        width: 300,
        required: true,
        truncate: false,
        render: (_: unknown, config: IEmailConfigResponse) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <p className="text-md font-medium text-slate-900 my-1">
                {config.label}
              </p>
              <p className="text-sm text-slate-400 font-mono mb-2">
                {config.templateType}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "template",
        title: "Assigned Template",
        width: 220,
        render: (_: unknown, config: IEmailConfigResponse) => (
          <span className="text-sm text-slate-600">
            {getTemplateName(config)}
          </span>
        ),
      },
      {
        key: "status",
        title: "Status",
        width: 120,
        align: "center" as const,
        render: (_: unknown, config: IEmailConfigResponse) =>
          config.templateId ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
              <CheckCircle2 className="h-3 w-3" />
              Custom
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              Default
            </span>
          ),
      },
      {
        key: "active",
        title: "Active",
        width: 90,
        align: "center" as const,
        render: (_: unknown, config: IEmailConfigResponse) =>
          config.isActive ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              On
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
              <XCircle className="h-3.5 w-3.5" />
              Off
            </span>
          ),
      },
      {
        key: "actions",
        title: "Actions",
        width: 120,
        align: "center" as const,
        truncate: false,
        render: (_: unknown, config: IEmailConfigResponse) => (
          <div className="flex justify-center gap-2">
            <SimpleTooltip
              label="Edit"
              side="top"
              className="inline-block"
              tooltipClassName="text-xs shadow-soft border-0"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openEditor(config);
                }}
                className="text-primary-600 hover:text-primary-800 transition-colors"
              >
                <SquarePen className="w-4 h-4" />
              </button>
            </SimpleTooltip>
            {config.templateId && (
              <SimpleTooltip
                label="Reset to Default"
                side="top"
                className="inline-block"
                tooltipClassName="text-xs shadow-soft border-0"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setResetConfirm(config.templateType);
                  }}
                  className="text-amber-600 hover:text-amber-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </SimpleTooltip>
            )}
          </div>
        ),
      },
    ],
    [openEditor],
  );

  if (isLoading) {
    return <EmailConfigSkeleton />;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            {/* <Settings className="h-6 w-6 text-primary-600" /> */}
            Email Config
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-soft border border-slate-200 py-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Total Types
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {configs.length}
                </p>
              </div>
              <div className="p-2.5 bg-primary-50 rounded-lg">
                <Layers className="h-6 w-6 text-primary-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-soft border border-slate-200 py-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Configured
                </p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {configuredCount}
                </p>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <CheckSquare className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-soft border border-slate-200 py-4 px-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  Active
                </p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {activeCount}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <Activity className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-soft border border-slate-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search template types..."
              className="flex-1"
            />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as string)}
              placeholder="Filter by status"
              size="md"
              className="w-full sm:w-48"
              clearable={false}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-soft">
          <Table
            columns={columns}
            data={filtered}
            loading={isLoading}
            emptyMessage="No template types found."
            rowKey={(row: IEmailConfigResponse) => row.templateType}
            onRowClick={(config) => openEditor(config)}
            hoverable
            striped
            size="md"
          />
        </div>

        {/* Edit Modal */}
        {editingType && editingConfig && (
          <Modal
            isOpen={!!editingType}
            onClose={closeEditor}
            title={`Configure: ${editingConfig.label}`}
            size="md"
          >
            <div className="space-y-5 p-1">
              <Input
                label="Template Type"
                value={editingConfig.templateType}
                readOnly
                size="md"
                className="font-mono"
              />

              <Select
                label="Assigned Template"
                options={templateOptions}
                value={formTemplateId}
                onChange={(v) => setFormTemplateId(v as string)}
                placeholder="Select a template..."
                searchable
                clearable
                size="md"
              />
              <p className="text-xs text-slate-400 -mt-3">
                Select a visual builder template or leave empty to use the
                built-in default.
              </p>

              <Input
                label="Subject Override"
                value={formSubjectOverride}
                onChange={(v) => setFormSubjectOverride(v as string)}
                placeholder="Leave empty to use the template's subject"
                size="md"
                helperText="Overrides the template subject for this specific email type."
              />

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Active</p>
                  <p className="text-xs text-slate-400">
                    Disable to stop sending this email type entirely.
                  </p>
                </div>
                <Toggle checked={formIsActive} onChange={setFormIsActive} />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <Button
                  appearance="ghost"
                  size="small"
                  onClick={() => {
                    setResetConfirm(editingConfig.templateType);
                  }}
                  icon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset to Default
                </Button>

                <div className="flex gap-2">
                  <Button
                    appearance="default"
                    size="small"
                    onClick={closeEditor}
                  >
                    Cancel
                  </Button>
                  <Button
                    appearance="primary"
                    size="small"
                    onClick={handleSave}
                    disabled={isSaving}
                    loading={isSaving}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Reset Confirmation */}
        <ConfirmationModal
          isOpen={!!resetConfirm}
          onClose={() => setResetConfirm(null)}
          onConfirm={handleResetConfirm}
          title="Reset Email Config"
          message={
            <>
              Are you sure you want to reset{" "}
              <strong>{resetConfirm}</strong> to the built-in default? This will
              remove the custom template assignment.
            </>
          }
          type="warning"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}

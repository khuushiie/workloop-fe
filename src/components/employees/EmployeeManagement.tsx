import React, { useEffect, useMemo, useState } from "react";
import { Plus, Upload, AlertCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { IUserDetail } from "../../types";
import {
  useGetUsersQuery,
  useGetUsersForFilterQuery,
  useGetStatsQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLazyDownloadEmployeesQuery,
  userApi,
} from "../../store/apis/user.api";
import { useAppDispatch } from "../../store/hooks";
import { useUploadProfileImageMutation } from "../../store/apis/uploads.api";
import {
  useGetMasterConfigByCategoryQuery,
  type IMasterConfigOption,
} from "../../store/apis/masterConfig.api";
import {
  useLazyGetOrganizationByIdQuery,
} from "../../store/apis/organization.api";
import { useGetLicenseSummaryQuery } from "../../store/apis/billingLicense.api";
import { useAuth } from "../../store/hooks/useAuth";
import { useAdminUploadDocumentMutation } from "../../store/apis/userDocuments.api";
import type {
  IUserListItem,
  IUserFilterItem,
  ICreateUserBody,
  IUpdateUserBody,
} from "../../types/user.api.types";
import { useDebounce, DEBOUNCE_DELAYS } from "../../utils/debounce";
import BulkUploadModal from "./BulkUploadModal";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { AlertModal } from "../common/AlertModal";
import EmployeeStatsCards, {
  EmployeeStats,
} from "./components/EmployeeStatsCards";
import EmployeeFilters from "./components/EmployeeFilters";
import EmployeeTableSection from "./components/EmployeeTableSection";
import EmployeeFormModal from "./components/EmployeeFormModal";
import EmployeeCredentialsModal from "./components/EmployeeCredentialsModal";
import { UserLimitExceededDialog } from "./components/UserLimitExceededDialog";
import { EmployeeFormSubmitPayload } from "./components/types";
import { mergeEmployeeInitialValues } from "./components/employee-form/formDefaults";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { MasterConfigCategory } from "../../constants";
import FilterWrapper from "../common/FilterWrapper";
import { Button } from "../common";
import { EmployeeTableSectionSkeleton, StatCardSkeleton } from "./Skeleton";
import type { SelectOption } from "../common/Select";

type FormMode = "create" | "edit" | "view";

interface ModalState {
  open: boolean;
  mode: FormMode;
  initialValues: Partial<IUserDetail> | null;
}

interface DeleteState {
  open: boolean;
  employeeId: string | null;
  retainLicense: boolean;
}

interface CredentialsState {
  open: boolean;
  name: string;
  workEmail: string;
  password: string;
}

const mapStatsFromApi = (api: {
  totalEmployees: number;
  activeEmployees: number;
  totalActiveDepartments: number;
  newEmployeesThisMonth: number;
}): EmployeeStats => ({
  total: api.totalEmployees,
  active: api.activeEmployees,
  departments: api.totalActiveDepartments,
  newThisMonth: api.newEmployeesThisMonth,
});

const mergeInitialValues = (value: Partial<IUserDetail> | null) =>
  mergeEmployeeInitialValues(value);

const EmployeeManagement: React.FC = () => {
  const canManageEmployees = useHasPermission(
    PERMISSIONS.EMPLOYEE_MANAGEMENT_MANAGE,
  );
  const canManage = canManageEmployees;
  const { data: statsPayload, isLoading: statsLoading } = useGetStatsQuery();
  const dispatch = useAppDispatch();
  const stats: EmployeeStats = statsPayload
    ? mapStatsFromApi(statsPayload)
    : { total: 0, active: 0, departments: 0, newThisMonth: 0 };
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>(
    [],
  );
  const [positionOptions, setPositionOptions] = useState<SelectOption[]>([]);

  const { data: departmentList } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.DEPARTMENT,
  );
  const { data: designationList } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.DESIGNATION,
  );
  const { data: employmentTypeList } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.EMPLOYMENT_TYPE,
  );
  const { data: disciplineList } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.EMPLOYMENT_DISCIPLINE,
  );
  const { data: relationshipList } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.RELATIONSHIP,
  );
  const { data: employmentStatusList } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.EMPLOYMENT_STATUS,
  );
  const { data: genderList } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.GENDER,
  );

  const [filters, setFilters] = useState({
    search: "",
    department: "",
    employmentType: "",
    status: "",
  });
  const debouncedSearch = useDebounce(filters.search, DEBOUNCE_DELAYS.SEARCH);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // GET /v2/users – list with filters and pagination (data used as-is)
  const queryParams = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      name: debouncedSearch || undefined,
      status: filters.status || undefined,
      department: filters.department || undefined,
      employmentType: filters.employmentType || undefined,
    }),
    [
      pagination.page,
      pagination.limit,
      debouncedSearch,
      filters.status,
      filters.department,
      filters.employmentType,
    ],
  );
  const {
    data: usersPayload,
    isLoading: listLoading,
    error: listErrorResponse,
    refetch: refetchUsers,
  } = useGetUsersQuery(queryParams);

  const employees: IUserListItem[] = usersPayload?.data ?? [];
  const paginationMeta = usersPayload?.pagination;
  const listError = listErrorResponse ? "Failed to load employees" : "";

  // Sync pagination total from API
  useEffect(() => {
    if (paginationMeta) {
      setPagination((prev) => ({ ...prev, total: paginationMeta.total }));
    }
  }, [paginationMeta]);

  const { data: filterUsers = [] } = useGetUsersForFilterQuery();
  const allEmployees: IUserFilterItem[] = filterUsers;

  const { data: userDetail, refetch: refetchUserDetail, isFetching: isUserDetailFetching } = useGetUserByIdQuery(
    selectedUserId ?? "",
    {
      skip: !selectedUserId,
    },
  );

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [uploadProfileImage, { isLoading: isUploadingProfile }] =
    useUploadProfileImageMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [adminUpload, { isLoading: isAdminUploading }] = useAdminUploadDocumentMutation();

  const isSubmitting = isCreating || isUpdating || isUploadingProfile || isAdminUploading;
  const [downloadEmployees] = useLazyDownloadEmployeesQuery();
  const { user } = useAuth();
  const [triggerGetOrg] = useLazyGetOrganizationByIdQuery();
  const navigate = useNavigate();
  const { data: licenseSummary } = useGetLicenseSummaryQuery();
  const noLicensesAvailable = licenseSummary?.availableLicenses === 0;
  const isNearLicenseLimit = licenseSummary?.isNearLimit === true;

  const [userLimitDialogState, setUserLimitDialogState] = useState<{
    open: boolean;
    organizationId: string;
    organizationName: string;
  }>({ open: false, organizationId: "", organizationName: "" });

  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    mode: "create",
    initialValues: null,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [credentialsState, setCredentialsState] = useState<CredentialsState>({
    open: false,
    name: "",
    workEmail: "",
    password: "",
  });

  const [deleteState, setDeleteState] = useState<DeleteState>({
    open: false,
    employeeId: null,
    retainLicense: false,
  });

  const [alertState, setAlertState] = useState({
    open: false,
    title: "",
    message: "",
    type: "error" as "error" | "warning" | "success" | "info",
  });

  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  const modalInitialValues = useMemo((): Partial<IUserDetail> => {
    if (modalState.mode === "create") {
      return mergeEmployeeInitialValues(null);
    }
    if (userDetail && selectedUserId) {
      const emergencyContact = userDetail.emergencyContact
        ? { ...userDetail.emergencyContact }
        : undefined;
      return {
        ...userDetail,
        designation: userDetail.designation ?? "",
        department: userDetail.department ?? "",
        reportingManagerId: userDetail.reportingManagerId ?? "",
        functionalManagerId: userDetail.functionalManagerId ?? "",
        emergencyContact,
      } as Partial<IUserDetail>;
    }
    return mergeEmployeeInitialValues(modalState.initialValues);
  }, [modalState.mode, modalState.initialValues, userDetail, selectedUserId]);

  // Refetch user detail when opening view/edit modal so we always show fresh data (e.g. after an edit)
  useEffect(() => {
    if (
      modalState.open &&
      selectedUserId &&
      (modalState.mode === "view" || modalState.mode === "edit")
    ) {
      refetchUserDetail();
    }
  }, [modalState.open, modalState.mode, selectedUserId, refetchUserDetail]);

  useEffect(() => {
    if (departmentList?.length) {
      setDepartmentOptions(
        departmentList.map((item: IMasterConfigOption) => ({
          value: item.id,
          label: item.displayName,
        })),
      );
    }
  }, [departmentList]);

  useEffect(() => {
    if (designationList?.length) {
      setPositionOptions(
        designationList.map((item: IMasterConfigOption) => ({
          value: item.id,
          label: item.displayName,
        })),
      );
    }
  }, [designationList]);

  const employmentTypeOptions: SelectOption[] = useMemo(
    () =>
      (employmentTypeList ?? []).map((item: IMasterConfigOption) => ({
        value: item.id,
        label: item.displayName,
      })),
    [employmentTypeList],
  );

  const disciplineOptions: SelectOption[] = useMemo(
    () =>
      (disciplineList ?? []).map((item: IMasterConfigOption) => ({
        value: item.id,
        label: item.displayName,
      })),
    [disciplineList],
  );

  const relationshipOptions: SelectOption[] = useMemo(
    () =>
      (relationshipList ?? []).map((item: IMasterConfigOption) => ({
        value: item.id,
        label: item.displayName,
      })),
    [relationshipList],
  );

  const statusOptions: SelectOption[] = useMemo(
    () =>
      (employmentStatusList ?? []).map((item: IMasterConfigOption) => ({
        value: item.id,
        label: item.displayName,
      })),
    [employmentStatusList],
  );

  const genderOptions: SelectOption[] = useMemo(
    () =>
      (genderList ?? []).map((item: IMasterConfigOption) => ({
        value: item.id,
        label: item.displayName,
      })),
    [genderList],
  );

  const isSuperAdmin = (user as { role?: string })?.role?.toUpperCase() === "SUPERADMIN";
  const userOrgId = (user as { organizationId?: string })?.organizationId;

  const handleOpenCreate = async () => {
    if (!canManage) return;
    setSelectedUserId(null);

    // For non–super-admin: check user limit before opening create modal
    if (!isSuperAdmin && userOrgId) {
      try {
        const { data: org } = await triggerGetOrg(userOrgId);
        const limit = org?.userLimit ?? null;
        const count = org?.currentUserCount ?? 0;
        if (limit != null && typeof limit === "number" && count >= limit) {
          setUserLimitDialogState({
            open: true,
            organizationId: userOrgId,
            organizationName: org?.name ?? "Organization",
          });
          return;
        }
      } catch {
        // On error, still allow opening the form
      }
    }

    setModalState({
      open: true,
      mode: "create",
      initialValues: null,
    });
  };

  const handleOpenEdit = (employee: IUserListItem) => {
    if (!canManage) return;
    setSelectedUserId(employee.id);
    setModalState({
      open: true,
      mode: "edit",
      initialValues: null,
    });
  };

  const handleOpenView = (employee: IUserListItem) => {
    setSelectedUserId(employee.id);
    setModalState({
      open: true,
      mode: "view",
      initialValues: null,
    });
  };

  const handleCloseForm = () => {
    setSelectedUserId(null);
    setModalState({ open: false, mode: "create", initialValues: null });
  };

  const safeTrim = (s: string | null | undefined): string =>
    s == null ? "" : String(s).trim();

  /** Extract trimmed string from IDisplayName (displayName/id) or plain string */
  const trimDisplayOrString = (
    v: string | { displayName?: string; id?: string } | null | undefined,
  ): string => {
    if (v == null) return "";
    if (typeof v === "string") return v.trim();
    return (v.displayName ?? v.id ?? "").trim();
  };

  const buildCreateBody = (
    v: Partial<IUserDetail>,
    profilePicUrl: string,
    extra?: {
      organizationId?: string;
      roleId?: string;
    },
  ): ICreateUserBody => ({
    email: (v.email ?? v.workEmail ?? "").trim(),
    workEmail: (v.workEmail ?? "").trim(),
    employeeId: (v.employeeId ?? "").trim(),
    firstName: v.firstName?.trim(),
    lastName: v.lastName?.trim(),
    phone: v.phone?.trim(),
    gender: v.gender?.trim(),
    bloodGroup: v.bloodGroup?.trim(),
    uanNumber: v.uanNumber?.trim(),
    aadharCardNo: v.aadharCardNo?.trim(),
    panCardNo: v.panCardNo?.trim(),
    dob: v.dob?.trim(),
    profilePic: profilePicUrl || v.profilePic?.trim(),
    motherName: v.motherName?.trim(),
    fatherName: v.fatherName?.trim(),

    organizationId: extra?.organizationId,
    roleId: extra?.roleId,
    status: v.status?.trim() || undefined,
    department: (v.department ?? "").trim(),
    designation: (v.designation ?? "").trim(),
    joinDate: (v.joinDate ?? "").trim(),
    employmentType: v.employmentType?.trim(),
    workLocation: (v as Record<string, unknown>).workLocation as
      | string
      | undefined,
    workMode: (v as Record<string, unknown>).workMode as string | undefined,
    reportingManager: v.reportingManagerId?.trim() || undefined,
    functionalManager: v.functionalManagerId?.trim() || undefined,
    address: v.address
      ? {
        street: v.address.street?.trim(),
        city: v.address.city?.trim(),
        state: v.address.state?.trim(),
        zipCode: v.address.zipCode?.trim(),
        country: v.address.country?.trim(),
      }
      : undefined,
    permanentAddress: v.permanentAddress
      ? {
        street: v.permanentAddress.street?.trim(),
        city: v.permanentAddress.city?.trim(),
        state: v.permanentAddress.state?.trim(),
        zipCode: v.permanentAddress.zipCode?.trim(),
        country: v.permanentAddress.country?.trim(),
      }
      : undefined,
    emergencyContact:
      safeTrim(v.emergencyContact?.name) && safeTrim(v.emergencyContact?.phone)
        ? {
          name: safeTrim(v.emergencyContact!.name),
          relationshipId:
            safeTrim(v.emergencyContact!.relationshipId) || undefined,
          phone: safeTrim(v.emergencyContact!.phone),
        }
        : undefined,
    bankDetails: v.bankDetails
      ? {
        accountHolderName: v.bankDetails.accountHolderName?.trim(),
        accountNumber: v.bankDetails.accountNumber?.trim(),
        ifscCode: v.bankDetails.ifscCode?.trim(),
        bankName: v.bankDetails.bankName?.trim(),
        branchName: v.bankDetails.branchName?.trim(),
      }
      : undefined,
    ...((): Record<string, unknown> => {
      const list = v.educationDetails
        ?.filter((e) => e?.institutionName?.trim())
        .map((e) => ({
          institutionName: e.institutionName?.trim(),
          discipline: (typeof (e.discipline as unknown) === "string" ? (e.discipline as unknown as string) : e.discipline?.displayName)?.trim(),
          startDate: e.startDate?.trim(),
          endDate: e.endDate?.trim(),
          grade: e.grade?.trim(),
          explainBreaks: e.explainBreaks?.trim() || undefined,
        }));
      return list?.length ? { educationDetails: list } : {};
    })(),
    ...((): Record<string, unknown> => {
      const list = v.previousEmployments
        ?.filter((p) => p?.employerName?.trim())
        .map((p) => ({
          employerName: p.employerName?.trim(),
          designation: (typeof (p.designation as unknown) === "string" ? (p.designation as unknown as string) : p.designation?.displayName)?.trim(),
          startDate: p.startDate?.trim(),
          endDate: p.endDate?.trim(),
          annualCTC: p.annualCTC,
          breakReason: p.breakReason?.trim(),
        }));
      return list?.length ? { previousEmployments: list } : {};
    })(),
  });

  const buildUpdateBody = (
    v: Partial<IUserDetail>,
    profilePicUrl?: string,
    extra?: {
      organizationId?: string;
      roleId?: string;
    },
  ): IUpdateUserBody => {
    const body: IUpdateUserBody = {};
    if (v.email !== undefined) body.email = safeTrim(v.email);
    if (v.workEmail !== undefined) body.workEmail = safeTrim(v.workEmail);
    if (v.employeeId !== undefined) body.employeeId = safeTrim(v.employeeId);
    if (v.firstName !== undefined) body.firstName = safeTrim(v.firstName);
    if (v.lastName !== undefined) body.lastName = safeTrim(v.lastName);

    // organization & role handling
    if (extra?.organizationId !== undefined) {
      body.organizationId = extra.organizationId;
    }

    // Send only roleId - backend derives role type from roleId and syncs to user table
    if (extra?.roleId !== undefined) {
      body.roleId = extra.roleId;
    }

    if (v.phone !== undefined) body.phone = safeTrim(v.phone);
    if (v.gender !== undefined) body.gender = safeTrim(v.gender);
    if (v.bloodGroup !== undefined) body.bloodGroup = safeTrim(v.bloodGroup);
    if (v.uanNumber !== undefined) body.uanNumber = safeTrim(v.uanNumber);
    if (v.aadharCardNo !== undefined)
      body.aadharCardNo = safeTrim(v.aadharCardNo);
    if (v.panCardNo !== undefined) body.panCardNo = safeTrim(v.panCardNo);
    if (v.dob !== undefined) body.dob = safeTrim(v.dob);
    if (profilePicUrl !== undefined) body.profilePic = profilePicUrl;
    else if (v.profilePic !== undefined)
      body.profilePic = safeTrim(v.profilePic);
    if (v.motherName !== undefined) body.motherName = safeTrim(v.motherName);
    if (v.fatherName !== undefined) body.fatherName = safeTrim(v.fatherName);
    if (v.status !== undefined) body.status = safeTrim(v.status);
    if (v.department !== undefined) body.department = safeTrim(v.department);
    if (v.designation !== undefined) body.designation = safeTrim(v.designation);
    if (v.joinDate !== undefined) body.joinDate = safeTrim(v.joinDate);
    if (v.employmentType !== undefined)
      body.employmentType = safeTrim(v.employmentType);
    const workLocation = (v as Record<string, unknown>).workLocation as
      | string
      | null
      | undefined;
    const workMode = (v as Record<string, unknown>).workMode as
      | string
      | null
      | undefined;
    if (workLocation !== undefined) body.workLocation = safeTrim(workLocation);
    if (workMode !== undefined) body.workMode = safeTrim(workMode);
    if (v.reportingManagerId !== undefined)
      body.reportingManager = safeTrim(v.reportingManagerId) || undefined;
    if (v.functionalManagerId !== undefined)
      body.functionalManager = safeTrim(v.functionalManagerId) || undefined;
    if (v.address)
      body.address = {
        street: v.address.street?.trim(),
        city: v.address.city?.trim(),
        state: v.address.state?.trim(),
        zipCode: v.address.zipCode?.trim(),
        country: v.address.country?.trim(),
      };
    if (v.permanentAddress)
      body.permanentAddress = {
        street: v.permanentAddress.street?.trim(),
        city: v.permanentAddress.city?.trim(),
        state: v.permanentAddress.state?.trim(),
        zipCode: v.permanentAddress.zipCode?.trim(),
        country: v.permanentAddress.country?.trim(),
      };
    if (v.emergencyContact)
      body.emergencyContact = {
        name: safeTrim(v.emergencyContact.name),
        relationshipId:
          safeTrim(v.emergencyContact.relationshipId) || undefined,
        phone: safeTrim(v.emergencyContact.phone),
      };
    if (v.bankDetails)
      body.bankDetails = {
        accountHolderName: v.bankDetails.accountHolderName?.trim(),
        accountNumber: v.bankDetails.accountNumber?.trim(),
        ifscCode: v.bankDetails.ifscCode?.trim(),
        bankName: v.bankDetails.bankName?.trim(),
        branchName: v.bankDetails.branchName?.trim(),
      };
    if (v.educationDetails?.length) {
      const withData = v.educationDetails.filter((e) =>
        safeTrim(e.institutionName),
      );
      if (withData.length > 0) {
        body.educationDetails = withData.map((e) => ({
          id: (e as { id?: string }).id,
          institutionName: safeTrim(e.institutionName),
          discipline: safeTrim(typeof (e.discipline as unknown) === "string" ? (e.discipline as unknown as string) : e.discipline?.displayName),
          startDate: safeTrim(e.startDate),
          endDate: safeTrim(e.endDate),
          grade: safeTrim(e.grade),
          percentage: e.percentage,
          explainBreaks: safeTrim(e.explainBreaks) || undefined,
        }));
      }
    }
    if (v.previousEmployments?.length) {
      const withData = v.previousEmployments.filter((p) =>
        safeTrim(p.employerName),
      );
      if (withData.length > 0) {
        body.previousEmployments = withData.map((p) => ({
          id: (p as { id?: string }).id,
          employerName: safeTrim(p.employerName),
          designation: safeTrim(typeof (p.designation as unknown) === "string" ? (p.designation as unknown as string) : p.designation?.displayName),
          startDate: safeTrim(p.startDate),
          endDate: safeTrim(p.endDate),
          annualCTC: p.annualCTC,
          breakReason: safeTrim(p.breakReason),
        }));
      }
    }
    return body;
  };

  const handleFormSubmit = async (payload: EmployeeFormSubmitPayload) => {
    if (modalState.mode === "view" || !canManage) return;

    try {
      setFormSubmitting(true);
      const mode = modalState.mode;
      const baseValues = mergeInitialValues(payload.values);

      const profilePicUrl =
        payload.values.profilePic ?? baseValues.profilePic ?? "";

      if (mode === "create") {
        const orgId =
          payload.values.organizationId ??
          (user as { organizationId?: string })?.organizationId;
        if (orgId) {
          const { data: org } = await triggerGetOrg(orgId);
          const limit = org?.userLimit ?? null;
          const count = org?.currentUserCount ?? 0;
          if (
            limit != null &&
            typeof limit === "number" &&
            count >= limit
          ) {
            handleCloseForm();
            setUserLimitDialogState({
              open: true,
              organizationId: orgId,
              organizationName: org?.name ?? "Organization",
            });
            return;
          }
        }

        const body = buildCreateBody(baseValues, profilePicUrl, {
          organizationId: payload.values.organizationId,
          roleId: payload.values.roleId,
        });
        const result = await createUser(body).unwrap();
        const newUserId = result?.user?.id;

        // NEW: Batch upload documents if provided
        if (newUserId && payload.localDocuments && payload.localDocuments.length > 0) {
          let successCount = 0;
          let failCount = 0;

          for (const doc of payload.localDocuments) {
            try {
              await adminUpload({
                userId: newUserId,
                documentTypeId: doc.documentTypeId,
                file: doc.file,
              }).unwrap();
              successCount++;
            } catch (err: any) {
              const errMsg = err?.data?.message || err?.message || "Internal server error";
              console.error(`Failed to upload ${doc.documentTypeName}:`, err);
              toast.error(`Failed to upload ${doc.documentTypeName}: ${errMsg}`);
              failCount++;
            }
          }
          
          if (successCount > 0 && failCount === 0) {
            toast.success(`Successfully uploaded all ${successCount} documents`);
          } else if (successCount > 0 || failCount > 0) {
            toast.success(`Upload complete: ${successCount} succeeded, ${failCount} failed`);
          }
        }

        handleCloseForm();
        refetchUsers();
        const firstName = (baseValues.firstName ?? "").trim();
        const firstNameForPassword = firstName.replace(/\s+/g, "");
        setCredentialsState({
          open: true,
          name: `${firstName} ${(baseValues.lastName ?? "").trim()}`.trim(),
          workEmail: body.workEmail,
          password: `${firstNameForPassword || "user"}@123`,
        });
        toast.success("Employee created and documents queued successfully");
      } else if (mode === "edit" && selectedUserId) {
        const body = buildUpdateBody(baseValues, profilePicUrl, {
          roleId: payload.values.roleId,
        });
        if (profilePicUrl) body.profilePic = profilePicUrl;
        await updateUser({ id: selectedUserId, body }).unwrap();
        handleCloseForm();
        refetchUsers();
        toast.success("Employee updated successfully");
      }
    } catch (err: unknown) {
      const apiError = err as { status?: number; data?: { message?: string; statusCode?: number }; message?: string };
      const message = apiError?.data?.message ?? apiError?.message ?? "Failed to save employee. Please try again.";
      const statusCode = apiError?.status ?? apiError?.data?.statusCode;

      if (statusCode === 400 && message.toLowerCase().includes("user limit")) {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-1">
              <span>{message}</span>
              <button
                type="button"
                className="text-sm font-semibold text-blue-600 underline hover:text-blue-800 text-left"
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/billing-license");
                }}
              >
                Go to Billing & Licenses →
              </button>
            </div>
          ),
          { duration: 8000 },
        );
      } else {
        toast.error(message);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (!canManage) return;
    setDeleteState({ open: true, employeeId, retainLicense: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteState.employeeId) return;
    if (!canManage) return;
    try {
      await deleteUser({
        id: deleteState.employeeId,
        retainLicense: deleteState.retainLicense,
      }).unwrap();
      setDeleteState({ open: false, employeeId: null, retainLicense: false });
      refetchUsers();
      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast.error("Failed to delete employee. Please try again.");
    }
  };

  const handleBulkUploadSuccess = () => {
    setShowBulkUploadModal(false);
    dispatch(
      userApi.util.invalidateTags([
        { type: "UserList" },
        { type: "UserFilter" },
      ]),
    );
  };

  const handleExport = async () => {
    try {
      const blob = await downloadEmployees({
        name: debouncedSearch || undefined,
        status: filters.status || undefined,
        department: filters.department || undefined,
        employmentType: filters.employmentType || undefined,
      }).unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Employees_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Excel downloaded");
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as { message?: string })?.message ??
        "Failed to download Excel file";
      toast.error(message);
    }
  };

  const handleFilterChange = (
    key: "search" | "department" | "employmentType" | "status",
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination({ page: 1, limit, total: pagination.total });
  };

  const handleAlertClose = () => {
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const employeeStatCards = Array.from({ length: 4 });
  return (
    <div className="p-6 space-y-6">
      <div className="flex max-[830px]:flex-col items-start sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2 md:text-3xl">
            Employee Management
          </h1>
        </div>
        {canManage && (
          <div className="flex items-center space-x-3">
            <Button
              htmlType="button"
              appearance="primary"
              size="large"
              onClick={() => setShowBulkUploadModal(true)}
              icon={<Upload className="w-3 h-3 md:w-5 md:h-5" />}
            >
              Bulk Upload
            </Button>
            <Button
              htmlType="button"
              size="large"
              appearance="primary"
              onClick={handleOpenCreate}
              icon={<Plus className="w-3 h-3 md:w-5 md:h-5" />}
            >
              Add Employee
            </Button>
          </div>
        )}
      </div>

      {listError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{listError}</span>
        </div>
      )}

      {isNearLicenseLimit && !noLicensesAvailable && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              Running low on licenses — only {licenseSummary?.availableLicenses} of {licenseSummary?.totalLicenses} remaining.
            </span>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-amber-900 underline hover:text-amber-700 whitespace-nowrap ml-4"
            onClick={() => navigate("/billing-license")}
          >
            Add Licenses
          </button>
        </div>
      )}

      {noLicensesAvailable && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              No licenses available. You cannot add new employees until more licenses are purchased.
            </span>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-red-900 underline hover:text-red-700 whitespace-nowrap ml-4"
            onClick={() => navigate("/billing-license")}
          >
            Add Licenses
          </button>
        </div>
      )}

      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {employeeStatCards.map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <EmployeeStatsCards stats={stats} />
      )}

      {/* Filters */}
      <FilterWrapper>
        <EmployeeFilters
          searchTerm={filters.search}
          onSearchChange={(value) => handleFilterChange("search", value)}
          departmentOptions={departmentOptions}
          selectedDepartment={filters.department}
          onDepartmentChange={(value) =>
            handleFilterChange("department", value)
          }
          employmentTypeOptions={employmentTypeOptions}
          selectedEmploymentType={filters.employmentType}
          onEmploymentTypeChange={(value) =>
            handleFilterChange("employmentType", value)
          }
          statusOptions={statusOptions}
          selectedStatus={filters.status}
          onStatusChange={(value) => handleFilterChange("status", value)}
        />
      </FilterWrapper>

      {listLoading ? (
        <EmployeeTableSectionSkeleton />
      ) : (
        <EmployeeTableSection
          employees={employees}
          loading={listLoading}
          currentPage={pagination.page}
          itemsPerPage={pagination.limit}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleLimitChange}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteEmployee}
          onExport={handleExport}
          canManage={canManage}
        />
      )}

      <EmployeeFormModal
        isOpen={modalState.open}
        isLoadingData={isUserDetailFetching}
        mode={modalState.mode}
        initialValues={modalInitialValues}
        employees={allEmployees}
        departmentOptions={departmentOptions}
        positionOptions={positionOptions}
        employmentTypeOptions={employmentTypeOptions}
        disciplineOptions={disciplineOptions}
        relationshipOptions={relationshipOptions}
        statusOptions={statusOptions}
        genderOptions={genderOptions}
        isSubmitting={formSubmitting}
        onProfilePicUpload={
          modalState.mode === "edit" && selectedUserId
            ? async (file) => {
              const res = await uploadProfileImage({
                file,
                userId: selectedUserId,
              }).unwrap();
              return res ? { fileUrl: res.fileUrl, signedUrl: res.signedUrl } : undefined;
            }
            : modalState.mode === "create"
              ? async (file) => {
                const res = await uploadProfileImage({ file }).unwrap();
                return res ? { fileUrl: res.fileUrl, signedUrl: res.signedUrl } : undefined;
              }
              : undefined
        }
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />

      <EmployeeCredentialsModal
        isOpen={credentialsState.open}
        name={credentialsState.name}
        workEmail={credentialsState.workEmail}
        password={credentialsState.password}
        onClose={() =>
          setCredentialsState({
            open: false,
            name: "",
            workEmail: "",
            password: "",
          })
        }
      />

      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSuccess={handleBulkUploadSuccess}
      />

      <ConfirmationModal
        isOpen={deleteState.open}
        onClose={() => setDeleteState({ open: false, employeeId: null, retainLicense: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message={
          <div>
            <p className="mb-3">Are you sure you want to delete this employee? This action cannot be undone.</p>
            <div className="border border-slate-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-700 mb-2">License handling:</p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="retainLicense"
                  checked={!deleteState.retainLicense}
                  onChange={() => setDeleteState(prev => ({ ...prev, retainLicense: false }))}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-medium">Release License</span>
                  <span className="block text-xs text-slate-500">Free the license for new hires</span>
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="retainLicense"
                  checked={deleteState.retainLicense}
                  onChange={() => setDeleteState(prev => ({ ...prev, retainLicense: true }))}
                  className="mt-0.5"
                />
                <span className="text-sm text-slate-700">
                  <span className="font-medium">Keep License Reserved</span>
                  <span className="block text-xs text-slate-500">Retain the license for future use</span>
                </span>
              </label>
            </div>
          </div>
        }
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      <AlertModal
        isOpen={alertState.open}
        onClose={handleAlertClose}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText="OK"
      />

      <UserLimitExceededDialog
        isOpen={userLimitDialogState.open}
        onClose={() => {
          setUserLimitDialogState({
            open: false,
            organizationId: "",
            organizationName: "",
          });
          handleCloseForm();
        }}
        organizationId={userLimitDialogState.organizationId}
        organizationName={userLimitDialogState.organizationName}
      />
    </div>
  );
};

export default EmployeeManagement;

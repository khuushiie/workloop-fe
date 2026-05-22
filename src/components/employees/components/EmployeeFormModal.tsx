import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { IUserDetail } from "../../../types";
import { useSignedUrl } from "../../../store/hooks/useSignedUrl";
import { COUNTRIES, INDIAN_STATES } from "../../../utils/constants";
import Modal, { ModalFooter, ModalButton } from "../../common/Modal";
import Select, { SelectOption } from "../../common/Select";
import { useAppSelector } from "../../../store/hooks";
import {
  useGetOrganizationsFilterQuery,
  useLazyGetOrgDetailsQuery,
} from "../../../store/apis/organization.api";
import { useLazyListRolesQuery } from "../../../store/apis/rbac.api";
import {
  useGetMasterConfigByCategoryForOrgQuery,
  type IMasterConfigOption,
} from "../../../store/apis/masterConfig.api";
import { MasterConfigCategory } from "../../../constants";
import { EmployeeFormMode, EmployeeFormSubmitPayload, LocalDocument } from "./types";
import { capitalizeWords, getDisplayName } from "../../../utils/nameUtils";
import BasicInfoSection from "./employee-form/BasicInfoSection";
import WorkInfoSection from "./employee-form/WorkInfoSection";
import AddressSection from "./employee-form/AddressSection";
import EmergencyContactSection from "./employee-form/EmergencyContactSection";
import BankDetailsSection from "./employee-form/BankDetailsSection";
import DocumentsSection from "./employee-form/DocumentsSection";
import EmploymentHistorySection from "./employee-form/EmploymentHistorySection";
import EducationSection from "./employee-form/EducationSection";
import { useGetUsersForFilterQuery } from "../../../store/apis/user.api";
import {
  mergeEmployeeInitialValues,
  getValidationErrors,
  ensureAddress,
  ensurePermanentAddress,
  ensureEmergencyContact,
  ensureBankDetails,
  normalizeEducationList,
  normalizeEmploymentList,
  createDefaultEducation,
  createDefaultEmployment,
  EducationDetail,
  EmploymentDetail,
  ValidationErrors,
  isValidIFSC,
} from "./employee-form/formDefaults";

/** User detail (for form) or v2 filter item (id + fullName) for manager dropdown */
type ManagerOptionSource = IUserDetail | { id: string; fullName: string };

interface EmployeeFormModalProps {
  isOpen: boolean;
  mode: EmployeeFormMode;
  initialValues: Partial<IUserDetail>;
  employees: ManagerOptionSource[];
  departmentOptions: SelectOption[];
  positionOptions: SelectOption[];
  employmentTypeOptions: SelectOption[];
  disciplineOptions: SelectOption[];
  relationshipOptions: SelectOption[];
  statusOptions: SelectOption[];
  genderOptions: SelectOption[];
  isSubmitting: boolean;
  selfEditMode?: boolean;
  isLoadingData?: boolean;
  /** When provided, profile image is uploaded on change; returns fileUrl (for DB) and signedUrl (for display). */
  onProfilePicUpload?: (
    file: File,
  ) => Promise<{ fileUrl: string; signedUrl: string } | undefined>;
  onClose: () => void;
  onSubmit: (payload: EmployeeFormSubmitPayload) => Promise<void>;
}

type RoleSelectOption = SelectOption & {
  meta?: string;
};

/** Single option when org roles are not loaded (e.g. My Profile self-edit). Not used when roles come from API. */
const toRoleOptionFromUser = (
  value: Partial<IUserDetail> | null | undefined,
): RoleSelectOption | null => {
  if (!value) return null;

  const roleId = value.roleId?.trim();
  if (roleId) {
    const label =
      value.roleName?.trim() ||
      value.roleTypeName?.trim() ||
      String(value.role || "").trim() ||
      "N/A";
    return {
      value: String(roleId),
      label,
      meta: value.role ? String(value.role) : undefined,
    };
  }

  const optionValue = value.role;
  const optionLabel = value.roleName || value.roleTypeName || value.role;
  if (!optionValue || !optionLabel) return null;

  return {
    value: String(optionValue),
    label: String(optionLabel),
    meta: value.role ? String(value.role) : undefined,
  };
};

const mapRolesResponseToOptions = (roles: unknown[]): RoleSelectOption[] =>
  roles
    .map((raw) => {
      const role = raw as {
        name?: string;
        id?: string;
        type?: string;
      };
      const id = role.id;
      if (id == null || role.name == null) return null;
      return {
        label: String(role.name),
        value: String(id),
        meta: role.type,
      } as RoleSelectOption;
    })
    .filter(Boolean) as RoleSelectOption[];

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  mode,
  initialValues,
  employees,
  departmentOptions: departmentOptionsProp,
  positionOptions: positionOptionsProp,
  employmentTypeOptions: employmentTypeOptionsProp,
  disciplineOptions: disciplineOptionsProp,
  relationshipOptions: relationshipOptionsProp,
  statusOptions: statusOptionsProp,
  genderOptions,
  isSubmitting,
  selfEditMode = false,
  isLoadingData = false,
  onProfilePicUpload,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Partial<IUserDetail>>(() =>
    mergeEmployeeInitialValues(initialValues),
  );
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null,
  );
  const [profilePicUploading, setProfilePicUploading] = useState(false);

  const signedInitialPic = useSignedUrl(initialValues.profilePic);

  useEffect(() => {
    if (signedInitialPic) setProfilePicPreview(signedInitialPic);
  }, [signedInitialPic]);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [ifscLookupLoading, setIfscLookupLoading] = useState(false);
  const [ifscLookupError, setIfscLookupError] = useState("");
  const [sameAsCurrent, setSameAsCurrent] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [roleOptions, setRoleOptions] = useState<RoleSelectOption[]>([]);
  const [localDocuments, setLocalDocuments] = useState<LocalDocument[]>([]);

  const handleAddLocalDocument = (doc: LocalDocument) => {
    setLocalDocuments((prev) => [...prev, doc]);
  };

  const handleRemoveLocalDocument = (index: number) => {
    setLocalDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const { user } = useAppSelector((state) => state.auth);

  const isSuperAdmin = user?.role.toUpperCase() === "SUPERADMIN";
  const userOrgId = (
    user as unknown as IUserDetail & { organizationId?: string }
  )?.organizationId;

  // Org-scoped master config queries are only needed for SuperAdmin
  const effectiveOrgId: string = isSuperAdmin ? selectedOrgId : "";
  const useOrgScoped = isSuperAdmin && Boolean(effectiveOrgId);

  const targetManagerOrgId = isSuperAdmin ? selectedOrgId : userOrgId;
  const skipManagerFetch = !targetManagerOrgId;

  const { data: fetchedManagers = [] } = useGetUsersForFilterQuery(
    { organizationId: targetManagerOrgId },
    { skip: skipManagerFetch },
  );

  const isViewMode = mode === "view";
  const shouldFetchRolesFromApi =
    !selfEditMode &&
    (mode === "create" || mode === "edit" || mode === "view");
  const formId = "employee-form-modal";

  useEffect(() => {
    if (!isOpen) {
      setRoleOptions([]);
      setSelectedOrgId("");
      setLocalDocuments([]);
      return;
    }
    const merged = mergeEmployeeInitialValues(initialValues);
    if (merged.roleId) {
      merged.roleId = String(merged.roleId).trim();
    }

    setFormData(merged);
    setProfilePicFile(null);
    setProfilePicPreview(initialValues.profilePic ?? null);
    setIfscLookupError("");
    setTouchedFields(new Set());
    setSubmitAttempted(false);
    setSameAsCurrent(false);

    // Employee management: options come only from roles API (fetch effects below).
    // My Profile: no roles API — one option from current user.
    if (!shouldFetchRolesFromApi) {
      const single = toRoleOptionFromUser(merged);
      setRoleOptions(single ? [single] : []);
    }

    if (isSuperAdmin) {
      if (initialValues.organizationId) {
        setSelectedOrgId(initialValues.organizationId);
      } else {
        setSelectedOrgId("");
      }
    }
  }, [initialValues, isOpen, isSuperAdmin, shouldFetchRolesFromApi]);

  // Recalculate validation errors whenever formData changes
  // Only store errors internally, but only show them for touched fields or after submit attempt
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const errors = getValidationErrors(formData);
    setFormErrors(errors);
  }, [formData, isOpen]);

  const [getOrgDetails] = useLazyGetOrgDetailsQuery();

  useEffect(() => {
    if (!isOpen) return;
    if (isSuperAdmin) return;
    if (!userOrgId) return;

    // My Profile (self edit) should not call role-list API.
    // Employee Management create/edit/view should fetch organization roles for the dropdown.
    if (!shouldFetchRolesFromApi) return;

    const fetchRolesAndNextEmpId = async () => {
      try {
        const [res, orgDetailsRes] = await Promise.all([
          getOrganizationRoles(
            { active: "true", organizationId: userOrgId },
            false,
          ).unwrap(),
          mode === "create"
            ? getOrgDetails(userOrgId).unwrap()
            : Promise.resolve(null),
        ]);
        const roles = Array.isArray(res) ? res : (res?.items ?? []);
        setRoleOptions(mapRolesResponseToOptions(roles));
        if (mode === "create" && orgDetailsRes?.nextEmployeeId) {
          setFormData((prev) => ({
            ...prev,
            employeeId: orgDetailsRes.nextEmployeeId ?? undefined,
          }));
        }
      } catch (err) {
        console.error("Role fetch failed");
      }
    };

    fetchRolesAndNextEmpId();
  }, [isOpen, isSuperAdmin, userOrgId, mode, shouldFetchRolesFromApi]);

  useEffect(() => {
    if (!isOpen) return;
    if (isSuperAdmin) return;
    if (!userOrgId) return;

    setFormData((prev) => ({
      ...prev,
      organizationId: prev.organizationId || userOrgId,
    }));
  }, [isOpen, isSuperAdmin, userOrgId]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isSuperAdmin) return;

    const orgIdFromInitial = initialValues.organizationId;

    if (orgIdFromInitial) {
      setSelectedOrgId(orgIdFromInitial);

      // also ensure formData has it
      setFormData((prev) => ({
        ...prev,
        organizationId: orgIdFromInitial,
      }));
    }
  }, [isOpen, isSuperAdmin, initialValues.organizationId]);

  useEffect(() => {
    if (!shouldFetchRolesFromApi) return;
    if (!isSuperAdmin) return;
    if (!selectedOrgId) return;

    const fetchRolesForSuperAdmin = async () => {
      try {
        const res = await getOrganizationRoles(
          {
            active: "true",
            organizationId: selectedOrgId,
          },
          false,
        ).unwrap();

        const roles = Array.isArray(res) ? res : (res?.items ?? []);

        setRoleOptions(mapRolesResponseToOptions(roles));
      } catch {
        toast.error("Failed to fetch roles");
      }
    };

    fetchRolesForSuperAdmin();
  }, [isOpen, isSuperAdmin, selectedOrgId, shouldFetchRolesFromApi]);

  const skipOrgQueries = !isSuperAdmin || !effectiveOrgId;

  const orgQueryArg = (categoryCode: string) => ({
    categoryCode,
    organizationId: effectiveOrgId,
  });

  const {
    data: orgDepartmentList,
    isLoading: orgDeptLoading,
    isFetching: orgDeptFetching,
  } = useGetMasterConfigByCategoryForOrgQuery(
    orgQueryArg(MasterConfigCategory.DEPARTMENT),
    { skip: skipOrgQueries },
  );
  const {
    data: orgDesignationList,
    isLoading: orgDesigLoading,
    isFetching: orgDesigFetching,
  } = useGetMasterConfigByCategoryForOrgQuery(
    orgQueryArg(MasterConfigCategory.DESIGNATION),
    { skip: skipOrgQueries },
  );
  const {
    data: orgEmploymentTypeList,
    isLoading: orgEmpTypeLoading,
    isFetching: orgEmpTypeFetching,
  } = useGetMasterConfigByCategoryForOrgQuery(
    orgQueryArg(MasterConfigCategory.EMPLOYMENT_TYPE),
    { skip: skipOrgQueries },
  );
  const {
    data: orgDisciplineList,
    isLoading: orgDiscLoading,
    isFetching: orgDiscFetching,
  } = useGetMasterConfigByCategoryForOrgQuery(
    orgQueryArg(MasterConfigCategory.EMPLOYMENT_DISCIPLINE),
    { skip: skipOrgQueries },
  );
  const {
    data: orgRelationshipList,
    isLoading: orgRelLoading,
    isFetching: orgRelFetching,
  } = useGetMasterConfigByCategoryForOrgQuery(
    orgQueryArg(MasterConfigCategory.RELATIONSHIP),
    { skip: skipOrgQueries },
  );
  const {
    data: orgStatusList,
    isLoading: orgStatusLoading,
    isFetching: orgStatusFetching,
  } = useGetMasterConfigByCategoryForOrgQuery(
    orgQueryArg(MasterConfigCategory.EMPLOYMENT_STATUS),
    { skip: skipOrgQueries },
  );
  const {
    data: orgGenderList,
    isLoading: orgGenderLoading,
    isFetching: orgGenderFetching,
  } = useGetMasterConfigByCategoryForOrgQuery(
    orgQueryArg(MasterConfigCategory.GENDER),
    { skip: skipOrgQueries },
  );

  const isOrgConfigLoading =
    orgDeptLoading ||
    orgDesigLoading ||
    orgEmpTypeLoading ||
    orgDiscLoading ||
    orgRelLoading ||
    orgStatusLoading ||
    orgGenderLoading ||
    orgDeptFetching ||
    orgDesigFetching ||
    orgEmpTypeFetching ||
    orgDiscFetching ||
    orgRelFetching ||
    orgStatusFetching ||
    orgGenderFetching;

  const isFormDisabled =
    isSuperAdmin && !selfEditMode && (!selectedOrgId || isOrgConfigLoading);

  const toSelectOptions = (list?: IMasterConfigOption[]): SelectOption[] =>
    (list ?? []).map((item) => ({ value: item.id, label: item.displayName }));

  const orgScopedDepartmentOptions = useMemo(
    () => toSelectOptions(orgDepartmentList),
    [orgDepartmentList],
  );
  const orgScopedDesignationOptions = useMemo(
    () => toSelectOptions(orgDesignationList),
    [orgDesignationList],
  );
  const orgScopedEmploymentTypeOptions = useMemo(
    () => toSelectOptions(orgEmploymentTypeList),
    [orgEmploymentTypeList],
  );
  const orgScopedDisciplineOptions = useMemo(
    () => toSelectOptions(orgDisciplineList),
    [orgDisciplineList],
  );
  const orgScopedRelationshipOptions = useMemo(
    () => toSelectOptions(orgRelationshipList),
    [orgRelationshipList],
  );
  const orgScopedStatusOptions = useMemo(
    () => toSelectOptions(orgStatusList),
    [orgStatusList],
  );
  const orgScopedGenderOptions = useMemo(
    () => toSelectOptions(orgGenderList),
    [orgGenderList],
  );

  const employmentTypeOptions: SelectOption[] = useMemo(() => {
    const base = useOrgScoped
      ? orgScopedEmploymentTypeOptions
      : (employmentTypeOptionsProp ?? []);
    const val =
      formData.employmentType ??
      (initialValues as Record<string, unknown>).employmentType;
    if (
      val != null &&
      String(val).trim() &&
      !base.some((o) => String(o.value) === String(val))
    ) {
      return [...base, { value: String(val), label: String(val) }];
    }
    return base;
  }, [
    useOrgScoped,
    orgScopedEmploymentTypeOptions,
    employmentTypeOptionsProp,
    formData.employmentType,
    initialValues,
  ]);

  const departmentOptions: SelectOption[] = useMemo(() => {
    const base = useOrgScoped
      ? orgScopedDepartmentOptions
      : (departmentOptionsProp ?? []);
    const val =
      formData.department ??
      (initialValues as Record<string, unknown>).department;
    const name = (initialValues as Record<string, unknown>).departmentName as
      | string
      | undefined;
    if (
      val != null &&
      String(val).trim() &&
      !base.some((o) => String(o.value) === String(val))
    ) {
      return [
        ...base,
        {
          value: String(val),
          label: name && String(name).trim() ? name : String(val),
        },
      ];
    }
    return base;
  }, [
    useOrgScoped,
    orgScopedDepartmentOptions,
    departmentOptionsProp,
    formData.department,
    initialValues,
  ]);

  const statusOptions: SelectOption[] = useMemo(
    () => (useOrgScoped ? orgScopedStatusOptions : (statusOptionsProp ?? [])),
    [useOrgScoped, orgScopedStatusOptions, statusOptionsProp],
  );

  const positionOptions: SelectOption[] = useMemo(() => {
    const base = useOrgScoped
      ? orgScopedDesignationOptions
      : (positionOptionsProp ?? []);
    const val = formData.designation ?? initialValues.designation;
    const name = initialValues.designationName;
    if (
      val != null &&
      String(val).trim() &&
      !base.some((o) => String(o.value) === String(val))
    ) {
      return [
        ...base,
        {
          value: String(val),
          label: name && String(name).trim() ? name : String(val),
        },
      ];
    }
    return base;
  }, [
    useOrgScoped,
    orgScopedDesignationOptions,
    positionOptionsProp,
    formData.designation,
    initialValues,
  ]);

  const disciplineOptions: SelectOption[] = useMemo(
    () =>
      useOrgScoped ? orgScopedDisciplineOptions : (disciplineOptionsProp ?? []),
    [useOrgScoped, orgScopedDisciplineOptions, disciplineOptionsProp],
  );

  const effectiveGenderOptions: SelectOption[] = useMemo(
    () => (useOrgScoped ? orgScopedGenderOptions : (genderOptions ?? [])),
    [useOrgScoped, orgScopedGenderOptions, genderOptions],
  );

  const managerOptions: SelectOption[] = useMemo(() => {
    const sourceList = targetManagerOrgId ? fetchedManagers : employees;

    return sourceList
      .filter((e) => {
        const eId = (e as IUserDetail).id ?? (e as { id: string }).id;
        return eId !== (formData.id ?? formData.id);
      })
      .map((e) => {
        const eId = (e as IUserDetail).id ?? (e as { id: string }).id;
        const label =
          (e as { fullName?: string }).fullName ??
          getDisplayName(e as IUserDetail) ??
          (e as IUserDetail).workEmail ??
          (e as IUserDetail).employeeId ??
          "Unnamed";
        return { value: eId, label };
      });
  }, [fetchedManagers, employees, formData.id, targetManagerOrgId]);

  const relationshipOptions: SelectOption[] = useMemo(() => {
    const base = useOrgScoped
      ? orgScopedRelationshipOptions
      : (relationshipOptionsProp ?? []);
    const ec = initialValues?.emergencyContact;
    const val = formData.emergencyContact?.relationshipId ?? ec?.relationshipId;
    const name = ec?.relationshipName;
    if (
      val != null &&
      String(val).trim() &&
      !base.some((o) => String(o.value) === String(val))
    ) {
      return [
        ...base,
        {
          value: String(val),
          label: name && String(name).trim() ? name : String(val),
        },
      ];
    }
    return base;
  }, [
    useOrgScoped,
    orgScopedRelationshipOptions,
    relationshipOptionsProp,
    formData.emergencyContact?.relationshipId,
    initialValues,
  ]);

  const countryOptions: SelectOption[] = useMemo(
    () => COUNTRIES.map((country) => ({ value: country, label: country })),
    [],
  );

  const stateOptions: SelectOption[] = useMemo(
    () => INDIAN_STATES.map((state) => ({ value: state, label: state })),
    [],
  );

  const { data: organizationsData } = useGetOrganizationsFilterQuery(
    undefined,
    {
      skip: !isSuperAdmin,
    },
  );

  const [getOrganizationRoles, { isFetching: isRolesFetching }] =
    useLazyListRolesQuery();

  const educationDetails = useMemo(
    () =>
      normalizeEducationList(
        formData.educationDetails as EducationDetail[] | undefined,
      ),
    [formData.educationDetails],
  );
  const organizationOptions: SelectOption[] = useMemo(() => {
    const list = organizationsData?.data;
    if (!list) return [];

    return list.map((org: { organizationName: string; id: string }) => ({
      label: org.organizationName,
      value: org.id,
    }));
  }, [organizationsData]);

  const employmentDetails = useMemo(
    () =>
      normalizeEmploymentList(
        formData.previousEmployments as EmploymentDetail[] | undefined,
      ),
    [formData.previousEmployments],
  );

  const handleIfscBlur = (ifsc: string) => {
    if (!ifsc?.trim() || !isValidIFSC(ifsc)) return;
    const initialIfsc = (initialValues?.bankDetails?.ifscCode ?? "").trim();
    if (ifsc.trim() === initialIfsc) return;
    fetchIfscDetails(ifsc);
  };

  const updateFormField = <K extends keyof IUserDetail>(
    field: K,
    value: IUserDetail[K],
  ) => {
    let finalValue = value;

    if (
      (field === "firstName" || field === "lastName") &&
      typeof value === "string"
    ) {
      finalValue = capitalizeWords(value) as IUserDetail[K];
    }

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  };

  const updateAddressField = <
    K extends keyof NonNullable<IUserDetail["address"]>,
  >(
    field: K,
    value: NonNullable<IUserDetail["address"]>[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...ensureAddress(prev.address),
        [field]: value,
      },
    }));
  };

  const updatePermanentAddressField = <
    K extends keyof NonNullable<IUserDetail["permanentAddress"]>,
  >(
    field: K,
    value: NonNullable<IUserDetail["permanentAddress"]>[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      permanentAddress: {
        ...ensurePermanentAddress(prev.permanentAddress),
        [field]: value,
      },
    }));
  };

  const handleSameAsCurrentChange = (checked: boolean) => {
    setSameAsCurrent(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: { ...ensureAddress(prev.address) },
      }));
    }
  };

  useEffect(() => {
    if (sameAsCurrent) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: { ...ensureAddress(prev.address) },
      }));
    }
  }, [
    sameAsCurrent,
    formData.address?.street,
    formData.address?.city,
    formData.address?.state,
    formData.address?.zipCode,
    formData.address?.country,
  ]);

  const updateEmergencyField = <
    K extends keyof NonNullable<IUserDetail["emergencyContact"]>,
  >(
    field: K,
    value: NonNullable<IUserDetail["emergencyContact"]>[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...ensureEmergencyContact(prev.emergencyContact),
        [field]: value,
      },
    }));
  };

  const updateBankField = <
    K extends keyof NonNullable<IUserDetail["bankDetails"]>,
  >(
    field: K,
    value: NonNullable<IUserDetail["bankDetails"]>[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...ensureBankDetails(prev.bankDetails ?? undefined),
        [field]: value,
      },
    }));
  };

  const updateEducationField = (
    index: number,
    field: keyof EducationDetail,
    value: EducationDetail[keyof EducationDetail],
  ) => {
    setFormData((prev) => {
      const list = normalizeEducationList(
        prev.educationDetails as EducationDetail[] | undefined,
      );
      const next = list.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, educationDetails: next };
    });
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      educationDetails: [
        ...normalizeEducationList(
          prev.educationDetails as EducationDetail[] | undefined,
        ),
        createDefaultEducation(),
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev) => {
      const list = normalizeEducationList(
        prev.educationDetails as EducationDetail[] | undefined,
      );
      if (list.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        educationDetails: list.filter((_, idx) => idx !== index),
      };
    });
  };

  const updateEmploymentField = (
    index: number,
    field: keyof EmploymentDetail,
    value: EmploymentDetail[keyof EmploymentDetail],
  ) => {
    setFormData((prev) => {
      const list = normalizeEmploymentList(
        prev.previousEmployments as EmploymentDetail[] | undefined,
      );
      const next = list.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, previousEmployments: next };
    });
  };

  const addEmployment = () => {
    setFormData((prev) => ({
      ...prev,
      previousEmployments: [
        ...normalizeEmploymentList(
          prev.previousEmployments as EmploymentDetail[] | undefined,
        ),
        createDefaultEmployment(),
      ],
    }));
  };

  const removeEmployment = (index: number) => {
    setFormData((prev) => {
      const list = normalizeEmploymentList(
        prev.previousEmployments as EmploymentDetail[] | undefined,
      );
      if (list.length <= 1) {
        return prev;
      }
      return {
        ...prev,
        previousEmployments: list.filter((_, idx) => idx !== index),
      };
    });
  };

  const handleOrganizationChange = async (orgId: string) => {
    setSelectedOrgId(orgId);

    setFormData((prev) => ({
      ...prev,
      organizationId: orgId,
      roleId: "",
      role: "",
      department: "",
      designation: "",
      status: "",
      employmentType: "",
      gender: "",
      employeeId: mode === "create" ? "" : prev.employeeId,
    }));

    setRoleOptions([]);

    if (!orgId) return;

    try {
      const [rolesRes, orgDetailsRes] = await Promise.all([
        getOrganizationRoles(
          { active: "true", organizationId: orgId },
          false,
        ).unwrap(),
        mode === "create"
          ? getOrgDetails(orgId).unwrap()
          : Promise.resolve(null),
      ]);

      const roles = Array.isArray(rolesRes)
        ? rolesRes
        : (rolesRes?.items ?? []);

      setRoleOptions(mapRolesResponseToOptions(roles));

      if (mode === "create" && orgDetailsRes?.nextEmployeeId) {
        setFormData((prev) => ({
          ...prev,
          employeeId: orgDetailsRes.nextEmployeeId ?? undefined,
        }));
      }
    } catch (err) {
      toast.error("Failed to fetch organization data");
    }
  };

  const handleProfilePicChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (onProfilePicUpload) {
      setProfilePicUploading(true);
      try {
        const result = await onProfilePicUpload(file);
        if (result) {
          updateFormField("profilePic", result.fileUrl);
          setProfilePicFile(null);
          setProfilePicPreview(result.signedUrl);
        } else {
          setProfilePicFile(file);
          const reader = new FileReader();
          reader.onloadend = () =>
            setProfilePicPreview(reader.result as string);
          reader.readAsDataURL(file);
        }
      } catch {
        toast.error("Failed to upload image");
        setProfilePicFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfilePicPreview(reader.result as string);
        reader.readAsDataURL(file);
      } finally {
        setProfilePicUploading(false);
      }
    } else {
      setProfilePicFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePicPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePic = () => {
    setProfilePicFile(null);
    setProfilePicPreview(null);
    updateFormField("profilePic", "");
  };

  const fetchIfscDetails = async (ifsc: string) => {
    if (!isValidIFSC(ifsc)) {
      return;
    }
    try {
      setIfscLookupLoading(true);
      setIfscLookupError("");
      const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (!response.ok) {
        throw new Error("Lookup failed");
      }
      const data = await response.json();
      updateBankField("bankName", data?.BANK || "");
      updateBankField("branchName", data?.BRANCH || "");
    } catch (error) {
      setIfscLookupError("Could not fetch details for this IFSC.");
    } finally {
      setIfscLookupLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    const errors = getValidationErrors(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorFields = new Set(Object.keys(errors));
      setTouchedFields((prev) => new Set([...prev, ...errorFields]));
      setTimeout(() => {
        const formElement = document.getElementById(formId);
        const firstErrorElement = formElement?.querySelector(".text-red-600");

        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          const inputElement = firstErrorElement.parentElement?.querySelector(
            "input, select, textarea",
          ) as HTMLElement;
          if (inputElement) {
            inputElement.focus();
          }
        }
      }, 100);
      return;
    }

    const selectedRole = roleOptions.find((r) => r.value === formData.roleId);

    const roleTypeName = selectedRole?.label;
    const roleId = selectedRole?.value;

    const finalFormData = { ...formData };
    if (sameAsCurrent) {
      finalFormData.permanentAddress = { ...ensureAddress(finalFormData.address) };
    }

    await onSubmit({
      values: {
        ...(finalFormData as Record<string, unknown>),
        organizationId: isSuperAdmin ? selectedOrgId : userOrgId,
        roleId: roleId as string | undefined,
        roleTypeName,
      },
      profilePicFile,
      localDocuments,
    });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Helper function to get visible errors (only show for touched fields or after submit attempt)
  const getVisibleErrors = (): ValidationErrors => {
    if (submitAttempted) {
      return formErrors;
    }
    const visibleErrors: ValidationErrors = {};
    Object.keys(formErrors).forEach((key) => {
      if (touchedFields.has(key)) {
        visibleErrors[key] = formErrors[key];
      }
    });
    return visibleErrors;
  };

  // Helper function to mark a field as touched
  const markFieldTouched = (fieldName: string) => {
    setTouchedFields((prev) => new Set([...prev, fieldName]));
  };

  const visibleErrors = getVisibleErrors();

  const modalTitle =
    mode === "create"
      ? "Add New Employee"
      : mode === "edit"
        ? selfEditMode
          ? "Edit Profile"
          : "Edit Employee"
        : "Employee Details";

  const modalHeader = (
    <div className="flex items-center w-full">
      <div className="flex-1">
        <span className="text-lg font-bold text-slate-900">{modalTitle}</span>
      </div>

      {isSuperAdmin && !selfEditMode && (
        <div className="w-72 mr-2">
          <Select
            placeholder="Select Organization"
            options={organizationOptions}
            value={selectedOrgId}
            onChange={(val) => handleOrganizationChange(val as string)}
            disabled={mode === "edit" || isViewMode}
            searchable
          />
        </div>
      )}
    </div>
  );

  const isModalDataLoading =
    isRolesFetching || isOrgConfigLoading || isLoadingData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalHeader}
      size="4xl"
      loading={isSubmitting}
      maskClosable={false}
      footer={
        <ModalFooter>
          <ModalButton
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {isViewMode ? "Close" : "Cancel"}
          </ModalButton>
          {!isViewMode && (
            <ModalButton
              variant="primary"
              type="submit"
              form={formId}
              loading={isSubmitting}
              disabled={isFormDisabled}
            >
              {mode === "create"
                ? "Create Employee"
                : selfEditMode
                  ? "Update"
                  : "Update Employee"}
            </ModalButton>
          )}
        </ModalFooter>
      }
      closable={!isSubmitting}
      bodyClassName="space-y-8"
    >
      {isSuperAdmin && !selectedOrgId && !selfEditMode && (
        <div className="text-center py-8 text-slate-500">
          Please select an organization to fill in the employee details.
        </div>
      )}
      {isSuperAdmin && selectedOrgId && isOrgConfigLoading && (
        <div className="text-center py-8 text-slate-500">
          Loading organization configuration...
        </div>
      )}
      {isModalDataLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Loading...</p>
        </div>
      ) : (
        <form
          id={formId}
          onSubmit={handleSubmit}
          className={`space-y-8 ${isFormDisabled ? "pointer-events-none opacity-60" : ""}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BasicInfoSection
              formData={formData}
              formErrors={visibleErrors}
              genderOptions={effectiveGenderOptions}
              managerOptions={managerOptions}
              isViewMode={isViewMode}
              selfEditMode={selfEditMode}
              profilePicPreview={profilePicPreview}
              profilePicUploading={profilePicUploading}
              onProfilePicChange={handleProfilePicChange}
              onProfilePicRemove={handleRemoveProfilePic}
              onFieldChange={updateFormField}
              setFormErrors={setFormErrors}
              getValidationErrors={getValidationErrors}
              markFieldTouched={markFieldTouched}
            />
            <WorkInfoSection
              roleOptions={roleOptions}
              formData={formData}
              formErrors={visibleErrors}
              isViewMode={isViewMode}
              selfEditMode={selfEditMode}
              departmentOptions={departmentOptions}
              positionOptions={positionOptions}
              employmentTypeOptions={employmentTypeOptions}
              statusOptions={statusOptions}
              onFieldChange={updateFormField}
              setFormErrors={setFormErrors}
              getValidationErrors={getValidationErrors}
              markFieldTouched={markFieldTouched}
            />
          </div>

          <AddressSection
            address={formData.address}
            permanentAddress={formData.permanentAddress}
            sameAsCurrent={sameAsCurrent}
            isViewMode={isViewMode}
            selfEditMode={selfEditMode}
            formErrors={visibleErrors}
            stateOptions={stateOptions}
            countryOptions={countryOptions}
            onAddressChange={updateAddressField}
            onPermanentAddressChange={updatePermanentAddressField}
            onSameAsCurrentChange={handleSameAsCurrentChange}
            setFormErrors={setFormErrors}
            markFieldTouched={markFieldTouched}
          />

          <EmergencyContactSection
            contact={formData.emergencyContact}
            formData={formData}
            isViewMode={isViewMode}
            selfEditMode={selfEditMode}
            formErrors={visibleErrors}
            relationshipOptions={relationshipOptions}
            onContactChange={updateEmergencyField}
            setFormErrors={setFormErrors}
            getValidationErrors={getValidationErrors}
            markFieldTouched={markFieldTouched}
          />

          <BankDetailsSection
            bankDetails={formData.bankDetails}
            isViewMode={isViewMode}
            selfEditMode={selfEditMode}
            formErrors={visibleErrors}
            ifscLookupLoading={ifscLookupLoading}
            ifscLookupError={ifscLookupError}
            onBankChange={updateBankField}
            onIfscLookup={handleIfscBlur}
            setFormErrors={setFormErrors}
            markFieldTouched={markFieldTouched}
          />

          <DocumentsSection
            userId={(formData.id ?? initialValues?.id) as string | undefined}
            isViewMode={isViewMode}
            selfEditMode={selfEditMode}
            localDocuments={localDocuments}
            onAddLocalDocument={handleAddLocalDocument}
            onRemoveLocalDocument={handleRemoveLocalDocument}
          />

          <EmploymentHistorySection
            joiningDate={formData.joinDate}
            employments={employmentDetails}
            positionOptions={positionOptions}
            isViewMode={isViewMode}
            onAdd={addEmployment}
            onRemove={removeEmployment}
            onChange={updateEmploymentField}
          />

          <EducationSection
            educationDetails={educationDetails}
            disciplines={disciplineOptions}
            isViewMode={isViewMode}
            selfEditMode={selfEditMode}
            onAdd={addEducation}
            onRemove={removeEducation}
            onChange={updateEducationField}
          />
        </form>
      )}
    </Modal>
  );
};

export default EmployeeFormModal;

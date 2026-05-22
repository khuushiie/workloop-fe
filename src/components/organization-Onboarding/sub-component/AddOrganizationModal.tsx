import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Building2 } from "lucide-react";
import Modal, { ModalFooter, ModalButton } from "../../common/Modal";
import Input from "../../common/Input";
import Select from "../../common/Select";
import type { SelectOption } from "../../common/Select";
import RadioButton from "../../common/RadioButton";
import {
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
} from "../../../store/apis/organization.api";
import { useUploadOrganizationLogoMutation } from "../../../store/apis/uploads.api";
import {
  useGetMasterConfigByCategoryQuery,
  type IMasterConfigOption,
} from "../../../store/apis/masterConfig.api";
import { COUNTRIES, INDIAN_STATES } from "../../../utils/constants";
import {
  SubscriptionPlan,
  isSubscriptionPlan,
} from "../../../constants/subscriptionPlan";
import type { IOrganizationDetail } from "../../../types/organization.types";
import SelectModulesModal from "./SelectModuleModal";
import { TextField } from "../../employees/components/employee-form/FormFields";
import SignedImage from "../../common/SignedImage";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrganisationModalMode = "create" | "edit";

interface Ipoc {
  name: string;
  email: string;
  phone: string;
}

interface IOrganisationAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface ILocationConfigFormData {
  enforceOfficeCheckin: boolean;
  latitude: string;
  longitude: string;
  allowedRadiusMeters: string;
}

interface IOrganisationFormData {
  name: string;
  code: string;
  tagline: string;
  email: string;
  website: string;
  status: string;
  subscriptionPlan: SubscriptionPlan;
  userLimit: string;
  employeeIdFormat: string;
  logo: string;
  poc: Ipoc;
  address: IOrganisationAddress;
  locationConfig: ILocationConfigFormData;
}

interface IOrganisationValidationErrors {
  name?: string;
  code?: string;
  email?: string;
  website?: string;
  status?: string;
  subscriptionPlan?: string;
  employeeIdFormat?: string;
  userLimit?: string;
  pocName?: string;
  pocEmail?: string;
  pocPhone?: string;
  zipCode?: string;
  locationLatitude?: string;
  locationLongitude?: string;
  locationRadius?: string;
}
interface IAddOrganisationModalProps {
  isOpen: boolean;
  mode: OrganisationModalMode;
  initialData?: IOrganizationDetail | null;

  // pre-fills SelectModulesModal in edit mode
  initialSelectedNodeIds?: string[];
  loadingData?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_POC: Ipoc = {
  name: "",
  email: "",
  phone: "",
};

const DEFAULT_ADDRESS: IOrganisationAddress = {
  street: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};

const ORG_CODE_REGEX = /^[A-Za-z0-9]{3,9}$/;

/** Minimum allowed user count for a new organisation (enforced in UI and validation). */
const MIN_ORG_USER_LIMIT = 20;

const PLAN_OPTIONS: SelectOption[] = [
  { value: SubscriptionPlan.STARTER, label: "Starter" },
  { value: SubscriptionPlan.GROWTH, label: "Growth" },
  { value: SubscriptionPlan.ENTERPRISE, label: "Enterprise" },
];

const DEFAULT_LOCATION_CONFIG: ILocationConfigFormData = {
  enforceOfficeCheckin: false,
  latitude: "",
  longitude: "",
  allowedRadiusMeters: "100",
};

const DEFAULT_FORM_DATA: IOrganisationFormData = {
  name: "",
  code: "",
  tagline: "",
  email: "",
  website: "",
  status: "",
  subscriptionPlan: SubscriptionPlan.STARTER,
  userLimit: "",
  employeeIdFormat: "",
  logo: "",
  poc: { ...DEFAULT_POC },
  address: { ...DEFAULT_ADDRESS },
  locationConfig: { ...DEFAULT_LOCATION_CONFIG },
};

// ─── Regex ────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const URL_REGEX =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-.~:/?#[\]@!$&'()*+,;=%]*)?$/i;
const ZIP_REGEX = /^\d{5,6}$/;
// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeTrim = (value: string | null | undefined): string =>
  value == null ? "" : String(value).trim();

/**
 * Allows only digits, a single `.`, and an optional leading `-` for signed coordinates.
 * Strips all other characters (letters, spaces, `e`, etc.).
 */
const sanitizeLatLngDecimalInput = (raw: string): string => {
  let s = String(raw ?? "").replace(/[^0-9.\-]/g, "");
  if (!s) return "";

  const neg = s[0] === "-";
  if (neg) s = s.slice(1);
  s = s.replace(/-/g, "");

  const firstDot = s.indexOf(".");
  if (firstDot === -1) {
    return (neg ? "-" : "") + s;
  }

  const intPart = s.slice(0, firstDot).replace(/\./g, "");
  const fracPart = s.slice(firstDot + 1).replace(/\./g, "");
  return (neg ? "-" : "") + intPart + "." + fracPart;
};

// POC is now fully required — all three fields must be filled
const validate = (
  data: IOrganisationFormData,
): IOrganisationValidationErrors => {
  const errors: IOrganisationValidationErrors = {};

  // Organisation fields
  if (!data.name.trim()) {
    errors.name = "Organisation name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (!safeTrim(data.code)) {
    errors.code = "Organisation code is required";
  } else if (!ORG_CODE_REGEX.test(data.code.trim())) {
    errors.code = "Code must be 3–9 alphanumeric characters (e.g. ACME)";
  }

  if (!data.email.trim()) {
    errors.email = "Organisation email is required";
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!data.status.trim()) {
    errors.status = "Status is required";
  }

  if (!safeTrim(data.employeeIdFormat)) {
    errors.employeeIdFormat = "Employee ID format is required";
  }

  if (!data.subscriptionPlan.trim()) {
    errors.subscriptionPlan = "Subscription plan is required";
  }

  if (!data.userLimit.trim()) {
    errors.userLimit = "Number of users is required";
  } else {
    const num = parseInt(data.userLimit, 10);
    if (isNaN(num) || num < 1) {
      errors.userLimit = "Enter a valid number of users";
    } else if (num < MIN_ORG_USER_LIMIT) {
      errors.userLimit = `Organization must have at least ${MIN_ORG_USER_LIMIT} users`;
    }
  }

  if (data.website.trim() && !URL_REGEX.test(data.website.trim())) {
    errors.website = "Enter a valid URL (e.g. https://example.com)";
  }

  // POC — all three fields are required
  if (!data.poc.name.trim()) {
    errors.pocName = "POC name is required";
  }

  if (!data.poc.email.trim()) {
    errors.pocEmail = "POC email is required";
  } else if (!EMAIL_REGEX.test(data.poc.email.trim())) {
    errors.pocEmail = "Enter a valid POC email address";
  }

  if (!data.poc.phone.trim()) {
    errors.pocPhone = "POC phone is required";
  } else if (!PHONE_REGEX.test(data.poc.phone.trim())) {
    errors.pocPhone = "Phone must be 10 digits and start with 6–9";
  }

  const zip = data.address.zipCode.trim();

  if (zip && !ZIP_REGEX.test(zip)) {
    errors.zipCode = "ZIP must be 5 or 6 digits";
  }

  if (data.locationConfig.enforceOfficeCheckin) {
    const lat = data.locationConfig.latitude.trim();
    const lng = data.locationConfig.longitude.trim();

    if (!lat) {
      errors.locationLatitude = "Latitude is required when office check-in is enforced";
    } else {
      const latNum = parseFloat(lat);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        errors.locationLatitude = "Latitude must be between -90 and 90";
      }
    }

    if (!lng) {
      errors.locationLongitude = "Longitude is required when office check-in is enforced";
    } else {
      const lngNum = parseFloat(lng);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        errors.locationLongitude = "Longitude must be between -180 and 180";
      }
    }

    const radiusStr = data.locationConfig.allowedRadiusMeters.trim();
    if (radiusStr) {
      const radiusNum = parseFloat(radiusStr);
      if (isNaN(radiusNum) || radiusNum < 10) {
        errors.locationRadius = "Radius must be at least 10 meters";
      }
    }
  }

  return errors;
};

const buildInitialFormData = (
  data: IOrganizationDetail | null | undefined,
  statusList?: IMasterConfigOption[],
): IOrganisationFormData => {
  if (!data) {
    return {
      ...DEFAULT_FORM_DATA,
      poc: { ...DEFAULT_POC },
      address: { ...DEFAULT_ADDRESS },
      locationConfig: { ...DEFAULT_LOCATION_CONFIG },
    };
  }

  let normalizedStatus = data.status ?? "";

  if (statusList?.length && data.status) {
    const match = statusList.find(
      (s) =>
        s.id === data.status ||
        s.displayName.toLowerCase() === data.status.toLowerCase(),
    );

    normalizedStatus = match?.id ?? "";
  }

  return {
    name: data.name ?? "",
    code: data.code ?? "",
    tagline: data.tagline ?? "",
    email: data.email ?? "",
    website: data.website ?? "",
    status: normalizedStatus,
    subscriptionPlan: isSubscriptionPlan(data.subscriptionPlan)
      ? data.subscriptionPlan
      : SubscriptionPlan.STARTER,
    userLimit: data.userLimit != null ? String(data.userLimit) : "",
    employeeIdFormat: data.employeeIdFormat ?? "",
    logo: data.logo ?? "",
    poc: {
      name: data.poc?.name ?? "",
      email: data.poc?.email ?? "",
      phone: data.poc?.phone ?? "",
    },
    address: {
      street: data.address?.street ?? "",
      city: data.address?.city ?? "",
      state: data.address?.state ?? "",
      country: data.address?.country ?? "",
      zipCode: data.address?.zipCode ?? "",
    },
    locationConfig: {
      enforceOfficeCheckin: data.locationConfig?.enforceOfficeCheckin ?? false,
      latitude:
        data.locationConfig?.latitude != null
          ? String(data.locationConfig.latitude)
          : "",
      longitude:
        data.locationConfig?.longitude != null
          ? String(data.locationConfig.longitude)
          : "",
      allowedRadiusMeters:
        data.locationConfig?.allowedRadiusMeters != null
          ? String(data.locationConfig.allowedRadiusMeters)
          : "100",
    },
  };
};

// ─── Component ────────────────────────────────────────────────────────────────

const AddOrganizationModal: React.FC<IAddOrganisationModalProps> = ({
  isOpen,
  mode,
  initialData,
  initialSelectedNodeIds = [],
  onClose,
  loadingData = false,
  onSuccess,
}) => {
  // ── Mutations ─────────────────────────────────────────────────────────────
  const [createOrganization, { isLoading: isCreating }] =
    useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: isUpdating }] =
    useUpdateOrganizationMutation();
  const [uploadOrganizationLogo, { isLoading: logoUploading }] =
    useUploadOrganizationLogoMutation();

  const isSubmitting = isCreating || isUpdating;
  const isEditLoading = mode === "edit" && loadingData;

  // ── Master config — status options ────────────────────────────────────────

  const { data: organisationStatusList } = useGetMasterConfigByCategoryQuery(
    "organization_status",
  );

  const statusOptions: SelectOption[] = useMemo(
    () =>
      (organisationStatusList ?? []).map((item: IMasterConfigOption) => ({
        value: item.id,
        label: item.displayName,
      })),
    [organisationStatusList],
  );

  // ── Country / State options ───────────────────────────────────────────────
  const countryOptions: SelectOption[] = useMemo(
    () => COUNTRIES.map((c) => ({ value: c, label: c })),
    [],
  );

  const stateOptions: SelectOption[] = useMemo(
    () => INDIAN_STATES.map((s) => ({ value: s, label: s })),
    [],
  );

  // ── Form state ────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<IOrganisationFormData>(() =>
    buildInitialFormData(null),
  );
  const [formErrors, setFormErrors] = useState<IOrganisationValidationErrors>(
    {},
  );
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    initialSelectedNodeIds ?? [],
  );

  const formId = "add-organisation-form";

  // ── Reset on open / mode change ───────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    setFormData(
      buildInitialFormData(
        mode === "edit" ? initialData : null,
        organisationStatusList,
      ),
    );

    setFormErrors({});
    setTouchedFields(new Set());
    setSubmitAttempted(false);
    setCurrentStep(1);
    setSelectedPermissionIds(initialSelectedNodeIds ?? []);
  }, [
    isOpen,
    mode,
    initialData,
    organisationStatusList,
    initialSelectedNodeIds,
  ]);
  // ── Live validation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setFormErrors(validate(formData));
  }, [formData, isOpen]);

  // ── Visible errors (only show after blur or submit attempt) ───────────────
  const visibleErrors = useMemo((): IOrganisationValidationErrors => {
    if (submitAttempted) return formErrors;
    const result: IOrganisationValidationErrors = {};
    (
      Object.keys(formErrors) as (keyof IOrganisationValidationErrors)[]
    ).forEach((key) => {
      if (touchedFields.has(key)) result[key] = formErrors[key];
    });
    return result;
  }, [formErrors, touchedFields, submitAttempted]);

  // ── Field setters ─────────────────────────────────────────────────────────

  const markTouched = (field: string) =>
    setTouchedFields((prev) => new Set([...prev, field]));

  const setField = (
    field: keyof Omit<IOrganisationFormData, "poc" | "address">,
    value: string | SubscriptionPlan,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (value) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const setPocField = (field: keyof Ipoc, value: string) => {
    setFormData((prev) => ({
      ...prev,
      poc: { ...prev.poc, [field]: value },
    }));
  };

  const setAddressField = (
    field: keyof IOrganisationAddress,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const setLocationConfigField = (
    field: keyof ILocationConfigFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      locationConfig: { ...prev.locationConfig, [field]: value },
    }));
  };

  /**
   * Toggles office check-in enforcement. When turned off, clears latitude/longitude/radius
   * validation errors and touch state so stale messages disappear, without wiping field values.
   */
  const handleEnforceOfficeCheckinChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      locationConfig: {
        ...prev.locationConfig,
        enforceOfficeCheckin: checked,
      },
    }));
    if (!checked) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.locationLatitude;
        delete next.locationLongitude;
        delete next.locationRadius;
        return next;
      });
      setTouchedFields((prev) => {
        const next = new Set(prev);
        next.delete("locationLatitude");
        next.delete("locationLongitude");
        next.delete("locationRadius");
        return next;
      });
    }
  };

  // ── Build POC payload — always included (all required) ───────────────────
  const buildpoc = () => ({
    name: safeTrim(formData.poc.name),
    email: safeTrim(formData.poc.email),
    phone: safeTrim(formData.poc.phone),
  });

  /** Build locationConfig payload for the API. */
  const buildLocationConfig = () => {
    const lc = formData.locationConfig;
    if (!lc.enforceOfficeCheckin) {
      return { enforceOfficeCheckin: false };
    }
    return {
      enforceOfficeCheckin: true,
      latitude: parseFloat(lc.latitude),
      longitude: parseFloat(lc.longitude),
      ...(lc.allowedRadiusMeters.trim()
        ? { allowedRadiusMeters: parseFloat(lc.allowedRadiusMeters) }
        : {}),
    };
  };

  // ── Build address payload — omit if all fields empty ─────────────────────
  const buildAddress = () => {
    const addr = formData.address;
    const hasAny =
      safeTrim(addr.street) ||
      safeTrim(addr.city) ||
      safeTrim(addr.state) ||
      safeTrim(addr.country) ||
      safeTrim(addr.zipCode);
    if (!hasAny) return undefined;
    return {
      street: safeTrim(addr.street) || undefined,
      city: safeTrim(addr.city) || undefined,
      state: safeTrim(addr.state) || undefined,
      country: safeTrim(addr.country) || undefined,
      zipCode: safeTrim(addr.zipCode) || undefined,
    };
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  // Create mode : createOrganization → open SelectModulesModal
  // Edit mode   : updateOrganization → open SelectModulesModal
  // const handleNext = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setSubmitAttempted(true);

  //   const errors = validate(formData);
  //   setFormErrors(errors);

  //   if (Object.keys(errors).length > 0) {
  //     setTouchedFields((prev) => new Set([...prev, ...Object.keys(errors)]));
  //     return;
  //   }

  //   try {
  //     if (mode === "create") {
  //       setSelectModulesOpen(true);
  //     } else if (mode === "edit" && initialData?.id) {
  //       await updateOrganization({
  //         id: initialData.id,
  //         body: {
  //           name: safeTrim(formData.name),
  //           email: safeTrim(formData.email),
  //           website: safeTrim(formData.website) || undefined,
  //           status: safeTrim(formData.status),
  //           poc: buildpoc(),
  //           address: buildAddress(),
  //         },
  //       }).unwrap();

  //       setSelectModulesOpen(true);
  //     }
  //   } catch (err: unknown) {
  //     const message =
  //       (err as { data?: { message?: string } })?.data?.message ??
  //       (err as { message?: string })?.message ??
  //       "Something went wrong. Please try again.";
  //     toast.error(message);
  //   }
  // };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const errors = validate(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setTouchedFields((prev) => new Set([...prev, ...Object.keys(errors)]));
      return;
    }

    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }
    try {
      const res = await uploadOrganizationLogo({ file }).unwrap();
      setField("logo", res.fileUrl);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as { message?: string })?.message ??
        "Failed to upload logo";
      toast.error(msg);
    } finally {
      e.target.value = "";
    }
  };

  const handleLogoRemove = () => {
    setField("logo", "");
  };

  const handleModulesSubmit = async (permissionIds: string[]) => {
    try {
      if (mode === "create") {
        const userLimitNum = parseInt(formData.userLimit, 10);
        await createOrganization({
          name: safeTrim(formData.name),
          code: safeTrim(formData.code).toUpperCase(),
          ...(safeTrim(formData.tagline) && {
            tagline: safeTrim(formData.tagline),
          }),
          email: safeTrim(formData.email),
          website: safeTrim(formData.website) || undefined,
          status: safeTrim(formData.status),
          poc: buildpoc(),
          address: buildAddress(),
          permissions: permissionIds ?? [],
          employeeIdFormat: safeTrim(formData.employeeIdFormat),
          userLimit: userLimitNum,
          subscriptionPlan: formData.subscriptionPlan,
          ...(safeTrim(formData.logo) && { logo: safeTrim(formData.logo) }),
          locationConfig: buildLocationConfig(),
        }).unwrap();
      } else if (mode === "edit" && initialData?.id) {
        const userLimitNum = parseInt(formData.userLimit, 10);
        await updateOrganization({
          id: initialData.id,
          body: {
            name: safeTrim(formData.name),
            ...(safeTrim(formData.code) && {
              code: safeTrim(formData.code).toUpperCase(),
            }),
            ...(formData.tagline !== undefined && {
              tagline: safeTrim(formData.tagline) || null,
            }),
            email: safeTrim(formData.email),
            website: safeTrim(formData.website) || undefined,
            status: safeTrim(formData.status),
            poc: buildpoc(),
            address: buildAddress(),
            permissions: permissionIds ?? [],
            employeeIdFormat: safeTrim(formData.employeeIdFormat),
            userLimit: userLimitNum,
            subscriptionPlan: formData.subscriptionPlan,
            ...(formData.logo !== undefined && {
              logo: safeTrim(formData.logo) || null,
            }),
            locationConfig: buildLocationConfig(),
          },
        }).unwrap();
      }

      onSuccess();
      onClose();
      toast.success(
        mode === "create"
          ? "Organization created successfully"
          : "Organization updated successfully",
      );
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        (err as { message?: string })?.message ??
        "Failed to save organization";
      toast.error(message);
    }
  };
  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleModulesSuccess = () => {
    onSuccess();
    onClose();
  };

  const handleModulesClose = () => {
    onSuccess();
    onClose();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Step 1: Organisation form ──────────────────────────────────── */}
      <Modal
        isOpen={isOpen && currentStep === 1}
        onClose={handleClose}
        title={
          mode === "create"
            ? "Add New Organisation - Organisation Information"
            : "Edit Organisation - Organisation Information"
        }
        size="4xl"
        loading={isSubmitting || isEditLoading}
        maskClosable={false}
        closable={!isSubmitting && !isEditLoading}
        bodyClassName="space-y-8"
        className="h-[750px]"
        footer={
          <ModalFooter>
            <ModalButton
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting || isEditLoading}
            >
              Cancel
            </ModalButton>
            <ModalButton
              variant="primary"
              type="submit"
              form={formId}
              loading={isSubmitting}
              disabled={isEditLoading}
            >
              <span className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </span>
            </ModalButton>
          </ModalFooter>
        }
      >
        <form id={formId} onSubmit={handleNext} className="space-y-8">
          {/* ── Section 1: Organisation Information ─────────────────────── */}
          <div className="space-y-6">
            <div className="flex flex-col items-start gap-4">
              <label className="block text-sm font-semibold text-slate-700">
                Organisation Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-slate-200 relative shrink-0">
                  {logoUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-10">
                      <span className="text-xs text-white font-medium">
                        Uploading…
                      </span>
                    </div>
                  )}
                  {formData.logo ? (
                    <SignedImage
                      rawUrl={formData.logo}
                      alt="Organisation logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="org-logo-upload"
                    className="cursor-pointer px-4 py-2 text-sm font-medium text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    {formData.logo ? "Change Logo" : "Upload Logo"}
                  </label>
                  <input
                    id="org-logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  {formData.logo && (
                    <button
                      type="button"
                      onClick={handleLogoRemove}
                      className="px-4 py-2 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition-colors text-left"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Organization Name"
                required
                placeholder="Enter organization name"
                value={formData.name}
                onChange={(val) => setField("name", String(val ?? ""))}
                onBlur={() => markTouched("name")}
                error={visibleErrors.name}
              />

              <Input
                label="Organisation Code (3 to 9 characters)"
                required
                placeholder="Enter Organisation Code"
                maxLength={9}
                value={formData.code}
                onChange={(val) =>
                  setField(
                    "code",
                    String(val ?? "")
                      .toUpperCase()
                      .slice(0, 9),
                  )
                }
                onBlur={() => markTouched("code")}
                error={visibleErrors.code}
              />

              <Input
                label="Tagline (optional)"
                placeholder="Enter organization tagline"
                value={formData.tagline}
                onChange={(val) => setField("tagline", String(val ?? ""))}
              />

              <Input
                label="Organization Email"
                required
                type="email"
                placeholder="Enter organization email"
                value={formData.email}
                onChange={(val) => setField("email", String(val ?? ""))}
                onBlur={() => markTouched("email")}
                error={visibleErrors.email}
              />

              <Input
                label="Website"
                placeholder="Enter Website url (e.g. https://www.example.com)"
                value={formData.website}
                onChange={(val) => setField("website", String(val ?? ""))}
                onBlur={() => markTouched("website")}
                error={visibleErrors.website}
              />

              <div className="space-y-2">
                <RadioButton
                  name="status"
                  label="Select Status"
                  required={true}
                  options={statusOptions?.length > 0 ? statusOptions : [
                    { label: "Active", value: "true" },
                    { label: "Inactive", value: "false" },
                  ]}
                  value={formData.status}
                  onChange={(val) => {
                    setField("status", String(val));
                    markTouched("status");
                  }}
                  error={visibleErrors.status}
                  direction="row"
                />
              </div>

              <Input
                label="Employee ID format (e.g. EMP → EMP001, EMP002)"
                placeholder="Enter Employee ID"
                required
                value={formData.employeeIdFormat}
                onChange={(val) =>
                  setField("employeeIdFormat", String(val ?? ""))
                }
                onBlur={() => markTouched("employeeIdFormat")}
                error={visibleErrors.employeeIdFormat}
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Subscription Plan <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.subscriptionPlan}
                  options={PLAN_OPTIONS}
                  onChange={(val) => {
                    const raw = String(val ?? SubscriptionPlan.STARTER);
                    const plan = isSubscriptionPlan(raw)
                      ? raw
                      : SubscriptionPlan.STARTER;
                    setField("subscriptionPlan", plan);
                    markTouched("subscriptionPlan");
                  }}
                  placeholder="Select Plan"
                />
                {visibleErrors.subscriptionPlan && (
                  <p className="text-xs text-red-500 mt-1">
                    {visibleErrors.subscriptionPlan}
                  </p>
                )}
              </div>

              <Input
                label={`Number of users ( min ${MIN_ORG_USER_LIMIT} )`}
                type="text"
                required
                placeholder={"Enter Number of users"}
                value={formData.userLimit}
                onChange={(val) => {
                  const str = String(val ?? "");
                  const num = str.replace(/[^\d]/g, "");
                  setField("userLimit", num);
                }}
                onBlur={() => markTouched("userLimit")}
                error={visibleErrors.userLimit}
              />
            </div>
          </div>

          {/* ── Section 2: Point of Contact (all required) ───────────────── */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Point of Contact
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="POC Name"
                required
                placeholder="Enter POC name"
                value={formData.poc.name}
                onChange={(val) => setPocField("name", String(val ?? ""))}
                onBlur={() => markTouched("pocName")}
                error={visibleErrors.pocName}
              />

              <Input
                label="POC Email"
                required
                type="email"
                placeholder="Enter POC email"
                value={formData.poc.email}
                onChange={(val) => setPocField("email", String(val ?? ""))}
                onBlur={() => markTouched("pocEmail")}
                error={visibleErrors.pocEmail}
              />

              <TextField
                label="POC Phone"
                required
                maxLength={10}
                placeholder="Enter POC Phone number"
                value={formData.poc.phone}
                onChange={(val) => {
                  let str = String(val ?? "");

                  // remove non-digits
                  str = str.replace(/[^\d]/g, "");

                  // enforce first digit 6–9
                  if (str.length === 1 && !/[6-9]/.test(str)) {
                    str = "";
                  }

                  // limit to 10 digits
                  str = str.slice(0, 10);

                  setPocField("phone", str);
                }}
                onBlur={() => markTouched("pocPhone")}
                error={visibleErrors.pocPhone}
              />
            </div>
          </div>

          {/* ── Section 3: Address (all optional) ───────────────────────── */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Address
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Input
                label="Street"
                placeholder="Enter Street Address"
                value={formData.address.street}
                onChange={(val) => setAddressField("street", String(val ?? ""))}
              />

              <Input
                label="City"
                placeholder="Enter City"
                value={formData.address.city}
                onChange={(val) => setAddressField("city", String(val ?? ""))}
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  State
                </label>
                <Select
                  value={formData.address.state}
                  options={stateOptions}
                  onChange={(val) =>
                    setAddressField("state", String(val ?? ""))
                  }
                  placeholder="Select State"
                  searchable
                  clearable
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Country
                </label>
                <Select
                  value={formData.address.country}
                  options={countryOptions}
                  onChange={(val) =>
                    setAddressField("country", String(val ?? ""))
                  }
                  placeholder="Select Country"
                  searchable
                  clearable
                />
              </div>

              <TextField
                maxLength={6}
                label="ZIP / Postal Code"
                placeholder="Enter Postal Code"
                value={formData.address.zipCode}
                onChange={(val) => {
                  let str = String(val ?? "");

                  // allow only digits
                  str = str.replace(/[^\d]/g, "");

                  // limit length
                  str = str.slice(0, 6);

                  setAddressField("zipCode", str);
                }}
                onBlur={() => markTouched("zipCode")}
                error={visibleErrors.zipCode}
              />
            </div>
          </div>

          {/* ── Section 4: Office Location Config ───────────────────────── */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Office Location &amp; Check-In
            </h3>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                checked={formData.locationConfig.enforceOfficeCheckin}
                onChange={(e) =>
                  handleEnforceOfficeCheckinChange(e.target.checked)
                }
              />
              <span className="text-sm font-medium text-slate-700">
                Restrict check-in to office premises only
              </span>
            </label>

            {formData.locationConfig.enforceOfficeCheckin && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Input
                  label="Office Latitude"
                  required
                  type="text"
                  placeholder="e.g. 18.5824222"
                  value={formData.locationConfig.latitude}
                  onChange={(val) => {
                    setLocationConfigField(
                      "latitude",
                      sanitizeLatLngDecimalInput(String(val ?? "")),
                    );
                  }}
                  onBlur={() => markTouched("locationLatitude")}
                  error={visibleErrors.locationLatitude}
                />

                <Input
                  label="Office Longitude"
                  required
                  type="text"
                  placeholder="e.g. 73.7260936"
                  value={formData.locationConfig.longitude}
                  onChange={(val) => {
                    setLocationConfigField(
                      "longitude",
                      sanitizeLatLngDecimalInput(String(val ?? "")),
                    );
                  }}
                  onBlur={() => markTouched("locationLongitude")}
                  error={visibleErrors.locationLongitude}
                />

                <Input
                  label="Allowed Radius (meters)"
                  type="text"
                  placeholder="Default: 100"
                  value={formData.locationConfig.allowedRadiusMeters}
                  onChange={(val) => {
                    const str = String(val ?? "").replace(/[^\d]/g, "");
                    setLocationConfigField("allowedRadiusMeters", str);
                  }}
                  onBlur={() => markTouched("locationRadius")}
                  error={visibleErrors.locationRadius}
                />
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* ── Step 2: Select Modules (opens after Next succeeds) ─────────── */}
      {isOpen && currentStep === 2 && (
        <SelectModulesModal
          isOpen={isOpen && currentStep === 2}
          //pre-fills tree with existing selections on edit
          initialSelectedNodeIds={selectedPermissionIds}
          isSubmitting={isSubmitting}
          onSelectionChange={setSelectedPermissionIds}
          onClose={handleModulesClose}
          onBack={handleBack}
          onSuccess={handleModulesSubmit}
        />
      )}
    </>
  );
};

export default AddOrganizationModal;

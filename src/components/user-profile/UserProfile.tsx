import { useState, useEffect, type ReactNode } from "react";
import BadgeComponent from "../common/Badge";
import {
  Badge,
  CalendarDays,
  Phone,
  UserCircle2,
  Users,
  MailPlusIcon,
  Cake,
  MapIcon,
  Briefcase,
  Fingerprint,
  Pencil,
  Building2,
  Shield,
} from "lucide-react";
import { User as UserIcon } from "lucide-react";
import type {
  IUserDetail,
  IUserDetailEducation,
  IUserDetailPreviousEmployment,
  IUpdateUserBody,
} from "../../types/user.api.types";
import EmployeeFormModal from "../employees/components/EmployeeFormModal";
import { EmployeeFormSubmitPayload } from "../employees/components/types";
import {
  useGetMasterConfigByCategoryQuery,
  type IMasterConfigOption,
} from "../../store/apis/masterConfig.api";
import type { SelectOption } from "../common/Select";
import toast from "react-hot-toast";
import UserProfileSkeleton from "./UserProfileSkeleton";
import EmployeeProfile from "./EmployeeProfile";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { MasterConfigCategory } from "../../constants";
import { Button, OverflowTooltip } from "../common";
import { getDepartmentVariant } from "../../utils/badgeVariants";
import { formatDate } from "../../utils/timeUtils";
import { useAuth } from "../../store/hooks/useAuth";
import { formatDisplayValue } from "../../utils/stringUtils";
import { useAppDispatch } from "../../store/hooks";
import {
  userApi,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../store/apis/user.api";
import { useUploadProfileImageMutation } from "../../store/apis/uploads.api";
import { useSignedUrl } from "../../store/hooks/useSignedUrl";

const safeTrim = (s: string | null | undefined): string =>
  s == null ? "" : String(s).trim();

function buildProfileUpdateBody(
  v: Partial<IUserDetail>,
  profilePicUrl?: string,
): IUpdateUserBody {
  const body: IUpdateUserBody = {};
  if (v.firstName !== undefined) body.firstName = safeTrim(v.firstName);
  if (v.lastName !== undefined) body.lastName = safeTrim(v.lastName);
  if (v.email !== undefined) body.email = safeTrim(v.email);
  if (v.phone !== undefined) body.phone = safeTrim(v.phone);
  if (v.gender !== undefined) body.gender = safeTrim(v.gender);
  if (v.bloodGroup !== undefined) body.bloodGroup = safeTrim(v.bloodGroup);
  if (v.uanNumber !== undefined) body.uanNumber = safeTrim(v.uanNumber);
  if (v.aadharCardNo !== undefined)
    body.aadharCardNo = safeTrim(v.aadharCardNo);
  if (v.panCardNo !== undefined) body.panCardNo = safeTrim(v.panCardNo);
  if (v.dob !== undefined) body.dob = safeTrim(v.dob);
  if (profilePicUrl !== undefined) body.profilePic = profilePicUrl;
  else if (v.profilePic !== undefined) body.profilePic = safeTrim(v.profilePic);
  if (v.motherName !== undefined) body.motherName = safeTrim(v.motherName);
  if (v.fatherName !== undefined) body.fatherName = safeTrim(v.fatherName);
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
      relationshipId: safeTrim(v.emergencyContact.relationshipId) || undefined,
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
    const withData = v.educationDetails.filter((e: IUserDetailEducation) =>
      safeTrim(e.institutionName),
    );
    if (withData.length > 0) {
      body.educationDetails = withData.map((e: IUserDetailEducation) => ({
        id: (e as IUserDetailEducation & { id?: string }).id,
        institutionName: safeTrim(e.institutionName),
        discipline: safeTrim(e?.discipline as unknown as string),
        startDate: safeTrim(e.startDate),
        endDate: safeTrim(e.endDate),
        grade: safeTrim(e.grade),
        percentage: e.percentage,
        explainBreaks: safeTrim(e.explainBreaks) || undefined,
      }));
    }
  }
  if (v.previousEmployments?.length) {
    const withData = v.previousEmployments.filter(
      (p: IUserDetailPreviousEmployment) => safeTrim(p.employerName),
    );
    if (withData.length > 0) {
      body.previousEmployments = withData.map(
        (p: IUserDetailPreviousEmployment) => ({
          id: (p as IUserDetailPreviousEmployment & { id?: string }).id,
          employerName: safeTrim(p.employerName),
          designation: safeTrim(p?.designation as unknown as string),
          startDate: safeTrim(p.startDate),
          endDate: safeTrim(p.endDate),
          annualCTC: p.annualCTC,
          breakReason: safeTrim(p.breakReason),
        }),
      );
    }
  }
  return body;
}

function UserProfile() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [openingEdit, setOpeningEdit] = useState(false);
  const canManage = useHasPermission(PERMISSIONS.EMPLOYEE_PROFILE_MANAGE);
  const [imgError, setImgError] = useState(false);
  const userId = user?.id ?? "";
  const {
    data: userData,
    isLoading: loading,
    isFetching,
    isError: hasError,
    error: queryError,
    refetch: refetchUser,
  } = useGetUserByIdQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  const [updateUser] = useUpdateUserMutation();
  const [uploadProfileImage] = useUploadProfileImageMutation();
  const profilePicSrc = useSignedUrl(userData?.profilePic);

  useEffect(() => {
    setImgError(false);
  }, [userData?.profilePic]);

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

  const departmentOptions: SelectOption[] = (departmentList ?? []).map(
    (item: IMasterConfigOption) => ({
      value: item.id,
      label: item.displayName,
    }),
  );
  const positionOptions: SelectOption[] = (designationList ?? []).map(
    (item: IMasterConfigOption) => ({
      value: item.id,
      label: item.displayName,
    }),
  );
  const employmentTypeOptions: SelectOption[] = (employmentTypeList ?? []).map(
    (item: IMasterConfigOption) => ({
      value: item.id,
      label: item.displayName,
    }),
  );
  const disciplineOptions: SelectOption[] = (disciplineList ?? []).map(
    (item: IMasterConfigOption) => ({
      value: item.id,
      label: item.displayName,
    }),
  );
  const relationshipOptions: SelectOption[] = (relationshipList ?? []).map(
    (item: IMasterConfigOption) => ({
      value: item.id,
      label: item.displayName,
    }),
  );
  const statusOptions: SelectOption[] = (employmentStatusList ?? []).map(
    (item: IMasterConfigOption) => ({
      value: item.id,
      label: item.displayName,
    }),
  );
  const genderOptions: SelectOption[] = (genderList ?? []).map(
    (item: IMasterConfigOption) => ({
      value: item.id,
      label: item.displayName,
    }),
  );

  const error = hasError
    ? ((queryError as { data?: { message?: string }; message?: string })?.data
        ?.message ??
      (queryError as { message?: string })?.message ??
      "Failed to fetch user data. Please try again later.")
    : null;

  const organizationDisplay = userData?.organizationName ?? "-";

  const details: { icon: ReactNode; label: string; value: ReactNode }[] = [
    {
      icon: <Badge className="w-4 h-4 text-slate-500" />,
      label: "Employee ID",
      value: formatDisplayValue(userData?.employeeId),
    },
    {
      icon: <Building2 className="w-4 h-4 text-slate-500" />,
      label: "Organization",
      value: (
        <OverflowTooltip
          text={organizationDisplay}
          className="cursor-default text-right"
          rootClassName="w-full min-w-0"
          side="bottom"
        >
          {organizationDisplay}
        </OverflowTooltip>
      ),
    },
    {
      icon: <Shield className="w-4 h-4 text-slate-500" />,
      label: "Role",
      value: formatDisplayValue(userData?.roleName || userData?.role),
    },
    {
      icon: <CalendarDays className="w-4 h-4 text-slate-500" />,
      label: "Date of Joining",
      value: userData?.joinDate ? formatDate(userData.joinDate) : "-",
    },
    {
      icon: <UserCircle2 className="w-4 h-4 text-slate-500" />,
      label: "Functional Manager",
      value: formatDisplayValue(userData?.functionalManagerName),
    },
    {
      icon: <UserCircle2 className="w-4 h-4 text-slate-500" />,
      label: "Reporting Manager",
      value: formatDisplayValue(userData?.reportingManagerName),
    },
  ];

  const basicInfo = [
    {
      icon: <Phone className="w-4 h-4 text-slate-500" />,
      label: "Phone",
      value: formatDisplayValue(userData?.phone ? `+91 ${userData.phone}` : undefined),
    },
    {
      icon: <MailPlusIcon className="w-4 h-4 text-slate-500" />,
      label: "Work Email",
      value: (
        <OverflowTooltip
          text={formatDisplayValue(userData?.workEmail)}
          className="cursor-pointer pl-2"
          rootClassName="w-full min-w-0"
          side="bottom"
        >
          {formatDisplayValue(userData?.workEmail)}
        </OverflowTooltip>
      ),
    },
    {
      icon: <Users className="w-4 h-4 text-slate-500" />,
      label: "Gender",
      value: formatDisplayValue(userData?.genderName),
    },
    {
      icon: <Cake className="w-4 h-4 text-slate-500" />,
      label: "Birthday",
      value: formatDisplayValue(userData?.dob ? formatDate(userData.dob) : undefined),
    },
    {
      icon: <UserCircle2 className="w-4 h-4 text-slate-500" />,
      label: "Father's Name",
      value: formatDisplayValue(userData?.fatherName),
    },
    {
      icon: <UserCircle2 className="w-4 h-4 text-slate-500" />,
      label: "Mother's Name",
      value: formatDisplayValue(userData?.motherName),
    },
    {
      icon: <Briefcase className="w-4 h-4 text-slate-500" />,
      label: "Employment Type",
      value: formatDisplayValue(userData?.employmentTypeName || userData?.employmentType),
    },
    {
      icon: <Fingerprint className="w-4 h-4 text-slate-500" />,
      label: "Blood Group",
      value: formatDisplayValue(userData?.bloodGroup),
    },
  ];

  const handleOpenEdit = async () => {
    if (!userId || openingEdit) return;

    try {
      setOpeningEdit(true);
      setEditOpen(true);
      // Clear cached profile data for this user before opening edit.
      dispatch(userApi.util.invalidateTags([{ type: "User", id: userId }]));
      await refetchUser();
    } catch {
      toast.error("Failed to refresh profile data. Please try again.");
    } finally {
      setOpeningEdit(false);
    }
  };

  const handleCloseEdit = () => {
    if (!editSubmitting) setEditOpen(false);
  };

  const handleSelfEditSubmit = async (payload: EmployeeFormSubmitPayload) => {
    if (!userData?.id) return;
    try {
      setEditSubmitting(true);
      const values = payload.values as Partial<IUserDetail>;
      const profilePicUrl = values.profilePic ?? userData.profilePic ?? "";
      const body = buildProfileUpdateBody(values, profilePicUrl);
      console.log(body);
      await updateUser({ id: userData.id, body }).unwrap();
      toast.success("Profile updated successfully");
      setEditOpen(false);
      await refetchUser();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string }; message?: string })?.data
          ?.message ??
        (err as { message?: string })?.message ??
        "Failed to update profile. Please try again.";
      toast.error(message);
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading || (!userData && isFetching)) {
    return <UserProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="text-slate-600">No profile data available.</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-4">
        <div className="flex flex-row items-center justify-between sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            My Profile
          </h1>
          {canManage && (
            <Button
              htmlType="button"
              appearance="primary"
              onClick={handleOpenEdit}
              disabled={openingEdit}
              icon={<Pencil className="h-3.5 w-4 md:h-4" />}
            >
              {openingEdit ? "Refreshing..." : "Edit Info"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[30%_auto] gap-4 md:gap-6">
          <div className="bg-white bg-[linear-gradient(to_top,#fff_60%,rgba(129,140,248,0.4)_100%)] backdrop-blur-md shadow-2xl rounded-2xl p-3 md:p-4 flex flex-col">
            <div className="flex items-center justify-center py-6">
              <div className="flex flex-col justify-center items-center">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-slate-100 overflow-hidden bg-center flex items-center justify-center border-2 border-primary-200 mb-2">
                  {userData.profilePic && !imgError ? (
                    <img
                      src={profilePicSrc}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-primary-400" />
                  )}
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {userData.firstName} {userData.lastName}
                </h1>

                <div
                  className="
    flex justify-between items-center gap-4
    md:flex-col md:justify-center md:items-center
    lg:flex-row lg:justify-between lg:items-center
  "
                >
                  {userData.designationName && (
                    <BadgeComponent variant="gray" size="large">
                      {userData.designationName}
                    </BadgeComponent>
                  )}

                  {userData.departmentName && (
                    <BadgeComponent
                      variant={getDepartmentVariant(userData.departmentName)}
                      size="large"
                    >
                      {userData.departmentName}
                    </BadgeComponent>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="border-b-2 space-y-3 border-slate-200 pb-4">
                {details.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-8 min-w-0"
                  >
                    <div className="flex items-center gap-2 shrink-0 min-w-0">
                      {item.icon}
                      <h2 className="text-xs sm:text-sm font-medium text-slate-500 m-0">
                        {item.label}
                      </h2>
                    </div>
                    <div className="min-w-0 flex-1 text-right text-xs sm:text-sm font-bold text-slate-900">
                      {typeof item.value === "string" ? (
                        <span className="block truncate">{item.value}</span>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Basic Information</h3>
                {basicInfo.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex w-[50%] items-center gap-2">
                      {item.icon}
                      <h2 className="text-xs sm:text-sm font-medium text-slate-500 m-0">
                        {item.label}
                      </h2>
                    </div>
                    <div className="text-right">
                      <h2
                        className="text-xs sm:text-sm tracking-wide font-bold text-slate-900 m-0 truncate max-w-[14rem]"
                        title={typeof item.value === "string" ? item.value : ""}
                      >
                        {item.value}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white backdrop-blur-md shadow-[0_0_15px_rgba(156,163,175,0.5)] rounded-2xl space-y-6 p-4 sm:p-4 md:p-6 flex flex-col">
            <EmployeeProfile data={userData} />
          </div>
        </div>
      </div>

      <EmployeeFormModal
        isOpen={editOpen}
        mode="edit"
        initialValues={userData}
        employees={[]}
        departmentOptions={departmentOptions}
        positionOptions={positionOptions}
        employmentTypeOptions={employmentTypeOptions}
        disciplineOptions={disciplineOptions}
        relationshipOptions={relationshipOptions}
        statusOptions={statusOptions}
        genderOptions={genderOptions}
        isSubmitting={editSubmitting}
        isLoadingData={openingEdit}
        selfEditMode={true}
        onProfilePicUpload={
          userData?.id
            ? async (file) => {
                const res = await uploadProfileImage({
                  file,
                  userId: userData.id,
                }).unwrap();
                return res
                  ? { fileUrl: res.fileUrl, signedUrl: res.signedUrl }
                  : undefined;
              }
            : undefined
        }
        onClose={handleCloseEdit}
        onSubmit={handleSelfEditSubmit}
      />
    </>
  );
}

export default UserProfile;

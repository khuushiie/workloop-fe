import React, { useState } from "react";
import type { IUserDetail } from "../../types/user.api.types";
import DocumentsSection from "../employees/components/employee-form/DocumentsSection";

type TabKey =
  | "General"
  | "Bank Details"
  | "Documents"
  | "Education Details"
  | "Previous Employement";

const Field = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="flex flex-col">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-base text-slate-900 font-medium">{value}</span>
  </div>
);

const formatValue = (value: string | number | null | undefined): string => {
  if (value === "" || value === null || value === undefined) return "-";
  return String(value);
};

const formatKey = (key: string): string => {
  const formattedKey = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")

  return formattedKey
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
};

interface ProfileSectionProps {
  title: string;
  data: Record<string, string | number | undefined>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, data }) => {

  return (
    <div className="p-6 bg-white rounded-lg shadow-soft mb-6 border border-slate-200">
      <div className="flex justify-between items-center mb-4 border-b">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-10">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm text-slate-500">{formatKey(key)}</span>
            <span className="text-base text-slate-900 font-medium">
              {value ?? "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface EmergencyContactSectionProps {
  title: string;
  data: Record<string, string | number | undefined>;
}

const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({ title, data }) => {

  return (
    <div className="p-6 bg-white rounded-lg shadow-soft mb-6 border border-slate-200">
      <div className="flex justify-between items-center mb-4 border-b">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-10">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm text-slate-500">{formatKey(key)}</span>
            <span className="text-base text-slate-900 font-medium">
              {value ?? "-"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EducationSection: React.FC<{ data: IUserDetail["educationDetails"] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="p-6 text-slate-600">No education details available.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-soft border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Education Details</h2>

      <div className="space-y-6">
        {data.map((edu, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10">
            <Field label="Institution Name" value={formatValue(edu.institutionName)} />
            <Field label="Discipline" value={formatValue(edu.discipline?.displayName)} />
            <Field label="Start Date" value={formatValue(edu.startDate)} />
            <Field label="End Date" value={formatValue(edu.endDate)} />
            <Field label="Grade" value={formatValue(edu.grade)} />
            <Field label="Explain Breaks" value={formatValue(edu.explainBreaks)} />
          </div>
        ))}
      </div>
    </div>
  );
};

const PreviousEmploymentSection: React.FC<{ data: IUserDetail["previousEmployments"] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="p-6 text-slate-600">No previous employment records.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-soft border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Previous Employments</h2>

      <div className="space-y-6">
        {data.map((job, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10">
            <Field label="Employer Name" value={formatValue(job?.employerName)} />
            <Field label="Designation" value={formatValue(job?.designation?.displayName)} />
            <Field label="Start Date" value={formatValue(job?.startDate)} />
            <Field label="End Date" value={formatValue(job?.endDate)} />
            <Field label="Annual CTC" value={formatValue(job?.annualCTC)} />
            <Field label="Break Reason" value={formatValue(job?.breakReason)} />
          </div>
        ))}
      </div>
    </div>
  );
};

interface EmployeeProfileProps {
  data: IUserDetail | null;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("General");

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <>
            <ProfileSection
              title="Personal Information"
              data={{
                aadhaarCardNumber: data?.aadharCardNo || '-',
                panCardNumber: data?.panCardNo || '-',
                UANNumber: data?.uanNumber || '-',
              }}
            />
            <ProfileSection
              title="Current Address"
              data={{
                street: data?.address?.street,
                city: data?.address?.city,
                state: data?.address?.state,
                zipCode: data?.address?.zipCode,
                country: data?.address?.country,
              }}
            />
            <ProfileSection
              title="Permanent Address"
              data={{
                street: data?.permanentAddress?.street,
                city: data?.permanentAddress?.city,
                state: data?.permanentAddress?.state,
                zipCode: data?.permanentAddress?.zipCode,
                country: data?.permanentAddress?.country,
              }}
            />
            <EmergencyContactSection
              title="Emergency Contact"
              data={{
                name: data?.emergencyContact?.name,
                phone: data?.emergencyContact?.phone,
                relationship: data?.emergencyContact?.relationshipName,
              }}
            />
          </>
        );

      case "Bank Details":
        return (
          <ProfileSection
            title="Bank Details"
            data={{
              bankName: formatValue(data?.bankDetails?.bankName),
              branchName: formatValue(data?.bankDetails?.branchName),
              IFSCCode: formatValue(data?.bankDetails?.ifscCode),
              accountHolderName: formatValue(data?.bankDetails?.accountHolderName),
              accountNumber: formatValue(data?.bankDetails?.accountNumber),
            }}
          />
        );

      case "Documents":
        return data?.id ? (
          <DocumentsSection userId={data.id} isViewMode={false} selfEditMode={true} />
        ) : (
          <div className="p-6 text-slate-600">No user data available.</div>
        );

      case "Education Details":
        return (
          <EducationSection data={data?.educationDetails ?? []} />
        );

      case "Previous Employement":
        return (
          <PreviousEmploymentSection data={data?.previousEmployments ?? []} />
        );

      default:
        return null;
    }
  };

  const tabs: TabKey[] = [
    "General",
    "Bank Details",
    "Documents",
    "Education Details",
    "Previous Employement",
  ];

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex pb-2 gap-4 md:gap-6 sm:gap-6 overflow-x-auto whitespace-nowrap border-b border-slate-300 mb-4 bg-white px-2 rounded-t-lg">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`text-sm md:font-medium cursor-pointer transition ${
              activeTab === tab
                ? "text-primary-500 border-b-2 border-primary-500"
                : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="space-y-6">{renderContent()}</div>
    </div>
  );
};

export default EmployeeProfile;

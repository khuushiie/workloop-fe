import React, { useEffect, useMemo } from "react";
import { useGetOrganizationByCodeQuery } from "../../store/apis/organization.api";
import { useDispatch } from "react-redux";
import { setWeekOffConfig } from "../../store/slices/authSlice";
import Footer from "../common/Footer";

export function getOrgCodeFromSubdomain(): string | null {
  const hostname = window.location.hostname;
  const match = hostname.match(/^(.+)-hrms\./);
  return match ? match[1] : null;
}

export const DEFAULT_ORG = {
  name: "THE STACKMENTALIST",
  tagline: "Great Innovations Ahead",
  queryCode: "STK",
} as const;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

const OrgLogo: React.FC<{
  logoUrl?: string | null;
  name: string;
  loading?: boolean;
}> = ({ logoUrl, name, loading }) => {
  const initials = getInitials(name);

  if (loading) {
    return <div className="w-16 h-16 rounded-2xl bg-primary-100 animate-pulse" />;
  }

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="w-20 h-20 rounded-2xl object-center shadow-soft"
      />
    );
  }

  if (initials) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-brand-button">
        <span className="text-white text-2xl font-extrabold">{initials}</span>
      </div>
    );
  }

  return null;
};

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const orgCode = useMemo(() => getOrgCodeFromSubdomain(), []);
  const queryCode = orgCode || DEFAULT_ORG.queryCode;
  const dispatch = useDispatch();
  const { data: orgData, isLoading: orgLoading } =
    useGetOrganizationByCodeQuery(queryCode);

  useEffect(() => {
    if (orgData?.weekOffConfig) {
      dispatch(setWeekOffConfig(orgData.weekOffConfig));
    }
  }, [orgData?.weekOffConfig, dispatch]);

  const displayName =
    orgData?.name || orgCode?.toUpperCase() || DEFAULT_ORG.name;
  const logoUrl = orgData?.logo;
  const tagline = orgData?.tagline ?? DEFAULT_ORG.tagline;

  return (
    <div className="min-h-screen w-full bg-surface-muted flex flex-col relative overflow-hidden">
      <div className="flex flex-1">
        {/* Atmospheric blur orbs — Corporate Trust signature */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary-400/25 to-secondary-400/20 rounded-full blur-3xl animate-blob-drift" />
          <div className="absolute top-1/4 -right-32 w-[400px] h-[400px] bg-gradient-to-br from-secondary-400/20 to-primary-300/15 rounded-full blur-3xl animate-blob-drift [animation-delay:2s]" />
          <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-primary-300/20 to-secondary-300/15 rounded-full blur-3xl animate-blob-drift [animation-delay:4s]" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-primary-200/25 to-secondary-200/20 rounded-full blur-2xl" />
        </div>

        {/* Left Panel — Organization Branding */}
        <div className="hidden lg:flex lg:w-[45%] flex-col items-center justify-center pl-16 pr-8 relative z-10">
          <div className="max-w-sm text-center">
            <div className="flex justify-center mb-6">
              <OrgLogo
                logoUrl={logoUrl}
                name={displayName}
                loading={orgLoading}
              />
            </div>

            {displayName && (
              <h2 className="text-lg font-extrabold text-slate-900 tracking-widest uppercase mb-1">
                {displayName}
              </h2>
            )}

            {tagline && (
              <p className="text-base text-slate-400 mb-10 font-medium">{tagline}</p>
            )}

            {!tagline && displayName && <div className="mb-10" />}

            <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight leading-tight">
              Welcome to{" "}
              <span className="text-gradient">HRMS</span>
            </h1>
            <p className="text-slate-500 text-base leading-relaxed max-w-xs mx-auto">
              A unified platform to manage your daily work activities and stay
              connected with the organization.
            </p>
          </div>
        </div>

        {/* Right Panel — Form Content */}
        <div className="w-full lg:w-[55%] flex items-center justify-center p-4 lg:pl-8 lg:pr-16 relative z-10">
          <div className="max-w-md w-full">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-soft-hover p-8 sm:p-10 border border-slate-100/80 transition-all duration-200">
              {children}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;

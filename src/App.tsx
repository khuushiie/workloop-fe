import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import AttendanceReports from "./components/attendance/AttendanceReports";
import EmployeeAttendance from "./components/attendance/EmployeeAttendance";
import ChangePassword from "./components/auth/ChangePassword";
import Login from "./components/auth/Login";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import UserDashboard from "./components/dashboard/UserDashboard";
import EmployeeManagement from "./components/employees/EmployeeManagement";
import Footer from "./components/common/Footer";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import LeaveApproval from "./components/leave/LeaveApproval";
import LeaveCredits from "./components/leave/LeaveCredits";
import LeaveOverview from "./components/leave/LeaveOverview";
import MyLeaves from "./components/leave/MyLeaves";
import MyTimesheets from "./components/timesheet/MyTimesheets";
import TimesheetMain from "./components/timesheet/TimesheetMain";
import {
  FeatureFlagsProvider,
  useFeatureFlags,
} from "./contexts/FeatureFlagsContext";
import { useEffectivePermissions } from "./store/hooks/useRbac";
import { FEATURE_FLAGS, RoleTypeEnum } from "./utils/constants";

import FeatureFlagManagement from "./components/admin-config/FeatureFlagManagement";
import RoleSetupPage from "./components/admin/access-rights/RoleSetupPage";
import ARApproval from "./components/attendance/ARApproval";
import AttendanceRegularization from "./components/attendance/AttendanceRegularization";
import RegularizationManagement from "./components/attendance/RegularizationManagement";
import DowntimePage from "./components/common/DowntimePage";
import FeatureFlagRoute from "./components/common/FeatureFlagRoute";
import PermissionGate from "./components/common/PermissionGate";
import EmployeeSelfService from "./components/employee-service/EmployeeSelfService";
import LeaveCompOff from "./components/employee-service/LeaveCompOff";
import FilterManagement from "./components/filters/FilterManagement";
import HolidayManagement from "./components/holiday/HolidayManagement";
import KpiAssignment from "./components/kpi/KpiAssignment";
import KpiScoring from "./components/kpi/KpiScoring";
import UserDetailsPage from "./components/kpi/UserDetailsPage";
import NotFoundPage from "./components/not-found/NotFound";
import RegularizationReport from "./components/reports/RegularizationReport";
import ProjectManagement from "./components/resource-management/ProjectManagement";
import ResourceManagement from "./components/resource-management/ResourceManagement";
import ProjectAnalytics from "./components/resource-management/project-analytics/ProjectAnayltics";
import ResourceDetailsPage from "./components/resource-management/resource-details/ResourseDetailsPage";
import UserProfile from "./components/user-profile/UserProfile";
import { usePrefetchMasterConfigForEmployee } from "./store/apis/masterConfig.api";
import { useAuth } from "./store/hooks/useAuth";
// import SurveyResponsesAdmin from "./components/survey-admin/pages/SurveyResponsesAdmin";
import {
  MySurveys,
  ResponsesOverview,
  SurveyBuilder,
  SurveyInsights,
  SurveyManagement,
} from "./components/survey";
import { PERMISSIONS, PermissionCode } from "./utils/rbac/permissions";
import ForgotPassword from "./components/auth/ForgotPassword";
import DynamicWorkflow from "./components/dynamicWorkflow/DynamicWorkflow";
import { GroupDialog } from "./components/dynamicWorkflow/Group/GroupDialog";
import ManageGroups from "./components/dynamicWorkflow/Group/ManageGroups";
import OrganizationOnboarding from "./components/organization-Onboarding/OrganizationOnboarding";
import BillingLicensePage from "./components/billing-license/BillingLicensePage";
import ReferralManagement from "./components/referral/ReferralManagement";
import MyReferrals from "./components/referral/MyReferrals";
import HolidayConfig from "./components/config-management/HolidayConfig";
import EmailTemplatesPage from "./components/admin/email-templates/EmailTemplatesPage";
import EmailConfigPage from "./components/admin/email-config/EmailConfigPage";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowFirstLogin?: boolean;
}> = ({ children, allowFirstLogin = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  console.log("user", user, allowFirstLogin);
  if (user?.isFirstLogin && !allowFirstLogin) {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
};

const LoginRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Login />;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isReady } = useEffectivePermissions();
  const { pathname } = useLocation();
  const mainRef = React.useRef<HTMLElement>(null);

  // Prefetch employee master config (department, designation, etc.) so screens read from Redux cache
  usePrefetchMasterConfigForEmployee();

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll main container to top on route change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  if (!isReady) {
    return <div className="flex h-screen bg-surface-muted" />;
  }

  return (
    <div className="flex h-screen bg-surface-muted">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin =
    user?.role?.toLowerCase() === RoleTypeEnum.ADMIN?.toLowerCase();
  return <>{isAdmin ? <AdminDashboard /> : <UserDashboard />}</>;
};

// Wrapper to conditionally show ChangePassword with or without Layout
const ChangePasswordWrapper: React.FC = () => {
  const { user } = useAuth();

  // First login: show without layout
  if (user?.isFirstLogin) {
    return <ChangePassword />;
  }

  // Normal access: show with layout
  return (
    <Layout>
      <ChangePassword />
    </Layout>
  );
};

const NoAccess: React.FC<{ message?: string }> = ({
  message = "You do not have access to this module.",
}) => <div className="p-4">{message}</div>;

const withPermission = (
  code: PermissionCode | PermissionCode[],
  element: React.ReactNode,
  message?: string,
) => (
  <PermissionGate code={code} fallback={<NoAccess message={message} />}>
    {element}
  </PermissionGate>
);

const AppContent: React.FC = () => {
  const { isDowntime, isLoading } = useFeatureFlags();

  // Show loading state while feature flags are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Show downtime page if downtime flag is enabled or server error occurred
  if (isDowntime) {
    return <DowntimePage />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/access-right-management/setup-roles"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.ACCESS_RIGHT_VIEW,
                  PERMISSIONS.ACCESS_RIGHT_MANAGE,
                ],
                <RoleSetupPage />,
                "You do not have access to Access Right Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-profile"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.EMPLOYEE_PROFILE_VIEW,
                <UserProfile />,
                "You do not have access to My Profile.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/kpi/assignment"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.KPI_ASSIGNMENTS_VIEW,
                  PERMISSIONS.KPI_ASSIGNMENTS_MANAGE,
                ],
                <FeatureFlagRoute featureKey={FEATURE_FLAGS.SHOW_KPIS}>
                  <KpiAssignment />
                </FeatureFlagRoute>,
                "You do not have access to KPI Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/project-management"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.PROJECT_MANAGEMENT_VIEW,
                  PERMISSIONS.PROJECT_MANAGEMENT_MANAGE,
                ],
                <ProjectManagement />,
                "You do not have access to Project Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/project-analytics"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.PROJECT_MANAGEMENT_VIEW,
                  PERMISSIONS.PROJECT_MANAGEMENT_MANAGE,
                ],
                <ProjectAnalytics />,
                "You do not have access to Project Analytics.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/kpi/scoring"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [PERMISSIONS.KPI_SCORES_VIEW, PERMISSIONS.KPI_SCORES_MANAGE],
                <FeatureFlagRoute featureKey={FEATURE_FLAGS.SHOW_KPIS}>
                  <KpiScoring />
                </FeatureFlagRoute>,
                "You do not have access to KPI Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/kpi/user-details/:userId"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [PERMISSIONS.MY_PERFORMANCE_VIEW, PERMISSIONS.KPI_SCORES_VIEW],
                <FeatureFlagRoute featureKey={FEATURE_FLAGS.SHOW_KPIS}>
                  <UserDetailsPage />
                </FeatureFlagRoute>,
                "You do not have access to KPI Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.EMPLOYEE_MANAGEMENT_VIEW,
                  PERMISSIONS.EMPLOYEE_MANAGEMENT_MANAGE,
                ],
                <EmployeeManagement />,
                "You do not have access to Employee Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/leave-creation"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [PERMISSIONS.APPLY_LEAVE_VIEW, PERMISSIONS.APPLY_LEAVE_MANAGE],
                <LeaveCreation />,
                "You do not have access to Leave Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/admin/leave-balance"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.LEAVE_BALANCES_VIEW,
                  PERMISSIONS.LEAVE_BALANCES_MANAGE,
                ],
                <LeaveCredits />,
                "You do not have access to Leave Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/leave-approvals"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.LEAVE_REQUESTS_VIEW,
                  PERMISSIONS.LEAVE_REQUESTS_MANAGE,
                ],
                <LeaveApproval />,
                "You do not have access to Leave Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports/leave-balance-report"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.REPORTS_LEAVE_BALANCE_VIEW,
                <LeaveOverview />,
                "You do not have access to Reports.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/timesheet/management"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.TIMESHEET_MANAGEMENT_VIEW,
                  PERMISSIONS.TIMESHEET_MANAGEMENT_MANAGE,
                ],
                <TimesheetMain />,
                "You do not have access to Timesheet Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/holiday-management"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.HOLIDAY_MANAGEMENT_VIEW,
                  PERMISSIONS.HOLIDAY_MANAGEMENT_MANAGE,
                ],
                <HolidayManagement />,
                "You do not have access to Holiday Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports/attendance"
        element={
          <ProtectedRoute>
            <Layout>
              {/* {withPermission(
                  [
                    PERMISSIONS.REPORTS_ATTENDANCE_VIEW,
                    PERMISSIONS.REPORTS_ATTENDANCE_MANAGE,
                    PERMISSIONS.MY_ATTENDANCE_VIEW,
                  ], */}
              <AttendanceReports />,
              {/* "You do not have access to Attendance Reports."
                 )} */}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/attendance"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.REPORTS_ATTENDANCE_VIEW,
                  PERMISSIONS.REPORTS_ATTENDANCE_MANAGE,
                  PERMISSIONS.MY_ATTENDANCE_VIEW,
                ],
                <AttendanceReports />,
                "You do not have access to Attendance Reports.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/apply-leave"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.APPLY_LEAVE_VIEW,
                <MyLeaves />,
                "You do not have access to Leave Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-timesheets"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.MY_TIMESHEETS_VIEW,

                <MyTimesheets />,
                "You do not have access to Timesheets.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.MY_ATTENDANCE_VIEW,
                <EmployeeAttendance />,
                "You do not have access to Attendance.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance-regularization"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.APPLY_AR_VIEW,
                <AttendanceRegularization />,
                "You do not have access to Attendance Regularization.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/regularization"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.REGULARIZATION_MANAGEMENT_VIEW,
                  PERMISSIONS.REGULARIZATION_MANAGEMENT_MANAGE,
                ],
                <RegularizationManagement />,
                "You do not have access to Regularization Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/ar-approvals"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.REGULARIZATION_MANAGEMENT_VIEW,
                  PERMISSIONS.REGULARIZATION_MANAGEMENT_MANAGE,
                ],

                <ARApproval />,
                "You do not have access to Regularization Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports/regularization"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.REPORTS_REGULARIZATION_VIEW,
                <RegularizationReport />,
                "You do not have access to Reports.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* New Survey Builder Route */}
      <Route
        path="/survey-builder"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.SURVEY_RESPONSES_VIEW,
                  PERMISSIONS.SURVEY_RESPONSES_MANAGE,
                ],
                <SurveyBuilder />,
                "You do not have access to Survey Builder.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* My Surveys - Employee Portal */}
      <Route
        path="/my-surveys"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.MY_SURVEYS_MANAGE,
                <MySurveys />,
                "You do not have access to My Surveys.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute allowFirstLogin={true}>
            <ChangePasswordWrapper />
          </ProtectedRoute>
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/admin/employee-service"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.EMPLOYEE_SERVICE_VIEW,
                  PERMISSIONS.EMPLOYEE_SERVICE_MANAGE,
                ],
                <EmployeeSelfService />,
                "You do not have access to Employee Service.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee-self-service"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.EMPLOYEE_SELF_SERVICE_VIEW,
                  PERMISSIONS.EMPLOYEE_SELF_SERVICE_MANAGE,
                ],
                <LeaveCompOff />,
                "You do not have access to Comp Off Request.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/referral/create"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.REFER_CANDIDATE_VIEW,
                  PERMISSIONS.REFER_CANDIDATE_MANAGE,
                ],
                <ReferralManagement />,
                "You do not have access to Refer Candidate."
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/referral-trackings"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.MY_REFERRALS_VIEW,
                  PERMISSIONS.MY_REFERRALS_MANAGE,
                ],
                <MyReferrals />,  
                "You do not have access to Referral Tracking."
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/survey-responses"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.SURVEY_RESPONSE_VIEW,
                  PERMISSIONS.SURVEY_RESPONSE_MANAGE,
                ],
                <ResponsesOverview />,
                "You do not have access to Survey Responses.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/survey-responses/:surveyId/insights"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.SURVEY_RESPONSE_VIEW,
                  PERMISSIONS.SURVEY_RESPONSE_MANAGE,
                ],
                <SurveyInsights />,
                "You do not have access to Survey Insights.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/survey-management"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.SURVEY_RESPONSE_VIEW,
                  PERMISSIONS.SURVEY_RESPONSE_MANAGE,
                ],
                <SurveyManagement />,
                "You do not have access to Survey Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/surveys"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                PERMISSIONS.MY_SURVEYS_VIEW,
                <Survey />,
                "You do not have access to Surveys.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/admin/config/feature-flags"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.FEATURE_FLAGS_VIEW,
                  PERMISSIONS.FEATURE_FLAGS_MANAGE,
                ],
                <FeatureFlagManagement />,
                "You do not have access to Feature Flags.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resource-allocation/project-management"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.PROJECT_MANAGEMENT_VIEW,
                  PERMISSIONS.PROJECT_MANAGEMENT_MANAGE,
                ],
                <ProjectManagement />,
                "You do not have access to Project Management.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resource-allocation/project-analytics"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.PROJECT_ANALYTICS_VIEW,
                  PERMISSIONS.PROJECT_ANALYTICS_MANAGE,
                ],
                <ProjectAnalytics />,
                "You do not have access to Project Analytics.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      {
        <Route
          path="/resource-allocation/resource-management"
          element={
            <ProtectedRoute>
              <Layout>
                {withPermission(
                  [
                    PERMISSIONS.RESOURCE_MANAGEMENT_VIEW,
                    PERMISSIONS.RESOURCE_MANAGEMENT_MANAGE,
                  ],
                  <ResourceManagement />,
                )}
              </Layout>
            </ProtectedRoute>
          }
        />
      }

      {
        <Route
          path="/resource-allocation/resource-management/resource-details/:resourceId"
          element={
            <ProtectedRoute>
              <Layout>
                {withPermission(
                  [
                    PERMISSIONS.RESOURCE_MANAGEMENT_VIEW,
                    PERMISSIONS.RESOURCE_MANAGEMENT_MANAGE,
                  ],
                  <ResourceDetailsPage />,
                )}
              </Layout>
            </ProtectedRoute>
          }
        />
      }

      <Route
        path="/admin/config/master-config"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.MASTER_CONFIG_VIEW,
                  PERMISSIONS.MASTER_CONFIG_MANAGE,
                ],
                <FilterManagement />,
                "You do not have access to Admin Config.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dynamic-workflow"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.MANAGE_WORKFLOW_VIEW,
                  PERMISSIONS.MANAGE_WORKFLOW_MANAGE,
                ],
                <DynamicWorkflow />,
                "You do not have access to Dynamic Workflow.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflow/group"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.MANAGE_GROUPS_VIEW,
                  PERMISSIONS.MANAGE_GROUPS_MANAGE,
                ],
                <ManageGroups />,
                "You do not have access to Manage Groups.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="admin/organization"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.ORGANIZATION_ONBOARDING_VIEW,
                  PERMISSIONS.ORGANIZATION_ONBOARDING_MANAGE,
                ],
                <OrganizationOnboarding />,
                "You do not have access to Organization Onboarding.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing-license"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.BILLING_LICENSE_VIEW,
                  PERMISSIONS.BILLING_LICENSE_MANAGE,
                ],
                <BillingLicensePage />,
                "You do not have access to Billing & license.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing-license"
        element={<Navigate to="/billing-license" replace />}
      />

      <Route
        path="/admin/config-management/holiday-config"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.WEEK_OFF_CONFIG_VIEW,
                  PERMISSIONS.WEEK_OFF_CONFIG_MANAGE,
                ],
                <HolidayConfig />,
                "You do not have access to Holiday Config.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/email-templates"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.EMAIL_TEMPLATES_VIEW,
                  PERMISSIONS.EMAIL_TEMPLATES_MANAGE,
                ],
                <EmailTemplatesPage />,
                "You do not have access to Email Templates.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/email-config"
        element={
          <ProtectedRoute>
            <Layout>
              {withPermission(
                [
                  PERMISSIONS.EMAIL_CONFIG_VIEW,
                  PERMISSIONS.EMAIL_CONFIG_MANAGE,
                ],
                <EmailConfigPage />,
                "You do not have access to Email Config.",
              )}
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <NotFoundPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
function App() {
  return (
    <Router>
      <FeatureFlagsProvider>
        <AppContent />
      </FeatureFlagsProvider>
    </Router>
  );
}

export default App;

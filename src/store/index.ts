import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { attendanceApi } from "./apis/attendance.api";
import { attendanceRegularizationApi } from "./apis/attendanceRegularization.api";
import { authApi } from "./apis/auth.api";
import { compOffApi } from "./apis/compOff.api";
import { gameBookingApi } from "./apis/gameBooking.api";
import { featureFlagApi } from "./apis/featureFlag.api";
import { holidayManagementApi } from "./apis/holidayManagement.api";
import { kpiApi } from "./apis/kpi.api";
import { leaveApi } from "./apis/leave.api";
import { leaveCreditApi } from "./apis/leaveCredit.api";
import { masterConfigApi } from "./apis/masterConfig.api";
import { rbacApi } from "./apis/rbac.api";
import { analyticsApi } from "./apis/resource-allocation/project-analytics.api";
import { projectApi } from "./apis/resource-allocation/project-management.api";
import { resourceAllocationApi } from "./apis/resource-allocation/resource-allocation.api";
import { surveyApi } from "./apis/survey.api";
import { timesheetApi } from "./apis/timesheet.api";
import { uploadsApi } from "./apis/uploads.api";
import { userApi } from "./apis/user.api";
import { billingLicenseApi } from "./apis/billingLicense.api";
import attendanceReducer from "./slices/attendanceSlice";
import authReducer from "./slices/authSlice";
import masterConfigReducer from "./slices/masterConfigSlice";
import rbacReducer from "./slices/rbacSlice";
import surveyReducer from "./slices/surveySlice";
import { workflowApi } from "./apis/dynamicWorkflow.api";
import { referralApi } from "./apis/referral.api";
import { jobDescriptionApi } from "./apis/jobDescription.api";
import { OrganizationApi } from "./apis/organization.api";
import { userDocumentsApi } from "./apis/userDocuments.api";
import { emailTemplateApi } from "./apis/emailTemplate.api";
import { emailConfigApi } from "./apis/emailConfig.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    masterConfig: masterConfigReducer,
    attendance: attendanceReducer,
    rbac: rbacReducer,
    survey: surveyReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [resourceAllocationApi.reducerPath]: resourceAllocationApi.reducer,
    [masterConfigApi.reducerPath]: masterConfigApi.reducer,
    [featureFlagApi.reducerPath]: featureFlagApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [rbacApi.reducerPath]: rbacApi.reducer,
    [compOffApi.reducerPath]: compOffApi.reducer,
    [gameBookingApi.reducerPath]: gameBookingApi.reducer,
    [leaveApi.reducerPath]: leaveApi.reducer,
    [surveyApi.reducerPath]: surveyApi.reducer,
    [timesheetApi.reducerPath]: timesheetApi.reducer,
    [leaveCreditApi.reducerPath]: leaveCreditApi.reducer,
    [holidayManagementApi.reducerPath]: holidayManagementApi.reducer,
    [attendanceRegularizationApi.reducerPath]:
      attendanceRegularizationApi.reducer,
    [kpiApi.reducerPath]: kpiApi.reducer,
    [uploadsApi.reducerPath]: uploadsApi.reducer,
    [workflowApi.reducerPath]: workflowApi.reducer,
    [referralApi.reducerPath]: referralApi.reducer,
    [jobDescriptionApi.reducerPath]: jobDescriptionApi.reducer,
    [OrganizationApi.reducerPath]: OrganizationApi.reducer,
    [billingLicenseApi.reducerPath]: billingLicenseApi.reducer,
    [userDocumentsApi.reducerPath]: userDocumentsApi.reducer,
    [emailTemplateApi.reducerPath]: emailTemplateApi.reducer,
    [emailConfigApi.reducerPath]: emailConfigApi.reducer,
  },
  middleware: (gDM) =>
    gDM().concat(
      authApi.middleware,
      userApi.middleware,
      masterConfigApi.middleware,
      attendanceApi.middleware,
      analyticsApi.middleware,
      projectApi.middleware,
      resourceAllocationApi.middleware,
      surveyApi.middleware,
      rbacApi.middleware,
      compOffApi.middleware,
      gameBookingApi.middleware,
      holidayManagementApi.middleware,
      attendanceRegularizationApi.middleware,
      leaveApi.middleware,
      leaveCreditApi.middleware,
      featureFlagApi.middleware,
      timesheetApi.middleware,
      kpiApi.middleware,
      uploadsApi.middleware,
      workflowApi.middleware,
      referralApi.middleware,
      jobDescriptionApi.middleware,
      OrganizationApi.middleware,
      billingLicenseApi.middleware,
      userDocumentsApi.middleware,
      emailTemplateApi.middleware,
      emailConfigApi.middleware,
    ),
});
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

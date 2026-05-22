import type { SubscriptionPlan } from "../constants/subscriptionPlan";
import type { WeekOffConfig } from "../utils/weekOff";

/** Response from GET /v2/organization/by-code/:code — branding + org config */
export interface IOrganizationByCode {
  name: string;
  code: string;
  tagline: string | null;
  status: string;
  logo: string | null;
  weekOffConfig?: WeekOffConfig | null;
}

export interface IOrganizationAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface IOrganizationListItem {
  id: string;
  name: string;
  /** Unique 3-4 char org code (used in URL subdomain). */
  code?: string;
  /** Optional tagline for auth/login pages. */
  tagline?: string | null;
  email: string;
  website?: string;
  status: string;
  userLimit?: number | null;
  currentUserCount?: number;
  subscriptionPlan?: SubscriptionPlan;
  /** Organization logo/image URL. */
  logo?: string | null;

  poc?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  address?: IOrganizationAddress;

  createdAt?: string;
  updatedAt?: string;
}

// export interface IOrganizationDetail {
//   id: string;
//   name: string;
//   email: string;
//   website?: string;
//   poc?: string;
//   pocId?: string;

  
//   poc?: {
//     name?: string;
//     email?: string;
//     phone?: string;
//   };
//   status: string;
//   country?: string;
//   adminId?: string;
//   adminName?: string;
//   phone?: string;
//   address?: IOrganizationAddress;
//   description?: string;
//   permissionIds?: string[] | null;

//   createdAt?: string;
//   updatedAt?: string;
// }

// Duplicate declaration removed — IOrganizationByCode is defined above.

export interface IOrganizationDetail {
  id: string;
  name: string;
  /** Unique 3-4 char org code (used in URL subdomain). */
  code?: string;
  /** Optional tagline for auth/login pages. */
  tagline?: string | null;
  email: string;
  website?: string;
  status: string;

  poc?: {
    name?: string;
    email?: string;
    phone?: string;
  };

  address?: IOrganizationAddress;
  description?: string;

  permissions?: string[] | null;

  /** Maximum number of users allowed (subscription limit). null = no limit. */
  userLimit?: number | null;
  /** Current user count. Only present in get-by-id response. */
  currentUserCount?: number;
  subscriptionPlan?: SubscriptionPlan;
  /** Employee ID format prefix (e.g. "EMP" yields EMP001, EMP002). */
  employeeIdFormat?: string | null;
  /** Organization logo/image URL (stored in S3). */
  logo?: string | null;

  /** Per-org office location geofence for check-in enforcement. */
  locationConfig?: {
    enforceOfficeCheckin: boolean;
    latitude?: number | null;
    longitude?: number | null;
    allowedRadiusMeters?: number;
  } | null;

  createdAt?: string;
  updatedAt?: string;
}


export interface IOrganizationStats {
  total: number;
  active: number;
  inactive: number;
}

export interface IOrganizationFilterItem {
  id: string;
  name: string;
  poc?: string;
  pocId?: string;
}

export interface ILocationConfigBody {
  enforceOfficeCheckin: boolean;
  latitude?: number;
  longitude?: number;
  allowedRadiusMeters?: number;
}

export interface ICreateOrganizationBody {
  name: string;
  /** Unique 3-4 char org code (alphanumeric). Used in URL subdomain. */
  code: string;
  /** Optional tagline for auth/login pages. */
  tagline?: string;
  email: string;
  website?: string;
 poc?: {
  name?: string;
  email?: string;
  phone?: string;
};
pocId?: string;
  status?: string;
  country?: string;
  phone?: string;
  address?: IOrganizationAddress;
 permissions: string[] | null;
  /** Maximum number of users allowed (subscription limit). Optional; omit for no limit. */
  userLimit?: number;
  subscriptionPlan?: SubscriptionPlan;
  /** Employee ID format prefix (e.g. "EMP" yields EMP001, EMP002). */
  employeeIdFormat?: string;
  /** Organization logo URL (from upload). */
  logo?: string;
  /** Office location geofence config. */
  locationConfig?: ILocationConfigBody;
}

export interface IUpdateOrganizationBody {
  name?: string;
  /** Unique 3-4 char org code (alphanumeric). */
  code?: string;
  /** Optional tagline for auth/login pages. */
  tagline?: string | null;
  email?: string;
  website?: string;
    poc?: {
    name: string;
    email?: string;
    phone?: string;
  };
  status?: string;
  country?: string;
  phone?: string;
  address?: IOrganizationAddress;
  permissions?: string[] | null;
  /** Maximum number of users allowed (subscription limit). */
  userLimit?: number | null;
  subscriptionPlan?: SubscriptionPlan;
  /** Employee ID format prefix (e.g. "EMP" yields EMP001, EMP002). */
  employeeIdFormat?: string | null;
  /** Organization logo URL (from upload). */
  logo?: string | null;
  /** Office location geofence config. */
  locationConfig?: ILocationConfigBody;
}

export interface IOrganizationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrganizationListResponse {
  data: IOrganizationListItem[];
  pagination: IOrganizationPagination;
}

export interface IOrganizationQueryParams {
  page?: number;
  limit?: number;
  search?: string;  
  status?: string;
  poc?: string;      
}





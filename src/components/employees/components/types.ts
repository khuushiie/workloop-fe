import type { IUserDetail } from "../../../types";

export interface LocalDocument {
  file: File;
  documentTypeId: string;
  documentTypeName: string;
}

export interface EmployeeFormSubmitPayload {
  values: Partial<IUserDetail>;
  profilePicFile: File | null;
  localDocuments?: LocalDocument[];
}

export type EmployeeFormMode = "create" | "edit" | "view";


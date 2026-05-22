import { IMasterConfigOption } from "../../store/apis/masterConfig.api";
import { IUserFilterItem } from "../../types";
import { MODULES } from "./constants";


export const getLabelValue = (options: IUserFilterItem[] | undefined, id: string) => {
  if (!options) return "";
  return options.find(opt => opt.id === id)?.fullName || "";
};

export const getStatusLabel = (options: IMasterConfigOption[] | undefined, id: string | undefined) => {
  if (!options || !id) return "";
  return options.find(opt => opt.id === id)?.displayName || "";
};

export const getLabelForModules = (category_code: string) => {
  if (!MODULES || !category_code) return "";
  return MODULES[category_code as keyof typeof MODULES]?.label || "";
};

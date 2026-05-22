export interface IHoliday {
  _id?: string;
  name: string;
  date: string;
  year: string;
  isMandatory: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IHolidayFormData {
  name: string;
  date: string;
  year: string;
  isMandatory: boolean;
  description?: string;
}

/** @deprecated Use IHoliday */
export type Holiday = IHoliday;
/** @deprecated Use IHolidayFormData */
export type HolidayFormData = IHolidayFormData;

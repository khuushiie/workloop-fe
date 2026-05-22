// Office Configuration from Environment Variables
export const OFFICE_CONFIG = {
  // Location
  latitude: Number(import.meta.env.VITE_OFFICE_LATITUDE) || 18.5824222,
  longitude: Number(import.meta.env.VITE_OFFICE_LONGITUDE) || 73.7260936,
  allowedRadiusMeters:
    Number(import.meta.env.VITE_ALLOWED_RADIUS_METERS) || 100,

  // Timing
  startHour: Number(import.meta.env.VITE_OFFICE_START_HOUR) || 10,
  startMinute: Number(import.meta.env.VITE_OFFICE_START_MINUTE) || 30,
  startTime: import.meta.env.VITE_OFFICE_START_TIME || "10:30",

  // API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
} as const;

// Helper function to check if check-in is late
export const isLateCheckIn = (checkInTime: Date): boolean => {
  const checkInHour = checkInTime.getHours();
  const checkInMinute = checkInTime.getMinutes();

  return (
    checkInHour > OFFICE_CONFIG.startHour ||
    (checkInHour === OFFICE_CONFIG.startHour &&
      checkInMinute > OFFICE_CONFIG.startMinute)
  );
};

// Helper function to get office start time as Date
export const getOfficeStartTime = (date: Date = new Date()): Date => {
  const startTime = new Date(date);
  startTime.setHours(OFFICE_CONFIG.startHour, OFFICE_CONFIG.startMinute, 0, 0);
  return startTime;
};

// Helper function to format office start time
export const getOfficeStartTimeFormatted = (): string => {
  return OFFICE_CONFIG.startTime;
};

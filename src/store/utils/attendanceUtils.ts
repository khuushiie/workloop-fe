import { OFFICE_CONFIG } from "../../utils/config";

const DEFAULT_ALLOWED_RADIUS = OFFICE_CONFIG.allowedRadiusMeters;

export class AttendanceUtils {

  /**
   * Haversine distance between two lat/lng pairs in meters.
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Returns true when the user is within the allowed radius.
   * @param allowedRadius - override from org locationConfig; falls back to env default.
   */
  static isLocationValid(
    distance: number | null,
    allowedRadius: number = DEFAULT_ALLOWED_RADIUS,
  ): boolean {
    return distance !== null && distance <= allowedRadius;
  }

  // Format full date-time string to "10:30 AM"
  static formatTime(time?: string | null): string {
    if (!time) return "--:--";
    try {
      return new Date(time).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return "--:--";
    }
  }

  // Convert decimal hours (e.g., 8.5) to "08:30"
  static formatHoursToHHMM(hours: number = 0): string {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  static getStatusLabel(status?: string): string {
    if (!status) return "Unknown";
    const labels: Record<string, string> = {
      present: "Present",
      half_day: "Half Day",
      absent: "Absent",
      leave: "Leave",
      late: "Late",
      not_checked_in: "Not Checked In",
      working: "Working",
      completed: "Completed",
      on_break: "On Break",
      checked_out: "Checked Out"
    };
    return labels[status.toLowerCase()] || status;
  }

  // --- 4. Status Colors (Tailwind Classes) ---
  // Added this back from your old reference
  static getStatusColor(status?: string): string {
    if (!status) return "bg-slate-100 text-slate-800";

    switch (status.toLowerCase()) {
      case "present":
      case "working":
        return "bg-green-100 text-green-800";

      case "late":
        return "bg-yellow-100 text-yellow-800";

      case "half_day":
      case "on_break":
        return "bg-orange-100 text-orange-800";

      case "absent":
        return "bg-red-100 text-red-800";

      case "leave":
        return "bg-primary-100 text-primary-800";

      case "completed":
      case "checked_out":
        return "bg-slate-100 text-slate-800"; // or purple/blue if you prefer

      default:
        return "bg-slate-100 text-slate-800";
    }
  }


  static getFormattedDateTime = () => {
    const now = new Date();
    const isoString = now.toISOString();
    return {
      date: isoString.split("T")[0],
      time: isoString.split("T")[1].split(".")[0],
    };
  };

  // Extract error message from RTK Query error object
  static getErrorMessage(error: unknown): string {
    if (!error) return "";
    if (typeof error === "object" && error !== null && "data" in error) return ((error as { data?: { message?: string } }).data)?.message || "Server Error";
    if (typeof error === "object" && error !== null && "message" in error) return (error as { message: string }).message;
    return "An unknown error occurred";
  }
}
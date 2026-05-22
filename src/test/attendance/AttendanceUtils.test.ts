import { describe, it, expect, vi } from "vitest";

vi.mock("../../utils/config", () => ({
  OFFICE_CONFIG: {
    latitude: 18.5824222,
    longitude: 73.7260936,
    allowedRadiusMeters: 100,
    startHour: 10,
    startMinute: 30,
    startTime: "10:30",
    apiBaseUrl: "http://localhost:3000",
  },
}));

import { AttendanceUtils } from "../../store/utils/attendanceUtils";

describe("AttendanceUtils.isLocationValid", () => {
  it("should return true when distance is within default radius", () => {
    expect(AttendanceUtils.isLocationValid(50)).toBe(true);
  });

  it("should return true when distance equals default radius", () => {
    expect(AttendanceUtils.isLocationValid(100)).toBe(true);
  });

  it("should return false when distance exceeds default radius", () => {
    expect(AttendanceUtils.isLocationValid(101)).toBe(false);
  });

  it("should return false when distance is null", () => {
    expect(AttendanceUtils.isLocationValid(null)).toBe(false);
  });

  it("should use custom radius when provided", () => {
    expect(AttendanceUtils.isLocationValid(150, 200)).toBe(true);
    expect(AttendanceUtils.isLocationValid(250, 200)).toBe(false);
  });

  it("should accept radius of exactly the distance", () => {
    expect(AttendanceUtils.isLocationValid(500, 500)).toBe(true);
  });
});

describe("AttendanceUtils.calculateDistance", () => {
  it("should return 0 for identical coordinates", () => {
    const dist = AttendanceUtils.calculateDistance(18.58, 73.72, 18.58, 73.72);
    expect(dist).toBe(0);
  });

  it("should return a positive distance for different coordinates", () => {
    const dist = AttendanceUtils.calculateDistance(
      18.5824222,
      73.7260936,
      18.583,
      73.727,
    );
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(200);
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isGameBookingPeriod } from "../../utils/gameBookingPeriod";
import type { GameBookingItem } from "../../store/apis/gameBooking.api";

const baseBooking: GameBookingItem = {
  id: "1",
  gameId: "g1",
  gameName: "Test",
  createdBy: "u1",
  creatorName: "User",
  startTime: "2030-01-01T10:00:00.000Z",
  endTime: "2030-01-01T11:00:00.000Z",
  duration: 60,
  status: "pending",
  participants: [],
  createdAt: "2029-01-01T00:00:00.000Z",
};

describe("isGameBookingPeriod", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true when endTime is after now (UTC)", () => {
    vi.setSystemTime(new Date("2030-01-01T10:30:00.000Z"));
    expect(isGameBookingPeriod(baseBooking)).toBe(true);
  });

  it("returns false when endTime is before or equal to now (UTC)", () => {
    vi.setSystemTime(new Date("2030-01-01T11:00:00.000Z"));
    expect(isGameBookingPeriod(baseBooking)).toBe(false);
    vi.setSystemTime(new Date("2030-01-01T11:00:01.000Z"));
    expect(isGameBookingPeriod(baseBooking)).toBe(false);
  });
});

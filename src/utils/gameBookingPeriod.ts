import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { GameBookingItem } from "../store/apis/gameBooking.api";

dayjs.extend(utc);

export function isGameBookingPeriod(booking: GameBookingItem): boolean {
  return dayjs.utc(booking.endTime).isAfter(dayjs.utc());
}

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ✅ CHANGE 1: Use 'string' to accept whatever the backend sends 
// ("present", "absent", "working", "on_break", etc.)
export type AttendanceStatus = string;

export interface IAttendanceState {
  status: AttendanceStatus;
  checkInTime: string | null;
  breakStartTime: string | null;
  lastUpdated: string | null;
}

const initialState: IAttendanceState = {
  status: "not_checked_in", // Default state matching backend convention
  checkInTime: null,
  breakStartTime: null,
  lastUpdated: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    // 1. SYNC: Put backend data directly into Redux
    setAttendanceState: (state, action: PayloadAction<{
      status: string;
      checkInTime?: string | null;
      breakStartTime?: string | null;
    }>) => {
      state.status = action.payload.status; // Stores "absent", "present", etc. directly
      state.checkInTime = action.payload.checkInTime ?? state.checkInTime;
      state.breakStartTime = action.payload.breakStartTime ?? null;
      state.lastUpdated = new Date().toISOString();
    },

    // 2. OPTIMISTIC UPDATES: We manually set strings that match backend expectations
    markCheckIn: (state, action: PayloadAction<{ time: string }>) => {
      state.status = "present"; // Assuming success means 'present'
      state.checkInTime = action.payload.time;
      state.breakStartTime = null;
    },

    markCheckOut: (state) => {
      state.status = "checked_out"; // Or 'present' depending on how you want the UI to behave
      state.breakStartTime = null;
    },

    markBreakStart: (state, action: PayloadAction<{ time: string }>) => {
      state.status = "on_break";
      state.breakStartTime = action.payload.time;
    },

    markBreakEnd: (state) => {
      state.status = "present"; // Back to working
      state.breakStartTime = null;
    },

    resetAttendance: () => initialState,
  },
});

export const {
  setAttendanceState,
  markCheckIn,
  markCheckOut,
  markBreakStart,
  markBreakEnd,
  resetAttendance
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
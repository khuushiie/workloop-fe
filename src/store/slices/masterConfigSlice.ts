import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ========= Interfaces ========= */

export interface IMasterConfigOption {
  code: string;
  label: string;
}

export interface IMasterConfig {
  id: string;
  categoryCode: string;
  code: string;
  label: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/* ========= State ========= */

interface IMasterConfigState {
  selectedCategoryCode: string | null;
  selectedConfigId: string | null;

  // pagination (UI-driven)
  skip: number;
  limit: number;

  // optional helpers
  isDrawerOpen: boolean;
}

const initialState: IMasterConfigState = {
  selectedCategoryCode: null,
  selectedConfigId: null,
  skip: 0,
  limit: 10,
  isDrawerOpen: false,
};

/* ========= Slice ========= */

const masterConfigSlice = createSlice({
  name: "masterConfig",
  initialState,
  reducers: {
    setSelectedCategoryCode(
      state,
      action: PayloadAction<string | null>
    ) {
      state.selectedCategoryCode = action.payload;
      state.skip = 0; // reset pagination on category change
    },

    setSelectedConfigId(
      state,
      action: PayloadAction<string | null>
    ) {
      state.selectedConfigId = action.payload;
    },

    setPagination(
      state,
      action: PayloadAction<{ skip: number; limit: number }>
    ) {
      state.skip = action.payload.skip;
      state.limit = action.payload.limit;
    },

    openConfigDrawer(state) {
      state.isDrawerOpen = true;
    },

    closeConfigDrawer(state) {
      state.isDrawerOpen = false;
      state.selectedConfigId = null;
    },

    resetMasterConfigState() {
      return initialState;
    },
  },
});

/* ========= Actions ========= */

export const {
  setSelectedCategoryCode,
  setSelectedConfigId,
  setPagination,
  openConfigDrawer,
  closeConfigDrawer,
  resetMasterConfigState,
} = masterConfigSlice.actions;

/* ========= Reducer ========= */

export default masterConfigSlice.reducer;

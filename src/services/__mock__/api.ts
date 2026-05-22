// import { vi } from 'vitest';

// // This file must contain a mock for EVERY function used in your tests.
// export const apiService = {
//   fetchTemplates: vi.fn(),
//   fetchDrafts: vi.fn(),
//   createSurvey: vi.fn(),
//   createSurveyTemplate: vi.fn(),
  
//   // FIX: Add the missing getCurrentUser mock function
//   getCurrentUser: vi.fn(), 
// };
// __mock__/api.ts
import { vi } from 'vitest';

// This file must contain a mock for EVERY function used in your tests.
export const apiService = {
  fetchTemplates: vi.fn(),
  fetchDrafts: vi.fn(),
  
  // FIX: Replace createSurvey with saveSurvey
  saveSurvey: vi.fn(), 
  createSurveyTemplate: vi.fn(),
  
  // FIX: Add the missing getCurrentUser mock function
  getCurrentUser: vi.fn(), 
};
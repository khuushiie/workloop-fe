// src/components/survey-admin/__mocks__/antd.ts

import React from 'react';
import { vi } from 'vitest';
import type { DatePickerProps } from 'antd';
import dayjs from 'dayjs';

// The mock component for Antd's DatePicker.
// It acts as a simple text input for testing purposes.
const MockDatePicker: React.FC<DatePickerProps> = ({ onChange, placeholder, ...props }) => {
  return (
    <input
      data-testid="date-picker-mock"
      placeholder={placeholder}
      onChange={(e) => {
        // We'll call the real onChange function with a mock dayjs object and the value string.
        // This makes sure the test passes the expected arguments.
        const mockDayjs = e.target.value ? dayjs(e.target.value) : null;
        onChange?.(mockDayjs, e.target.value);
      }}
      {...props}
    />
  );
};

export const DatePicker = MockDatePicker;

// Re-export other mocked antd components to prevent errors in other tests.
// Note: It's crucial to mock every antd component that is used in the code being tested.
export const Button: React.FC<any> = ({ children, ...props }) => <button {...props}>{children}</button>;
export const Modal: React.FC<any> = ({ children, visible, onCancel, ...props }) => visible ? <div data-testid="mock-modal">{children}</div> : null;
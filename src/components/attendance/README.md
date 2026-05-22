# Attendance Components

This directory contains reusable components for attendance management functionality. The components are designed to be shared between admin and user attendance views.

## Components Structure

```
attendance/
├── types.ts              # Shared TypeScript interfaces
├── utils.ts              # Utility functions for status, dates, calculations
├── exportUtils.ts        # Excel export functionality
├── useAttendance.ts      # Custom hook for attendance logic
├── AttendanceFilters.tsx # Reusable filter component
├── AttendanceTable.tsx   # Reusable table component
├── AttendanceLegend.tsx  # Reusable legend component
├── index.ts              # Export barrel
├── UserAttendance.tsx    # User attendance view (refactored)
├── AdminAttendance.tsx   # Admin attendance view (refactored)
└── README.md            # This documentation
```

## Shared Components

### 1. Types (`types.ts`)

Contains all shared TypeScript interfaces:
- `AttendanceRecord`
- `Employee`
- `Department`
- `AttendanceSummary`
- `LeaveRequest`
- `AttendanceFilters`
- `AttendanceTableProps`

### 2. Utilities (`utils.ts`)

Common utility functions:
- `getStatusLabel()` - Convert status to display label
- `getLeaveStatusLabel()` - Convert leave type to display label
- `getStatusColor()` - Get CSS classes for status colors
- `formatDate()` - Format dates consistently
- `getMonthName()` - Get month name from number
- `getDaysInMonth()` - Calculate days in a month
- `generateAttendanceTable()` - Generate attendance data structure
- `calculateEmployeeSummary()` - Calculate attendance summary

### 3. Export Utilities (`exportUtils.ts`)

Excel export functionality:
- `exportAttendanceToXLSX()` - Export attendance data to Excel

### 4. Custom Hook (`useAttendance.ts`)

Manages attendance state and logic:
- Data fetching (attendance records, employees, departments, leave requests)
- Filter management
- Loading and error states
- Supports both admin and user modes

### 5. AttendanceFilters (`AttendanceFilters.tsx`)

Reusable filter component with:
- Month/Year selection
- Department filter (admin only)
- Employee filter (admin only)
- Status filter (admin only)
- Export button
- Collapsible design

### 6. AttendanceTable (`AttendanceTable.tsx`)

Reusable table component with:
- Dynamic column generation for days
- Status indicators with colors
- Summary calculations
- Loading states
- Empty states
- Responsive design

### 7. AttendanceLegend (`AttendanceLegend.tsx`)

Reusable legend component with:
- Status indicators
- Configurable to show/hide "Late" status
- Consistent styling

## Usage Examples

### Basic Usage

```tsx
import { 
  useAttendance, 
  AttendanceFilters, 
  AttendanceTable, 
  AttendanceLegend 
} from './attendance';

const MyAttendanceComponent = () => {
  const {
    attendanceRecords,
    employees,
    departments,
    leaveRequests,
    loading,
    error,
    filters,
    handleFilterChange,
  } = useAttendance({ isAdmin: true });

  return (
    <div>
      <AttendanceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        departments={departments}
        employees={employees}
        loading={loading}
        isAdmin={true}
      />
      
      <AttendanceTable
        employees={employees}
        attendanceRecords={attendanceRecords}
        leaveRequests={leaveRequests}
        filters={filters}
        loading={loading}
        isAdmin={true}
      />
      
      <AttendanceLegend showLate={true} />
    </div>
  );
};
```

### User View

```tsx
const UserAttendanceView = () => {
  const {
    attendanceRecords,
    leaveRequests,
    loading,
    filters,
    user,
    handleFilterChange,
  } = useAttendance({ isAdmin: false });

  return (
    <div>
      <AttendanceFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
        isAdmin={false}
      />
      
      <AttendanceTable
        employees={[]}
        attendanceRecords={attendanceRecords}
        leaveRequests={leaveRequests}
        filters={filters}
        loading={loading}
        isAdmin={false}
        currentUser={user}
      />
      
      <AttendanceLegend showLate={false} />
    </div>
  );
};
```

## Benefits of Refactoring

1. **Code Reusability**: Shared components eliminate duplication
2. **Maintainability**: Changes in one place affect all instances
3. **Consistency**: UI and behavior are consistent across views
4. **Type Safety**: Shared TypeScript interfaces ensure type consistency
5. **Testing**: Easier to test individual components
6. **Performance**: Optimized rendering and state management
7. **Scalability**: Easy to add new attendance-related features

## Migration Notes

The original `UserAttendance.tsx` and `AdminAttendance.tsx` components have been refactored to use the new reusable components. The functionality remains the same, but the code is now more maintainable and reusable.

### Key Changes:
- Removed duplicate utility functions
- Extracted common UI components
- Centralized state management in custom hook
- Unified export functionality
- Consistent error handling and loading states

# Employee Card Component

## Overview
The Employee Card component displays real-time online/offline status of all employees in the organization. It shows employee names, IDs, departments, and their current online status.

## Features
- **Real-time Status**: Shows who's currently online or offline
- **Employee Information**: Displays employee name, ID, and department
- **Status Indicators**: Visual indicators for online (green) and offline (gray) status
- **Last Seen**: Shows when offline employees were last active
- **Auto-refresh**: Updates every 30 seconds
- **Responsive Design**: Works on desktop and mobile devices

## Components

### EmployeeCard.tsx
Main component that fetches and displays employee status information.

### Key Features:
- Fetches employee data from `/employees/with-status` endpoint
- Updates current user's activity every 30 seconds
- Tracks user interactions (mouse, keyboard, scroll) to update activity
- Shows online/offline counts
- Displays employee avatars with initials
- Color-coded department badges

## Backend Integration

### New Endpoints:
- `GET /employees/with-status` - Returns employees with attendance-based status
- `GET /employees/status/:userId` - Returns status for a specific employee
- `POST /employees/clear-cache/:userId` - Clears cache for a specific employee

### Database Integration:
Uses existing Attendance schema to determine online/offline status:
- `checkInTime` - When employee checked in
- `checkOutTime` - When employee checked out
- `breaks` - Array of break records with start/end times
- `isActive` - Whether a break is currently active

### Real-Time Updates:
- **Event System**: Uses attendance event service to notify when status changes
- **Cache Management**: Implements caching with automatic invalidation
- **Immediate Updates**: Status updates immediately when check-in/check-out/break events occur
- **10-Second Refresh**: Automatic refresh every 10 seconds for responsive updates

### Attendance-Based Status Logic:
- **Online**: Checked in and not on break, or on break for less than 2 hours
- **Offline**: Not checked in, checked out, on extended break (>2 hours), or inactive (>30 minutes)
- **Status Types**:
  - "At work" - Checked in and working
  - "On lunch break" - On lunch break
  - "On tea break" - On tea break
  - "On personal break" - On personal break
  - "Checked out" - Finished for the day
  - "Not checked in" - Haven't checked in today
  - "Inactive" - Checked in but no recent activity
  - "On extended break" - Break longer than 2 hours

## Usage

The Employee Card is automatically included in both Admin and User dashboards:

```tsx
import EmployeeCard from './EmployeeCard';

// In dashboard components
<EmployeeCard />
```

## Styling

The component uses Tailwind CSS classes and includes:
- Responsive design for different screen sizes
- Hover effects and transitions
- Color-coded status indicators
- Department-specific color badges
- Loading and error states

## Future Enhancements

Potential improvements:
- WebSocket integration for real-time updates
- Department filtering
- Search functionality
- Status history
- Custom status messages
- Team/department grouping

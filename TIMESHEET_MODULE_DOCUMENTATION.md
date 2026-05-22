# Timesheet Module Documentation

## Overview
The Timesheet Module is a comprehensive system for tracking and managing employee work hours, tasks, and project assignments. It provides both user and admin interfaces with role-based access control.

## Architecture

### Frontend Structure
```
src/
├── types/
│   └── timesheet.ts              # TypeScript interfaces and types
├── services/
│   └── timesheetApi.ts            # API service layer
└── components/
    └── timesheet/
        ├── TimesheetManagement.tsx    # Admin timesheet management
        ├── MyTimesheets.tsx           # User timesheet view
        └── AddTimesheetModal.tsx      # Timesheet creation modal
```

## Data Models

### TimesheetEntry Interface
```typescript
interface TimesheetEntry {
  id: string;                    // Unique identifier
  date: string;                  // Date in YYYY-MM-DD format
  userId: string;                // User who created the timesheet
  userName: string;              // Display name of the user
  userEmail: string;             // User's email address
  tasks: TimesheetTask[];        // Array of tasks for the day
  project: string;               // Project name
  totalHours: number;           // Total hours worked
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;            // Creation timestamp
  updatedAt: string;            // Last update timestamp
}
```

### TimesheetTask Interface
```typescript
interface TimesheetTask {
  id: string;                   // Unique task identifier
  name: string;                 // Task name
  startTime: string;           // Start time (HH:MM format)
  endTime: string;             // End time (HH:MM format)
  hours: number;               // Calculated hours
  description?: string;        // Optional task description
}
```

### TimesheetStats Interface
```typescript
interface TimesheetStats {
  totalHours: number;          // Total hours across all timesheets
  approvedHours: number;        // Hours in approved timesheets
  thisMonthHours: number;      // Hours for current month
  totalEntries: number;        // Total number of timesheet entries
}
```

## Components

### 1. TimesheetManagement (Admin View)
**Route:** `/admin/timesheet-management`
**Purpose:** Complete timesheet management for administrators

#### Features:
- **Dashboard Stats**: Total hours, approved hours, monthly hours, entry count
- **Advanced Filtering**: Status, user, search, date range
- **Comprehensive Table**: All users' timesheets with full details
- **Admin Actions**: Edit, approve, delete any timesheet
- **Bulk Operations**: Manage multiple timesheets

#### Key Functions:
```typescript
// Load all timesheets with filters
const loadData = async () => {
  const timesheets = await timesheetApi.getTimesheets(filters);
  const stats = await timesheetApi.getStats();
};

// Approve timesheet
const handleApprove = async (id: string) => {
  await timesheetApi.approveTimesheet(id);
};

// Delete timesheet
const handleDelete = async (id: string) => {
  await timesheetApi.deleteTimesheet(id);
};
```

### 2. MyTimesheets (User View)
**Route:** `/my-timesheets`
**Purpose:** Personal timesheet management for employees

#### Features:
- **Personal Stats**: User-specific statistics
- **Personal Filtering**: Status, search, date range (no user filter)
- **Personal Table**: Only user's own timesheets
- **User Actions**: View, edit (draft only), submit, delete (draft only)

#### Key Functions:
```typescript
// Load user's own timesheets
const loadData = async () => {
  const timesheets = await timesheetApi.getMyTimesheets(filters);
  const stats = await timesheetApi.getStats();
};

// Submit timesheet for approval
const handleSubmit = async (id: string) => {
  await timesheetApi.updateTimesheet(id, { status: 'submitted' });
};
```

### 3. AddTimesheetModal
**Purpose:** Create new timesheet entries

#### Features:
- **Date Selection**: Required field
- **Project Assignment**: Required field
- **Dynamic Task Management**: Add/remove tasks
- **Time Tracking**: Start/end time with auto-calculation
- **Validation**: Required fields and business rules

#### Key Functions:
```typescript
// Add new task
const addTask = () => {
  setFormData(prev => ({
    ...prev,
    tasks: [...prev.tasks, newTask]
  }));
};

// Calculate hours automatically
const calculateHours = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
};

// Submit timesheet
const handleSubmit = async (e: React.FormEvent) => {
  await timesheetApi.createTimesheet(formData);
};
```

## API Service Layer

### TimesheetApiService Class
**File:** `src/services/timesheetApi.ts`

#### Methods:

##### Statistics
```typescript
async getStats(): Promise<TimesheetStats>
```
- **Purpose**: Get timesheet statistics
- **Returns**: Total hours, approved hours, monthly hours, entry count

##### Timesheet Management
```typescript
async getTimesheets(filters?: TimesheetFilters): Promise<TimesheetEntry[]>
async getTimesheetById(id: string): Promise<TimesheetEntry>
async createTimesheet(data: CreateTimesheetDto): Promise<TimesheetEntry>
async updateTimesheet(id: string, data: UpdateTimesheetDto): Promise<TimesheetEntry>
async deleteTimesheet(id: string): Promise<void>
```

##### User-Specific Operations
```typescript
async getMyTimesheets(filters?: TimesheetFilters): Promise<TimesheetEntry[]>
```

##### Admin Operations
```typescript
async approveTimesheet(id: string): Promise<TimesheetEntry>
async rejectTimesheet(id: string): Promise<TimesheetEntry>
async getPendingTimesheets(): Promise<TimesheetEntry[]>
```

## Business Logic

### Timesheet Status Flow
```
Draft → Submitted → Approved
  ↓         ↓
Deleted   Rejected
```

### Status Rules:
- **Draft**: User can edit, delete, or submit
- **Submitted**: Admin can approve or reject
- **Approved**: Final state, no further changes
- **Rejected**: User can edit and resubmit

### Time Calculation Logic
```typescript
const calculateHours = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60));
};
```

### Validation Rules
1. **Required Fields**: Date, project, task names
2. **Time Validation**: End time must be after start time
3. **Hours Calculation**: Automatic based on time difference
4. **Status Transitions**: Only valid transitions allowed

## User Interface Design

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Title + Add Timesheet Button                    │
├─────────────────────────────────────────────────────────┤
│ Stats Cards: Total | Approved | This Month | Entries   │
├─────────────────────────────────────────────────────────┤
│ Filters: Status | User | Search | From Date | To Date  │
├─────────────────────────────────────────────────────────┤
│ Timesheet Table: Date | User | Tasks | Projects | Hours │
│                      | Status | Actions                │
└─────────────────────────────────────────────────────────┘
```

### Status Badge Colors
- **Draft**: Gray (`bg-gray-100 text-gray-700`)
- **Submitted**: Yellow (`bg-yellow-100 text-yellow-700`)
- **Approved**: Green (`bg-green-100 text-green-700`)
- **Rejected**: Red (`bg-red-100 text-red-700`)

### Action Icons
- **View**: Eye icon (blue)
- **Edit**: Pencil icon (blue)
- **Approve**: Checkmark icon (green)
- **Delete**: Trash icon (red)

## Role-Based Access Control

### Admin Permissions
- ✅ View all users' timesheets
- ✅ Approve/reject timesheets
- ✅ Edit any timesheet
- ✅ Delete any timesheet
- ✅ Access admin routes
- ✅ View all statistics

### User Permissions
- ✅ View own timesheets only
- ✅ Create new timesheets
- ✅ Edit own draft timesheets
- ✅ Submit timesheets for approval
- ✅ Delete own draft timesheets
- ✅ View personal statistics

## Navigation Integration

### Sidebar Navigation
```typescript
// Admin Navigation
{
  icon: Clock,
  label: "Timesheet Management",
  path: "/admin/timesheet-management",
  type: "single",
},
{
  icon: Clock,
  label: "Timesheet Approvals",
  path: "/admin/timesheet-approvals",
  type: "single",
},

// User Navigation
{
  icon: Clock,
  label: "My Timesheets",
  path: "/my-timesheets",
  type: "single",
},
```

### Route Configuration
```typescript
// Admin Route
<Route path="/admin/timesheet-management" element={<TimesheetManagement />} />

// User Route
<Route path="/my-timesheets" element={<MyTimesheets />} />
```

## Dummy Data Structure

### Sample Timesheet Entry
```typescript
{
  id: '1',
  date: '2024-01-16',
  userId: '1',
  userName: 'John Smith',
  userEmail: 'john.smith@company.com',
  tasks: [
    {
      id: '1',
      name: 'Backend API Development',
      startTime: '09:15',
      endTime: '18:00',
      hours: 8.0,
      description: 'API development and testing'
    }
  ],
  project: 'E-commerce Platform',
  totalHours: 8.0,
  status: 'draft',
  createdAt: '2024-01-16T09:00:00Z',
  updatedAt: '2024-01-16T18:00:00Z'
}
```

### Sample Statistics
```typescript
{
  totalHours: 23.0,
  approvedHours: 7.5,
  thisMonthHours: 0.0,
  totalEntries: 3
}
```

## Backend Requirements

### Database Schema (MongoDB)
```javascript
// Timesheet Collection
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  date: Date,                // Timesheet date
  project: String,           // Project name
  tasks: [{
    name: String,            // Task name
    startTime: String,       // HH:MM format
    endTime: String,         // HH:MM format
    hours: Number,           // Calculated hours
    description: String      // Optional description
  }],
  totalHours: Number,        // Sum of all task hours
  status: String,            // draft, submitted, approved, rejected
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints Required
```
GET    /api/timesheet/stats              # Get statistics
GET    /api/timesheet                    # Get all timesheets (admin)
GET    /api/timesheet/my                 # Get user's timesheets
GET    /api/timesheet/:id                # Get specific timesheet
POST   /api/timesheet                    # Create timesheet
PATCH  /api/timesheet/:id                # Update timesheet
DELETE /api/timesheet/:id                # Delete timesheet
PATCH  /api/timesheet/:id/approve        # Approve timesheet (admin)
PATCH  /api/timesheet/:id/reject         # Reject timesheet (admin)
GET    /api/timesheet/pending            # Get pending timesheets (admin)
```

### Authentication & Authorization
- JWT token validation
- Role-based access control
- User ownership validation
- Admin privilege checks

## Future Enhancements

### Potential Features
1. **Time Tracking Integration**: Real-time check in/out
2. **Project Management**: Link to project management system
3. **Reporting**: Advanced analytics and reports
4. **Notifications**: Email notifications for status changes
5. **Mobile Support**: Mobile-responsive design
6. **Bulk Operations**: Bulk approve/reject
7. **Export Functionality**: Export to Excel/PDF
8. **Time Validation**: Overtime detection and alerts

### Technical Improvements
1. **Real-time Updates**: WebSocket integration
2. **Caching**: Redis for performance
3. **Search**: Elasticsearch for advanced search
4. **Audit Trail**: Track all changes
5. **Backup**: Automated data backup
6. **Monitoring**: Application monitoring and logging

## Testing Strategy

### Unit Tests
- Component rendering
- State management
- Form validation
- API service methods

### Integration Tests
- User workflows
- Admin workflows
- API endpoints
- Database operations

### E2E Tests
- Complete user journeys
- Cross-browser compatibility
- Performance testing

## Deployment Considerations

### Environment Variables
```env
TIMESHEET_DB_URL=mongodb://localhost:27017/timesheet
TIMESHEET_JWT_SECRET=your-secret-key
TIMESHEET_UPLOAD_PATH=/uploads/timesheets
```

### Security
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

This documentation provides a comprehensive understanding of the timesheet module's architecture, functionality, and implementation details. It serves as a guide for backend development and future enhancements.

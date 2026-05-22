type AttendanceEventListener = (userId: string) => void;

class AttendanceEventService {
  private listeners: AttendanceEventListener[] = [];

  // Subscribe to attendance events
  subscribe(listener: AttendanceEventListener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners when attendance changes
  notifyAttendanceChange(userId: string) {
    this.listeners.forEach(listener => {
      try {
        listener(userId);
      } catch (error) {
      }
    });
  }

  // Method to be called when check-in/check-out/break events occur
  onAttendanceUpdate(userId: string) {
    this.notifyAttendanceChange(userId);
  }
}

export const attendanceEventService = new AttendanceEventService();

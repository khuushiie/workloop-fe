const AttendanceLegend = () => {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-soft border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Legends</h3>

      {/* Status Legends */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-slate-800 mb-3">
          Attendance Status
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <span className="w-10 h-10 bg-green-100 text-green-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              P
            </span>
            <span className="text-sm text-slate-700">Present</span>
          </div>
          <div className="flex items-center">
            <span className="w-10 h-10 bg-red-100 text-red-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              A
            </span>
            <span className="text-sm text-slate-700">Absent</span>
          </div>
          <div className="flex items-center">
            <span className="w-10 h-10 bg-orange-100 text-orange-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              HD
            </span>
            <span className="text-sm text-slate-700">Half Day</span>
          </div>
          <div className="flex items-center">
            <span className="w-10 h-10 bg-primary-100 text-primary-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              EL
            </span>
            <span className="text-sm text-slate-700">Earned Leave</span>
          </div>
         
          <div className="flex items-center">
            <span className="w-10 h-10 bg-slate-200 text-slate-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              LWP
            </span>
            <span className="text-sm text-slate-700">Leave Without Pay</span>
          </div>
          <div className="flex items-center">
            <span className="w-10 h-10 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              CPL
            </span>
            <span className="text-sm text-slate-700">Compensatory Leave</span>
          </div>
        <div className="flex items-center">
  <span className="w-10 h-10 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
    OH
  </span>
  <span className="text-sm text-slate-700">Optional Holiday</span>
</div>

          <div className="flex items-center">
            <span className="w-10 h-10 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              LATE
            </span>
            <span className="text-sm text-slate-700">Late</span>
          </div>
          <div className="flex items-center">
            <span className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full text-xs font-semibold mr-3 flex items-center justify-center px-1">
              NM
            </span>
            <span className="text-sm text-slate-700">Not Marked</span>
          </div>
        </div>
      </div>

      {/* Half Day Leave Legends */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-slate-800 mb-3">
          Half Day Leave Status
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <span className="w-12 h-10 bg-gradient-to-r from-green-100 to-primary-100 text-green-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              P/EL
            </span>
            <span className="text-sm text-slate-700">
              Half Present + Half EL
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-12 h-10 bg-gradient-to-r from-green-100 to-purple-100 text-green-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              P/SL
            </span>
            <span className="text-sm text-slate-700">
              Half Present + Half SL
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-12 h-10 bg-gradient-to-r from-green-100 to-slate-200 text-green-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              P/LWP
            </span>
            <span className="text-sm text-slate-700">
              Half Present + Half LWP
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-12 h-10 bg-gradient-to-r from-orange-100 to-primary-100 text-orange-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              HD/EL
            </span>
            <span className="text-sm text-slate-700">
              Half Day EL (No Check-in)
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-12 h-10 bg-gradient-to-r from-green-100 to-indigo-100 text-green-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              P/CPL
            </span>
            <span className="text-sm text-slate-700">
              Half Present + Half CPL
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-12 h-10 bg-gradient-to-r from-orange-100 to-indigo-100 text-orange-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              HD/CPL
            </span>
            <span className="text-sm text-slate-700">
              Half Day CPL (No Check-in)
            </span>
          </div>
        </div>
      </div>

      {/* Time Information Legends */}
      <div>
        <h4 className="text-md font-semibold text-slate-800 mb-3">
          Time Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 text-primary-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              In
            </div>
            <span className="text-sm text-slate-700">Check In Time</span>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 text-red-800 rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              Out
            </div>
            <span className="text-sm text-slate-700">Check Out Time</span>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              H
            </div>
            <span className="text-sm text-slate-700">Net Work Hours</span>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-600 text-white rounded-full text-xs font-medium mr-3 flex items-center justify-center px-1">
              B
            </div>
            <span className="text-sm text-slate-700">Break Hours</span>
          </div>
        </div>
        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600">
            <strong>Note:</strong> Each day shows attendance status, check
            in/out times, work hours, and break hours. Monthly totals are
            displayed in the summary columns on the right.
          </p>
          <p className="text-xs text-slate-600 mt-2">
            <strong>Half Day Leave:</strong> When an employee takes a half-day
            leave, the status shows both parts - e.g., "P/EL" means half-day
            present + half-day earned leave. "HD/EL" means half-day EL without
            check-in.
          </p>
          <p className="text-xs text-slate-600 mt-2">
            <strong>4-Hour Rule:</strong> Employees working less than 4 hours
            without leave are marked as "Absent" with "&lt;4h work" indicator.
            If leave is applied for the same day, they are marked as "Leave"
            regardless of work hours.
          </p>
          <p className="text-xs text-slate-600 mt-2">
            <strong>Break Hours:</strong> Break hours are always displayed with
            a "Break:" label, even when they are 0.00h. This ensures complete
            information is shown for each day.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceLegend;

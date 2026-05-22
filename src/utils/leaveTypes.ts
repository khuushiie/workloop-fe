export const getLeaveTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      earned: "Earned Leave",
      sick: "Sick Leave",
      lwp: "Leave Without Pay",
      wfh: "Work From Home",
      compensatory_leave: "Compensatory Leave",
      optional_holiday: "Optional Holiday",
      flexi_weekend: "Flexi Weekend",
    };
    return types[type] || type;
  };
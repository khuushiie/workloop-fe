const RoleBasedContribution = ({ data }: any) => {

  const totals = data.roles.map((r: string, i: number) => ({
    role: r,
    value: data.values.reduce((s: number, row: number[]) => s + row[i], 0),
  }));

  return (
    <div className="bg-white p-5 rounded-2xl shadow-soft w-full">
      <h3 className="text-md font-semibold mb-4 text-slate-500">
        Role-Based Contribution
      </h3>

      <div className="space-y-4">
        {totals.map((r: any) => (
          <div key={r.role}>
            <div className="flex justify-between text-sm">
              <span>{r.role}</span>
              <span>{r.value}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full">
              <div className="h-full bg-primary-600 rounded-full w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleBasedContribution;

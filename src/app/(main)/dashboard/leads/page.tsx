import { LeadsStats } from "./_components/leads-stats";
import { LeadsTable } from "./_components/leads-table";

export default function LeadsPage() {
  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <LeadsStats />
      <LeadsTable />
    </div>
  );
}


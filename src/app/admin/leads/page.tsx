import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import LeadModel from "@/lib/models/Lead";
import UserModel from "@/lib/models/User";
import { requireAdminUser } from "@/lib/auth";
import type { Lead } from "@/types";
import { LeadManagementClient } from "@/components/admin/leads/lead-management-client";

export const metadata = {
  title: "Khách hàng tiềm năng — CRM VinFast Đà Nẵng",
};

export default async function AdminLeadsPage() {
  const user = await requireAdminUser();

  let leads: Lead[] = [];
  let salesUsers: string[] = [];

  const conn = await connectToDatabase();
  if (conn) {
    const [leadDocs, userDocs] = await Promise.all([
      LeadModel.find({}).sort({ createdAt: -1 }).lean(),
      UserModel.find({}).select("name role").sort({ name: 1 }).lean(),
    ]);
    leads = JSON.parse(JSON.stringify(leadDocs));
    salesUsers = userDocs.map((u) => u.name).filter(Boolean);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Khách hàng tiềm năng
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Theo dõi phễu bán hàng, chốt đơn, lái thử &amp; tương tác khách hàng đại lý VinFast Đà Nẵng
          </p>
        </div>
      </div>

      <LeadManagementClient
        initialLeads={leads}
        userRole={user.role}
        salesUsers={salesUsers}
      />
    </div>
  );
}

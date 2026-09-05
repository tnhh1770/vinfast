import "server-only";
import { requireRole } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/lib/models/User";
import type { AdminUser } from "@/types";
import UsersClient from "./UsersClient";

export const metadata = {
  title: "Người dùng — CRM VinFast Đà Nẵng",
};

export default async function AdminUsersPage() {
  const current = await requireRole("admin");

  const conn = await connectToDatabase();
  const users: AdminUser[] = conn
    ? JSON.parse(
        JSON.stringify(
          await UserModel.find({})
            .select("_id email name role createdAt")
            .sort({ createdAt: 1 })
            .lean(),
        ),
      )
    : [];

  return <UsersClient initialUsers={users} currentUserId={String(current._id)} />;
}

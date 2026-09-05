import "server-only";
import { requireAdminUser } from "@/lib/auth";
import { getCrmTransactions } from "@/lib/crm-db";
import TransactionsClient from "./TransactionsClient";

export const metadata = {
  title: "Giao dịch — CRM VinFast Đà Nẵng",
};

export default async function AdminTransactionPage() {
  await requireAdminUser();

  const transactions = await getCrmTransactions();

  return <TransactionsClient initialTransactions={transactions} />;
}

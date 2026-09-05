import "server-only";
import { getCrmTransactions } from "@/lib/crm-db";
import TransactionsClient from "./TransactionsClient";

export const metadata = {
  title: "Quản Lý Giao Dịch Transaction — CarEmpire CRM",
};

export default async function AdminTransactionPage() {
  const transactions = await getCrmTransactions();

  return <TransactionsClient initialTransactions={transactions} />;
}

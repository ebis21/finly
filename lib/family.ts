import { requireSupabase } from "@/lib/supabase";
import { walletTotals, type WalletTotals } from "@/lib/finance";
import {
  rowToGoal,
  rowToTransaction,
  type GoalRow,
  type TransactionRow,
} from "@/lib/hybrid-data";
import type { Goal, Transaction } from "@/lib/types";

export interface FamilyMember {
  linkId: string;
  userId: string;
  name: string;
  email: string;
}

export interface ChildPortfolio {
  transactions: Transaction[];
  goals: Goal[];
  totals: WalletTotals;
}

interface MemberRow {
  link_id: string;
  member_id: string;
  name: string | null;
  email: string | null;
}

function toMember(row: MemberRow): FamilyMember {
  return {
    linkId: row.link_id,
    userId: row.member_id,
    name: row.name ?? (row.email ? row.email.split("@")[0] : "Konto"),
    email: row.email ?? "",
  };
}

// ---------- Strona dziecka ----------
export async function createLinkCode(): Promise<string> {
  const { data, error } = await requireSupabase().rpc("create_link_code");
  if (error) throw new Error(error.message);
  return data as string;
}

export async function listParents(): Promise<FamilyMember[]> {
  const { data, error } = await requireSupabase().rpc("get_my_parents");
  if (error) throw new Error(error.message);
  return ((data ?? []) as MemberRow[]).map(toMember);
}

export async function unlink(linkId: string): Promise<void> {
  const { error } = await requireSupabase()
    .from("family_links")
    .delete()
    .eq("id", linkId);
  if (error) throw new Error(error.message);
}

// ---------- Strona rodzica ----------
export async function redeemCode(
  code: string
): Promise<{ childId: string; name: string }> {
  const { data, error } = await requireSupabase().rpc("redeem_link_code", {
    p_code: code,
  });
  if (error) throw new Error(error.message);
  const row = data as { child_id: string; name: string };
  return { childId: row.child_id, name: row.name };
}

export async function listChildren(): Promise<FamilyMember[]> {
  const { data, error } = await requireSupabase().rpc("get_my_children");
  if (error) throw new Error(error.message);
  return ((data ?? []) as MemberRow[]).map(toMember);
}

export async function loadChildPortfolio(
  childId: string
): Promise<ChildPortfolio> {
  const client = requireSupabase();
  const [tx, gl] = await Promise.all([
    client
      .from("transactions")
      .select("*")
      .eq("user_id", childId)
      .order("date", { ascending: false }),
    client
      .from("goals")
      .select("*")
      .eq("user_id", childId)
      .order("created_at", { ascending: true }),
  ]);
  if (tx.error) throw new Error(tx.error.message);
  if (gl.error) throw new Error(gl.error.message);
  const transactions = ((tx.data ?? []) as TransactionRow[]).map(rowToTransaction);
  const goals = ((gl.data ?? []) as GoalRow[]).map(rowToGoal);
  return { transactions, goals, totals: walletTotals(transactions, goals) };
}

export async function addPocketMoney(
  childId: string,
  amount: number,
  title: string
): Promise<void> {
  const { error } = await requireSupabase().rpc("parent_add_pocket_money", {
    p_child: childId,
    p_amount: amount,
    p_title: title,
  });
  if (error) throw new Error(error.message);
}

export async function contributeToChildGoal(
  goalId: string,
  amount: number
): Promise<void> {
  const { error } = await requireSupabase().rpc("parent_contribute_to_goal", {
    p_goal: goalId,
    p_amount: amount,
  });
  if (error) throw new Error(error.message);
}

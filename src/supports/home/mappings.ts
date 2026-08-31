import type {
  ExpenseRecord,
  IncomeRecord,
  OrderRecord,
  PayLaterRecord,
  SavingGoalRecord,
} from "@/lib/localDb"

export const mapOrderRow = (
  row: Record<string, unknown>,
): OrderRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  target: Number(row.target ?? 0),
  saved: Number(row.saved ?? 0),
  progress: Number(row.progress ?? 0),
  due: String(row.due ?? "N/A"),
  reserved:
    row.reserved == null
      ? undefined
      : Number(row.reserved),
  amount:
    row.amount == null
      ? undefined
      : Number(row.amount),
})

export const mapExpenseRow = (
  row: Record<string, unknown>,
): ExpenseRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  category: String(row.category ?? ""),
  amount: Number(row.amount ?? 0),
  time: String(row.time ?? ""),
})

export const mapSavingGoalRow = (
  row: Record<string, unknown>,
): SavingGoalRecord => ({
  id: Number(row.id),
  title: String(row.title ?? ""),
  target: Number(row.target ?? 0),
  saved: Number(row.saved ?? 0),
  progress: Number(row.progress ?? 0),
  status: String(row.status ?? ""),
})

export const mapPaylaterRow = (
  row: Record<string, unknown>,
): PayLaterRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  months: Number(row.months ?? 0),
  monthlyPayment: Number(
    row.monthly_payment ?? 0,
  ),
  totalAmount: Number(
    row.total_amount ?? 0,
  ),
  imageUrl:
    row.image_url == null
      ? undefined
      : String(row.image_url),
})

export const mapIncomeRow = (
  row: Record<string, unknown>,
): IncomeRecord => ({
  id: Number(row.id),
  source: String(row.source ?? ""),
  amount: Number(row.amount ?? 0),
  createdAt: String(row.created_at ?? ""),
})
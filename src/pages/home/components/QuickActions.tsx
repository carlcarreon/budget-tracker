import { AddBalance } from "@/components/dialogs/balance/AddBalance"
import { AddExpense } from "@/components/dialogs/expenses/AddExpense"
import { AddOrder } from "@/components/dialogs/orders/AddOrder"
import { AddPaylater } from "@/components/dialogs/paylater/AddPaylater"

type QuickActionsProps = {
  onBalanceSubmit: (payload: {
    amount: number
  }) => void

  onExpenseSubmit: (payload: {
    name: string
    amount: number
    category: string
  }) => void

  onOrderSubmit: (payload: {
    name: string
    amount: number
  }) => void

  onPaylaterSubmit: (payload: {
    name: string
    months: number
    monthlyPayment: number
    imageUrl?: string
  }) => void
}

export function QuickActions({
  onBalanceSubmit,
  onExpenseSubmit,
  onOrderSubmit,
  onPaylaterSubmit,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-4 gap-1">
      <AddBalance
        onSubmit={onBalanceSubmit}
      />

      <AddExpense
        onSubmit={onExpenseSubmit}
      />

      <AddOrder
        onSubmit={onOrderSubmit}
      />

      <AddPaylater
        onSubmit={onPaylaterSubmit}
      />
    </div>
  )
}
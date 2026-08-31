import {
  HandPlatter,
  Wallet,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import { EmptyStateCard } from "./EmptyStateCard"

type RecentTransaction = {
  id: string
  name: string
  category: string
  amount: number
  time: string
  type: "income" | "expense"
}

type RecentTransactionsProps = {
  transactions: RecentTransaction[]
  formatCurrency: (value: number) => string
  formatTransactionDate: (value: string) => string
}

export function RecentTransactions({
  transactions,
  formatCurrency,
  formatTransactionDate,
}: RecentTransactionsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Recent Transactions
        </h2>

        <button
          type="button"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View All
        </button>
      </div>

      <Card className="py-0">
        <CardContent className="p-0">
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => {
              const isIncome =
                transaction.type === "income"

              return (
                <div key={transaction.id}>
                  <div className="flex items-center gap-3 px-4 py-4">
                    {/* ICON */}
                    <div
                      className={
                        isIncome
                          ? "rounded-full bg-emerald-500/10 p-3 text-emerald-600"
                          : "rounded-full bg-rose-500/10 p-3 text-rose-500"
                      }
                    >
                      {isIncome ? (
                        <Wallet className="h-5 w-5" />
                      ) : (
                        <HandPlatter className="h-5 w-5" />
                      )}
                    </div>

                    {/* INFORMATION */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {transaction.name}
                      </p>

                      <p className="text-xs font-medium text-muted-foreground">
                        {transaction.category}
                      </p>
                    </div>

                    {/* AMOUNT */}
                    <div className="text-right">
                      <p
                        className={
                          isIncome
                            ? "text-sm font-bold tracking-tight text-emerald-600"
                            : "text-sm font-bold tracking-tight text-rose-500"
                        }
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>

                      <p className="text-xs font-medium text-muted-foreground">
                        {formatTransactionDate(transaction.time)}
                      </p>
                    </div>
                  </div>

                  {index < transactions.length - 1 ? (
                    <Separator className="bg-slate-200" />
                  ) : null}
                </div>
              )
            })
          ) : (
            <div className="px-4 py-6">
              <EmptyStateCard
                icon={HandPlatter}
                iconClassName="bg-rose-500/10 text-rose-500"
                title="No transactions yet"
                description="Add your first expense or income."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
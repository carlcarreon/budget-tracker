import { useEffect, useMemo, useState } from "react"
import {
  BusFront,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Coffee,
  Ellipsis,
  Gamepad2,
  Plus,
  ReceiptText,
  ShoppingBag,
  Wallet,
} from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth"
import type { ExpenseRecord } from "@/lib/localDb"
import { supabase } from "@/utils/supabase"

const categoryMeta = {
  "Food & Dining": {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    chartColor: "#3b82f6",
    icon: Coffee,
  },
  Transportation: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    chartColor: "#22c55e",
    icon: BusFront,
  },
  Shopping: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    chartColor: "#f59e0b",
    icon: ShoppingBag,
  },
  "Bills & Utilities": {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    chartColor: "#8b5cf6",
    icon: ReceiptText,
  },
  Entertainment: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    chartColor: "#fb7185",
    icon: Gamepad2,
  },
  Others: {
    iconBg: "bg-slate-100",
    iconColor: "text-slate-400",
    chartColor: "#cbd5e1",
    icon: Ellipsis,
  },
} as const

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const mapExpenseRow = (
  row: Record<string, unknown>,
): ExpenseRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  category: String(row.category ?? ""),
  amount: Number(row.amount ?? 0),
  time: String(row.time ?? ""),
})

function ExpensesPage() {
  const { user } = useAuth()

  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadExpenses = async () => {
    if (!user) {
      setExpenses([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    if (error) {
      console.error("Failed to load expenses:", error)
      setExpenses([])
      setIsLoading(false)
      return
    }

    const mappedExpenses = (data ?? []).map((row) =>
      mapExpenseRow(row as Record<string, unknown>),
    )

    const uniqueItems = Array.from(
      new Map(
        mappedExpenses.map((item) => [
          `${item.id}-${item.name}-${item.category}-${item.time}`,
          item,
        ]),
      ).values(),
    )

    setExpenses(uniqueItems)
    setIsLoading(false)
  }

  useEffect(() => {
    void loadExpenses()
  }, [user])

  const categoryItems = useMemo(() => {
    const grouped = expenses.reduce<Record<string, number>>(
      (acc, expense) => {
        acc[expense.category] =
          (acc[expense.category] ?? 0) + expense.amount

        return acc
      },
      {},
    )

    const totals = Object.entries(grouped).map(
      ([name, value]) => ({
        name,
        value,
        amount: formatCurrency(value),
        percent: "0.0%",
        ...categoryMeta[
          name as keyof typeof categoryMeta
        ],
      }),
    )

    const total =
      totals.reduce((sum, item) => sum + item.value, 0) || 1

    return totals
      .sort((a, b) => b.value - a.value)
      .map((item) => ({
        ...item,
        percent: `${(
          (item.value / total) *
          100
        ).toFixed(1)}%`,
      }))
  }, [expenses])

  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      ),
    [expenses],
  )

  const transactionCount = expenses.length

  const highestExpense = useMemo(
    () =>
      Math.max(
        0,
        ...expenses.map((expense) => expense.amount),
      ),
    [expenses],
  )

  const dailyAverage =
    transactionCount > 0 ? totalSpent / 31 : 0

  const transactions = useMemo(
    () =>
      expenses.map((expense) => ({
        name: expense.name,
        category: expense.category,
        amount: formatCurrency(expense.amount),
        time: expense.time,
        icon:
          categoryMeta[
            expense.category as keyof typeof categoryMeta
          ]?.icon ?? Wallet,
        tint:
          categoryMeta[
            expense.category as keyof typeof categoryMeta
          ]?.iconBg ?? "bg-slate-100",
        iconColor:
          categoryMeta[
            expense.category as keyof typeof categoryMeta
          ]?.iconColor ?? "text-slate-500",
      })),
    [expenses],
  )

  return (
    <section
      className="page space-y-5"
      id="expenses"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Expenses
          </h2>

          <p className="max-w-md text-xs text-muted-foreground">
            Track where your money goes.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full border-blue-200 bg-blue-500 text-white shadow-sm hover:bg-blue-600 hover:text-white"
          aria-label="Add expense"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="overview"
        className="w-full"
      >
        <TabsList className="w-full">
          <TabsTrigger
            value="overview"
            className="flex-1"
          >
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="transactions"
            className="flex-1"
          >
            Transactions
          </TabsTrigger>

          <TabsTrigger
            value="categories"
            className="flex-1"
          >
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="mt-4 space-y-4"
        >
          <Card className="p-0">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700">
                      Spend This Month
                    </p>

                    <p className="text-3xl font-semibold tracking-tight text-rose-500">
                      {formatCurrency(totalSpent)}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                    >
                      Month
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-2xs">
                      May
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-2xs">
                      April
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-2xs">
                      March
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Separator className="bg-slate-200" />

              {isLoading ? (
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Loading expenses...
                  </p>
                </div>
              ) : expenses.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  <div className="flex items-center gap-3 p-0">
                    <div className="grid size-8 shrink-0 place-items-center rounded-md bg-rose-50 text-rose-500">
                      <span className="text-2xl leading-none">
                        ↓
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-2xs font-medium text-slate-700">
                        Daily Average
                      </p>

                      <p className="text-sm font-semibold text-rose-500">
                        {formatCurrency(dailyAverage)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-0">
                    <div className="grid size-8 shrink-0 place-items-center rounded-md bg-amber-50 text-amber-500">
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-2xs font-medium text-slate-700">
                        Transactions
                      </p>

                      <p className="text-sm font-semibold text-slate-900">
                        {transactionCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-0">
                    <div className="grid size-8 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-500">
                      <Wallet className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-2xs font-medium text-slate-700">
                        Highest Expense
                      </p>

                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(highestExpense)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <Wallet className="h-4 w-4" />
                  </div>

                  <p className="text-xs font-medium text-slate-900">
                    No expenses yet
                  </p>

                  <p className="mt-1 text-2xs text-slate-500">
                    Add an expense to start tracking your spending.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold tracking-tight text-slate-900">
                  Spending by Category
                </h3>

                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-0 text-sm font-medium text-blue-600 hover:bg-transparent hover:text-blue-700"
                >
                  View all
                </Button>
              </div>

              {categoryItems.length > 0 ? (
                <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-1">
                  <div className="relative mx-auto size-32">
                    <PieChart
                      width={128}
                      height={128}
                    >
                      <Pie
                        data={categoryItems}
                        dataKey="value"
                        innerRadius={42}
                        outerRadius={64}
                        paddingAngle={0}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        {categoryItems.map(
                          (entry) => (
                            <Cell
                              key={entry.name}
                              fill={
                                entry.chartColor ??
                                "#cbd5e1"
                              }
                            />
                          ),
                        )}
                      </Pie>
                    </PieChart>

                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Total
                        </p>

                        <p className="text-base font-semibold tracking-tight text-slate-900">
                          {formatCurrency(totalSpent)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {categoryItems.map(
                      (item) => {
                        const Icon =
                          item.icon ?? Ellipsis

                        return (
                          <div
                            key={item.name}
                            className="grid grid-cols-[minmax(0,1fr)_52px_48px] items-center gap-2"
                          >
                            <div className="flex min-w-0 items-center gap-1">
                              <div
                                className={`grid size-6 shrink-0 place-items-center rounded-md ${item.iconBg} ${item.iconColor}`}
                              >
                                <Icon className="h-3 w-3" />
                              </div>

                              <span className="min-w-0 truncate text-2xs leading-tight text-slate-900">
                                {item.name}
                              </span>
                            </div>

                            <span className="whitespace-nowrap text-left text-xs font-medium leading-none text-slate-900">
                              {item.amount}
                            </span>

                            <span className="justify-self-end whitespace-nowrap text-right text-xs leading-none text-slate-500">
                              {item.percent}
                            </span>
                          </div>
                        )
                      },
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                    <ShoppingBag className="h-4 w-4" />
                  </div>

                  <p className="text-xs font-medium text-slate-900">
                    No categories yet
                  </p>

                  <p className="mt-1 text-2xs text-slate-500">
                    Add expenses to see your category breakdown.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-base font-semibold tracking-tight text-slate-900">
                  Recent Transactions
                </h3>

                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-0 text-sm font-medium text-blue-600 hover:bg-transparent hover:text-blue-700"
                >
                  View all
                </Button>
              </div>

              {transactions.length > 0 ? (
                <div className="space-y-0">
                  {transactions.map(
                    (transaction, index) => (
                      <div
                        key={`${transaction.name}-${transaction.category}-${transaction.time}`}
                      >
                        <div className="flex items-center gap-3 py-3">
                          <div
                            className={`grid size-11 place-items-center rounded-md ${transaction.tint}`}
                          >
                            <transaction.icon
                              className={`h-5 w-5 ${transaction.iconColor}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {transaction.name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {transaction.category}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-rose-500">
                              -{transaction.amount}
                            </p>

                            <p className="text-xs text-slate-500">
                              {transaction.time}
                            </p>
                          </div>

                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>

                        {index <
                        transactions.length - 1 ? (
                          <Separator className="bg-slate-200" />
                        ) : null}
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <Wallet className="h-4 w-4" />
                  </div>

                  <p className="text-xs font-medium text-slate-900">
                    No recent transactions
                  </p>

                  <p className="mt-1 text-2xs text-slate-500">
                    Add an expense to populate this list.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="transactions"
          className="mt-4"
        >
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Transactions view is powered by your
              Supabase expense records.
            </p>
          </Card>
        </TabsContent>

        <TabsContent
          value="categories"
          className="mt-4"
        >
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Categories view is powered by your
              Supabase expense records.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  )
}

export default ExpensesPage
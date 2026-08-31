import { useEffect, useMemo, useState } from "react"
import {
  ChevronRight,
  CreditCard,
  ClipboardList,
  HandPlatter,
  ShoppingBag,
  PiggyBank,
  Wallet,
  WalletCards,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import type {
  ExpenseRecord,
  IncomeRecord,
  OrderRecord,
  PayLaterRecord,
  SavingGoalRecord,
} from "@/lib/localDb"
import { supabase } from "@/utils/supabase"
import { AddExpenseAction } from "./AddExpenseAction"
import { AddExpenseDialog } from "./AddExpenseDialog"
import { AddOrderAction } from "./AddOrderAction"
import { AddOrderDialog } from "./AddOrderDialog"
import { AddPaylaterAction } from "./AddPaylaterAction"
import { AddPaylaterDialog } from "./AddPaylaterDialog"
import { AddSalaryAction } from "./AddSalaryAction"
import { SalaryDialog } from "./SalaryDialog"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))

function EmptyStateCard({
  icon: Icon,
  title,
  description,
  iconClassName,
}: {
  icon: typeof ShoppingBag
  title: string
  description: string
  iconClassName: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center">
      <div
        className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${iconClassName}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="text-xs font-medium text-slate-900">{title}</p>

      <p className="mt-1 text-2xs text-slate-500">{description}</p>
    </div>
  )
}

const mapOrderRow = (row: Record<string, unknown>): OrderRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  target: Number(row.target ?? 0),
  saved: Number(row.saved ?? 0),
  progress: Number(row.progress ?? 0),
  due: String(row.due ?? "N/A"),
  reserved: row.reserved == null ? undefined : Number(row.reserved),
  amount: row.amount == null ? undefined : Number(row.amount),
})

const mapExpenseRow = (row: Record<string, unknown>): ExpenseRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  category: String(row.category ?? ""),
  amount: Number(row.amount ?? 0),
  time: String(row.time ?? ""),
})

const mapSavingGoalRow = (
  row: Record<string, unknown>,
): SavingGoalRecord => ({
  id: Number(row.id),
  title: String(row.title ?? ""),
  target: Number(row.target ?? 0),
  saved: Number(row.saved ?? 0),
  progress: Number(row.progress ?? 0),
  status: String(row.status ?? ""),
})

const mapPaylaterRow = (
  row: Record<string, unknown>,
): PayLaterRecord => ({
  id: Number(row.id),
  name: String(row.name ?? ""),
  months: Number(row.months ?? 0),
  monthlyPayment: Number(row.monthly_payment ?? 0),
  totalAmount: Number(row.total_amount ?? 0),
  imageUrl: row.image_url == null ? undefined : String(row.image_url),
})

const mapIncomeRow = (
  row: Record<string, unknown>,
): IncomeRecord => ({
  id: Number(row.id),
  source: String(row.source ?? ""),
  amount: Number(row.amount ?? 0),
  createdAt: String(row.created_at ?? ""),
})

export function HomePage() {
  const { user } = useAuth()

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [savingGoals, setSavingGoals] = useState<SavingGoalRecord[]>([])
  const [paylaters, setPaylaters] = useState<PayLaterRecord[]>([])
  const [incomes, setIncomes] = useState<IncomeRecord[]>([])

  const [isSalaryOpen, setIsSalaryOpen] = useState(false)
  const [isExpenseOpen, setIsExpenseOpen] = useState(false)
  const [isOrderOpen, setIsOrderOpen] = useState(false)
  const [isPaylaterOpen, setIsPaylaterOpen] = useState(false)

  const [salaryAmount, setSalaryAmount] = useState("")

  const loadHome = async () => {
    const [
      orderResult,
      expenseResult,
      goalResult,
      paylaterResult,
      incomeResult,
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("id", { ascending: true }),

      supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("id", { ascending: true }),

      supabase
        .from("saving_goals")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("id", { ascending: true }),

      supabase
        .from("paylaters")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("id", { ascending: true }),

      supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user?.id ?? "")
        .order("id", { ascending: true }),
    ])

    if (orderResult.error) throw orderResult.error
    if (expenseResult.error) throw expenseResult.error
    if (goalResult.error) throw goalResult.error
    if (paylaterResult.error) throw paylaterResult.error
    if (incomeResult.error) throw incomeResult.error

    setOrders(
      (orderResult.data ?? []).map((row) => mapOrderRow(row)),
    )

    setExpenses(
      (expenseResult.data ?? []).map((row) => mapExpenseRow(row)),
    )

    setSavingGoals(
      (goalResult.data ?? []).map((row) => mapSavingGoalRow(row)),
    )

    setPaylaters(
      (paylaterResult.data ?? []).map((row) => mapPaylaterRow(row)),
    )

    setIncomes(
      (incomeResult.data ?? []).map((row) => mapIncomeRow(row)),
    )
  }

  useEffect(() => {
    let active = true

    if (!user) {
      return undefined
    }

    void loadHome().catch(() => {
      if (active) {
        setOrders([])
        setExpenses([])
        setSavingGoals([])
        setPaylaters([])
        setIncomes([])
      }
    })

    return () => {
      active = false
    }
  }, [user])

  /*
   * TOTAL INCOME
   */
  const incomeTotal = useMemo(
    () =>
      incomes.reduce(
        (sum, income) => sum + income.amount,
        0,
      ),
    [incomes],
  )

  /*
   * TOTAL EXPENSES
   */
  const expenseTotal = useMemo(
    () =>
      expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      ),
    [expenses],
  )

  /*
   * NET BALANCE
   *
   * Example:
   * Income = ₱500
   * Expenses = ₱800
   * Balance = -₱300
   */
  const totalBalance = useMemo(
    () => incomeTotal - expenseTotal,
    [incomeTotal, expenseTotal],
  )

  /*
   * ORDER COUNT
   */
  const orderCount = useMemo(
    () => orders.length,
    [orders],
  )

  /*
   * PAYLATER COUNT
   */
  const paylaterCount = useMemo(
    () => paylaters.length,
    [paylaters],
  )

  /*
   * PAYLATER MONTHLY TOTAL
   *
   * Kept internally in case it is needed later.
   */
  const paylaterDue = useMemo(
    () =>
      paylaters.reduce(
        (sum, paylater) =>
          sum + paylater.monthlyPayment,
        0,
      ),
    [paylaters],
  )

  /*
   * SAVINGS
   */
  const savings = useMemo(
    () =>
      savingGoals.reduce(
        (sum, goal) => sum + goal.saved,
        0,
      ),
    [savingGoals],
  )

  /*
   * TODAY'S INCOME
   */
  const todayIncome = useMemo(() => {
    const today = new Date().toDateString()

    return incomes.reduce((sum, income) => {
      const incomeDate = new Date(
        income.createdAt,
      ).toDateString()

      return incomeDate === today
        ? sum + income.amount
        : sum
    }, 0)
  }, [incomes])

  /*
   * TODAY'S EXPENSES
   */
  const todayExpenses = useMemo(() => {
    const today = new Date().toDateString()

    return expenses.reduce((sum, expense) => {
      if (expense.time.startsWith("Today")) {
        return sum + expense.amount
      }

      const expenseDate = new Date(
        expense.time,
      ).toDateString()

      return expenseDate === today
        ? sum + expense.amount
        : sum
    }, 0)
  }, [expenses])

  /*
   * TODAY'S NET
   *
   * Example:
   * Today income = ₱500
   * Today expenses = ₱800
   * Result = -₱300
   */
  const todayNet = useMemo(
    () => todayIncome - todayExpenses,
    [todayIncome, todayExpenses],
  )

  /*
   * RECENT TRANSACTIONS
   */
  const recentTransactions = useMemo(() => {
    const expenseTransactions = expenses.map(
      (expense) => ({
        id: `expense-${expense.id}`,
        name: expense.name,
        category: expense.category,
        amount: expense.amount,
        time: expense.time,
        type: "expense" as const,
        date: new Date(expense.time).getTime(),
      }),
    )

    const incomeTransactions = incomes.map(
      (income) => ({
        id: `income-${income.id}`,
        name: income.source,
        category: "Income",
        amount: income.amount,
        time: income.createdAt,
        type: "income" as const,
        date: new Date(
          income.createdAt,
        ).getTime(),
      }),
    )

    return [
      ...expenseTransactions,
      ...incomeTransactions,
    ]
      .sort((a, b) => b.date - a.date)
      .slice(0, 3)
  }, [expenses, incomes])

  /*
   * ADD SALARY
   */
  const handleSalarySubmit = async () => {
    const parsedAmount = Number(
      salaryAmount.replace(/[^0-9.]/g, ""),
    )

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return
    }

    const createdAt = new Date().toISOString()

    const { data, error } = await supabase
      .from("incomes")
      .insert({
        source: "Salary",
        amount: parsedAmount,
        created_at: createdAt,
        user_id: user?.id,
      })
      .select()
      .single()

    if (error || !data) {
      return
    }

    setIncomes((current) => [
      ...current,
      {
        id: data.id,
        source: data.source,
        amount: Number(data.amount),
        createdAt: data.created_at,
      },
    ])

    setSalaryAmount("")
    setIsSalaryOpen(false)
  }

  /*
   * ADD EXPENSE
   */
  const handleExpenseSubmit = async (payload: {
    name: string
    amount: number
    category: string
  }) => {
    const time = `Today, ${new Intl.DateTimeFormat(
      "en-PH",
      {
        hour: "numeric",
        minute: "2-digit",
      },
    ).format(new Date())}`

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        name: payload.name,
        amount: payload.amount,
        category: payload.category,
        time,
        user_id: user?.id,
      })
      .select()
      .single()

    if (error || !data) {
      return
    }

    setExpenses((current) => [
      ...current,
      {
        id: data.id,
        name: data.name,
        amount: Number(data.amount),
        category: data.category,
        time: data.time,
      },
    ])

    setIsExpenseOpen(false)
  }

  /*
   * ADD ORDER
   */
  const handleOrderSubmit = async (payload: {
    name: string
    amount: number
  }) => {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        name: payload.name,
        target: payload.amount,
        saved: 0,
        progress: 0,
        due: "N/A",
        amount: payload.amount,
        user_id: user?.id,
      })
      .select()
      .single()

    if (error || !data) {
      return
    }

    setOrders((current) => [
      ...current,
      {
        id: data.id,
        name: data.name,
        target: Number(data.target),
        saved: Number(data.saved),
        progress: Number(data.progress),
        due: data.due,
        amount:
          data.amount == null
            ? undefined
            : Number(data.amount),
        reserved:
          data.reserved == null
            ? undefined
            : Number(data.reserved),
      },
    ])

    setIsOrderOpen(false)
  }

  /*
   * ADD PAYLATER
   */
  const handlePaylaterSubmit = async (payload: {
    name: string
    months: number
    monthlyPayment: number
    imageUrl?: string
  }) => {
    const totalAmount =
      payload.months *
      payload.monthlyPayment

    const { data, error } = await supabase
      .from("paylaters")
      .insert({
        name: payload.name,
        months: payload.months,
        monthly_payment:
          payload.monthlyPayment,
        total_amount: totalAmount,
        image_url:
          payload.imageUrl ?? null,
        user_id: user?.id,
      })
      .select()
      .single()

    if (error || !data) {
      return
    }

    setPaylaters((current) => [
      ...current,
      {
        id: data.id,
        name: data.name,
        months: data.months,
        monthlyPayment: Number(
          data.monthly_payment,
        ),
        totalAmount: Number(
          data.total_amount,
        ),
        imageUrl:
          data.image_url ?? undefined,
      },
    ])

    setIsPaylaterOpen(false)
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-slate-900">
        Hello
      </h1>

      {/* TOTAL BALANCE */}
      <Card className="overflow-hidden border-slate-200 bg-white py-4 shadow-sm">
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>Total Balance</span>
              </div>

              <p
                className={`text-4xl font-bold tracking-tight ${totalBalance >= 0
                    ? "text-emerald-600"
                    : "text-rose-500"
                  }`}
              >
                {totalBalance >= 0 ? "+" : "-"}
                {formatCurrency(totalBalance)}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2 rounded-full"
            >
              Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="bg-slate-200" />

          <div className="flex items-stretch gap-0 text-center">
            {/* NET BALANCE */}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="rounded-2xl bg-slate-100 p-2">
                <Wallet
                  className={`h-5 w-5 ${totalBalance >= 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                    }`}
                />
              </div>

              <span className="text-2xs font-medium leading-none whitespace-nowrap text-muted-foreground">
                Balance
              </span>

              <span
                className={`text-sm font-medium tracking-tight ${totalBalance >= 0
                    ? "text-emerald-600"
                    : "text-rose-500"
                  }`}
              >
                {totalBalance >= 0 ? "+" : "-"}
                {formatCurrency(totalBalance)}
              </span>
            </div>

            <Separator
              orientation="vertical"
              className="mx-1 h-20 self-center bg-slate-200"
            />

            {/* ORDERS */}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="rounded-2xl bg-slate-100 p-2">
                <ShoppingBag className="h-5 w-5 text-amber-300" />
              </div>

              <span className="text-2xs font-medium leading-none whitespace-nowrap text-muted-foreground">
                Orders
              </span>

              <span className="text-sm font-medium tracking-tight text-slate-900">
                {orderCount}
              </span>
            </div>

            <Separator
              orientation="vertical"
              className="mx-1 h-20 self-center bg-slate-200"
            />

            {/* SAVINGS */}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="rounded-2xl bg-slate-100 p-2">
                <PiggyBank className="h-5 w-5 text-violet-300" />
              </div>

              <span className="text-2xs font-medium leading-none whitespace-nowrap text-muted-foreground">
                Savings
              </span>

              <span className="text-sm font-medium tracking-tight text-slate-900">
                {formatCurrency(savings)}
              </span>
            </div>

            <Separator
              orientation="vertical"
              className="mx-1 h-20 self-center bg-slate-200"
            />

            {/* PAYLATER */}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="rounded-2xl bg-slate-100 p-2">
                <WalletCards className="h-5 w-5 text-rose-300" />
              </div>

              <span className="text-2xs font-medium leading-none whitespace-nowrap text-muted-foreground">
                PayLater
              </span>

              <span className="text-sm font-medium tracking-tight text-slate-900">
                {paylaterCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-4 gap-1">
        <AddSalaryAction
          onClick={() => setIsSalaryOpen(true)}
        />

        <AddExpenseAction
          onClick={() => setIsExpenseOpen(true)}
        />

        <AddOrderAction
          onClick={() => setIsOrderOpen(true)}
        />

        <AddPaylaterAction
          onClick={() => setIsPaylaterOpen(true)}
        />
      </div>

      {/* MY TRACKERS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            My Trackers
          </h2>

          <Button
            type="button"
            variant="ghost"
            className="h-auto px-0 text-xs font-medium text-blue-600 hover:bg-transparent hover:text-blue-700"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
         
          {/* ORDERS */}
          <Card className="border-slate-200 bg-white py-2 shadow-sm">
            <CardContent className="space-y-2 px-2">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-blue-500/10 p-2 text-blue-600">
                  <ShoppingBag className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-md font-semibold text-slate-900">
                    Order
                  </p>
                </div>
              </div>

              <div className="flex min-h-[50px] flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold tracking-tight text-blue-600">
                  {orderCount}
                </p>
              </div>
            </CardContent>
          </Card>


          {/* PAYLATER */}
          <Card className="border-slate-200 bg-white py-2 shadow-sm">
            <CardContent className="space-y-2 px-2">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-rose-500/10 p-2 text-rose-500">
                  <CreditCard className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-md font-semibold text-slate-900">
                    PayLater
                  </p>
                </div>
              </div>

              <div className="flex min-h-[50px] flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold tracking-tight text-rose-500">
                  {paylaterCount}
                </p>
              </div>
            </CardContent>
          </Card>


          {/* TODAY */}
          <Card className="border-slate-200 bg-white py-2 shadow-sm">
            <CardContent className="space-y-2 px-2">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600">
                  <ClipboardList className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-md font-semibold text-slate-900">
                    Today
                  </p>
                </div>
              </div>

              <div className="flex min-h-[50px] flex-col items-center justify-center text-center">
                <p
                  className={`text-3xl font-bold tracking-tight ${todayNet > 0
                      ? "text-emerald-600"
                      : todayNet < 0
                        ? "text-rose-500"
                        : "text-slate-900"
                    }`}
                >
                  {todayNet > 0 ? "+" : todayNet < 0 ? "-" : ""}
                  {formatCurrency(todayNet)}
                </p>
              </div>
            </CardContent>
          </Card>


          {/* SAVINGS */}
          <Card className="border-slate-200 bg-white py-2 shadow-sm">
            <CardContent className="space-y-2 px-2">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-violet-500/10 p-2 text-violet-600">
                  <PiggyBank className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-md font-semibold text-slate-900">
                    Savings
                  </p>
                </div>
              </div>

              <div className="flex min-h-[50px] flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold tracking-tight text-violet-600">
                  {formatCurrency(savings)}
                </p>
              </div>
            </CardContent>
          </Card>
         

        </div>
      </section>

      {/* RECENT TRANSACTIONS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Recent Transactions
          </h2>

          <Button
            type="button"
            variant="ghost"
            className="h-auto px-0 text-xs font-medium text-blue-600 hover:bg-transparent hover:text-blue-700"
          >
            View All
          </Button>
        </div>

        <Card className="py-0">
          <CardContent className="p-0">
            {recentTransactions.length > 0 ? (
              recentTransactions.map(
                (transaction, index) => {
                  const isIncome =
                    transaction.type ===
                    "income"

                  return (
                    <div
                      key={transaction.id}
                    >
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
                          <p className="text-sm font-semibold text-slate-900">
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
                            {isIncome
                              ? "+"
                              : "-"}
                            {formatCurrency(
                              transaction.amount,
                            )}
                          </p>

                          <p className="text-xs font-medium text-muted-foreground">
                            {new Date(
                              transaction.time,
                            ).toLocaleString(
                              "en-PH",
                              {
                                month:
                                  "short",
                                day: "numeric",
                                hour: "numeric",
                                minute:
                                  "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {index <
                        recentTransactions.length -
                        1 ? (
                        <Separator className="bg-slate-200" />
                      ) : null}
                    </div>
                  )
                },
              )
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

      {/* DIALOGS */}
      <SalaryDialog
        open={isSalaryOpen}
        amount={salaryAmount}
        onOpenChange={setIsSalaryOpen}
        onAmountChange={setSalaryAmount}
        onSubmit={() =>
          void handleSalarySubmit()
        }
      />

      <AddExpenseDialog
        open={isExpenseOpen}
        onOpenChange={setIsExpenseOpen}
        onSubmit={(payload) =>
          void handleExpenseSubmit(payload)
        }
      />

      <AddOrderDialog
        open={isOrderOpen}
        onOpenChange={setIsOrderOpen}
        onSubmit={(payload) =>
          void handleOrderSubmit(payload)
        }
      />

      <AddPaylaterDialog
        open={isPaylaterOpen}
        onOpenChange={setIsPaylaterOpen}
        onSubmit={(payload) =>
          void handlePaylaterSubmit(payload)
        }
      />
    </div>
  )
}


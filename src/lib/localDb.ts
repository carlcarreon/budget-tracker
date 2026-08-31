import Dexie, { type Table } from "dexie"

export type OrderRecord = {
  id?: number
  name: string
  target: number
  saved: number
  progress: number
  due: string
  reserved?: number
  amount?: number
}

export type ExpenseRecord = {
  id?: number
  name: string
  category: string
  amount: number
  time: string
}

export type SavingGoalRecord = {
  id?: number
  title: string
  target: number
  saved: number
  progress: number
  status: string
}

export type ContributionRecord = {
  id?: number
  title: string
  amount: number
  date: string
}

export type PayLaterRecord = {
  id?: number
  name: string
  months: number
  monthlyPayment: number
  totalAmount: number
  imageUrl?: string
}

export type IncomeRecord = {
  id?: number
  source: string
  amount: number
  createdAt: string
}

export type SettingsRecord = {
  id?: number
  profileName: string
  email: string
  isPremium: boolean
  theme: "light" | "dark"
  currency: "PHP"
  dateFormat: string
}

class BudgetTrackDB extends Dexie {
  orders!: Table<OrderRecord, number>
  expenses!: Table<ExpenseRecord, number>
  savingGoals!: Table<SavingGoalRecord, number>
  contributions!: Table<ContributionRecord, number>
  paylaters!: Table<PayLaterRecord, number>
  incomes!: Table<IncomeRecord, number>
  settings!: Table<SettingsRecord, number>

  constructor() {
    super("budget-track")

    this.version(1).stores({
      orders: "++id, name, due",
      expenses: "++id, name, category, time",
      savingGoals: "++id, title, status",
      contributions: "++id, title, date",
      settings: "++id, profileName",
    })

    this.version(2).stores({
      orders: "++id, name, due",
      expenses: "++id, name, category, time",
      savingGoals: "++id, title, status",
      contributions: "++id, title, date",
      paylaters: "++id, name, due",
      incomes: "++id, source, createdAt",
      settings: "++id, profileName",
    })
  }
}

export const db = new BudgetTrackDB()
let seedPromise: Promise<void> | null = null
let seedCompleted = false
const SEED_LOCK_KEY = "budget-track:seed-disabled"

const isSeedDisabled = () =>
  typeof window !== "undefined" && window.localStorage.getItem(SEED_LOCK_KEY) === "true"

const setSeedDisabled = (disabled: boolean) => {
  if (typeof window === "undefined") {
    return
  }

  if (disabled) {
    window.localStorage.setItem(SEED_LOCK_KEY, "true")
  } else {
    window.localStorage.removeItem(SEED_LOCK_KEY)
  }
}

export const seedData = {
  orders: [
    {
      name: "Mechanical Keyboard",
      target: 3500,
      saved: 1200,
      progress: 34,
      due: "Jun 28",
    },
    {
      name: "iPhone 15 Case",
      target: 850,
      saved: 500,
      progress: 59,
      due: "Jul 5",
    },
    {
      name: "Monitor Stand",
      target: 1500,
      saved: 300,
      progress: 20,
      due: "Jul 15",
    },
  ] satisfies OrderRecord[],
  expenses: [
    {
      name: "Coffee Shop",
      category: "Food & Dining",
      amount: 120,
      time: "Today, 8:30 AM",
    },
    {
      name: "Jeepney Fare",
      category: "Transportation",
      amount: 15,
      time: "Today, 7:45 AM",
    },
    {
      name: "Shopee",
      category: "Shopping",
      amount: 399,
      time: "Yesterday, 9:15 PM",
    },
  ] satisfies ExpenseRecord[],
  savingGoals: [
    {
      title: "Japan Trip",
      target: 50000,
      saved: 34000,
      progress: 68,
      status: "On Track",
    },
    {
      title: "New Laptop",
      target: 35000,
      saved: 15750,
      progress: 45,
      status: "On Track",
    },
    {
      title: "Camera",
      target: 20000,
      saved: 5000,
      progress: 25,
      status: "Behind",
    },
    {
      title: "Emergency Fund",
      target: 30000,
      saved: 28000,
      progress: 93,
      status: "Almost there!",
    },
  ] satisfies SavingGoalRecord[],
  contributions: [
    {
      title: "Japan Trip",
      amount: 1000,
      date: "May 31, 2024 • 9:30 AM",
    },
    {
      title: "New Laptop",
      amount: 750,
      date: "May 30, 2024 • 8:15 PM",
    },
    {
      title: "Camera",
      amount: 500,
      date: "May 29, 2024 • 6:45 PM",
    },
  ] satisfies ContributionRecord[],
  paylaters: [] satisfies PayLaterRecord[],
  settings: [
    {
      profileName: "CJ Bautista",
      email: "cj.bautista@example.com",
      isPremium: true,
      theme: "dark",
      currency: "PHP",
      dateFormat: "May 31, 2024",
    },
  ] satisfies SettingsRecord[],
}

export async function seedLocalDatabase() {
  if (isSeedDisabled()) {
    return
  }

  if (seedCompleted) {
    return
  }

  if (seedPromise) {
    return seedPromise
  }

  seedPromise = (async () => {
    const [orderCount, expenseCount, goalCount, contributionCount, paylaterCount, incomeCount, settingsCount] =
      await Promise.all([
        db.orders.count(),
        db.expenses.count(),
        db.savingGoals.count(),
        db.contributions.count(),
        db.paylaters.count(),
        db.incomes.count(),
        db.settings.count(),
      ])

    const writes: Promise<number>[] = []

    if (orderCount === 0) {
      writes.push(db.orders.bulkAdd(seedData.orders))
    }

    if (expenseCount === 0) {
      writes.push(db.expenses.bulkAdd(seedData.expenses))
    }

    if (goalCount === 0) {
      writes.push(db.savingGoals.bulkAdd(seedData.savingGoals))
    }

    if (contributionCount === 0) {
      writes.push(db.contributions.bulkAdd(seedData.contributions))
    }

    if (paylaterCount === 0) {
      // no-op: paylater entries are user-generated
    }

    if (incomeCount === 0) {
      // no-op: income entries are created by the user
    }

    if (settingsCount === 0) {
      writes.push(db.settings.bulkAdd(seedData.settings))
    }

    await Promise.all(writes)
    seedCompleted = true
  })()

  try {
    await seedPromise
  } finally {
    seedPromise = null
  }
}

export async function clearLocalDatabase() {
  await Promise.all([
    db.orders.clear(),
    db.expenses.clear(),
    db.savingGoals.clear(),
    db.contributions.clear(),
    db.paylaters.clear(),
    db.incomes.clear(),
    db.settings.clear(),
  ])

  seedCompleted = true
  setSeedDisabled(true)
}

export function restoreLocalDatabaseSeeding() {
  setSeedDisabled(false)
  seedCompleted = false
}

const seedMatchers = {
  orders: seedData.orders,
  expenses: seedData.expenses,
  savingGoals: seedData.savingGoals,
  contributions: seedData.contributions,
  paylaters: seedData.paylaters,
  incomes: [] satisfies IncomeRecord[],
  settings: seedData.settings,
} as const

const normalizeRecord = <T extends Record<string, unknown>>(record: T) => {
  const normalized = { ...record }

  delete normalized.id

  return normalized
}

const isExactSeedMatch = <T extends Record<string, unknown>>(
  current: T[],
  seed: readonly T[],
) => {
  if (current.length !== seed.length) {
    return false
  }

  return current.every((record, index) => {
    return (
      JSON.stringify(normalizeRecord(record)) ===
      JSON.stringify(normalizeRecord(seed[index]))
    )
  })
}

export async function clearBundledSeedIfPresent() {
  const [orders, expenses, savingGoals, contributions, paylaters, incomes, settings] =
    await Promise.all([
      db.orders.orderBy("id").toArray(),
      db.expenses.orderBy("id").toArray(),
      db.savingGoals.orderBy("id").toArray(),
      db.contributions.orderBy("id").toArray(),
      db.paylaters.orderBy("id").toArray(),
      db.incomes.orderBy("id").toArray(),
      db.settings.orderBy("id").toArray(),
    ])

  const hasSeedData =
    isExactSeedMatch(orders, seedMatchers.orders) &&
    isExactSeedMatch(expenses, seedMatchers.expenses) &&
    isExactSeedMatch(savingGoals, seedMatchers.savingGoals) &&
    isExactSeedMatch(contributions, seedMatchers.contributions) &&
    isExactSeedMatch(paylaters, seedMatchers.paylaters) &&
    isExactSeedMatch(incomes, seedMatchers.incomes) &&
    isExactSeedMatch(settings, seedMatchers.settings)

  if (!hasSeedData) {
    return false
  }

  await clearLocalDatabase()
  restoreLocalDatabaseSeeding()
  return true
}

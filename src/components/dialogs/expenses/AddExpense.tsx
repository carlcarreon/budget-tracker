import { useMemo, useState } from "react"
import { ChevronDown, ClipboardList } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { QuickAction } from "@/pages/home/QuickAction"

const expenseCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Others",
] as const

type AddExpenseProps = {
  onSubmit: (payload: {
    name: string
    amount: number
    category: string
  }) => void
}

export function AddExpense({ onSubmit }: AddExpenseProps) {
  const [open, setOpen] = useState(false)

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] =
    useState<(typeof expenseCategories)[number]>(
      "Food & Dining",
    )

  const amountValue = useMemo(
    () => Number(amount.replace(/[^0-9.]/g, "")),
    [amount],
  )

  const resetForm = () => {
    setName("")
    setAmount("")
    setCategory("Food & Dining")
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)

    if (!value) {
      resetForm()
    }
  }

  const handleSubmit = () => {
    if (
      !name.trim() ||
      !Number.isFinite(amountValue) ||
      amountValue <= 0
    ) {
      return
    }

    onSubmit({
      name: name.trim(),
      amount: amountValue,
      category,
    })

    resetForm()
    setOpen(false)
  }

  return (
    <>
      {/* QUICK ACTION */}
      <QuickAction
        icon={<ClipboardList className="h-4 w-4" />}
        iconClassName="bg-green-500/10 text-green-600"
        title="Add Expense"
        description="Track spending"
        onClick={() => setOpen(true)}
      />

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>

            <DialogDescription>
              Enter the expense details and pick a category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* NAME */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="expense-name"
              >
                Expense name
              </label>

              <Input
                id="expense-name"
                placeholder="Coffee Shop"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />
            </div>

            {/* AMOUNT */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="expense-amount"
              >
                Amount
              </label>

              <Input
                id="expense-amount"
                inputMode="decimal"
                placeholder="₱0.00"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
              />
            </div>

            {/* CATEGORY */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Category
              </label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {category}
                    </span>

                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)]"
                >
                  {expenseCategories.map((item) => (
                    <DropdownMenuItem
                      key={item}
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
            >
              Save Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
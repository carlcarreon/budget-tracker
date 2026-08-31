import { useState } from "react"
import { Plus } from "lucide-react"

import { QuickAction } from "@/pages/home/QuickAction"

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

type AddBalanceProps = {
  onSubmit: (payload: {
    source: string
    amount: number
  }) => void
}

export function AddBalance({ onSubmit }: AddBalanceProps) {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState("")
  const [amount, setAmount] = useState("")

  const resetForm = () => {
    setSource("")
    setAmount("")
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)

    if (!value) {
      resetForm()
    }
  }

  const handleSubmit = () => {
    const amountValue = Number(
      amount.replace(/[^0-9.]/g, ""),
    )

    if (
      !source.trim() ||
      !Number.isFinite(amountValue) ||
      amountValue <= 0
    ) {
      return
    }

    onSubmit({
      source: source.trim(),
      amount: amountValue,
    })

    resetForm()
    setOpen(false)
  }

  return (
    <>
      {/* QUICK ACTION */}
      <QuickAction
        icon={<Plus className="h-4 w-4" />}
        iconClassName="bg-blue-500/10 text-blue-600"
        title="Add Balance"
        description="Add income"
        onClick={() => setOpen(true)}
      />

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Balance</DialogTitle>

            <DialogDescription>
              Add income to your available balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* SOURCE */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="income-source"
              >
                Income source
              </label>

              <Input
                id="income-source"
                placeholder="Salary, Freelance, Allowance..."
                value={source}
                onChange={(event) =>
                  setSource(event.target.value)
                }
              />
            </div>

            {/* AMOUNT */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="income-amount"
              >
                Amount
              </label>

              <Input
                id="income-amount"
                inputMode="decimal"
                placeholder="₱0.00"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
              />

              <p className="text-2xs text-slate-500">
                This amount will be added to your available balance.
              </p>
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
              Add Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

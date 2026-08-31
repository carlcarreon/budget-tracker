import { useState } from "react"
import { Plus } from "lucide-react"

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

import { QuickAction } from "@/pages/home/QuickAction"

type AddBalanceProps = {
  onSubmit: (payload: {
    amount: number
  }) => void
}

export function AddBalance({
  onSubmit,
}: AddBalanceProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")

  const resetForm = () => {
    setAmount("")
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value)

    if (!value) {
      resetForm()
    }
  }

  const handleSubmit = () => {
    const parsedAmount = Number(
      amount.replace(/[^0-9.]/g, ""),
    )

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return
    }

    onSubmit({
      amount: parsedAmount,
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
        description="Fund your balance"
        onClick={() => setOpen(true)}
      />

      {/* DIALOG */}
      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Balance
            </DialogTitle>

            <DialogDescription>
              Enter the amount you want to add
              to your available balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              className="text-xs font-medium text-slate-700"
              htmlFor="balance-amount"
            >
              Amount
            </label>

            <Input
              id="balance-amount"
              inputMode="decimal"
              placeholder="₱0.00"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
            />

            <p className="text-2xs text-slate-500">
              This amount will be recorded as
              income and added to your balance.
            </p>
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
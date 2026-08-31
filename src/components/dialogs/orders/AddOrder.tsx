import { useMemo, useState } from "react"
import { ShoppingBag } from "lucide-react"

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

type AddOrderProps = {
  onSubmit: (payload: {
    name: string
    amount: number
  }) => void
}

export function AddOrder({
  onSubmit,
}: AddOrderProps) {
  const [open, setOpen] = useState(false)

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")

  const amountValue = useMemo(
    () =>
      Number(
        amount.replace(
          /[^0-9.]/g,
          "",
        ),
      ),
    [amount],
  )

  const resetForm = () => {
    setName("")
    setAmount("")
  }

  const handleOpenChange = (
    value: boolean,
  ) => {
    setOpen(value)

    if (!value) {
      resetForm()
    }
  }

  const handleSubmit = () => {
    if (
      !name.trim() ||
      !Number.isFinite(
        amountValue,
      ) ||
      amountValue <= 0
    ) {
      return
    }

    onSubmit({
      name: name.trim(),
      amount: amountValue,
    })

    resetForm()
    setOpen(false)
  }

  return (
    <>
      {/* QUICK ACTION */}
      <QuickAction
        icon={
          <ShoppingBag className="h-4 w-4" />
        }
        iconClassName="bg-amber-500/10 text-amber-600"
        title="Add Order"
        description="Track something"
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
              Add Order
            </DialogTitle>

            <DialogDescription>
              Add something you want to
              purchase and track its amount.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* NAME */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="order-name"
              >
                Order name
              </label>

              <Input
                id="order-name"
                placeholder="New headphones"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
              />
            </div>

            {/* AMOUNT */}
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="order-amount"
              >
                Amount
              </label>

              <Input
                id="order-amount"
                inputMode="decimal"
                placeholder="₱0.00"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
            >
              Save Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
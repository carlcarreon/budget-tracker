import { useState } from "react"

import { CreditCard, ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"

import Orders from "./Orders"
import PaylaterOrders from "./PaylaterOrders"

type OrdersTab = "orders" | "paylater"

function OrdersPage() {
  const [activeTab, setActiveTab] =
    useState<OrdersTab>("orders")

  return (
    <section
      className="page space-y-5"
      id="orders"
    >
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Orders
        </h2>

        <p className="max-w-md text-xs text-muted-foreground">
          Track and manage your purchases.
        </p>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setActiveTab("orders")}
          className={`h-9 rounded-lg text-xs font-semibold ${
            activeTab === "orders"
              ? "bg-white text-slate-900 shadow-sm hover:bg-white"
              : "text-slate-500 hover:bg-transparent hover:text-slate-900"
          }`}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Orders
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setActiveTab("paylater")}
          className={`h-9 rounded-lg text-xs font-semibold ${
            activeTab === "paylater"
              ? "bg-white text-slate-900 shadow-sm hover:bg-white"
              : "text-slate-500 hover:bg-transparent hover:text-slate-900"
          }`}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          PayLater
        </Button>
      </div>

      {/* CONTENT */}
      <div>
        {activeTab === "orders" ? (
          <Orders />
        ) : (
          <PaylaterOrders />
        )}
      </div>
    </section>
  )
}

export default OrdersPage
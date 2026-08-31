import { useEffect } from "react"
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { AuthProvider, useAuth } from "./lib/auth"
import { clearBundledSeedIfPresent } from "./lib/localDb"
import LoginPage from "./pages/LoginPage"
import { HomePage } from "./pages/home/Index"
import OrdersPage from "./pages/OrdersPage"
import ExpensesPage from "./pages/ExpensesPage"
import SavingsPage from "./pages/SavingsPage"
import SettingsPage from "./pages/SettingsPage"

function ProtectedRoute() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 text-sm text-slate-500">
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default function App() {
  useEffect(() => {
    void clearBundledSeedIfPresent()
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

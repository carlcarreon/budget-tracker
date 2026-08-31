import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"

export default function RegisterPage() {
  const {
    session,
    isLoading,
    signUpWithEmail,
  } = useAuth()

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  if (!isLoading && session) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setStatus(null)

    const cleanEmail = email.trim()

    if (password !== confirmPassword) {
      setStatus("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setStatus("Password must be at least 6 characters.")
      return
    }

    setIsRegistering(true)

    try {
      const { error, session: newSession } =
        await signUpWithEmail(
          cleanEmail,
          password
        )

      if (error) {
        setStatus(error)
        return
      }

      console.log("Registration successful")
      console.log("New session:", newSession)

      if (newSession) {
        // Automatically logged in
        navigate("/", { replace: true })
        return
      }

      // No session means Supabase is requiring
      // email confirmation.
      setStatus(
        "Account created, but email confirmation is required. Disable email confirmation in Supabase to enable automatic login."
      )
    } catch (error) {
      console.error("Registration failed:", error)

      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account."
      )
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <Card className="mx-auto max-w-md overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-6 p-6">

          <div className="space-y-2 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600">
              <UserPlus className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Create your account
              </h1>

              <p className="text-sm text-slate-500">
                Start tracking your budget today.
              </p>
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="email"
              >
                Email
              </label>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="password"
              >
                Password
              </label>

              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-medium text-slate-700"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>

              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
              />
            </div>

            {status ? (
              <p className="text-sm text-red-600">
                {status}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isRegistering ||
                !email.trim() ||
                !password ||
                !confirmPassword
              }
            >
              {isRegistering
                ? "Creating account..."
                : "Create account"}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{" "}

            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}


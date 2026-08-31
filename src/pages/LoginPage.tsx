import { useState, type FormEvent } from "react"
import { Navigate } from "react-router-dom"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth"

export default function LoginPage() {
  const { session, isLoading, signInWithEmail } = useAuth()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  if (!isLoading && session) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSending(true)
    setStatus(null)

    const { error } = await signInWithEmail(email.trim())
    if (error) {
      setStatus(error)
    } else {
      setStatus("Check your email for the login link.")
      setEmail("")
    }

    setIsSending(false)
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <Card className="mx-auto max-w-md overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600">
              <LogIn className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Sign in to Budget Track
              </h1>
              <p className="text-sm text-slate-500">
                We’ll keep you signed in on this device until you sign out.
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            {status ? (
              <p className="text-sm text-slate-600">{status}</p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={isSending || !email.trim()}
            >
              {isSending ? "Sending..." : "Send sign-in link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

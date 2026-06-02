import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Input, SectionHeading } from "../components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <div className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#07111f] px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(180deg,rgba(8,15,26,1)_0%,rgba(5,9,17,1)_100%)]" />

      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[31px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
          <Badge>MockInterview</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Sign in and keep your interview flow moving.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Resume active sessions, jump straight into setup, and review reports
            without leaving the app shell.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Fast access
              </p>
              <p className="mt-3 text-sm text-slate-200">
                Jump to dashboard, setup, and reports in one place.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Interactive
              </p>
              <p className="mt-3 text-sm text-slate-200">
                Use the new buttons to manage each interview stage.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Focused
              </p>
              <p className="mt-3 text-sm text-slate-200">
                Keep your practice loop tight with fewer clicks.
              </p>
            </div>
          </div>
        </div>

        <Card className="self-center">
          <SectionHeading
            title="Login"
            subtitle="Enter your account details to continue."
          />

          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Email</span>
              <Input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">
                Password
              </span>
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide password" : "Show password"}
              </Button>
              <Button type="button" variant="secondary" onClick={clearForm}>
                Clear form
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/register")}
              >
                Go to register
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

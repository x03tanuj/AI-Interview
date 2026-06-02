import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Input, SectionHeading } from "../components/ui";

export default function Register() {
  const [name, setName] = useState("");
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
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const fillSample = () => {
    setName("Alex Johnson");
    setEmail("alex.johnson@example.com");
    setPassword("Interview123!");
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <div className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#07111f] px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.16),transparent_30%),linear-gradient(180deg,rgba(8,15,26,1)_0%,rgba(5,9,17,1)_100%)]" />

      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[31px] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
          <Badge tone="warning">Create account</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Set up your practice space and start interviewing.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Save your progress, generate sessions on demand, and keep every mock
            interview tied to your account.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Saved history
              </p>
              <p className="mt-3 text-sm text-slate-200">
                Access active and completed sessions from one dashboard.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Quick actions
              </p>
              <p className="mt-3 text-sm text-slate-200">
                Use dedicated buttons for setup, answer tools, and reports.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Feedback loop
              </p>
              <p className="mt-3 text-sm text-slate-200">
                Review score, feedback, and ideal answers after every run.
              </p>
            </div>
          </div>
        </div>

        <Card className="self-center">
          <SectionHeading
            title="Register"
            subtitle="Create your interview practice account."
          />

          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <form onSubmit={submit} className="space-y-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Name</span>
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>

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
                autoComplete="new-password"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Register"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide password" : "Show password"}
              </Button>
              <Button type="button" variant="secondary" onClick={fillSample}>
                Fill sample data
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                Reset form
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/login")}
              >
                Back to login
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Chip,
  Input,
  ProgressBar,
  SectionHeading,
  StatCard,
} from "../components/ui";

const rolePresets = [
  "Senior Backend Engineer",
  "Full Stack Engineer",
  "Product Manager",
  "Frontend Engineer",
  "Staff Software Engineer",
];

const modePresets = [
  { label: "Technical", value: "technical", tone: "default" },
  { label: "HR", value: "hr", tone: "warning" },
  { label: "Mixed", value: "mixed", tone: "success" },
];

const difficultyPresets = [
  { label: "Easy", value: "easy", tone: "success" },
  { label: "Medium", value: "medium", tone: "default" },
  { label: "Hard", value: "hard", tone: "warning" },
];

const recommendations = {
  technical:
    "This route leans into architecture, APIs, and system design depth.",
  hr: "This route favors communication, leadership, and behavioral clarity.",
  mixed:
    "This route balances technical precision with decision-making and storytelling.",
};

const estimateMinutes = {
  easy: 18,
  medium: 25,
  hard: 32,
};

const estimateQuestions = {
  easy: 7,
  medium: 10,
  hard: 12,
};

export default function InterviewSetup() {
  const [mode, setMode] = useState("technical");
  const [role, setRole] = useState("Senior Backend Engineer");
  const [difficulty, setDifficulty] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const startLabel = useMemo(() => {
    const normalizedRole = role.trim() || "your target role";
    return `You are about to enter a ${normalizedRole} interview`;
  }, [role]);

  const applyPreset = (presetRole) => {
    setRole(presetRole);
  };

  const randomize = () => {
    const randomRole =
      rolePresets[Math.floor(Math.random() * rolePresets.length)];
    const randomMode =
      modePresets[Math.floor(Math.random() * modePresets.length)].value;
    const randomDifficulty =
      difficultyPresets[Math.floor(Math.random() * difficultyPresets.length)]
        .value;

    setRole(randomRole);
    setMode(randomMode);
    setDifficulty(randomDifficulty);
  };

  const resetForm = () => {
    setMode("technical");
    setRole("Senior Backend Engineer");
    setDifficulty("medium");
  };

  const submit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const response = await api.post("/sessions", { mode, role, difficulty });
      navigate(`/interview/${response.data.session._id}`);
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = estimateMinutes[difficulty];
  const questions = estimateQuestions[difficulty];

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Card className="space-y-6">
        <SectionHeading
          title="Quick start interview"
          subtitle="The setup should feel like choosing a mission, not filling a form."
          action={
            <Button variant="secondary" onClick={randomize}>
              Randomize
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          {rolePresets.map((presetRole) => (
            <button
              key={presetRole}
              type="button"
              onClick={() => applyPreset(presetRole)}
              className={`rounded-3xl border p-4 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/10 ${
                role === presetRole
                  ? "border-cyan-300/30 bg-cyan-400/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-white">{presetRole}</p>
                <Badge tone="muted">Role</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                One tap to center the practice session on this target.
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-200">
                Role selector
              </span>
              <Badge tone="muted">Fast start</Badge>
            </div>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Senior Backend Engineer"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-200">
                Interview mode
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                AI guided
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {modePresets.map((preset) => (
                <Chip
                  key={preset.value}
                  type="button"
                  active={mode === preset.value}
                  onClick={() => setMode(preset.value)}
                >
                  {preset.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-200">
                Difficulty
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Adaptive
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {difficultyPresets.map((preset) => (
                <Chip
                  key={preset.value}
                  type="button"
                  active={difficulty === preset.value}
                  onClick={() => setDifficulty(preset.value)}
                >
                  {preset.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="submit"
              disabled={submitting}
              className="py-4 text-base"
            >
              {submitting ? "Starting..." : "Start Mock Interview"}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm}>
              Reset configuration
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
            >
              Back to dashboard
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-4">
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_34%)]" />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Live preview</Badge>
                <Badge tone="muted">AI feedback included</Badge>
                <Badge tone="success">Adaptive difficulty</Badge>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Interview preview
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white">
                  {startLabel}.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {recommendations[mode]}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Est. time"
                  value={`${minutes} mins`}
                  detail="Session pacing"
                />
                <StatCard
                  label="Questions"
                  value={questions}
                  detail="AI-generated prompts"
                />
                <StatCard
                  label="Mode"
                  value={mode.toUpperCase()}
                  detail="Interview style"
                />
              </div>

              <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/35 p-4">
                <ProgressBar
                  label="Difficulty"
                  value={
                    difficulty === "easy"
                      ? 34
                      : difficulty === "medium"
                        ? 62
                        : 84
                  }
                  tone={
                    difficulty === "hard"
                      ? "purple"
                      : difficulty === "medium"
                        ? "cyan"
                        : "emerald"
                  }
                  detail={difficulty}
                />
                <ProgressBar
                  label="Coach confidence"
                  value={mode === "mixed" ? 76 : mode === "technical" ? 82 : 71}
                  tone="cyan"
                  detail="Personalized feedback enabled"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
          <Card>
            <SectionHeading
              title="Why this feels fast"
              subtitle="The app is optimized for practice momentum, not configuration overhead."
            />
            <div className="space-y-3 text-sm leading-6 text-slate-300">
              <p>
                The selected role, mode, and difficulty are summarized in the
                preview so the interview starts with one clear decision.
              </p>
              <p>
                Adaptive difficulty, AI-generated questions, and feedback loops
                stay visible throughout the session so users understand what the
                coach is doing.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

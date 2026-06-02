import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  AchievementBadge,
  Badge,
  Button,
  Card,
  ProgressBar,
  SectionHeading,
  StatCard,
} from "../components/ui";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const average = (values) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
const dayKey = (value) => value.toISOString().slice(0, 10);

const countEntries = (entries) => {
  const counts = new Map();
  entries.forEach((entry) => {
    const key = String(entry).trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
};

const calculateStreak = (sessions) => {
  const activeDays = new Set(
    sessions.map((session) => dayKey(new Date(session.createdAt))),
  );

  const cursor = new Date();
  let streak = 0;

  while (activeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export default function Profile() {
  const [queryError, setQueryError] = useState("");
  const navigate = useNavigate();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions", "history"],
    queryFn: async () => {
      const response = await api.get("/sessions/history");
      return response.data.sessions || [];
    },
    onError: (requestError) => {
      setQueryError(
        requestError.response?.data?.message || "Failed to load sessions.",
      );
    },
    onSuccess: () => setQueryError(""),
  });

  const profile = useMemo(() => {
    const orderedSessions = [...sessions].sort(
      (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
    );
    const completedSessions = orderedSessions.filter(
      (session) => session.status === "completed",
    );
    const activeSessions = orderedSessions.filter(
      (session) => session.status === "active",
    );
    const averageScore = average(
      completedSessions.map((session) => Number(session.overallScore) || 0),
    );
    const streak = calculateStreak(orderedSessions);
    const xp =
      completedSessions.length * 140 +
      Math.round(averageScore * 24) +
      streak * 45 +
      orderedSessions.length * 18;
    const level = Math.floor(xp / 600) + 1;
    const levelProgress = ((xp % 600) / 600) * 100;
    const strongCounts = countEntries(
      completedSessions.flatMap((session) => session.strongAreas || []),
    );
    const weakCounts = countEntries(
      completedSessions.flatMap((session) => session.weakAreas || []),
    );
    const readiness = clamp(
      Math.round(averageScore * 7.5 + streak * 4 + orderedSessions.length * 2),
      0,
      100,
    );

    const badges = [
      {
        title: "Consistency",
        detail: `${streak} day streak`,
        tone: streak >= 3 ? "success" : "default",
      },
      {
        title: "Coach trust",
        detail: `${readiness}/100 readiness`,
        tone: readiness >= 75 ? "purple" : "default",
      },
      {
        title: "Practice volume",
        detail: `${orderedSessions.length} total sessions`,
        tone: orderedSessions.length >= 5 ? "warning" : "default",
      },
    ];

    return {
      orderedSessions,
      completedSessions,
      activeSessions,
      averageScore,
      streak,
      xp,
      level,
      levelProgress,
      strongCounts,
      weakCounts,
      readiness,
      badges,
    };
  }, [sessions]);

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Card>
        <SectionHeading
          title="Profile"
          subtitle="Your practice identity, progression signals, and coaching momentum."
          action={
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Level"
            value={`Lv ${profile.level}`}
            detail={`${profile.xp} XP earned`}
          />
          <StatCard
            label="Readiness"
            value={`${profile.readiness}/100`}
            detail="Coach estimate"
          />
          <StatCard
            label="Streak"
            value={`${profile.streak} days`}
            detail="Daily practice"
          />
          <StatCard
            label="Sessions"
            value={profile.orderedSessions.length}
            detail="Total runs"
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <SectionHeading
            title="Achievement lane"
            subtitle="These badges make the habit loop visible and motivating."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {profile.badges.map((badge) => (
              <AchievementBadge
                key={badge.title}
                title={badge.title}
                detail={badge.detail}
                tone={badge.tone}
              />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            <ProgressBar
              label="Level progression"
              value={profile.levelProgress}
              tone="cyan"
              detail={`${profile.levelProgress.toFixed(0)}% to the next level`}
            />
            <ProgressBar
              label="AI readiness"
              value={profile.readiness}
              tone={profile.readiness >= 75 ? "emerald" : "purple"}
              detail="Probability of a strong next interview"
            />
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Coaching snapshot"
            subtitle="The highest leverage strengths and gaps the coach can use next."
          />
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Current state
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {profile.activeSessions.length > 0
                  ? "You have an active interview in progress, so the coach should keep the next session quick and focused."
                  : "You are in a steady practice state. Start a new interview to keep the feedback loop warm."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Strongest skill"
                value={profile.strongCounts[0]?.[0] || "Foundations"}
                detail="What the coach should keep reinforcing"
              />
              <StatCard
                label="Weakest skill"
                value={profile.weakCounts[0]?.[0] || "System Design"}
                detail="Best next practice target"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.strongCounts.slice(0, 3).map(([label]) => (
                <Badge key={label} tone="success">
                  Strong: {label}
                </Badge>
              ))}
              {profile.weakCounts.slice(0, 3).map(([label]) => (
                <Badge key={label} tone="warning">
                  Gap: {label}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeading
          title="Next actions"
          subtitle="Keep the loop tight: practice, review, and keep moving."
        />
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/interview/setup")}>
            Start interview
          </Button>
          <Button variant="secondary" onClick={() => navigate("/analytics")}>
            Analytics
          </Button>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="text-sm text-slate-300">Updating profile...</div>
      ) : null}
      {queryError ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {queryError}
        </div>
      ) : null}
    </motion.div>
  );
}

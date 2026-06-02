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
  RadarChart,
  SectionHeading,
  StatCard,
  TrendSparkline,
} from "../components/ui";

const quickStarts = [
  {
    label: "Senior backend",
    mode: "technical",
    role: "Senior Backend Engineer",
    difficulty: "hard",
    tone: "default",
  },
  {
    label: "Product leadership",
    mode: "hr",
    role: "Product Manager",
    difficulty: "medium",
    tone: "warning",
  },
  {
    label: "Full stack sprint",
    mode: "mixed",
    role: "Full Stack Engineer",
    difficulty: "medium",
    tone: "success",
  },
];

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatDay = (value) =>
  new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(value);

const dayKey = (value) => value.toISOString().slice(0, 10);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const average = (values) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;

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

const countEntries = (entries) => {
  const counts = new Map();

  entries.forEach((entry) => {
    const key = String(entry).trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
};

const recentWindow = (days = 7) => {
  const dates = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - index);
    dates.push(date);
  }

  return dates;
};

export default function Dashboard() {
  const [sessionsError, setSessionsError] = useState("");
  const [creating, setCreating] = useState("");
  const [updating, setUpdating] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const navigate = useNavigate();

  const {
    data: sessions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["sessions", "history"],
    queryFn: async () => {
      const response = await api.get("/sessions/history");
      return response.data.sessions || [];
    },
    onError: (requestError) => {
      setSessionsError(
        requestError.response?.data?.message || "Failed to load sessions.",
      );
    },
    onSuccess: () => setSessionsError(""),
  });

  const analytics = useMemo(() => {
    const orderedSessions = [...sessions].sort(
      (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
    );
    const activeSessions = orderedSessions.filter(
      (session) => session.status === "active",
    );
    const completedSessions = orderedSessions.filter(
      (session) => session.status === "completed",
    );
    const latestSession = orderedSessions[0];
    const recentCompleted = completedSessions[0] || null;
    const streakDays = calculateStreak(orderedSessions);
    const averageCompletedScore = average(
      completedSessions.map((session) => Number(session.overallScore) || 0),
    );
    const weeklySeries = recentWindow(7).map((date) => {
      const key = dayKey(date);
      const matchingSessions = orderedSessions.filter(
        (session) => dayKey(new Date(session.createdAt)) === key,
      );
      const matchingCompleted = matchingSessions.filter(
        (session) => session.status === "completed",
      );

      return {
        label: formatDay(date),
        sessions: matchingSessions.length,
        completed: matchingCompleted.length,
        averageScore:
          matchingCompleted.length > 0
            ? average(
                matchingCompleted.map(
                  (session) => Number(session.overallScore) || 0,
                ),
              )
            : 0,
      };
    });

    const weeklySessions = weeklySeries.reduce(
      (sum, day) => sum + day.sessions,
      0,
    );
    const weeklyGoalProgress = clamp(
      Math.round((weeklySessions / 5) * 100),
      0,
      100,
    );

    const readinessScore = clamp(
      Math.round(
        averageCompletedScore * 7.5 +
          weeklySessions * 4 +
          streakDays * 4 +
          activeSessions.length * 5 +
          completedSessions.length * 2,
      ),
      0,
      100,
    );

    const xp =
      completedSessions.length * 140 +
      Math.round(averageCompletedScore * 24) +
      streakDays * 45 +
      weeklySessions * 18;
    const level = Math.floor(xp / 600) + 1;
    const levelProgress = ((xp % 600) / 600) * 100;
    const questionsSolved = completedSessions.length * 10;

    const strongCounts = countEntries(
      completedSessions.flatMap((session) => session.strongAreas || []),
    );
    const weakCounts = countEntries(
      completedSessions.flatMap((session) => session.weakAreas || []),
    );

    const strongestSkills = strongCounts.slice(0, 4).map(([label, count]) => ({
      label,
      value: clamp(
        Math.round(68 + count * 8 + averageCompletedScore * 1.5),
        20,
        96,
      ),
      count,
    }));

    const weakestSkills = weakCounts.slice(0, 4).map(([label, count]) => ({
      label,
      value: clamp(Math.round(72 - count * 10 + averageCompletedScore), 18, 88),
      count,
    }));

    const skillScore = (keywords, fallback) => {
      const lowerKeywords = keywords.map((item) => item.toLowerCase());
      let score = fallback;

      strongCounts.forEach(([label, count]) => {
        const normalized = label.toLowerCase();
        if (lowerKeywords.some((keyword) => normalized.includes(keyword))) {
          score += count * 7;
        }
      });

      weakCounts.forEach(([label, count]) => {
        const normalized = label.toLowerCase();
        if (lowerKeywords.some((keyword) => normalized.includes(keyword))) {
          score -= count * 8;
        }
      });

      return clamp(Math.round(score + averageCompletedScore * 2), 22, 96);
    };

    const radarAxes = [
      {
        label: "System Design",
        value: skillScore(["system", "architecture", "design"], 60),
      },
      {
        label: "Databases",
        value: skillScore(["database", "sql", "storage"], 58),
      },
      {
        label: "Communication",
        value: skillScore(["communication", "behavioral", "story"], 64),
      },
      {
        label: "Problem Solving",
        value: skillScore(["problem", "algorithms", "logic"], 62),
      },
      {
        label: "Adaptability",
        value: skillScore(["adapt", "mixed", "trade-off"], 59),
      },
    ];

    const achievements = [
      {
        title: "Streak keeper",
        detail: `${streakDays} day practice streak`,
        tone: streakDays >= 3 ? "success" : "default",
      },
      {
        title: "Readiness lift",
        detail: `${readinessScore}/100 coach readiness`,
        tone: readinessScore >= 75 ? "purple" : "default",
      },
      {
        title: "Session finisher",
        detail: `${completedSessions.length} interviews completed`,
        tone: completedSessions.length >= 3 ? "warning" : "default",
      },
    ];

    const weeklyAverageScores = weeklySeries.map((day) =>
      day.averageScore > 0 ? day.averageScore : averageCompletedScore,
    );

    return {
      activeSessions,
      completedSessions,
      latestSession,
      recentCompleted,
      streakDays,
      averageCompletedScore,
      weeklySeries,
      weeklyGoalProgress,
      readinessScore,
      xp,
      level,
      levelProgress,
      questionsSolved,
      strongestSkills,
      weakestSkills,
      radarAxes,
      achievements,
      weeklyAverageScores,
    };
  }, [sessions]);

  const startSession = async ({ mode, role, difficulty }) => {
    setCreating(`${mode}-${role}-${difficulty}`);

    try {
      const response = await api.post("/sessions", { mode, role, difficulty });
      navigate(`/interview/${response.data.session._id}`);
    } catch (requestError) {
      setSessionsError(
        requestError.response?.data?.message || "Failed to start a session.",
      );
    } finally {
      setCreating("");
    }
  };

  const copySessionId = async (sessionId) => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopiedId(sessionId);
      window.setTimeout(() => setCopiedId(""), 1200);
    } catch {
      setSessionsError("Copy failed. Your browser may block clipboard access.");
    }
  };

  const endSession = async (sessionId) => {
    setUpdating(sessionId);

    try {
      await api.patch(`/sessions/${sessionId}/end`);
      navigate(`/report/${sessionId}`);
      await refetch();
    } catch (requestError) {
      setSessionsError(
        requestError.response?.data?.message || "Failed to finish the session.",
      );
      await refetch();
    } finally {
      setUpdating("");
    }
  };

  const continueAction = (session) =>
    session?.status === "completed"
      ? `/report/${session._id}`
      : `/interview/${session?._id}`;

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <motion.section whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_36%)]" />
          <div className="relative grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>AI coach active</Badge>
                <Badge tone="muted">Adaptive difficulty</Badge>
                <Badge tone="success">
                  {analytics.completedSessions.length} sessions finished
                </Badge>
              </div>

              <div className="space-y-3">
                <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Welcome back. Your next interview is one tap away.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  The coach is tracking readiness, streaks, and skill gaps in
                  real time so you can practice with momentum instead of setup
                  friction.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate("/interview/setup")}>
                  Start interview
                </Button>
                <Button variant="secondary" onClick={() => refetch()}>
                  {isLoading ? "Refreshing..." : "Refresh intelligence"}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {analytics.achievements.map((achievement) => (
                  <AchievementBadge
                    key={achievement.title}
                    title={achievement.title}
                    detail={achievement.detail}
                    tone={achievement.tone}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <StatCard
                label="Readiness score"
                value={`${analytics.readinessScore}/100`}
                detail={`AI estimate from ${analytics.completedSessions.length} completed interviews`}
              />
              <StatCard
                label="Current streak"
                value={`${analytics.streakDays} days`}
                detail={`${analytics.weeklySeries.reduce((sum, day) => sum + day.sessions, 0)} sessions this week`}
              />
              <StatCard
                label="Weekly goal"
                value={`${analytics.weeklyGoalProgress}%`}
                detail={`Goal progress ${analytics.weeklySeries.reduce((sum, day) => sum + day.sessions, 0)}/5`}
              />
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      XP / level
                    </p>
                    <div className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                      Lv {analytics.level}
                    </div>
                  </div>
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100">
                    {analytics.xp} XP
                  </div>
                </div>
                <div className="mt-4">
                  <ProgressBar
                    label="Progress to next level"
                    value={analytics.levelProgress}
                    detail={`${analytics.levelProgress.toFixed(0)}%`}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
            <Card className="relative overflow-hidden">
              <SectionHeading
                title="Continue last interview"
                subtitle="Resume where you left off or review the most recent completed run."
              />

              {analytics.latestSession ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={
                        analytics.latestSession.status === "completed"
                          ? "success"
                          : "default"
                      }
                    >
                      {analytics.latestSession.status}
                    </Badge>
                    <Badge tone="muted">{analytics.latestSession.mode}</Badge>
                    <Badge tone="muted">
                      {analytics.latestSession.difficulty}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-white">
                      {analytics.latestSession.role}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Created {formatDate(analytics.latestSession.createdAt)}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard
                      label="Score"
                      value={analytics.latestSession.overallScore.toFixed(1)}
                      detail="Last recorded performance"
                    />
                    <StatCard
                      label="Coach note"
                      value={
                        analytics.latestSession.status === "completed"
                          ? "Review"
                          : "Resume"
                      }
                      detail="AI keeps the context intact"
                    />
                    <StatCard
                      label="Session ID"
                      value={analytics.latestSession._id.slice(-6)}
                      detail="Copy or share as needed"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        navigate(continueAction(analytics.latestSession))
                      }
                    >
                      {analytics.latestSession.status === "completed"
                        ? "Review report"
                        : "Resume interview"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => copySessionId(analytics.latestSession._id)}
                    >
                      {copiedId === analytics.latestSession._id
                        ? "Copied"
                        : "Copy session ID"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  Start your first mock interview to build a coaching history.
                </p>
              )}
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
            <Card>
              <SectionHeading
                title="Analytics"
                subtitle="Weekly progress, readiness, and the sessions that are building your momentum."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/analytics")}
                  >
                    Open analytics
                  </Button>
                }
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Questions solved"
                  value={analytics.questionsSolved}
                  detail="Estimated from completed interviews"
                />
                <StatCard
                  label="Average score"
                  value={analytics.averageCompletedScore.toFixed(1)}
                  detail="Coach readiness signal"
                />
                <StatCard
                  label="Completed"
                  value={analytics.completedSessions.length}
                  detail="Finished practice sessions"
                />
              </div>

              <div className="mt-5 grid grid-cols-7 gap-2">
                {analytics.weeklySeries.map((day) => {
                  const height = clamp(day.sessions * 26 + 18, 18, 100);
                  const tone =
                    day.averageScore >= 8
                      ? "bg-linear-to-t from-emerald-400 to-emerald-500"
                      : day.averageScore >= 6
                        ? "bg-linear-to-t from-cyan-400 to-sky-400"
                        : "bg-linear-to-t from-amber-400 to-orange-400";

                  return (
                    <div
                      key={day.label}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="flex h-28 w-full items-end rounded-2xl border border-white/8 bg-white/5 p-1">
                        <motion.div
                          className={`w-full rounded-xl ${tone}`}
                          initial={{ height: 16 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.28 }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-slate-200">
                          {day.label}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {day.sessions}x
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {analytics.achievements.map((achievement) => (
                  <Badge key={achievement.title} tone="muted">
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
            <Card>
              <SectionHeading
                title="Interview history"
                subtitle="Resume an active session, open a completed report, or copy a session ID."
                action={
                  <Button variant="secondary" onClick={() => refetch()}>
                    Reload history
                  </Button>
                }
              />

              {isLoading ? (
                <p className="text-sm text-slate-300">Loading sessions...</p>
              ) : sessions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-300">
                  No sessions yet. Launch your first mock interview above.
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 6).map((session) => {
                    const isActive = session.status === "active";
                    return (
                      <div
                        key={session._id}
                        className="rounded-3xl border border-white/10 bg-slate-950/35 p-4 transition hover:border-cyan-300/30 hover:bg-slate-950/55"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone={isActive ? "default" : "success"}>
                                {session.status}
                              </Badge>
                              <Badge tone="muted">{session.mode}</Badge>
                              <Badge tone="muted">{session.difficulty}</Badge>
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-white">
                              {session.role}
                            </h3>
                            <p className="mt-1 text-sm text-slate-300">
                              Created {formatDate(session.createdAt)}
                            </p>
                          </div>
                          <p className="text-3xl font-semibold text-cyan-200">
                            {typeof session.overallScore === "number"
                              ? session.overallScore.toFixed(1)
                              : "0.0"}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            onClick={() =>
                              navigate(
                                isActive
                                  ? `/interview/${session._id}`
                                  : `/report/${session._id}`,
                              )
                            }
                          >
                            {isActive ? "Resume" : "Open report"}
                          </Button>
                          {isActive ? (
                            <Button
                              variant="secondary"
                              onClick={() => endSession(session._id)}
                              disabled={updating === session._id}
                            >
                              {updating === session._id
                                ? "Ending..."
                                : "End now"}
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            onClick={() => copySessionId(session._id)}
                          >
                            {copiedId === session._id ? "Copied ID" : "Copy ID"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
            <Card>
              <SectionHeading
                title="Quick start interview"
                subtitle="The fastest path into practice. Choose a preset and start immediately."
              />

              <div className="grid gap-3">
                {quickStarts.map((preset) => {
                  const key = `${preset.mode}-${preset.role}-${preset.difficulty}`;
                  const isBusy = creating === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => startSession(preset)}
                      disabled={isBusy}
                      className="group rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">
                          {preset.label}
                        </p>
                        <Badge tone={preset.tone}>Start</Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        {preset.role} · {preset.difficulty} · {preset.mode}
                      </p>
                      <div className="mt-4 text-sm font-semibold text-cyan-200 transition group-hover:text-cyan-100">
                        {isBusy ? "Creating..." : "Launch interview"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
            <Card>
              <SectionHeading
                title="Recommended practice"
                subtitle="The coach highlights the skill gap that will move your readiness fastest."
              />

              <div className="space-y-4">
                <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                    AI recommendation
                  </p>
                  <p className="mt-3 text-xl font-semibold text-white">
                    {analytics.weakestSkills[0]?.label || "System Design"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Adaptive difficulty is set to help you close this gap with a
                    focused practice run.
                  </p>
                </div>

                <div className="grid gap-3">
                  {(analytics.weakestSkills.length
                    ? analytics.weakestSkills
                    : analytics.strongestSkills
                  ).map((skill) => (
                    <ProgressBar
                      key={skill.label}
                      label={skill.label}
                      value={skill.value}
                      tone={
                        skill.value >= 75
                          ? "emerald"
                          : skill.value >= 60
                            ? "cyan"
                            : "amber"
                      }
                      detail={`${skill.count} recent mentions`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate("/interview/setup")}>
                    Start recommended interview
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/analytics")}
                  >
                    Review analytics
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
            <Card>
              <SectionHeading
                title="Continue the loop"
                subtitle="AI coaching works best when the next step is obvious."
              />
              <div className="space-y-3 text-sm leading-6 text-slate-300">
                <p>
                  Start a new mock interview in under three seconds, then let
                  the coach adapt the next question based on your answer
                  quality.
                </p>
                <p>
                  The dashboard keeps momentum visible with readiness, XP,
                  streaks, and skill bars so practice feels like progress, not
                  admin.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
          <Card>
            <SectionHeading
              title="Skill radar"
              subtitle="A coaching view of where your interview confidence is strongest and where the gaps remain."
            />

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <RadarChart axes={analytics.radarAxes} />
              <div className="space-y-3">
                {analytics.radarAxes.map((axis) => (
                  <ProgressBar
                    key={axis.label}
                    label={axis.label}
                    value={axis.value}
                    tone={
                      axis.value >= 75
                        ? "emerald"
                        : axis.value >= 60
                          ? "cyan"
                          : "amber"
                    }
                    detail="Skill radar score"
                  />
                ))}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-2">
                    {analytics.strongestSkills.slice(0, 3).map((skill) => (
                      <Badge key={skill.label} tone="success">
                        Strong: {skill.label}
                      </Badge>
                    ))}
                    {analytics.weakestSkills.slice(0, 3).map((skill) => (
                      <Badge key={skill.label} tone="warning">
                        Gap: {skill.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.18 }}>
          <Card>
            <SectionHeading
              title="Performance trends"
              subtitle="The coach translates score momentum into a weekly trendline."
            />

            <TrendSparkline points={analytics.weeklyAverageScores} />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatCard
                label="Best session"
                value={
                  analytics.recentCompleted?.overallScore?.toFixed?.(1) ?? "0.0"
                }
                detail={
                  analytics.recentCompleted
                    ? analytics.recentCompleted.role
                    : "Finish a session to unlock this insight"
                }
              />
              <StatCard
                label="Growth signal"
                value={analytics.weeklySeries.reduce(
                  (sum, day) => sum + day.completed,
                  0,
                )}
                detail="Completed sessions in the last 7 days"
              />
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-950/35 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                AI feedback loop
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Adaptive difficulty is working. Keep the weekly cadence high,
                and the coach will keep tightening the question quality around
                your weaker skills.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {sessionsError ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {sessionsError}
        </div>
      ) : null}
    </motion.div>
  );
}

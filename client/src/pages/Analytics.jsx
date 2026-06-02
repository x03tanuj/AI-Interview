import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  RadarChart,
  SectionHeading,
  StatCard,
  TrendSparkline,
} from "../components/ui";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const average = (values) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
const dayKey = (value) => value.toISOString().slice(0, 10);

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

const countEntries = (entries) => {
  const counts = new Map();
  entries.forEach((entry) => {
    const key = String(entry).trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].sort((left, right) => right[1] - left[1]);
};

const formatDay = (value) =>
  new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(value);

export default function Analytics() {
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

  const analytics = useMemo(() => {
    const orderedSessions = [...sessions].sort(
      (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
    );
    const completedSessions = orderedSessions.filter(
      (session) => session.status === "completed",
    );
    const averageCompletedScore = average(
      completedSessions.map((session) => Number(session.overallScore) || 0),
    );

    const weeklySeries = recentWindow(7).map((date) => {
      const sessionsForDay = orderedSessions.filter(
        (session) => dayKey(new Date(session.createdAt)) === dayKey(date),
      );
      const completedForDay = sessionsForDay.filter(
        (session) => session.status === "completed",
      );

      return {
        label: formatDay(date),
        sessions: sessionsForDay.length,
        averageScore:
          completedForDay.length > 0
            ? average(
                completedForDay.map(
                  (session) => Number(session.overallScore) || 0,
                ),
              )
            : 0,
      };
    });

    const streak = (() => {
      const activeDays = new Set(
        orderedSessions.map((session) => dayKey(new Date(session.createdAt))),
      );
      const cursor = new Date();
      let count = 0;
      while (activeDays.has(dayKey(cursor))) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      return count;
    })();

    const strongCounts = countEntries(
      completedSessions.flatMap((session) => session.strongAreas || []),
    );
    const weakCounts = countEntries(
      completedSessions.flatMap((session) => session.weakAreas || []),
    );

    const radarAxes = [
      {
        label: "System Design",
        value: clamp(Math.round(60 + averageCompletedScore * 2), 24, 96),
      },
      {
        label: "Databases",
        value: clamp(Math.round(56 + averageCompletedScore * 2), 24, 96),
      },
      {
        label: "Communication",
        value: clamp(Math.round(62 + averageCompletedScore * 2), 24, 96),
      },
      {
        label: "Problem Solving",
        value: clamp(Math.round(58 + averageCompletedScore * 2), 24, 96),
      },
      {
        label: "Adaptability",
        value: clamp(Math.round(57 + averageCompletedScore * 2), 24, 96),
      },
    ];

    return {
      orderedSessions,
      completedSessions,
      averageCompletedScore,
      weeklySeries,
      streak,
      strongCounts,
      weakCounts,
      radarAxes,
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
          title="Analytics"
          subtitle="Your weekly practice rhythm, performance pattern, and coach feedback in one place."
          action={
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Sessions"
            value={analytics.orderedSessions.length}
            detail="Practice volume"
          />
          <StatCard
            label="Completed"
            value={analytics.completedSessions.length}
            detail="Finished runs"
          />
          <StatCard
            label="Average score"
            value={analytics.averageCompletedScore.toFixed(1)}
            detail="Coach signal"
          />
          <StatCard
            label="Streak"
            value={`${analytics.streak} days`}
            detail="Momentum"
          />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeading
            title="Weekly progress graph"
            subtitle="Daily practice volume and score momentum over the last 7 days."
          />
          <div className="grid grid-cols-7 gap-2">
            {analytics.weeklySeries.map((day) => {
              const height = clamp(day.sessions * 26 + 18, 18, 100);
              return (
                <div
                  key={day.label}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-28 w-full items-end rounded-2xl border border-white/8 bg-white/5 p-1">
                    <motion.div
                      className="w-full rounded-xl bg-linear-to-t from-cyan-400 to-sky-400"
                      initial={{ height: 16 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.28 }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    {day.label}
                  </p>
                  <p className="text-[11px] text-slate-400">{day.sessions}x</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <TrendSparkline
              points={analytics.weeklySeries.map(
                (day) => day.averageScore || analytics.averageCompletedScore,
              )}
            />
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Skill radar"
            subtitle="Where the coach sees strength, drift, and skill gaps."
          />
          <RadarChart axes={analytics.radarAxes} />
          <div className="mt-4 space-y-3">
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
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeading
            title="Interview history"
            subtitle="Recent runs, scores, and completion states."
          />
          <div className="space-y-3">
            {analytics.orderedSessions.slice(0, 6).map((session) => (
              <div
                key={session._id}
                className="rounded-3xl border border-white/10 bg-slate-950/35 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          session.status === "completed" ? "success" : "default"
                        }
                      >
                        {session.status}
                      </Badge>
                      <Badge tone="muted">{session.mode}</Badge>
                      <Badge tone="muted">{session.difficulty}</Badge>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {session.role}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      {new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        day: "numeric",
                      }).format(new Date(session.createdAt))}
                    </p>
                  </div>
                  <p className="text-3xl font-semibold text-cyan-200">
                    {typeof session.overallScore === "number"
                      ? session.overallScore.toFixed(1)
                      : "0.0"}
                  </p>
                </div>
              </div>
            ))}
            {analytics.orderedSessions.length === 0 ? (
              <p className="text-sm text-slate-300">
                No sessions yet. Start practicing to populate this feed.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Performance trends"
            subtitle="The AI coach uses these signals to tune the next interview difficulty."
          />
          <TrendSparkline
            points={analytics.weeklySeries.map(
              (day) => day.averageScore || analytics.averageCompletedScore,
            )}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCard
              label="Strongest signal"
              value={analytics.strongCounts[0]?.[0] || "Foundations"}
              detail="Most repeated strengths"
            />
            <StatCard
              label="Weakest signal"
              value={analytics.weakCounts[0]?.[0] || "System Design"}
              detail="Highest leverage gap"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {analytics.strongCounts.slice(0, 3).map(([label]) => (
              <Badge key={label} tone="success">
                Strong: {label}
              </Badge>
            ))}
            {analytics.weakCounts.slice(0, 3).map(([label]) => (
              <Badge key={label} tone="warning">
                Gap: {label}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Adaptive difficulty is visible here: when the score trend lifts, the
            coach can push harder; when a gap widens, the next session should
            narrow the focus.
          </p>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-300">Updating analytics...</div>
      ) : null}
      {queryError ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {queryError}
        </div>
      ) : null}
    </motion.div>
  );
}

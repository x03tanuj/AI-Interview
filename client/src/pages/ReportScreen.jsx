import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import {
  Badge,
  Button,
  Card,
  SectionHeading,
  StatCard,
} from "../components/ui";

export default function ReportScreen() {
  const { sessionId } = useParams();
  const [copyState, setCopyState] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    data: report,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["report", sessionId],
    queryFn: async () => {
      const response = await api.get(`/summary/${sessionId}`);
      return response.data;
    },
    onError: (requestError) => {
      setError(
        requestError.response?.data?.message || "Failed to load the report.",
      );
    },
    onSuccess: () => setError(""),
  });

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopyState("json");
      window.setTimeout(() => setCopyState(""), 1200);
    } catch {
      setError("Clipboard access is blocked in this browser.");
    }
  };

  const copySummary = async () => {
    if (!report) return;

    const summary = [
      `Session: ${report.session.role} (${report.session.mode}, ${report.session.difficulty})`,
      `Score: ${report.session.overallScore}`,
      `Completion rate: ${report.stats.completionRate}%`,
      `Strong areas: ${report.session.strongAreas.join(", ") || "none"}`,
      `Weak areas: ${report.session.weakAreas.join(", ") || "none"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopyState("summary");
      window.setTimeout(() => setCopyState(""), 1200);
    } catch {
      setError("Clipboard access is blocked in this browser.");
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `interview-report-${sessionId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading)
    return <div className="text-sm text-slate-300">Loading report...</div>;

  if (!report) {
    return (
      <Card>
        <SectionHeading
          title="Report"
          subtitle="Unable to load the current report."
        />
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => refetch()}>Retry</Button>
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>
            Back to dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <Card>
        <SectionHeading
          title="Interview report"
          subtitle="Review the scorecard, export the findings, or spin up a new practice run."
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => refetch()}>
                Refresh
              </Button>
              <Button variant="secondary" onClick={copySummary}>
                {copyState === "summary" ? "Summary copied" : "Copy summary"}
              </Button>
              <Button variant="secondary" onClick={copyReport}>
                {copyState === "json" ? "JSON copied" : "Copy JSON"}
              </Button>
              <Button variant="secondary" onClick={downloadReport}>
                Download JSON
              </Button>
              <Button onClick={() => navigate("/interview/setup")}>
                New interview
              </Button>
            </div>
          }
        />

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Overall score"
            value={report.session.overallScore.toFixed(1)}
            detail="Average score across answered questions."
          />
          <StatCard
            label="Completion"
            value={`${report.stats.completionRate}%`}
            detail={`${report.stats.answeredQuestions}/${report.stats.totalQuestions} questions answered.`}
          />
          <StatCard
            label="Questions"
            value={report.stats.totalQuestions}
            detail="The report includes every generated question."
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <SectionHeading
            title="Session summary"
            subtitle="Core metrics and focus areas."
          />
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{report.session.mode}</Badge>
              <Badge tone="muted">{report.session.difficulty}</Badge>
              <Badge
                tone={report.session.strongAreas.length ? "success" : "muted"}
              >
                {report.session.role}
              </Badge>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Strong areas
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {report.session.strongAreas.length ? (
                  report.session.strongAreas.map((area) => (
                    <Badge key={area} tone="success">
                      {area}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-300">
                    No strong areas recorded yet.
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Weak areas
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {report.session.weakAreas.length ? (
                  report.session.weakAreas.map((area) => (
                    <Badge key={area} tone="warning">
                      {area}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-300">
                    No weak areas recorded yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeading
            title="Question review"
            subtitle="Each generated question with its answer, score, and feedback."
          />
          <div className="space-y-4">
            {report.mergedQA.map((item) => (
              <div
                key={item.questionId}
                className="rounded-3xl border border-white/10 bg-slate-950/45 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="muted">Q{item.questionNumber}</Badge>
                    <Badge>{item.category}</Badge>
                    <Badge tone={item.isAnswered ? "success" : "warning"}>
                      {item.isAnswered ? "answered" : "pending"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-semibold text-cyan-200">
                    {item.answer?.score ?? "-"}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-white">
                  {item.questionText}
                </p>

                {item.answer ? (
                  <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-200">
                      {item.answer.answerText}
                    </p>
                    <p className="text-sm text-slate-300">
                      {item.answer.feedback}
                    </p>
                    <p className="text-sm text-slate-400">
                      Ideal: {item.answer.idealAnswer}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            item.questionText,
                          );
                        }}
                      >
                        Copy question
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            item.answer.answerText,
                          );
                        }}
                      >
                        Copy answer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-300">
                    This question has not been answered yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

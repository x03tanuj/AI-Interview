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
  Textarea,
} from "../components/ui";

const sampleAnswer =
  "I would start by clarifying the problem, outline a structured approach, explain trade-offs, and validate the solution with an example or metric before moving forward.";

export default function InterviewScreen() {
  const { sessionId } = useParams();
  const [answerText, setAnswerText] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [copyState, setCopyState] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { data: session, isLoading: loadingSession } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const response = await api.get(`/sessions/${sessionId}`);
      return response.data.session;
    },
    onError: (requestError) => {
      setError(
        requestError.response?.data?.message ||
          "Unable to load session details.",
      );
    },
  });

  const {
    data: question,
    isLoading: loadingQuestion,
    refetch: generateQuestion,
  } = useQuery({
    queryKey: ["question", sessionId],
    queryFn: async () => {
      const response = await api.post("/questions/generate", { sessionId });
      return response.data.question;
    },
    onSuccess: () => {
      setEvaluation(null);
      setAnswerText("");
      setError("");
    },
    onError: (requestError) => {
      setError(
        requestError.response?.data?.message ||
          "Failed to generate a question.",
      );
    },
  });

  const submit = async () => {
    if (!question) return;

    setSubmitting(true);

    try {
      const response = await api.post("/questions/evaluate", {
        questionId: question._id,
        answerText,
      });
      setEvaluation(response.data.evaluation || response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to evaluate answer.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => generateQuestion();

  const fillSampleAnswer = () => {
    setAnswerText(sampleAnswer);
  };

  const clearAnswer = () => {
    setAnswerText("");
    setEvaluation(null);
  };

  const copyQuestion = async () => {
    if (!question?.questionText) return;

    try {
      await navigator.clipboard.writeText(question.questionText);
      setCopyState("question");
      window.setTimeout(() => setCopyState(""), 1200);
    } catch {
      setError("Clipboard access is blocked in this browser.");
    }
  };

  const copyFeedback = async () => {
    if (!evaluation) return;

    const payload = [
      `Score: ${evaluation.score}`,
      `Feedback: ${evaluation.feedback}`,
      `Ideal answer: ${evaluation.idealAnswer}`,
    ].join("\n\n");

    try {
      await navigator.clipboard.writeText(payload);
      setCopyState("feedback");
      window.setTimeout(() => setCopyState(""), 1200);
    } catch {
      setError("Clipboard access is blocked in this browser.");
    }
  };

  const endSession = async () => {
    setEnding(true);

    try {
      await api.patch(`/sessions/${sessionId}/end`);
      navigate(`/report/${sessionId}`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Failed to end the session.",
      );
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <Card>
          <SectionHeading
            title="Live interview"
            subtitle="Use the action bar to copy the prompt, submit an answer, move to the next question, or end the session."
            action={
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={copyQuestion}
                  disabled={!question}
                >
                  {copyState === "question"
                    ? "Question copied"
                    : "Copy question"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={fillSampleAnswer}
                  disabled={!question}
                >
                  Sample answer
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
              label="Session status"
              value={loadingSession ? "loading" : session?.status || "loading"}
              detail={
                loadingSession
                  ? "Fetching session info"
                  : session
                    ? `${session.mode} · ${session.difficulty}`
                    : "Fetching session info"
              }
            />
            <StatCard
              label="Role"
              value={session?.role || "..."}
              detail="The prompt is tailored to this role."
            />
            <StatCard
              label="Question"
              value={question?.questionNumber || 0}
              detail="Move to the next one when you are ready."
            />
          </div>
        </Card>

        <Card>
          <SectionHeading
            title={loadingQuestion ? "Loading question..." : "Current question"}
            subtitle="Read the prompt carefully, then write your answer in the editor below."
          />

          {question ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="muted">{session?.mode || "mode"}</Badge>
                <Badge tone="muted">
                  {session?.difficulty || "difficulty"}
                </Badge>
                <Badge>{question.category}</Badge>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-5 text-lg leading-8 text-white">
                {question.questionText}
              </div>

              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write a structured response, mention trade-offs, and stay concise where possible."
                rows={9}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={submit}
                  disabled={submitting || !answerText.trim()}
                >
                  {submitting ? "Submitting..." : "Submit answer"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={next}
                  disabled={loadingQuestion}
                >
                  {loadingQuestion ? "Generating..." : "Next question"}
                </Button>
                <Button variant="secondary" onClick={clearAnswer}>
                  Clear answer
                </Button>
                <Button variant="ghost" onClick={endSession} disabled={ending}>
                  {ending ? "Ending..." : "End session"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 p-8 text-sm text-slate-300">
              {loadingQuestion
                ? "Loading the first question..."
                : "No question is available yet."}
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <SectionHeading
            title="Answer tools"
            subtitle="Fast actions to support the live response flow."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <button
              type="button"
              onClick={fillSampleAnswer}
              className="rounded-3xl border border-white/10 bg-white/6 p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              <p className="font-semibold text-white">Insert sample answer</p>
              <p className="mt-2 text-sm text-slate-300">
                Use a structured starter response as a placeholder or draft.
              </p>
            </button>
            <button
              type="button"
              onClick={clearAnswer}
              className="rounded-3xl border border-white/10 bg-white/6 p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              <p className="font-semibold text-white">Clear draft</p>
              <p className="mt-2 text-sm text-slate-300">
                Reset the editor and start again from a clean slate.
              </p>
            </button>
            <button
              type="button"
              onClick={copyQuestion}
              className="rounded-3xl border border-white/10 bg-white/6 p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              <p className="font-semibold text-white">Copy prompt</p>
              <p className="mt-2 text-sm text-slate-300">
                Save the current question to your clipboard for note taking.
              </p>
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-3xl border border-white/10 bg-white/6 p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              <p className="font-semibold text-white">Back to dashboard</p>
              <p className="mt-2 text-sm text-slate-300">
                Jump out of the live room whenever you need to regroup.
              </p>
            </button>
          </div>
        </Card>

        {evaluation ? (
          <Card>
            <SectionHeading
              title="Evaluation"
              subtitle="Review the score, feedback, and ideal answer after submitting."
              action={
                <Button variant="secondary" onClick={copyFeedback}>
                  {copyState === "feedback"
                    ? "Feedback copied"
                    : "Copy feedback"}
                </Button>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Score"
                value={evaluation.score}
                detail="The answer evaluation score."
              />
              <StatCard
                label="Feedback"
                value="Ready"
                detail="Open the detailed notes below."
              />
            </div>

            <div className="mt-4 space-y-4 rounded-3xl border border-white/10 bg-slate-950/45 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Feedback
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {evaluation.feedback}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Ideal answer
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {evaluation.idealAnswer}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <SectionHeading
              title="Evaluation"
              subtitle="Results will appear here after you submit an answer."
            />
            <p className="text-sm text-slate-300">
              Use the submit button to get a score, feedback, and an ideal
              answer.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

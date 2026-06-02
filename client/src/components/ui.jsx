const buttonVariants = {
  primary:
    "bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 shadow-[0_18px_40px_-20px_rgba(34,211,238,0.9)] hover:from-cyan-300 hover:to-sky-300",
  secondary:
    "border border-white/15 bg-white/6 text-slate-100 hover:border-cyan-300/40 hover:bg-white/10",
  ghost:
    "border border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/6 hover:text-white",
  danger:
    "bg-rose-500 text-white shadow-[0_18px_40px_-20px_rgba(244,63,94,0.8)] hover:bg-rose-400",
};

export const appShellClass =
  "min-h-screen bg-[#07111f] text-slate-100 relative overflow-hidden selection:bg-cyan-300/30 selection:text-white";

export const pageBackdropClass =
  "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.24),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.16),_transparent_22%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_24%),linear-gradient(180deg,_rgba(7,17,31,1)_0%,_rgba(8,15,26,1)_44%,_rgba(4,8,15,1)_100%)]";

export function PageFrame({ title, eyebrow, description, actions, children }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 pb-24 sm:px-6 sm:pb-8 lg:px-8 lg:pb-8">
      <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-4 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
            MockInterview
          </p>
          <h1 className="mt-1 text-lg font-semibold text-white sm:text-xl">
            {title}
          </h1>
          <p className="text-sm leading-6 text-slate-300">
            {eyebrow ? (
              <span className="mr-2 text-cyan-200">{eyebrow}</span>
            ) : null}
            {description}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {actions}
        </div>
      </div>

      <main className="relative flex-1 py-5 sm:py-6">{children}</main>
    </div>
  );
}

export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.88)] backdrop-blur-2xl sm:p-5 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-slate-300">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      {...props}
      className={`inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto ${buttonVariants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20 ${className}`}
    />
  );
}

export function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20 ${className}`}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-3xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/20 ${className}`}
    />
  );
}

export function Pill({ active = false, children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-cyan-400 text-slate-950"
          : "border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? "bg-emerald-400/15 text-emerald-200 border-emerald-300/20"
      : tone === "warning"
        ? "bg-amber-400/15 text-amber-200 border-amber-300/20"
        : tone === "muted"
          ? "bg-white/6 text-slate-300 border-white/10"
          : "bg-cyan-400/15 text-cyan-200 border-cyan-300/20";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function Chip({ active = false, children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-cyan-400 text-slate-950 shadow-[0_12px_30px_-16px_rgba(34,211,238,0.8)]"
          : "border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/40 hover:bg-white/10 hover:text-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value = 0, tone = "cyan", label, detail }) {
  const toneStyles = {
    cyan: "from-cyan-400 to-sky-400",
    purple: "from-fuchsia-500 to-violet-500",
    emerald: "from-emerald-400 to-emerald-500",
    amber: "from-amber-400 to-orange-400",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-sm text-slate-300">{detail ?? `${value}%`}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div
          className={`h-full rounded-full bg-linear-to-r ${toneStyles[tone]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function TrendSparkline({ points = [], stroke = "#22d3ee" }) {
  const width = 260;
  const height = 96;

  if (!points.length) {
    return <div className="text-sm text-slate-400">No trend data yet.</div>;
  }

  const safeValues = points.map((value) => Number(value) || 0);
  const maxValue = Math.max(...safeValues, 1);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const coordinates = safeValues
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / maxValue) * (height - 12) - 6;
      return `${x},${y}`;
    })
    .join(" ");

  const pointsData = safeValues.map((value, index) => {
    const x = index * step;
    const y = height - (value / maxValue) * (height - 12) - 6;
    return { x, y };
  });

  const linePath = pointsData
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full">
      <defs>
        <linearGradient id="sparklineFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.45" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coordinates}
      />
      <path d={areaPath} fill="url(#sparklineFill)" />
    </svg>
  );
}

export function RadarChart({ axes = [] }) {
  const size = 220;
  const center = size / 2;
  const radius = 78;

  if (!axes.length) return null;

  const angleStep = (Math.PI * 2) / axes.length;

  const points = axes
    .map((axis, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const valueRadius =
        (radius * Math.max(0, Math.min(100, axis.value))) / 100;
      const x = center + Math.cos(angle) * valueRadius;
      const y = center + Math.sin(angle) * valueRadius;
      return `${x},${y}`;
    })
    .join(" ");

  const rings = [25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-56 w-full">
      {rings.map((ring) => (
        <circle
          key={ring}
          cx={center}
          cy={center}
          r={(radius * ring) / 100}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}
      {axes.map((axis, index) => {
        const angle = -Math.PI / 2 + index * angleStep;
        const axisX = center + Math.cos(angle) * radius;
        const axisY = center + Math.sin(angle) * radius;
        const labelX = center + Math.cos(angle) * (radius + 22);
        const labelY = center + Math.sin(angle) * (radius + 22);

        return (
          <g key={axis.label}>
            <line
              x1={center}
              y1={center}
              x2={axisX}
              y2={axisY}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            <text
              x={labelX}
              y={labelY}
              fill="rgba(226,232,240,0.9)"
              fontSize="10"
              textAnchor={
                labelX > center + 4
                  ? "start"
                  : labelX < center - 4
                    ? "end"
                    : "middle"
              }
              dominantBaseline="middle"
            >
              {axis.label}
            </text>
          </g>
        );
      })}
      <polygon
        points={points}
        fill="rgba(34,211,238,0.22)"
        stroke="rgba(34,211,238,0.95)"
        strokeWidth="2"
      />
      {axes.map((axis, index) => {
        const angle = -Math.PI / 2 + index * angleStep;
        const valueRadius =
          (radius * Math.max(0, Math.min(100, axis.value))) / 100;
        const x = center + Math.cos(angle) * valueRadius;
        const y = center + Math.sin(angle) * valueRadius;

        return <circle key={axis.label} cx={x} cy={y} r="3.5" fill="#67e8f9" />;
      })}
    </svg>
  );
}

export function AchievementBadge({ title, detail, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
      : tone === "warning"
        ? "border-amber-300/20 bg-amber-400/10 text-amber-100"
        : tone === "purple"
          ? "border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-100"
          : "border-white/10 bg-white/5 text-slate-100";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
      <p className="text-sm font-semibold">{title}</p>
      {detail ? (
        <p className="mt-1 text-xs leading-5 opacity-80">{detail}</p>
      ) : null}
    </div>
  );
}

export function MobileBottomNav({ items, currentPath, onNavigate }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#07111f]/85 px-3 py-3 backdrop-blur-2xl lg:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-2">
        {items.map((item) => {
          const active = currentPath === item.path;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={`rounded-2xl px-2 py-2 text-xs font-semibold transition-all ${
                active
                  ? "bg-cyan-400 text-slate-950 shadow-[0_18px_35px_-20px_rgba(34,211,238,0.75)]"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function StatCard({ label, value, detail }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.9)]">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <div className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
        {value}
      </div>
      {detail ? <p className="mt-2 text-sm text-slate-300">{detail}</p> : null}
    </div>
  );
}

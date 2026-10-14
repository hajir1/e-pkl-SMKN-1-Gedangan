const tones = {
    blue: "bg-blue-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
};

export default function ProgressBar({ value = 0, max = 100, tone = "blue", label, className = "" }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className={className}>
            <div
                className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label}
            >
                <div
                    className={`h-full rounded-full transition-all ${tones[tone]}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

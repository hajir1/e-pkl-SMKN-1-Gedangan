import { Link } from "@inertiajs/react";

const tones = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    sky: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    slate: "bg-slate-100 text-slate-600",
};

/** Kartu angka ringkas untuk dashboard. */
export default function StatCard({
    label,
    value,
    icon,
    tone = "blue",
    hint,
    href,
    className = "",
}) {
    const Tag = href ? Link : "div";
    return (
        <Tag
            href={href}
            className={`group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition ${
                href ? "hover:border-blue-300 hover:shadow" : ""
            } ${className}`}
        >
            {icon && (
                <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5 ${tones[tone]}`}
                >
                    {icon}
                </span>
            )}
            <div className="min-w-0">
                <p className="text-sm leading-snug text-slate-500">{label}</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
                    {value ?? 0}
                </p>
                {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
            </div>
        </Tag>
    );
}

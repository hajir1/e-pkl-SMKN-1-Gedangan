import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const tones = {
    info: { cls: "border-blue-200 bg-blue-50 text-blue-900", icon: <Info /> },
    success: { cls: "border-emerald-200 bg-emerald-50 text-emerald-900", icon: <CheckCircle2 /> },
    warning: { cls: "border-amber-200 bg-amber-50 text-amber-900", icon: <AlertTriangle /> },
    danger: { cls: "border-rose-200 bg-rose-50 text-rose-900", icon: <XCircle /> },
};

/** Kotak informasi/peringatan di dalam halaman. */
export default function Callout({ tone = "info", title, children, action, className = "" }) {
    const t = tones[tone];
    return (
        <div
            role={tone === "danger" ? "alert" : "status"}
            className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${t.cls} ${className}`}
        >
            <span className="mt-0.5 shrink-0 [&_svg]:h-[18px] [&_svg]:w-[18px]">{t.icon}</span>
            <div className="min-w-0 flex-1">
                {title && <p className="font-semibold">{title}</p>}
                {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
            </div>
            {action && <div className="shrink-0 self-center">{action}</div>}
        </div>
    );
}

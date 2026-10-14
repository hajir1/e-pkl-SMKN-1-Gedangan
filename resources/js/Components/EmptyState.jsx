import { Inbox } from "lucide-react";

export default function EmptyState({
    icon,
    title = "Belum ada data",
    description,
    action,
    className = "",
}) {
    return (
        <div
            className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}
        >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 [&_svg]:h-6 [&_svg]:w-6">
                {icon ?? <Inbox />}
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {title}
            </h3>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                    {description}
                </p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

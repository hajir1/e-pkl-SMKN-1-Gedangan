export default function Card({ className = "", children, ...props }) {
    return (
        <div
            {...props}
            className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, description, action, icon, className = "" }) {
    return (
        <div
            className={`flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 ${className}`}
        >
            <div className="flex min-w-0 items-start gap-3">
                {icon && (
                    <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 [&_svg]:h-[18px] [&_svg]:w-[18px]">
                        {icon}
                    </span>
                )}
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-slate-900">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-0.5 text-sm text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}

export function CardBody({ className = "", children }) {
    return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

import { forwardRef } from "react";

const Select = forwardRef(function Select(
    { className = "", invalid, children, ...props },
    ref
) {
    return (
        <select
            {...props}
            ref={ref}
            aria-invalid={invalid ? true : undefined}
            className={`block w-full rounded-lg border bg-white px-3 py-2.5 pr-9 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${
                invalid
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-500/30"
            } ${className}`}
        >
            {children}
        </select>
    );
});

export default Select;

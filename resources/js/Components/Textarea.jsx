import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
    { className = "", placeholder, rows = 3, invalid, ...props },
    ref
) {
    return (
        <textarea
            {...props}
            ref={ref}
            rows={rows}
            aria-invalid={invalid ? true : undefined}
            className={`block w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                invalid
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30"
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-500/30"
            } ${className}`}
            placeholder={placeholder ?? ""}
        ></textarea>
    );
});

export default Textarea;

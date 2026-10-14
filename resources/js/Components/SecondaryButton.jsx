import { forwardRef } from "react";

export default forwardRef(function SecondaryButton(
    { type = "button", className = "", disabled, children, ...props },
    ref
) {
    return (
        <button
            {...props}
            ref={ref}
            type={type}
            className={
                "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 " +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
});

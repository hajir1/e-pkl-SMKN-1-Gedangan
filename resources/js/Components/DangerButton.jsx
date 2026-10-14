import { forwardRef } from "react";

export default forwardRef(function DangerButton(
    { className = "", disabled, children, type = "button", ...props },
    ref
) {
    return (
        <button
            {...props}
            ref={ref}
            type={type}
            className={
                "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 active:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 " +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
});

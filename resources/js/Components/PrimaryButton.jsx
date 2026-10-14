import { forwardRef } from "react";

const tones = {
    blue: "bg-blue-700 hover:bg-blue-800 active:bg-blue-900 focus-visible:ring-blue-500",
    emerald:
        "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus-visible:ring-emerald-500",
};

export default forwardRef(function PrimaryButton(
    { className = "", disabled, children, type = "submit", tone = "blue", ...props },
    ref
) {
    return (
        <button
            {...props}
            ref={ref}
            type={type}
            className={`inline-flex items-center justify-center gap-2 rounded-lg border border-transparent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 ${tones[tone]} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
});

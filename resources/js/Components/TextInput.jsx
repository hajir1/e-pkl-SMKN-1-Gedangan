import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export default forwardRef(function TextInput(
    { type = "text", className = "", isFocused = false, invalid, ...props },
    ref
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const isFile = type === "file";

    return (
        <input
            {...props}
            type={type}
            aria-invalid={invalid ? true : undefined}
            className={
                (isFile
                    ? "block w-full cursor-pointer rounded-lg border bg-white text-sm text-slate-700 file:mr-3 file:cursor-pointer file:border-0 file:border-r file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-100 focus:outline-none focus:ring-2 "
                    : "rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 read-only:bg-slate-50 ") +
                (invalid
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/30 "
                    : "border-slate-300 focus:border-blue-600 focus:ring-blue-500/30 ") +
                className
            }
            ref={localRef}
        />
    );
});

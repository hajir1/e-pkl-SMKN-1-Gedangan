export default function InputLabel({
    value,
    className = "",
    required = false,
    hint,
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={`mb-1.5 block text-sm font-medium text-slate-700 ${className}`}
        >
            {value ? value : children}
            {required && (
                <span className="ms-0.5 text-rose-600" aria-hidden="true">
                    *
                </span>
            )}
            {hint && (
                <span className="ms-1.5 font-normal text-slate-500">
                    {hint}
                </span>
            )}
        </label>
    );
}

import InputError from "./InputError";
import InputLabel from "./InputLabel";

/** Label + kontrol + pesan error + teks bantuan dalam satu blok. */
export default function FormField({
    label,
    htmlFor,
    error,
    help,
    required,
    hint,
    className = "",
    children,
}) {
    return (
        <div className={className}>
            {label && (
                <InputLabel
                    htmlFor={htmlFor}
                    value={label}
                    required={required}
                    hint={hint}
                />
            )}
            {children}
            {help && !error && (
                <p className="mt-1.5 text-xs text-slate-500">{help}</p>
            )}
            <InputError message={error} />
        </div>
    );
}

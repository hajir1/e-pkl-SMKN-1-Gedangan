import { Link } from "@inertiajs/react";

const variants = {
    default: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
    primary: "text-blue-700 hover:bg-blue-50 hover:text-blue-800",
    success: "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800",
    danger: "text-rose-600 hover:bg-rose-50 hover:text-rose-700",
    warning: "text-amber-700 hover:bg-amber-50 hover:text-amber-800",
};

/**
 * Tombol ikon untuk aksi di tabel. `label` wajib: dipakai sebagai
 * aria-label & tooltip, karena tombol hanya berisi ikon.
 */
export default function IconButton({
    label,
    variant = "default",
    href,
    external = false,
    className = "",
    children,
    ...props
}) {
    const classes = `inline-flex h-9 w-9 items-center justify-center rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:h-[18px] [&_svg]:w-[18px] ${variants[variant]} ${className}`;

    if (href && external) {
        return (
            <a
                href={href}
                aria-label={label}
                title={label}
                className={classes}
                {...props}
            >
                {children}
            </a>
        );
    }
    if (href) {
        return (
            <Link
                href={href}
                aria-label={label}
                title={label}
                className={classes}
                {...props}
            >
                {children}
            </Link>
        );
    }
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={classes}
            {...props}
        >
            {children}
        </button>
    );
}

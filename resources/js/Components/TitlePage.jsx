import { Plus } from "lucide-react";

/**
 * Header halaman: judul, deskripsi, dan tombol aksi.
 * Props lama (nameRoute, icon, onClick, disabled) tetap didukung untuk
 * tombol aksi utama; aksi tambahan bisa dikirim lewat children.
 */
const TitlePage = ({
    title,
    quote,
    nameRoute,
    icon,
    children,
    eyebrow,
    ...props
}) => {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                {eyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                        {eyebrow}
                    </p>
                )}
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    {title}
                </h1>
                {quote && (
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        {quote}
                    </p>
                )}
            </div>
            {(nameRoute || children) && (
                <div className="flex flex-wrap items-center gap-2">
                    {children}
                    {nameRoute && (
                        <button
                            type="button"
                            {...props}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:h-4 [&_svg]:w-4"
                        >
                            {icon ?? <Plus />}
                            <span>{nameRoute}</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TitlePage;

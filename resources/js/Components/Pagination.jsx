import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Label pagination Laravel bisa berisi entitas HTML (&laquo; dsb). */
const labelOf = (label, index, total) => {
    if (index === 0) return { icon: <ChevronLeft />, text: "Sebelumnya" };
    if (index === total - 1) return { icon: <ChevronRight />, text: "Berikutnya" };
    return { text: String(label).replace(/&[a-z]+;/g, "").trim() };
};

/**
 * `params`: query tambahan yang ikut dikirim (mis. user_id di dashboard),
 * karena URL paginasi dari server tidak selalu membawa query string.
 */
const Pagination = ({ datas, preserveScroll = true, params, only }) => {
    if (!datas || !datas.total) return null;
    const links = datas.links ?? [];

    return (
        <nav
            aria-label="Navigasi halaman"
            className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row"
        >
            <p className="text-sm text-slate-500">
                Menampilkan{" "}
                <span className="font-medium text-slate-900">
                    {datas.from ?? 0}
                </span>
                –
                <span className="font-medium text-slate-900">
                    {datas.to ?? 0}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-slate-900">{datas.total}</span>{" "}
                data
            </p>
            {links.length > 3 && (
                <ul className="flex flex-wrap items-center gap-1">
                    {links.map((link, index) => {
                        const { icon, text } = labelOf(
                            link.label,
                            index,
                            links.length
                        );
                        const base =
                            "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium transition [&_svg]:h-4 [&_svg]:w-4";
                        if (!link.url) {
                            return (
                                <li key={index}>
                                    <span
                                        aria-disabled="true"
                                        aria-label={icon ? text : undefined}
                                        className={`${base} cursor-not-allowed text-slate-300`}
                                    >
                                        {icon ?? text}
                                    </span>
                                </li>
                            );
                        }
                        return (
                            <li key={index}>
                                <Link
                                    href={link.url}
                                    data={params}
                                    only={only}
                                    preserveScroll={preserveScroll}
                                    preserveState
                                    aria-label={icon ? text : `Halaman ${text}`}
                                    aria-current={link.active ? "page" : undefined}
                                    className={`${base} ${
                                        link.active
                                            ? "bg-blue-700 text-white shadow-sm"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                >
                                    {icon ?? text}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </nav>
    );
};

export default Pagination;

import { useNavigationLoading } from "@/Helpers/hooks";
import Spinner from "./Spinner";

/**
 * Tabel data responsif. Pada layar kecil tabel bisa digulir horizontal,
 * header tetap terbaca, dan overlay loading tampil saat data dimuat ulang
 * (filter, pencarian, pagination).
 */
const Table = ({ headers, children, className = "", minWidth = "min-w-[640px]" }) => {
    const loading = useNavigationLoading();
    return (
        <div className={`relative ${className}`}>
            <div className="overflow-x-auto">
                <table
                    className={`w-full ${minWidth} text-left text-sm text-slate-700`}
                >
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <tr>
                            {headers.map((head, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className={`whitespace-nowrap px-4 py-3 ${
                                        head.className ?? ""
                                    }`}
                                >
                                    {head.nama}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {children}
                </table>
            </div>
            {loading && (
                <div
                    className="absolute inset-0 flex items-start justify-center bg-white/60 pt-16"
                    aria-live="polite"
                >
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 shadow ring-1 ring-slate-200">
                        <Spinner /> Memuat data...
                    </span>
                </div>
            )}
        </div>
    );
};

export default Table;

export const Tr = ({ className = "", children, ...props }) => (
    <tr
        {...props}
        className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70 ${className}`}
    >
        {children}
    </tr>
);

export const Td = ({ className = "", children, ...props }) => (
    <td {...props} className={`px-4 py-3 align-middle ${className}`}>
        {children}
    </td>
);

/** Baris kosong yang memenuhi lebar tabel. */
export const TableEmpty = ({ colSpan, children }) => (
    <tr>
        <td colSpan={colSpan}>{children}</td>
    </tr>
);

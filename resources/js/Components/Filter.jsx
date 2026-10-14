import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "@/Helpers/hooks";

/**
 * Toolbar pencarian + tombol filter.
 * - Pencarian di-debounce agar tidak mengirim request setiap ketikan.
 * - onChange tetap menerima event { target: { name: "search", value } }
 *   supaya kompatibel dengan handler lama di setiap halaman.
 */
const Filter = ({
    sortModal,
    setSortModal,
    isFilter = true,
    value = "",
    onChange,
    placeholder = "Cari data...",
    activeCount = 0,
    children,
}) => {
    const [term, setTerm] = useState(value ?? "");

    useEffect(() => {
        setTerm(value ?? "");
    }, [value]);

    const emit = useDebouncedCallback((v) => {
        onChange?.({
            preventDefault: () => {},
            target: { name: "search", value: v },
        });
    }, 400);

    return (
        <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
                <Search
                    className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                />
                <label htmlFor="search" className="sr-only">
                    Pencarian
                </label>
                <input
                    type="search"
                    id="search"
                    name="search"
                    value={term}
                    autoComplete="off"
                    onChange={(e) => {
                        setTerm(e.target.value);
                        emit(e.target.value);
                    }}
                    className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pe-9 ps-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 [&::-webkit-search-cancel-button]:hidden"
                    placeholder={placeholder}
                />
                {term !== "" && (
                    <button
                        type="button"
                        aria-label="Hapus pencarian"
                        onClick={() => {
                            setTerm("");
                            emit("");
                        }}
                        className="absolute end-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {children}
                {isFilter && (
                    <button
                        type="button"
                        onClick={() => setSortModal(!sortModal)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filter & Urutkan
                        {activeCount > 0 && (
                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 text-xs font-semibold text-white">
                                {activeCount}
                            </span>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Filter;

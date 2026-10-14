import { router } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * true selama ada kunjungan GET Inertia (filter, paginasi, pencarian).
 * Ditunda 150 ms agar navigasi cepat tidak memunculkan kedipan loading.
 */
export function useNavigationLoading(delay = 150) {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        let timer;
        const offStart = router.on("start", (event) => {
            if (event.detail.visit.method !== "get") return;
            clearTimeout(timer);
            timer = setTimeout(() => setLoading(true), delay);
        });
        const offFinish = router.on("finish", () => {
            clearTimeout(timer);
            setLoading(false);
        });
        return () => {
            clearTimeout(timer);
            offStart();
            offFinish();
        };
    }, [delay]);
    return loading;
}

/** Callback yang baru dijalankan setelah pemanggilan berhenti selama `wait` ms. */
export function useDebouncedCallback(callback, wait = 400) {
    const cbRef = useRef(callback);
    const timer = useRef();
    cbRef.current = callback;

    useEffect(() => () => clearTimeout(timer.current), []);

    const debounced = useCallback(
        (...args) => {
            clearTimeout(timer.current);
            timer.current = setTimeout(() => cbRef.current(...args), wait);
        },
        [wait]
    );
    debounced.cancel = () => clearTimeout(timer.current);
    return debounced;
}

/** Waktu sekarang yang diperbarui berkala (untuk hitung mundur). */
export function useNow(interval = 60_000) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), interval);
        return () => clearInterval(id);
    }, [interval]);
    return now;
}

/** Object URL untuk pratinjau file; otomatis di-revoke saat file berganti. */
export function useObjectUrl(file) {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!(file instanceof Blob)) {
            setUrl(null);
            return;
        }
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);
    return url;
}

/**
 * State pencarian/filter/urutan untuk halaman daftar. Setiap perubahan
 * langsung dikirim ke server (pencarian sudah di-debounce oleh <Filter/>),
 * parameter kosong dibuang dan sort_order hanya dikirim bila sort_by diisi.
 */
export function useListFilter(routeName, filters, keys) {
    const initial = Object.fromEntries(
        ["search", "sort_by", "sort_order", ...keys].map((k) => [k, filters?.[k] ?? ""])
    );
    const [dataSearch, setDataSearch] = useState(initial);

    const kirim = (update) => {
        const params = Object.fromEntries(
            Object.entries({
                ...update,
                sort_order: update.sort_by ? update.sort_order : "",
            }).filter(([, v]) => v !== "" && v !== null && v !== undefined)
        );
        router.get(route(routeName), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (e) => {
        e?.preventDefault?.();
        const { name, value } = e.target;
        const update = { ...dataSearch, [name]: value };
        setDataSearch(update);
        kirim(update);
    };

    const resetFilter = () => {
        const update = Object.fromEntries(Object.keys(initial).map((k) => [k, ""]));
        update.search = dataSearch.search;
        setDataSearch(update);
        kirim(update);
    };

    const activeCount = ["sort_by", ...keys].filter((k) => (filters?.[k] ?? "") !== "").length;

    return { dataSearch, handleSearchChange, resetFilter, activeCount };
}

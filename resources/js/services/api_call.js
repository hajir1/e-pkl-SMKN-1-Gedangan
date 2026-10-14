import { useQuery } from "@tanstack/react-query";

const BASE = "https://hajir1.github.io/api-wilayah-indonesia/api";

const getJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gagal memuat data wilayah (${res.status})`);
    return res.json();
};

export const useGetProvince = () =>
    useQuery({
        queryKey: ["province"],
        queryFn: () => getJson(`${BASE}/provinces.json`),
    });

// Sebelumnya URL kabupaten mengandung baris baru di akhir string
// ("...json\n"), dan query tetap berjalan walau provinsi kosong.
export const useGetRegencies = (id) =>
    useQuery({
        queryKey: ["regencies", id],
        queryFn: () => getJson(`${BASE}/regencies/${id}.json`),
        enabled: Boolean(id),
    });

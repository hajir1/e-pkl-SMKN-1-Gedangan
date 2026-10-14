// Helper format & URL yang dipakai lintas halaman.

const BULAN = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
];

const BULAN_PANJANG = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
];

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/**
 * Tanggal "YYYY-MM-DD" diparse sebagai tanggal lokal (bukan UTC), agar
 * tidak bergeser satu hari di zona waktu WIB.
 */
export const parseDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split("-").map(Number);
        return new Date(y, m - 1, d);
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatTanggal = (value, { panjang = false } = {}) => {
    const date = parseDate(value);
    if (!date) return "-";
    const bulan = panjang ? BULAN_PANJANG : BULAN;
    return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatTanggalWaktu = (value) => {
    const date = parseDate(value);
    if (!date) return "-";
    const jam = String(date.getHours()).padStart(2, "0");
    const menit = String(date.getMinutes()).padStart(2, "0");
    return `${formatTanggal(date)}, ${jam}.${menit}`;
};

export const formatHari = (value) => {
    const date = parseDate(value);
    return date ? HARI[date.getDay()] : "-";
};

/** "6 Okt - 12 Okt 2025" */
export const formatPeriode = (mulai, selesai) => {
    const a = parseDate(mulai);
    const b = parseDate(selesai);
    if (!a || !b) return "-";
    const kiri =
        a.getFullYear() === b.getFullYear()
            ? `${a.getDate()} ${BULAN[a.getMonth()]}`
            : formatTanggal(a);
    return `${kiri} - ${formatTanggal(b)}`;
};

/** Senin s/d Minggu dari tanggal tertentu (fallback bila backend tidak mengirim periode). */
export const periodeMingguDari = (value = new Date()) => {
    const date = parseDate(value) ?? new Date();
    const mulai = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const selisih = (mulai.getDay() + 6) % 7; // Senin = 0
    mulai.setDate(mulai.getDate() - selisih);
    const selesai = new Date(mulai);
    selesai.setDate(mulai.getDate() + 6);
    return { mulai, selesai };
};

/** Sisa waktu sampai akhir periode (Minggu 23.59). */
export const sisaWaktu = (selesai, now = new Date()) => {
    const akhir = parseDate(selesai);
    if (!akhir) return null;
    const batas = new Date(
        akhir.getFullYear(),
        akhir.getMonth(),
        akhir.getDate(),
        23,
        59,
        59
    );
    const ms = batas.getTime() - now.getTime();
    if (ms <= 0) return { habis: true, hari: 0, jam: 0, menit: 0 };
    const menitTotal = Math.floor(ms / 60000);
    return {
        habis: false,
        hari: Math.floor(menitTotal / 1440),
        jam: Math.floor((menitTotal % 1440) / 60),
        menit: menitTotal % 60,
    };
};

export const formatSisaWaktu = (sisa) => {
    if (!sisa) return "-";
    if (sisa.habis) return "Periode telah berakhir";
    if (sisa.hari > 0) return `${sisa.hari} hari ${sisa.jam} jam lagi`;
    if (sisa.jam > 0) return `${sisa.jam} jam ${sisa.menit} menit lagi`;
    return `${sisa.menit} menit lagi`;
};

/**
 * URL file publik di storage. Sebelumnya memakai "./storage/..." (relatif
 * terhadap URL halaman), sehingga gambar rusak bila halaman berada di path
 * bertingkat. Ziggy dipakai agar tetap benar bila aplikasi berada di subfolder.
 */
export const storageUrl = (path) => {
    if (!path) return null;
    if (/^(https?:)?\/\//.test(path) || path.startsWith("blob:")) return path;
    return `${baseUrl()}storage/${String(path).replace(/^\/+/, "")}`;
};

/** URL aset di folder public (logo, gambar latar). */
export const assetUrl = (path) =>
    `${baseUrl()}${String(path).replace(/^\.?\/+/, "")}`;

const baseUrl = () => {
    try {
        if (typeof route === "function") {
            const url = route("welcome", undefined, false);
            return url.endsWith("/") ? url : `${url}/`;
        }
    } catch (e) {
        // route("welcome") tidak tersedia, pakai root domain.
    }
    return "/";
};

/** Escape karakter khusus agar input pencarian aman dipakai di RegExp. */
export const escapeRegExp = (value) =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const roleLabel = (role) =>
    ({
        admin: "Administrator",
        pembimbing_sekolah: "Pembimbing Sekolah",
        pembimbing_pt: "Pembimbing DU/DI",
        siswa: "Siswa",
    })[role] ?? (role ? String(role).replace(/_/g, " ") : "-");

export const inisial = (nama = "") =>
    String(nama)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join("") || "?";

export const sapaanWaktu = (now = new Date()) => {
    const jam = now.getHours();
    if (jam < 11) return "Selamat pagi";
    if (jam < 15) return "Selamat siang";
    if (jam < 18) return "Selamat sore";
    return "Selamat malam";
};

/** Membuang parameter kosong sebelum dikirim ke router.get(). */
export const cleanParams = (params) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, v]) => v !== "" && v !== null && v !== undefined
        )
    );

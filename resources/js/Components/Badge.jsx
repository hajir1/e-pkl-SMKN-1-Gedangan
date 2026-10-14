import {
    CheckCircle2,
    Clock3,
    HeartPulse,
    MailQuestion,
    UserCheck,
    XCircle,
} from "lucide-react";

const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-500/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
    sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-800 ring-amber-600/25",
    rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
    violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export default function Badge({ tone = "slate", icon, className = "", children }) {
    return (
        <span
            className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset [&_svg]:h-3.5 [&_svg]:w-3.5 ${tones[tone]} ${className}`}
        >
            {icon}
            {children}
        </span>
    );
}

/** Status verifikasi absensi (pending / disetujui / ditolak). */
export const STATUS_VERIFIKASI = {
    pending: { label: "Menunggu", tone: "amber", icon: <Clock3 /> },
    disetujui: { label: "Disetujui", tone: "emerald", icon: <CheckCircle2 /> },
    ditolak: { label: "Ditolak", tone: "rose", icon: <XCircle /> },
};

export function StatusBadge({ status, mark }) {
    // Data lama mungkin belum punya status_verifikasi: pakai kolom mark.
    const key = status ?? (mark ? "disetujui" : "pending");
    const s = STATUS_VERIFIKASI[key] ?? STATUS_VERIFIKASI.pending;
    return (
        <Badge tone={s.tone} icon={s.icon}>
            {s.label}
        </Badge>
    );
}

/** Keterangan kehadiran (hadir / izin / sakit). */
export const KETERANGAN = {
    hadir: { label: "Hadir", tone: "emerald", icon: <UserCheck /> },
    izin: { label: "Izin", tone: "amber", icon: <MailQuestion /> },
    sakit: { label: "Sakit", tone: "sky", icon: <HeartPulse /> },
};

export function KeteranganBadge({ value }) {
    const k = KETERANGAN[value];
    if (!k) return <Badge>{value ?? "-"}</Badge>;
    return (
        <Badge tone={k.tone} icon={k.icon}>
            {k.label}
        </Badge>
    );
}

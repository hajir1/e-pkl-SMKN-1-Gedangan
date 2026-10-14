import { AlertConfirm } from "@/Helpers/Alert";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Building2,
    CalendarCheck2,
    CalendarRange,
    CircleHelp,
    ClipboardList,
    FileText,
    GraduationCap,
    IdCard,
    Images,
    LayoutDashboard,
    LogOut,
    MapPinned,
    Trash2,
    UserCog,
    UserRound,
    UsersRound,
} from "lucide-react";

const ALL = ["admin", "pembimbing_sekolah", "pembimbing_pt", "siswa"];

/**
 * Daftar menu per role. `match` adalah segmen URL pertama yang membuat menu
 * aktif (sebelumnya memakai window.location yang tidak selalu ikut
 * diperbarui dan membuat menu "Laporan"/"Pembimbing" tidak pernah aktif).
 */
const buildMenu = (role, counts) => [
    {
        title: "Utama",
        items: [
            {
                nama: "Dashboard",
                href: route("dashboard"),
                match: ["dashboard"],
                icon: <LayoutDashboard />,
                roles: ALL,
            },
            {
                nama: role === "siswa" ? "Absensi Mingguan" : "Absensi & Jurnal",
                href: route("jurnal.index"),
                match: ["jurnal"],
                icon: <CalendarCheck2 />,
                roles: ALL,
                badge: role !== "siswa" ? counts.absensiPendingCount : 0,
                badgeLabel: "absensi menunggu verifikasi",
            },
            {
                nama: "Sampah Absensi",
                href: route("trashJurnal.index"),
                match: ["trashJurnal"],
                icon: <Trash2 />,
                roles: ["siswa"],
                badge: counts.trashJurnalCount,
                badgeTone: "slate",
                badgeLabel: "absensi di sampah",
            },
        ],
    },
    {
        title: "Kegiatan PKL",
        items: [
            {
                nama: role === "siswa" ? "Data Saya" : role === "admin" ? "Siswa" : "Siswa Bimbingan",
                href: route("siswa.index"),
                match: ["siswa"],
                icon: role === "siswa" ? <UserRound /> : <UsersRound />,
                roles: ALL,
            },
            {
                nama: role === "siswa" ? "Judul Laporan" : "Laporan",
                href: role === "siswa" ? route("laporan.create") : route("laporan.index"),
                match: ["laporan"],
                icon: <FileText />,
                roles: ALL,
                badge: role === "admin" ? counts.lpCount : 0,
                badgeLabel: "judul menunggu keputusan",
            },
            {
                nama: role === "admin" ? "Pengajuan Tempat" : "Ajukan Tempat PKL",
                href:
                    role === "admin"
                        ? route("pengajuanTempat.index")
                        : route("pengajuanTempat.create"),
                match: ["pengajuanTempat"],
                icon: <MapPinned />,
                roles: ["siswa", "admin"],
                badge: role === "admin" ? counts.ptCount : 0,
                badgeLabel: "pengajuan baru",
            },
        ],
    },
    {
        title: "Master Data",
        items: [
            {
                nama: "Data Registrasi",
                href: route("data_siswa.index"),
                match: ["data_siswa"],
                icon: <IdCard />,
                roles: ["admin"],
            },
            {
                nama: "Pembimbing",
                href: route("pembimbing.index"),
                match: ["pembimbing"],
                icon: <UserCog />,
                roles: ["admin"],
            },
            {
                nama: "Tempat DU/DI",
                href: route("tempat.index"),
                match: ["tempat"],
                icon: <Building2 />,
                roles: ["admin"],
            },
            {
                nama: "Jurusan",
                href: route("jurusan.index"),
                match: ["jurusan"],
                icon: <GraduationCap />,
                roles: ["admin"],
            },
            {
                nama: "Tahun Ajaran",
                href: route("tahunAjaran.index"),
                match: ["tahunAjaran"],
                icon: <CalendarRange />,
                roles: ["admin"],
            },
            {
                nama: "Slider Beranda",
                href: route("gambar.index"),
                match: ["gambar"],
                icon: <Images />,
                roles: ["admin"],
            },
        ],
    },
    {
        title: "Akun",
        items: [
            {
                nama: "Profil Saya",
                href: route("profile.edit"),
                match: ["profile"],
                icon: <ClipboardList />,
                roles: ALL,
            },
            {
                nama: "Panduan",
                href: route("dokumentasi"),
                match: ["dokumentasi"],
                icon: <CircleHelp />,
                roles: ALL,
            },
        ],
    },
];

export const handleLogout = (e) => {
    e?.preventDefault();
    AlertConfirm(
        "Anda akan keluar dari aplikasi.",
        "question",
        () => {
            router.post(route("logout"));
        },
        "Ya, Keluar"
    );
};

const SideMenu = ({ onNavigate }) => {
    const page = usePage();
    const { auth, ptCount, lpCount, trashJurnalCount, absensiPendingCount } =
        page.props;
    const url = page.url;
    const role = auth?.role;
    const segment = String(url ?? "/")
        .split("?")[0]
        .split("/")
        .filter(Boolean)[0];

    const groups = buildMenu(role, {
        ptCount: ptCount ?? 0,
        lpCount: lpCount ?? 0,
        trashJurnalCount: trashJurnalCount ?? 0,
        absensiPendingCount: absensiPendingCount ?? 0,
    })
        .map((g) => ({
            ...g,
            items: g.items.filter((item) => item.roles.includes(role)),
        }))
        .filter((g) => g.items.length > 0);

    return (
        <nav aria-label="Menu utama" className="space-y-6">
            {groups.map((group) => (
                <div key={group.title}>
                    <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {group.title}
                    </p>
                    <ul className="mt-2 space-y-0.5">
                        {group.items.map((item) => {
                            const active = item.match.includes(segment);
                            return (
                                <li key={item.nama}>
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
                                        aria-current={active ? "page" : undefined}
                                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition [&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:shrink-0 ${
                                            active
                                                ? "bg-blue-50 text-blue-800"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                    >
                                        <span
                                            className={
                                                active
                                                    ? "text-blue-700"
                                                    : "text-slate-400 group-hover:text-slate-600"
                                            }
                                        >
                                            {item.icon}
                                        </span>
                                        <span className="flex-1 truncate">
                                            {item.nama}
                                        </span>
                                        {item.badge > 0 && (
                                            <span
                                                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                                                    item.badgeTone === "slate"
                                                        ? "bg-slate-200 text-slate-700"
                                                        : "bg-rose-600 text-white"
                                                }`}
                                            >
                                                {item.badge > 99 ? "99+" : item.badge}
                                                <span className="sr-only">
                                                    {" "}
                                                    {item.badgeLabel}
                                                </span>
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
            <div className="border-t border-slate-200 pt-4">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 [&_svg]:h-[18px] [&_svg]:w-[18px]"
                >
                    <LogOut className="text-slate-400" />
                    Keluar
                </button>
            </div>
        </nav>
    );
};

export default SideMenu;

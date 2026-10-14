import { KETERANGAN, KeteranganBadge, StatusBadge } from "@/Components/Badge";
import Callout from "@/Components/Callout";
import Card, { CardBody, CardHeader } from "@/Components/Card";
import EmptyState from "@/Components/EmptyState";
import ImageViewer from "@/Components/ImageViewer";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import ProgressBar from "@/Components/ProgressBar";
import StatCard from "@/Components/StatCard";
import Table, { TableEmpty, Td, Tr } from "@/Components/Table";
import TitleModal, { ModalBody } from "@/Components/TitleModal";
import {
    formatPeriode,
    formatSisaWaktu,
    formatTanggal,
    formatTanggalWaktu,
    periodeMingguDari,
    roleLabel,
    sapaanWaktu,
    sisaWaktu,
    storageUrl,
} from "@/Helpers/format";
import { useNow } from "@/Helpers/hooks";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    BookOpenText,
    Building2,
    CalendarCheck2,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    Eye,
    FileText,
    GraduationCap,
    HelpCircle,
    Images,
    LayoutDashboard,
    Layers,
    MapPinned,
    Send,
    UserCheck,
    UserCog,
    Users,
    XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/* Util                                                                       */
/* -------------------------------------------------------------------------- */

/** pluck() Laravel yang kosong dikirim sebagai [] — normalisasi ke objek. */
const asObject = (v) => (v && !Array.isArray(v) ? v : {});

const periodeJurnal = (j) =>
    j?.minggu_mulai
        ? formatPeriode(j.minggu_mulai, j.minggu_selesai)
        : formatTanggal(j?.created_at);

const queryParam = (url, key) => {
    try {
        return new URL(url, "http://x").searchParams.get(key);
    } catch {
        return null;
    }
};

function QuickAction({ href, icon, title, description }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 [&_svg]:h-[18px] [&_svg]:w-[18px]">
                {icon}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-slate-900">
                    {title}
                </span>
                {description && (
                    <span className="block truncate text-xs text-slate-500">
                        {description}
                    </span>
                )}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-700" />
        </Link>
    );
}

function InfoRow({ icon, label, children }) {
    return (
        <div className="flex items-start gap-3 py-2.5">
            <span className="mt-0.5 text-slate-400 [&_svg]:h-4 [&_svg]:w-4">
                {icon}
            </span>
            <div className="min-w-0">
                <p className="text-xs text-slate-500">{label}</p>
                <div className="text-sm font-medium text-slate-900">
                    {children || <span className="font-normal text-slate-400">Belum ada</span>}
                </div>
            </div>
        </div>
    );
}

function Welcome({ auth, periode, children }) {
    const now = useNow(60000);
    return (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 px-5 py-6 text-white shadow-sm sm:px-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-emerald-400/20" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                    <p className="text-sm text-blue-100">
                        {sapaanWaktu(now)}, {roleLabel(auth.role)}
                    </p>
                    <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight">
                        {auth.user?.name}
                    </h1>
                    <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-blue-50 ring-1 ring-inset ring-white/20">
                        <CalendarCheck2 className="h-4 w-4" />
                        Minggu ini: {formatPeriode(periode.mulai, periode.selesai)}
                    </p>
                </div>
                {children}
            </div>
        </section>
    );
}

/* -------------------------------------------------------------------------- */
/* Siswa                                                                      */
/* -------------------------------------------------------------------------- */

function AbsensiMingguIni({ periode, ringkasan }) {
    const now = useNow(60000);
    const sisa = sisaWaktu(periode.selesai, now);
    const tersedia = ringkasan && "mingguIni" in ringkasan;
    const absensi = ringkasan?.mingguIni;

    let body;
    if (!tersedia) {
        // Backend lama tidak mengirim status minggu ini: arahkan ke halaman absensi.
        body = (
            <p className="text-sm text-slate-600">
                Absensi dikirim satu kali setiap minggu, paling lambat Minggu{" "}
                {formatTanggal(periode.selesai, { panjang: true })} pukul 23.59.
                Cek status dan kirim absensi di halaman Absensi Mingguan.
            </p>
        );
    } else if (!absensi) {
        body = (
            <Callout tone="warning" title="Belum mengirim absensi minggu ini">
                Batas pengiriman Minggu, {formatTanggal(periode.selesai, { panjang: true })}{" "}
                pukul 23.59 ({formatSisaWaktu(sisa)}).
            </Callout>
        );
    } else if (absensi.deleted_at) {
        body = (
            <Callout tone="warning" title="Absensi minggu ini ada di Sampah">
                Pulihkan atau hapus permanen terlebih dahulu sebelum mengirim
                absensi baru.
            </Callout>
        );
    } else {
        const tone = {
            pending: "info",
            disetujui: "success",
            ditolak: "danger",
        }[absensi.status_verifikasi] ?? "info";
        const judul = {
            pending: "Terkirim, menunggu verifikasi pembimbing",
            disetujui: "Absensi minggu ini sudah disetujui",
            ditolak: "Absensi ditolak, silakan perbaiki",
        }[absensi.status_verifikasi];
        body = (
            <Callout tone={tone} title={judul}>
                <span className="flex flex-wrap items-center gap-2">
                    <KeteranganBadge value={absensi.keterangan} />
                    Dikirim {formatTanggalWaktu(absensi.created_at)}
                </span>
                {absensi.catatan_verifikasi && (
                    <span className="mt-1 block">
                        Catatan: {absensi.catatan_verifikasi}
                    </span>
                )}
            </Callout>
        );
    }

    const cta =
        tersedia && absensi?.deleted_at
            ? { href: route("trashJurnal.index"), label: "Buka Sampah" }
            : {
                  href: route("jurnal.index"),
                  label:
                      tersedia && !absensi
                          ? "Kirim Absensi"
                          : absensi?.status_verifikasi === "ditolak"
                            ? "Perbaiki Absensi"
                            : "Lihat Absensi",
              };

    return (
        <Card>
            <CardHeader
                icon={<CalendarCheck2 />}
                title="Absensi minggu ini"
                description={formatPeriode(periode.mulai, periode.selesai)}
                action={
                    <Link
                        href={cta.href}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        {cta.label === "Kirim Absensi" ? (
                            <Send className="h-4 w-4" />
                        ) : (
                            <ArrowRight className="h-4 w-4" />
                        )}
                        {cta.label}
                    </Link>
                }
            />
            <CardBody>{body}</CardBody>
        </Card>
    );
}

function RekapKehadiran({ rekap }) {
    const total = Object.values(rekap).reduce((a, b) => a + Number(b || 0), 0);
    return (
        <Card>
            <CardHeader
                icon={<UserCheck />}
                title="Rekap kehadiran"
                description={`${total} absensi tercatat`}
            />
            <CardBody className="space-y-4">
                {total === 0 ? (
                    <p className="text-sm text-slate-500">
                        Belum ada absensi yang dikirim.
                    </p>
                ) : (
                    Object.entries(KETERANGAN).map(([key, k]) => {
                        const n = Number(rekap[key] ?? 0);
                        return (
                            <div key={key}>
                                <div className="mb-1.5 flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-slate-700 [&_svg]:h-4 [&_svg]:w-4">
                                        {k.icon} {k.label}
                                    </span>
                                    <span className="tabular-nums text-slate-900">
                                        <span className="font-semibold">{n}</span>
                                        <span className="text-slate-400">
                                            {" "}
                                            ({Math.round((n / total) * 100)}%)
                                        </span>
                                    </span>
                                </div>
                                <ProgressBar
                                    value={n}
                                    max={total}
                                    tone={k.tone}
                                    label={`${k.label}: ${n} dari ${total}`}
                                />
                            </div>
                        );
                    })
                )}
            </CardBody>
        </Card>
    );
}

function DaftarAbsensi({ items, showNama = false, emptyText, verifikasi = false }) {
    if (!items?.length) {
        return (
            <EmptyState
                icon={<ClipboardCheck />}
                title={emptyText}
                className="py-8"
            />
        );
    }
    return (
        <ul className="divide-y divide-slate-100">
            {items.map((j) => (
                <li key={j.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                            {showNama ? j.user?.name : periodeJurnal(j)}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                            {showNama ? `${periodeJurnal(j)} · ` : ""}
                            {j.kegiatan}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                        {verifikasi ? (
                            <KeteranganBadge value={j.keterangan} />
                        ) : (
                            <StatusBadge status={j.status_verifikasi} mark={j.mark} />
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}

function VisibilitasToggle({ auth }) {
    const [aktif, setAktif] = useState(Boolean(Number(auth.user.isVisibilityJurnal)));
    const [proses, setProses] = useState(false);
    const [panduan, setPanduan] = useState(false);

    const ubah = () => {
        const next = !aktif;
        setAktif(next);
        setProses(true);
        router.put(
            route("dashboard.update", auth.user.id),
            { isVisibilityJurnal: next },
            {
                preserveScroll: true,
                onError: () => setAktif(!next),
                onFinish: () => setProses(false),
            }
        );
    };

    return (
        <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={() => setPanduan(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Apa itu berbagi jurnal?"
                title="Apa itu berbagi jurnal?"
            >
                <HelpCircle className="h-4 w-4" />
            </button>
            <button
                type="button"
                role="switch"
                aria-checked={aktif}
                aria-label="Bagikan jurnal ke teman sejurusan"
                disabled={proses}
                onClick={ubah}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 ${
                    aktif ? "bg-blue-700" : "bg-slate-300"
                }`}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                        aktif ? "translate-x-5" : "translate-x-0.5"
                    }`}
                />
            </button>
            <span className="text-sm font-medium text-slate-600">
                {aktif ? "Dibagikan" : "Tidak dibagikan"}
            </span>
            <Modal show={panduan} onClose={() => setPanduan(false)} maxWidth="md">
                <TitleModal title="Berbagi Jurnal" onClick={() => setPanduan(false)} />
                <ModalBody className="space-y-3 text-sm text-slate-700">
                    <p>
                        Jika diaktifkan, jurnal Anda dapat dilihat oleh siswa
                        lain di <b>jurusan yang sama</b> yang juga
                        mengaktifkan fitur ini. Sebaliknya, Anda dapat melihat
                        jurnal mereka.
                    </p>
                    <p>
                        Fitur ini bisa dipakai sebagai referensi mengisi
                        kegiatan tanpa melanggar privasi; file PDF absensi
                        tetap tidak dibagikan.
                    </p>
                </ModalBody>
            </Modal>
        </div>
    );
}

function JurnalTeman({ auth, userActives, jurnals, url }) {
    const aktif = Boolean(Number(auth.user.isVisibilityJurnal));
    const userId = queryParam(url, "user_id");
    const teman = (userActives ?? []).filter((u) => u.id !== auth.user.id);
    const dipilih = teman.find((u) => String(u.id) === String(userId));

    const kembali = () =>
        router.get(route("dashboard"), {}, { preserveScroll: true, preserveState: true, only: ["jurnals"] });

    return (
        <Card>
            <CardHeader
                icon={<Users />}
                title="Jurnal teman sejurusan"
                description="Bagikan jurnal Anda untuk saling melihat kegiatan sebagai referensi."
                action={<VisibilitasToggle auth={auth} />}
            />
            {!aktif ? (
                <CardBody>
                    <p className="text-sm text-slate-500">
                        Aktifkan berbagi jurnal untuk melihat jurnal teman
                        sejurusan yang juga membagikannya.
                    </p>
                </CardBody>
            ) : userId ? (
                <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                        <button
                            type="button"
                            onClick={kembali}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
                        </button>
                        <p className="text-sm text-slate-600">
                            Jurnal{" "}
                            <span className="font-semibold text-slate-900">
                                {dipilih?.name ?? jurnals?.data?.[0]?.user?.name ?? "siswa"}
                            </span>
                        </p>
                    </div>
                    <Table
                        headers={[
                            { nama: "Periode" },
                            { nama: "Keterangan" },
                            { nama: "Kegiatan" },
                            { nama: "Foto" },
                        ]}
                        minWidth="min-w-[560px]"
                    >
                        <tbody>
                            {jurnals?.data?.length ? (
                                jurnals.data.map((j) => (
                                    <Tr key={j.id}>
                                        <Td className="whitespace-nowrap">{periodeJurnal(j)}</Td>
                                        <Td>
                                            <KeteranganBadge value={j.keterangan} />
                                        </Td>
                                        <Td className="max-w-xs">{j.kegiatan}</Td>
                                        <Td>
                                            <ImageViewer
                                                src={storageUrl(j.photo)}
                                                alt={`Foto kegiatan ${j.user?.name ?? ""}`}
                                                className="h-10 w-10"
                                            />
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={4}>
                                    <EmptyState
                                        title="Tidak ada jurnal yang bisa ditampilkan"
                                        description="Siswa ini belum mengirim absensi, atau tidak lagi membagikan jurnalnya."
                                    />
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={jurnals} params={{ user_id: userId }} only={["jurnals"]} />
                </div>
            ) : teman.length === 0 ? (
                <EmptyState
                    icon={<Users />}
                    title="Belum ada teman yang membagikan jurnal"
                    description="Daftar akan muncul ketika siswa sejurusan mengaktifkan berbagi jurnal."
                    className="py-8"
                />
            ) : (
                <ul className="divide-y divide-slate-100">
                    {teman.map((u) => (
                        <li key={u.id} className="flex items-center justify-between gap-3 px-5 py-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">{u.name}</p>
                                <p className="truncate text-xs text-slate-500">
                                    {u.jurusan?.nama ?? "-"}
                                    {u.datasiswa?.nisn ? ` · NISN ${u.datasiswa.nisn}` : ""}
                                </p>
                            </div>
                            <Link
                                href={route("dashboard", { user_id: u.id })}
                                only={["jurnals"]}
                                preserveState
                                preserveScroll
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <Eye className="h-4 w-4" /> Lihat
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}

function DashboardSiswa({ props, periode, url }) {
    const { auth, rekapSiswa, ringkasan, userActives, jurnals, trashJurnalCount } = props;
    const rekap = asObject(rekapSiswa);
    const info = ringkasan?.infoPkl;
    const status = ringkasan?.statusCounts;

    return (
        <div className="space-y-6">
            <AbsensiMingguIni periode={periode} ringkasan={ringkasan} />

            {status && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard label="Total absensi" value={status.total} icon={<ClipboardCheck />} href={route("jurnal.index")} />
                    <StatCard label="Menunggu verifikasi" value={status.pending} icon={<Clock3 />} tone="amber" href={route("jurnal.index", { status: "pending" })} />
                    <StatCard label="Disetujui" value={status.disetujui} icon={<CheckCircle2 />} tone="emerald" href={route("jurnal.index", { status: "disetujui" })} />
                    <StatCard label="Ditolak" value={status.ditolak} icon={<XCircle />} tone="rose" href={route("jurnal.index", { status: "ditolak" })} />
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
                <div className="space-y-6 lg:col-span-2">
                    {ringkasan?.terbaru && (
                        <Card>
                            <CardHeader
                                icon={<FileText />}
                                title="Absensi terakhir"
                                action={
                                    <Link href={route("jurnal.index")} className="text-sm font-medium text-blue-700 hover:underline">
                                        Lihat semua
                                    </Link>
                                }
                            />
                            <DaftarAbsensi items={ringkasan.terbaru} emptyText="Belum ada absensi yang dikirim" />
                        </Card>
                    )}
                    <JurnalTeman auth={auth} userActives={userActives} jurnals={jurnals} url={url} />
                </div>

                <div className="space-y-6">
                    <RekapKehadiran rekap={rekap} />
                    {info && (
                        <Card>
                            <CardHeader icon={<Building2 />} title="Informasi PKL" />
                            <CardBody className="divide-y divide-slate-100 py-1">
                                <InfoRow icon={<Building2 />} label="Tempat PKL">
                                    {info.tempat?.nama}
                                </InfoRow>
                                <InfoRow icon={<MapPinned />} label="Lokasi">
                                    {info.tempat?.lokasi}
                                </InfoRow>
                                <InfoRow icon={<UserCog />} label="Pembimbing DU/DI">
                                    {info.pembimbingPt?.name}
                                </InfoRow>
                                <InfoRow icon={<GraduationCap />} label="Pembimbing sekolah">
                                    {info.pembimbingSekolah?.name}
                                </InfoRow>
                                <InfoRow icon={<BookOpenText />} label="Judul laporan">
                                    {ringkasan.laporan && (
                                        <span>
                                            {ringkasan.laporan.judul}{" "}
                                            <span className="text-xs font-normal text-slate-500">
                                                ({{ pending: "menunggu", terima: "diterima", tolak: "ditolak" }[ringkasan.laporan.status] ?? ringkasan.laporan.status})
                                            </span>
                                        </span>
                                    )}
                                </InfoRow>
                            </CardBody>
                            {!info.tempat && (
                                <CardBody className="pt-0">
                                    <Callout tone="info">
                                        Belum terdaftar di tempat PKL.{" "}
                                        <Link href={route("pengajuanTempat.index")} className="font-medium underline">
                                            Ajukan tempat PKL
                                        </Link>
                                    </Callout>
                                </CardBody>
                            )}
                        </Card>
                    )}
                    <Card>
                        <CardHeader title="Akses cepat" />
                        <CardBody className="space-y-2">
                            <QuickAction href={route("jurnal.index")} icon={<CalendarCheck2 />} title="Absensi Mingguan" description="Kirim dan pantau status absensi" />
                            <QuickAction href={route("laporan.create")} icon={<BookOpenText />} title="Laporan PKL" description="Ajukan judul dan unduh format laporan" />
                            <QuickAction href={route("pengajuanTempat.index")} icon={<Building2 />} title="Pengajuan Tempat" description="Ajukan tempat PKL" />
                            {trashJurnalCount > 0 && (
                                <QuickAction href={route("trashJurnal.index")} icon={<FileText />} title="Sampah Absensi" description={`${trashJurnalCount} absensi dapat dipulihkan`} />
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Pembimbing                                                                 */
/* -------------------------------------------------------------------------- */

function DashboardPembimbing({ props }) {
    const { rekapPb = [], ringkasan } = props;
    const siswa = Array.isArray(rekapPb) ? rekapPb : [];
    const totalAbsensi = siswa.reduce((a, s) => a + Number(s.jurnals_count || 0), 0);
    const totalPending = siswa.reduce((a, s) => a + Number(s.jurnals_pending_count || 0), 0);
    const sudahAbsen = ringkasan?.sudahAbsenIds ? new Set(ringkasan.sudahAbsenIds) : null;
    const jumlahSudah = sudahAbsen ? siswa.filter((s) => sudahAbsen.has(s.id)).length : null;

    const urut = useMemo(
        () => [...siswa].sort((a, b) => (b.jurnals_pending_count ?? 0) - (a.jurnals_pending_count ?? 0) || a.name.localeCompare(b.name)),
        [siswa]
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Siswa bimbingan" value={siswa.length} icon={<Users />} href={route("siswa.index")} />
                <StatCard label="Menunggu verifikasi" value={totalPending} icon={<Clock3 />} tone="amber" href={route("jurnal.index", { status: "pending" })} />
                <StatCard label="Total absensi masuk" value={totalAbsensi} icon={<ClipboardCheck />} tone="sky" href={route("jurnal.index")} />
                {jumlahSudah !== null ? (
                    <StatCard label="Sudah absen minggu ini" value={`${jumlahSudah}/${siswa.length}`} icon={<CalendarCheck2 />} tone="emerald" />
                ) : (
                    <StatCard label="Disetujui" value={totalAbsensi - totalPending} hint="Termasuk yang ditolak" icon={<CheckCircle2 />} tone="emerald" />
                )}
            </div>

            {totalPending > 0 && (
                <Callout
                    tone="warning"
                    title={`${totalPending} absensi menunggu verifikasi Anda`}
                    action={
                        <Link href={route("jurnal.index", { status: "pending" })} className="whitespace-nowrap text-sm font-semibold underline">
                            Verifikasi sekarang
                        </Link>
                    }
                >
                    Periksa PDF absensi siswa, lalu setujui atau tolak dengan catatan.
                </Callout>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
                <Card className="lg:col-span-2">
                    <CardHeader
                        icon={<Users />}
                        title="Siswa bimbingan"
                        description={jumlahSudah !== null ? `${jumlahSudah} dari ${siswa.length} siswa sudah mengirim absensi minggu ini` : undefined}
                    />
                    <Table
                        headers={[
                            { nama: "Siswa" },
                            { nama: "Absensi", className: "text-right" },
                            { nama: "Menunggu", className: "text-right" },
                            ...(sudahAbsen ? [{ nama: "Minggu ini" }] : []),
                            { nama: "", className: "w-px" },
                        ]}
                        minWidth="min-w-[560px]"
                    >
                        <tbody>
                            {urut.length ? (
                                urut.map((s) => (
                                    <Tr key={s.id}>
                                        <Td>
                                            <p className="font-medium text-slate-900">{s.name}</p>
                                            <p className="text-xs text-slate-500">{s.tempat?.nama ?? "Belum ada tempat PKL"}</p>
                                        </Td>
                                        <Td className="text-right tabular-nums">{s.jurnals_count ?? 0}</Td>
                                        <Td className="text-right tabular-nums">
                                            {s.jurnals_pending_count > 0 ? (
                                                <span className="font-semibold text-amber-700">{s.jurnals_pending_count}</span>
                                            ) : (
                                                <span className="text-slate-400">0</span>
                                            )}
                                        </Td>
                                        {sudahAbsen && (
                                            <Td>
                                                {sudahAbsen.has(s.id) ? (
                                                    <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                                                        <CheckCircle2 className="h-4 w-4" /> Sudah
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                                                        <Clock3 className="h-4 w-4" /> Belum
                                                    </span>
                                                )}
                                            </Td>
                                        )}
                                        <Td>
                                            <Link
                                                href={route("jurnal.index", { search: s.name })}
                                                className="whitespace-nowrap text-sm font-medium text-blue-700 hover:underline"
                                            >
                                                Lihat absensi
                                            </Link>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={sudahAbsen ? 5 : 4}>
                                    <EmptyState
                                        icon={<Users />}
                                        title="Belum ada siswa bimbingan"
                                        description="Siswa akan muncul setelah admin menetapkan Anda sebagai pembimbing."
                                    />
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                </Card>

                <div className="space-y-6">
                    {ringkasan?.menunggu && (
                        <Card>
                            <CardHeader
                                icon={<Clock3 />}
                                title="Antrean verifikasi"
                                action={
                                    <Link href={route("jurnal.index", { status: "pending" })} className="text-sm font-medium text-blue-700 hover:underline">
                                        Semua
                                    </Link>
                                }
                            />
                            <DaftarAbsensi items={ringkasan.menunggu} showNama verifikasi emptyText="Tidak ada absensi yang menunggu" />
                        </Card>
                    )}
                    <Card>
                        <CardHeader title="Akses cepat" />
                        <CardBody className="space-y-2">
                            <QuickAction href={route("jurnal.index", { status: "pending" })} icon={<ClipboardCheck />} title="Verifikasi Absensi" description="Setujui atau tolak absensi siswa" />
                            <QuickAction href={route("siswa.index")} icon={<Users />} title="Data Siswa" description="Profil dan penilaian siswa" />
                            <QuickAction href={route("laporan.index")} icon={<BookOpenText />} title="Judul Laporan" description="Tinjau judul laporan siswa" />
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

function DashboardAdmin({ props }) {
    const { statistik = {}, ringkasan, ptCount, lpCount } = props;
    const s = asObject(statistik);
    const absen = ringkasan?.absensiMingguIni;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Siswa" value={s.siswa} icon={<Users />} href={route("siswa.index")} />
                <StatCard label="Tempat PKL" value={s.tempat} icon={<Building2 />} tone="sky" href={route("tempat.index")} />
                <StatCard label="Pembimbing DU/DI" value={s.pembimbingPt} icon={<UserCog />} tone="violet" href={route("pembimbing.index")} />
                <StatCard label="Pembimbing sekolah" value={s.pembimbingSekolah} icon={<GraduationCap />} tone="emerald" href={route("pembimbing.index")} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader
                            icon={<ClipboardCheck />}
                            title="Absensi"
                            action={
                                <Link href={route("jurnal.index")} className="text-sm font-medium text-blue-700 hover:underline">
                                    Buka absensi
                                </Link>
                            }
                        />
                        <CardBody className="space-y-5">
                            {absen && (
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between text-sm">
                                        <span className="text-slate-700">Siswa yang sudah absen minggu ini</span>
                                        <span className="tabular-nums font-semibold text-slate-900">
                                            {absen.sudah}/{absen.totalSiswa}
                                        </span>
                                    </div>
                                    <ProgressBar value={absen.sudah} max={absen.totalSiswa} tone="emerald" label="Siswa yang sudah absen minggu ini" />
                                </div>
                            )}
                            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {[
                                    { label: "Total", value: s.jurnal, cls: "text-slate-900" },
                                    { label: "Menunggu", value: s.jurnalPending, cls: "text-amber-700", status: "pending" },
                                    { label: "Disetujui", value: ringkasan?.statusCounts?.disetujui, cls: "text-emerald-700", status: "disetujui" },
                                    { label: "Ditolak", value: ringkasan?.statusCounts?.ditolak, cls: "text-rose-700", status: "ditolak" },
                                ]
                                    .filter((x) => x.value !== undefined)
                                    .map((x) => (
                                        <Link
                                            key={x.label}
                                            href={route("jurnal.index", x.status ? { status: x.status } : {})}
                                            className="rounded-xl bg-slate-50 px-3 py-2.5 hover:bg-slate-100"
                                        >
                                            <dt className="text-xs text-slate-500">{x.label}</dt>
                                            <dd className={`text-xl font-semibold tabular-nums ${x.cls}`}>{x.value ?? 0}</dd>
                                        </Link>
                                    ))}
                            </dl>
                        </CardBody>
                        {ringkasan?.menunggu && (
                            <>
                                <p className="border-t border-slate-100 px-5 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Menunggu verifikasi terbaru
                                </p>
                                <DaftarAbsensi items={ringkasan.menunggu} showNama verifikasi emptyText="Tidak ada absensi yang menunggu" />
                            </>
                        )}
                    </Card>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <StatCard label="Pengajuan tempat" value={s.pengajuanTempat} icon={<MapPinned />} tone="amber" href={route("pengajuanTempat.index")} hint={ptCount ? `${ptCount} baru` : undefined} />
                        <StatCard label="Judul laporan" value={s.laporan} icon={<BookOpenText />} tone="violet" href={route("laporan.index")} hint={lpCount ? `${lpCount} menunggu` : undefined} />
                        <StatCard label="Jurusan" value={s.jurusan} icon={<Layers />} tone="sky" href={route("jurusan.index")} />
                        <StatCard label="Tahun ajaran" value={s.tahunAjaran} icon={<CalendarCheck2 />} tone="slate" href={route("tahunAjaran.index")} />
                        <StatCard label="Gambar slider" value={s.slider} icon={<Images />} tone="slate" href={route("gambar.index")} />
                    </div>
                </div>

                <Card>
                    <CardHeader title="Akses cepat" />
                    <CardBody className="space-y-2">
                        <QuickAction href={route("jurnal.index", { status: "pending" })} icon={<ClipboardCheck />} title="Verifikasi Absensi" description={s.jurnalPending ? `${s.jurnalPending} menunggu` : "Tidak ada antrean"} />
                        <QuickAction href={route("siswa.create")} icon={<Users />} title="Tambah Siswa" description="Daftarkan siswa PKL" />
                        <QuickAction href={route("data_siswa.index")} icon={<FileText />} title="Data Siswa (NISN)" description="Import data induk siswa" />
                        <QuickAction href={route("tempat.index")} icon={<Building2 />} title="Tempat PKL" description="Kelola DU/DI" />
                        <QuickAction href={route("pengajuanTempat.index")} icon={<MapPinned />} title="Pengajuan Tempat" description={ptCount ? `${ptCount} pengajuan` : "Tinjau pengajuan siswa"} />
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

export default function Dashboard() {
    const page = usePage();
    const { auth, ringkasan } = page.props;
    const periode = ringkasan?.periode ?? periodeMingguDari();
    const role = auth.role;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <Welcome auth={auth} periode={periode}>
                    {role === "siswa" && (
                        <Link
                            href={route("jurnal.index")}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-50"
                        >
                            <CalendarCheck2 className="h-4 w-4" /> Absensi Mingguan
                        </Link>
                    )}
                    {role !== "siswa" && (
                        <Link
                            href={route("jurnal.index", { status: "pending" })}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-50"
                        >
                            <ClipboardCheck className="h-4 w-4" /> Verifikasi Absensi
                        </Link>
                    )}
                </Welcome>

                {role === "siswa" && <DashboardSiswa props={page.props} periode={periode} url={page.url} />}
                {(role === "pembimbing_sekolah" || role === "pembimbing_pt") && <DashboardPembimbing props={page.props} />}
                {role === "admin" && <DashboardAdmin props={page.props} />}
                {!["siswa", "pembimbing_sekolah", "pembimbing_pt", "admin"].includes(role) && (
                    <EmptyState icon={<LayoutDashboard />} title="Peran akun belum ditetapkan" description="Hubungi admin sekolah agar akun Anda diberi peran." />
                )}
            </div>
        </AuthenticatedLayout>
    );
}

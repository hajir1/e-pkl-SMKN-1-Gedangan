import { KeteranganBadge, StatusBadge } from "@/Components/Badge";
import Card from "@/Components/Card";
import EmptyState from "@/Components/EmptyState";
import Filter from "@/Components/Filter";
import FormField from "@/Components/FormField";
import IconButton from "@/Components/IconButton";
import ImageViewer from "@/Components/ImageViewer";
import Modal from "@/Components/Modal";
import { OptionSorting } from "@/Components/Option";
import Pagination from "@/Components/Pagination";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Select from "@/Components/Select";
import Table, { Td, TableEmpty, Tr } from "@/Components/Table";
import TextInput from "@/Components/TextInput";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import {
    cleanParams,
    escapeRegExp,
    formatPeriode,
    formatSisaWaktu,
    formatTanggal,
    formatTanggalWaktu,
    periodeMingguDari,
    sisaWaktu,
    storageUrl,
} from "@/Helpers/format";
import { useNow } from "@/Helpers/hooks";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    CalendarCheck2,
    CheckCircle2,
    Clock3,
    Download,
    FileText,
    Pencil,
    RotateCcw,
    Send,
    Trash2,
    XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import AbsensiFormModal from "./AbsensiFormModal";
import VerifikasiModal from "./VerifikasiModal";

const FILTER_KEYS = ["keterangan", "status", "marking", "start_date", "end_date", "sort_by"];

const STATUS_TABS = [
    { value: "", label: "Semua" },
    { value: "pending", label: "Menunggu" },
    { value: "disetujui", label: "Disetujui" },
    { value: "ditolak", label: "Ditolak" },
];

/** Periode minggu absensi; data lama (harian) belum punya minggu_mulai. */
const periodeJurnal = (j) =>
    j.minggu_mulai
        ? formatPeriode(j.minggu_mulai, j.minggu_selesai)
        : formatTanggal(j.created_at);

const Highlight = ({ text, term }) => {
    if (!term || !text) return text ?? "";
    // Sebelumnya input pencarian langsung dipakai sebagai RegExp, sehingga
    // karakter seperti "(" atau "+" membuat halaman crash.
    const parts = String(text).split(new RegExp(`(${escapeRegExp(term)})`, "gi"));
    return parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="rounded bg-amber-100 px-0.5 text-slate-900">
                {part}
            </mark>
        ) : (
            <span key={i}>{part}</span>
        )
    );
};

/** Kartu status absensi minggu berjalan (khusus siswa). */
function MingguIniCard({ periode, absensi, onKirim, onEdit }) {
    const now = useNow(60000);
    const sisa = sisaWaktu(periode.selesai, now);
    const status = absensi?.status_verifikasi ?? (absensi?.mark ? "disetujui" : "pending");
    const diSampah = Boolean(absensi?.deleted_at);

    let isi;
    if (!absensi) {
        isi = (
            <>
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Clock3 className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="font-semibold text-slate-900">
                            Anda belum mengirim absensi minggu ini
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600">
                            Batas pengiriman: Minggu, {formatTanggal(periode.selesai, { panjang: true })} pukul 23.59 WIB
                            {" · "}
                            <span className="font-medium text-amber-700">
                                {formatSisaWaktu(sisa)}
                            </span>
                        </p>
                    </div>
                </div>
                <PrimaryButton type="button" onClick={onKirim} className="w-full sm:w-auto">
                    <Send /> Kirim Absensi
                </PrimaryButton>
            </>
        );
    } else if (diSampah) {
        isi = (
            <>
                <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Trash2 className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="font-semibold text-slate-900">
                            Absensi minggu ini ada di Sampah
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600">
                            Pulihkan absensi tersebut, atau hapus permanen
                            terlebih dahulu sebelum mengirim yang baru.
                        </p>
                    </div>
                </div>
                <Link
                    href={route("trashJurnal.index")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 sm:w-auto"
                >
                    <RotateCcw className="h-4 w-4" /> Buka Sampah
                </Link>
            </>
        );
    } else {
        const meta = {
            pending: {
                bg: "bg-amber-100 text-amber-700",
                icon: <Clock3 className="h-5 w-5" />,
                judul: "Absensi terkirim, menunggu verifikasi pembimbing",
            },
            disetujui: {
                bg: "bg-emerald-100 text-emerald-700",
                icon: <CheckCircle2 className="h-5 w-5" />,
                judul: "Absensi minggu ini sudah disetujui",
            },
            ditolak: {
                bg: "bg-rose-100 text-rose-700",
                icon: <XCircle className="h-5 w-5" />,
                judul: "Absensi minggu ini ditolak, silakan perbaiki",
            },
        }[status];
        isi = (
            <>
                <div className="flex min-w-0 items-start gap-3">
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                        {meta.icon}
                    </span>
                    <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{meta.judul}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                            <KeteranganBadge value={absensi.keterangan} />
                            <span>Dikirim {formatTanggalWaktu(absensi.created_at)}</span>
                        </div>
                        {absensi.catatan_verifikasi && (
                            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                <span className="font-medium">Catatan pembimbing:</span>{" "}
                                {absensi.catatan_verifikasi}
                            </p>
                        )}
                    </div>
                </div>
                {status !== "disetujui" && (
                    <SecondaryButton onClick={onEdit} className="w-full sm:w-auto">
                        <Pencil /> {status === "ditolak" ? "Perbaiki Absensi" : "Ubah Absensi"}
                    </SecondaryButton>
                )}
            </>
        );
    }

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-3 text-white">
                <p className="flex items-center gap-2 text-sm font-medium">
                    <CalendarCheck2 className="h-4 w-4" /> Absensi minggu ini
                </p>
                <p className="text-sm text-blue-100">
                    {formatPeriode(periode.mulai, periode.selesai)}
                </p>
            </div>
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                {isi}
            </div>
        </Card>
    );
}

const Index = () => {
    const {
        jurnals,
        auth,
        filters,
        periodeMinggu,
        absensiMingguIni,
        sudahAbsenMingguIni,
    } = usePage().props;
    const isSiswa = auth.role === "siswa";
    const bisaVerifikasi = ["admin", "pembimbing_pt", "pembimbing_sekolah"].includes(auth.role);

    const periode = useMemo(() => {
        if (periodeMinggu?.mulai) return periodeMinggu;
        const p = periodeMingguDari();
        return { mulai: p.mulai, selesai: p.selesai };
    }, [periodeMinggu]);

    const [formModal, setFormModal] = useState({ show: false, jurnal: null });
    const [verifikasi, setVerifikasi] = useState({ jurnal: null, mode: null });
    const [sortModal, setSortModal] = useState(false);
    const [dataSearch, setDataSearch] = useState({
        search: filters?.search ?? "",
        sort_by: filters?.sort_by ?? "",
        sort_order: filters?.sort_order ?? "",
        keterangan: filters?.keterangan ?? "",
        status: filters?.status ?? "",
        marking: filters?.marking ?? "",
        start_date: filters?.start_date ?? "",
        end_date: filters?.end_date ?? "",
    });

    const activeCount = FILTER_KEYS.filter((k) => (filters?.[k] ?? "") !== "").length;

    const kirimFilter = (update) => {
        const params = cleanParams({
            ...update,
            sort_order: update.sort_by ? update.sort_order : "",
            end_date: update.start_date ? update.end_date : "",
        });
        router.get(route("jurnal.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchChange = (e) => {
        e.preventDefault?.();
        const { name, value } = e.target;
        const update = { ...dataSearch, [name]: value };
        setDataSearch(update);
        kirimFilter(update);
    };

    const resetFilter = () => {
        const update = {
            search: dataSearch.search,
            sort_by: "",
            sort_order: "",
            keterangan: "",
            status: "",
            marking: "",
            start_date: "",
            end_date: "",
        };
        setDataSearch(update);
        kirimFilter(update);
    };

    const handleDelete = (jurnal) => {
        AlertConfirm(
            `Absensi periode ${periodeJurnal(jurnal)} akan dipindahkan ke Sampah. Anda masih bisa memulihkannya dari menu Sampah Absensi.`,
            "warning",
            () =>
                router.delete(route("jurnal.destroy", jurnal.id), {
                    preserveScroll: true,
                }),
            "Ya, Hapus"
        );
    };

    const handleExportJurnal = () => {
        AlertConfirm(
            "Data absensi akan diekspor ke Excel sesuai filter dan pencarian yang sedang aktif.",
            "question",
            () => {
                window.location.href = route("jurnals.export", cleanParams(filters ?? {}));
            },
            "Ya, Ekspor"
        );
    };

    const headers = [
        { nama: "#", className: "w-12" },
        ...(isSiswa ? [] : [{ nama: "Siswa" }]),
        { nama: "Periode" },
        { nama: "Keterangan" },
        { nama: "Kegiatan" },
        { nama: "Bukti" },
        { nama: "Status" },
        { nama: "Aksi", className: "text-right" },
    ];

    const rows = jurnals?.data ?? [];

    return (
        <AuthenticatedLayout>
            <Head title={isSiswa ? "Absensi Mingguan" : "Absensi & Jurnal"} />

            <div className="space-y-6">
                <TitlePage
                    eyebrow="Absensi PKL"
                    title={isSiswa ? "Absensi Mingguan" : "Absensi & Jurnal Siswa"}
                    quote={
                        isSiswa
                            ? "Kirim absensi satu kali setiap minggu (Senin - Minggu) dengan lampiran PDF. Pembimbing akan memverifikasi absensi Anda."
                            : "Pantau dan verifikasi absensi mingguan siswa. Periksa PDF bukti sebelum menyetujui atau menolak."
                    }
                >
                    <SecondaryButton onClick={handleExportJurnal}>
                        <Download /> Ekspor Excel
                    </SecondaryButton>
                    {isSiswa && !sudahAbsenMingguIni && (
                        <PrimaryButton
                            type="button"
                            onClick={() => setFormModal({ show: true, jurnal: null })}
                        >
                            <Send /> Kirim Absensi
                        </PrimaryButton>
                    )}
                </TitlePage>

                {isSiswa && (
                    <MingguIniCard
                        periode={periode}
                        absensi={absensiMingguIni}
                        onKirim={() => setFormModal({ show: true, jurnal: null })}
                        onEdit={() => setFormModal({ show: true, jurnal: absensiMingguIni })}
                    />
                )}

                <Card className="overflow-hidden">
                    <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 pt-3" role="tablist" aria-label="Status verifikasi">
                        {STATUS_TABS.map((tab) => {
                            const active = (filters?.status ?? "") === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() =>
                                        handleSearchChange({
                                            target: { name: "status", value: tab.value },
                                        })
                                    }
                                    className={`-mb-px whitespace-nowrap border-b-2 px-3 pb-2.5 text-sm font-medium transition ${
                                        active
                                            ? "border-blue-700 text-blue-800"
                                            : "border-transparent text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <Filter
                        sortModal={sortModal}
                        setSortModal={setSortModal}
                        value={dataSearch.search}
                        onChange={handleSearchChange}
                        activeCount={activeCount}
                        placeholder={isSiswa ? "Cari kegiatan..." : "Cari nama siswa atau kegiatan..."}
                    />

                    <Table headers={headers} minWidth="min-w-[860px]">
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((jurnal, index) => {
                                    const status =
                                        jurnal.status_verifikasi ??
                                        (jurnal.mark ? "disetujui" : "pending");
                                    const bisaUbah = isSiswa && status !== "disetujui";
                                    return (
                                        <Tr key={jurnal.id}>
                                            <Td className="text-slate-500">
                                                {index + (jurnals.from ?? 1)}
                                            </Td>
                                            {!isSiswa && (
                                                <Td className="font-medium text-slate-900">
                                                    <Highlight text={jurnal.user?.name} term={filters?.search} />
                                                </Td>
                                            )}
                                            <Td className="whitespace-nowrap">
                                                <span className="font-medium text-slate-900">
                                                    {periodeJurnal(jurnal)}
                                                </span>
                                                <span className="block text-xs text-slate-500">
                                                    Dikirim {formatTanggal(jurnal.created_at)}
                                                </span>
                                            </Td>
                                            <Td>
                                                <KeteranganBadge value={jurnal.keterangan} />
                                            </Td>
                                            <Td className="max-w-xs">
                                                <p className="line-clamp-2" title={jurnal.kegiatan}>
                                                    <Highlight text={jurnal.kegiatan} term={filters?.search} />
                                                </p>
                                            </Td>
                                            <Td>
                                                <div className="flex items-center gap-2">
                                                    {jurnal.pdf_url ? (
                                                        <a
                                                            href={jurnal.pdf_url}
                                                            target="_blank"
                                                            rel="noopener"
                                                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 hover:bg-rose-100"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" /> PDF
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Tanpa PDF</span>
                                                    )}
                                                    {jurnal.photo && (
                                                        <ImageViewer
                                                            src={storageUrl(jurnal.photo)}
                                                            alt={`Foto kegiatan ${jurnal.user?.name ?? ""}`}
                                                            className="h-9 w-9"
                                                        />
                                                    )}
                                                </div>
                                            </Td>
                                            <Td>
                                                <StatusBadge status={jurnal.status_verifikasi} mark={jurnal.mark} />
                                                {jurnal.verifikator?.name && (
                                                    <span className="mt-1 block text-xs text-slate-500">
                                                        oleh {jurnal.verifikator.name}
                                                    </span>
                                                )}
                                                {status === "ditolak" && jurnal.catatan_verifikasi && (
                                                    <span
                                                        className="mt-1 block max-w-[200px] truncate text-xs text-rose-700"
                                                        title={jurnal.catatan_verifikasi}
                                                    >
                                                        “{jurnal.catatan_verifikasi}”
                                                    </span>
                                                )}
                                            </Td>
                                            <Td>
                                                <div className="flex items-center justify-end gap-1">
                                                    {bisaVerifikasi && status !== "disetujui" && (
                                                        <IconButton
                                                            label="Setujui absensi"
                                                            variant="success"
                                                            onClick={() => setVerifikasi({ jurnal, mode: "disetujui" })}
                                                        >
                                                            <CheckCircle2 />
                                                        </IconButton>
                                                    )}
                                                    {bisaVerifikasi && status !== "ditolak" && (
                                                        <IconButton
                                                            label="Tolak absensi"
                                                            variant="danger"
                                                            onClick={() => setVerifikasi({ jurnal, mode: "ditolak" })}
                                                        >
                                                            <XCircle />
                                                        </IconButton>
                                                    )}
                                                    {bisaUbah && (
                                                        <>
                                                            <IconButton
                                                                label={status === "ditolak" ? "Perbaiki absensi" : "Ubah absensi"}
                                                                variant="primary"
                                                                onClick={() => setFormModal({ show: true, jurnal })}
                                                            >
                                                                <Pencil />
                                                            </IconButton>
                                                            <IconButton
                                                                label="Hapus absensi"
                                                                variant="danger"
                                                                onClick={() => handleDelete(jurnal)}
                                                            >
                                                                <Trash2 />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    {isSiswa && status === "disetujui" && (
                                                        <span className="text-xs text-slate-400">Terkunci</span>
                                                    )}
                                                </div>
                                            </Td>
                                        </Tr>
                                    );
                                })
                            ) : (
                                <TableEmpty colSpan={headers.length}>
                                    {activeCount > 0 || filters?.search ? (
                                        <EmptyState
                                            title="Tidak ada absensi yang cocok"
                                            description="Coba ubah kata kunci pencarian atau atur ulang filter."
                                            action={
                                                <SecondaryButton onClick={resetFilter}>
                                                    Atur ulang filter
                                                </SecondaryButton>
                                            }
                                        />
                                    ) : (
                                        <EmptyState
                                            icon={<CalendarCheck2 />}
                                            title="Belum ada absensi"
                                            description={
                                                isSiswa
                                                    ? "Absensi yang Anda kirim setiap minggu akan tampil di sini."
                                                    : "Absensi siswa bimbingan Anda akan tampil di sini setelah dikirim."
                                            }
                                        />
                                    )}
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={jurnals} />
                </Card>
            </div>

            <AbsensiFormModal
                show={formModal.show}
                jurnal={formModal.jurnal}
                periode={formModal.jurnal?.minggu_mulai ? { mulai: formModal.jurnal.minggu_mulai, selesai: formModal.jurnal.minggu_selesai } : periode}
                onClose={() => setFormModal({ show: false, jurnal: formModal.jurnal })}
            />

            <VerifikasiModal
                jurnal={verifikasi.jurnal}
                mode={verifikasi.mode}
                onClose={() => setVerifikasi({ jurnal: null, mode: null })}
            />

            <Modal show={sortModal} onClose={() => setSortModal(false)} maxWidth="lg">
                <TitleModal
                    title="Filter & Urutkan Absensi"
                    description="Perubahan langsung diterapkan pada tabel."
                    onClick={() => setSortModal(false)}
                />
                <ModalBody className="space-y-5">
                    <OptionSorting
                        dataSearch={dataSearch}
                        handleSearchChange={handleSearchChange}
                        datas={[
                            { name: "Bawaan (terbaru)", value: "" },
                            ...(isSiswa ? [] : [{ name: "Nama siswa", value: "nama" }]),
                            { name: "Periode minggu", value: "minggu_mulai" },
                            { name: "Keterangan", value: "keterangan" },
                            { name: "Status verifikasi", value: "status_verifikasi" },
                            { name: "Tanggal dikirim", value: "created_at" },
                        ]}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField label="Keterangan" htmlFor="f-keterangan">
                            <Select id="f-keterangan" name="keterangan" value={dataSearch.keterangan} onChange={handleSearchChange}>
                                <option value="">Semua keterangan</option>
                                <option value="hadir">Hadir</option>
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                            </Select>
                        </FormField>
                        <FormField label="Status verifikasi" htmlFor="f-status">
                            <Select id="f-status" name="status" value={dataSearch.status} onChange={handleSearchChange}>
                                <option value="">Semua status</option>
                                <option value="pending">Menunggu</option>
                                <option value="disetujui">Disetujui</option>
                                <option value="ditolak">Ditolak</option>
                            </Select>
                        </FormField>
                        <FormField label="Dikirim mulai tanggal" htmlFor="f-start">
                            <TextInput id="f-start" type="date" name="start_date" className="w-full" value={dataSearch.start_date} onChange={handleSearchChange} />
                        </FormField>
                        <FormField
                            label="Sampai tanggal"
                            htmlFor="f-end"
                            help={!dataSearch.start_date ? "Isi tanggal mulai terlebih dahulu." : undefined}
                        >
                            <TextInput
                                id="f-end"
                                type="date"
                                name="end_date"
                                className="w-full"
                                min={dataSearch.start_date || undefined}
                                disabled={!dataSearch.start_date}
                                value={dataSearch.end_date}
                                onChange={handleSearchChange}
                            />
                        </FormField>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={resetFilter}>Atur ulang</SecondaryButton>
                    <PrimaryButton type="button" onClick={() => setSortModal(false)}>
                        Selesai
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        </AuthenticatedLayout>
    );
};

export default Index;

import { KeteranganBadge, StatusBadge } from "@/Components/Badge";
import Callout from "@/Components/Callout";
import Card from "@/Components/Card";
import EmptyState from "@/Components/EmptyState";
import IconButton from "@/Components/IconButton";
import ImageViewer from "@/Components/ImageViewer";
import Pagination from "@/Components/Pagination";
import Table, { TableEmpty, Td, Tr } from "@/Components/Table";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import {
    formatPeriode,
    formatTanggal,
    formatTanggalWaktu,
    storageUrl,
} from "@/Helpers/format";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArchiveRestore, ArrowLeft, FileText, Trash2 } from "lucide-react";
import { useState } from "react";

const periodeJurnal = (j) =>
    j.minggu_mulai
        ? formatPeriode(j.minggu_mulai, j.minggu_selesai)
        : formatTanggal(j.created_at);

export default function Index() {
    const { trasheds } = usePage().props;
    const [prosesId, setProsesId] = useState(null);
    const rows = trasheds?.data ?? [];

    const handleRestore = (jurnal) => {
        setProsesId(jurnal.id);
        router.put(
            route("trashJurnal.update", jurnal.id),
            {},
            { preserveScroll: true, onFinish: () => setProsesId(null) }
        );
    };

    const handleDelete = (jurnal) => {
        AlertConfirm(
            `Absensi periode ${periodeJurnal(jurnal)} beserta file PDF dan fotonya akan dihapus permanen dan tidak bisa dipulihkan.`,
            "warning",
            () => {
                setProsesId(jurnal.id);
                router.delete(route("trashJurnal.destroy", jurnal.id), {
                    preserveScroll: true,
                    onFinish: () => setProsesId(null),
                });
            },
            "Ya, Hapus Permanen"
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Sampah Absensi" />
            <div className="space-y-6">
                <TitlePage
                    eyebrow="Absensi PKL"
                    title="Sampah Absensi"
                    quote="Absensi yang Anda hapus tersimpan di sini. Pulihkan bila terhapus tidak sengaja, atau hapus permanen."
                >
                    <Link
                        href={route("jurnal.index")}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali ke Absensi
                    </Link>
                </TitlePage>

                <Callout tone="info">
                    Satu minggu hanya boleh memiliki satu absensi, termasuk yang
                    ada di Sampah. Untuk mengirim ulang absensi pada minggu yang
                    sama, pulihkan atau hapus permanen absensi tersebut.
                </Callout>

                <Card className="overflow-hidden">
                    <Table
                        headers={[
                            { nama: "#", className: "w-12" },
                            { nama: "Periode" },
                            { nama: "Keterangan" },
                            { nama: "Kegiatan" },
                            { nama: "Bukti" },
                            { nama: "Status" },
                            { nama: "Dihapus" },
                            { nama: "Aksi", className: "text-right" },
                        ]}
                        minWidth="min-w-[820px]"
                    >
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((ts, index) => (
                                    <Tr key={ts.id}>
                                        <Td className="text-slate-500">
                                            {index + (trasheds.from ?? 1)}
                                        </Td>
                                        <Td className="whitespace-nowrap font-medium text-slate-900">
                                            {periodeJurnal(ts)}
                                        </Td>
                                        <Td>
                                            <KeteranganBadge value={ts.keterangan} />
                                        </Td>
                                        <Td className="max-w-xs">
                                            <p className="line-clamp-2" title={ts.kegiatan}>
                                                {ts.kegiatan}
                                            </p>
                                        </Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                {ts.file_pdf ? (
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                        <FileText className="h-3.5 w-3.5" /> PDF
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Tanpa PDF</span>
                                                )}
                                                {ts.photo && (
                                                    <ImageViewer
                                                        src={storageUrl(ts.photo)}
                                                        alt="Foto kegiatan"
                                                        className="h-9 w-9"
                                                    />
                                                )}
                                            </div>
                                        </Td>
                                        <Td>
                                            <StatusBadge status={ts.status_verifikasi} mark={ts.mark} />
                                        </Td>
                                        <Td className="whitespace-nowrap text-slate-500">
                                            {formatTanggalWaktu(ts.deleted_at)}
                                        </Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-1">
                                                <IconButton
                                                    label="Pulihkan absensi"
                                                    variant="primary"
                                                    disabled={prosesId === ts.id}
                                                    onClick={() => handleRestore(ts)}
                                                >
                                                    <ArchiveRestore />
                                                </IconButton>
                                                <IconButton
                                                    label="Hapus permanen"
                                                    variant="danger"
                                                    disabled={prosesId === ts.id}
                                                    onClick={() => handleDelete(ts)}
                                                >
                                                    <Trash2 />
                                                </IconButton>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={8}>
                                    <EmptyState
                                        icon={<Trash2 />}
                                        title="Sampah kosong"
                                        description="Absensi yang Anda hapus akan muncul di sini."
                                    />
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={trasheds} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

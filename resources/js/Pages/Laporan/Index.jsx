import Badge from "@/Components/Badge";
import Card from "@/Components/Card";
import EmptyState from "@/Components/EmptyState";
import IconButton from "@/Components/IconButton";
import Pagination from "@/Components/Pagination";
import Table, { TableEmpty, Td, Tr } from "@/Components/Table";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import { formatTanggal } from "@/Helpers/format";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { BookOpenText, CheckCircle2, Clock3, Plus, Trash2, XCircle } from "lucide-react";
import { useState } from "react";

export const STATUS_LAPORAN = {
    pending: { label: "Menunggu", tone: "amber", icon: <Clock3 /> },
    terima: { label: "Diterima", tone: "emerald", icon: <CheckCircle2 /> },
    tolak: { label: "Ditolak", tone: "rose", icon: <XCircle /> },
};

export function StatusLaporan({ status }) {
    const s = STATUS_LAPORAN[status] ?? { label: status ?? "-", tone: "slate" };
    return (
        <Badge tone={s.tone} icon={s.icon}>
            {s.label}
        </Badge>
    );
}

export default function Index() {
    const { laporans, auth } = usePage().props;
    const isSiswa = auth.role === "siswa";
    const [prosesId, setProsesId] = useState(null);
    const rows = laporans?.data ?? [];

    const kirim = (lp, status) => {
        const terima = status === "terima";
        AlertConfirm(
            terima
                ? `Terima judul "${lp.judul}"? Siswa akan memakai judul ini untuk laporan PKL.`
                : `Tolak judul "${lp.judul}"? Siswa akan diminta mengajukan judul baru.`,
            terima ? "question" : "warning",
            () => {
                setProsesId(lp.id);
                router.put(route("laporan.update", lp.id), { status }, { preserveScroll: true, onFinish: () => setProsesId(null) });
            },
            terima ? "Ya, Terima" : "Ya, Tolak"
        );
    };

    const hapus = (lp) =>
        AlertConfirm(`Judul laporan "${lp.judul}" akan dihapus.`, "warning", () => router.delete(route("laporan.destroy", lp.id), { preserveScroll: true }), "Ya, Hapus");

    return (
        <AuthenticatedLayout>
            <Head title="Judul Laporan" />
            <div className="space-y-6">
                <TitlePage
                    eyebrow="Laporan PKL"
                    title={isSiswa ? "Judul Laporan Saya" : "Judul Laporan Siswa"}
                    quote={isSiswa ? "Riwayat judul laporan yang pernah Anda ajukan." : "Tinjau judul laporan yang diajukan siswa, lalu terima atau tolak."}
                >
                    {isSiswa && (
                        <Link
                            href={route("laporan.create")}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
                        >
                            <Plus className="h-4 w-4" /> Ajukan Judul
                        </Link>
                    )}
                </TitlePage>
                <Card className="overflow-hidden">
                    <Table
                        headers={[
                            { nama: "#", className: "w-12" },
                            ...(isSiswa ? [] : [{ nama: "Siswa" }]),
                            { nama: "Judul" },
                            { nama: "Status" },
                            { nama: "Diajukan" },
                            { nama: "Aksi", className: "text-right" },
                        ]}
                        minWidth="min-w-[680px]"
                    >
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((lp, index) => (
                                    <Tr key={lp.id}>
                                        <Td className="text-slate-500">{index + (laporans.from ?? 1)}</Td>
                                        {!isSiswa && (
                                            <Td>
                                                <p className="font-medium text-slate-900">{lp.user?.name ?? "-"}</p>
                                                <p className="text-xs text-slate-500">{lp.user?.tempat?.nama ?? "Belum ada tempat PKL"}</p>
                                            </Td>
                                        )}
                                        <Td className="max-w-md">
                                            <p className="text-slate-900">{lp.judul}</p>
                                        </Td>
                                        <Td>
                                            <StatusLaporan status={lp.status} />
                                        </Td>
                                        <Td className="whitespace-nowrap text-slate-500">{formatTanggal(lp.created_at)}</Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-1">
                                                {!isSiswa && lp.status !== "terima" && (
                                                    <IconButton label="Terima judul" variant="success" disabled={prosesId === lp.id} onClick={() => kirim(lp, "terima")}>
                                                        <CheckCircle2 />
                                                    </IconButton>
                                                )}
                                                {!isSiswa && lp.status === "pending" && (
                                                    <IconButton label="Tolak judul" variant="danger" disabled={prosesId === lp.id} onClick={() => kirim(lp, "tolak")}>
                                                        <XCircle />
                                                    </IconButton>
                                                )}
                                                {lp.status !== "terima" && (
                                                    <IconButton label="Hapus judul" variant="danger" onClick={() => hapus(lp)}>
                                                        <Trash2 />
                                                    </IconButton>
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={isSiswa ? 5 : 6}>
                                    <EmptyState
                                        icon={<BookOpenText />}
                                        title="Belum ada judul laporan"
                                        description={isSiswa ? "Ajukan judul laporan PKL Anda untuk ditinjau pembimbing." : "Judul yang diajukan siswa bimbingan Anda akan tampil di sini."}
                                    />
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={laporans} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

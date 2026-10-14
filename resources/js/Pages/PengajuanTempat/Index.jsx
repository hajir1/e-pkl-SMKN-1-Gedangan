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
import { CheckCircle2, MapPinned, Plus, XCircle } from "lucide-react";
import { useState } from "react";

export default function Index() {
    const { pengajuanTempats, auth } = usePage().props;
    const isAdmin = auth.role === "admin";
    const [prosesId, setProsesId] = useState(null);
    const rows = pengajuanTempats?.data ?? [];

    const terima = (pt) =>
        AlertConfirm(
            `Terima pengajuan ${pt.user?.name ?? "siswa"} ke ${pt.nama}? Tempat akan otomatis terdaftar (bila belum ada) dan siswa langsung ditempatkan di sana.`,
            "question",
            () => {
                setProsesId(pt.id);
                router.put(route("pengajuanTempat.update", pt.id), {}, { preserveScroll: true, onFinish: () => setProsesId(null) });
            },
            "Ya, Terima"
        );

    const tolak = (pt) =>
        AlertConfirm(
            `Tolak pengajuan ${pt.user?.name ?? "siswa"} ke ${pt.nama}? Pengajuan akan dihapus.`,
            "warning",
            () => {
                setProsesId(pt.id);
                router.delete(route("pengajuanTempat.destroy", pt.id), { preserveScroll: true, onFinish: () => setProsesId(null) });
            },
            "Ya, Tolak"
        );

    return (
        <AuthenticatedLayout>
            <Head title="Pengajuan Tempat" />
            <div className="space-y-6">
                <TitlePage
                    eyebrow="Tempat PKL"
                    title={isAdmin ? "Pengajuan Tempat PKL" : "Pengajuan Tempat Saya"}
                    quote={isAdmin ? "Tinjau tempat PKL yang diajukan siswa. Menerima pengajuan akan langsung menempatkan siswa." : "Status pengajuan tempat PKL Anda."}
                >
                    {!isAdmin && rows.length === 0 && (
                        <Link href={route("pengajuanTempat.create")} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
                            <Plus className="h-4 w-4" /> Ajukan Tempat
                        </Link>
                    )}
                </TitlePage>
                <Card className="overflow-hidden">
                    <Table
                        headers={[
                            { nama: "#", className: "w-12" },
                            ...(isAdmin ? [{ nama: "Pemohon" }] : []),
                            { nama: "Tempat" },
                            { nama: "Lokasi" },
                            { nama: "Alasan" },
                            { nama: "Diajukan" },
                            ...(isAdmin ? [{ nama: "Aksi", className: "text-right" }] : [{ nama: "Status" }]),
                        ]}
                        minWidth="min-w-[860px]"
                    >
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((pt, index) => (
                                    <Tr key={pt.id}>
                                        <Td className="text-slate-500">{index + (pengajuanTempats.from ?? 1)}</Td>
                                        {isAdmin && (
                                            <Td>
                                                <p className="font-medium text-slate-900">{pt.user?.name ?? "-"}</p>
                                                <p className="text-xs text-slate-500">{pt.user?.kontak ?? "-"}</p>
                                            </Td>
                                        )}
                                        <Td>
                                            <p className="font-medium text-slate-900">{pt.nama}</p>
                                            <p className="text-xs text-slate-500">
                                                {pt.bidang_usaha} · {pt.kontak}
                                            </p>
                                            <Badge tone={pt.is === "sekolah" ? "sky" : "violet"} className="mt-1">
                                                {pt.is === "sekolah" ? "Dari sekolah" : "Usulan siswa"}
                                            </Badge>
                                        </Td>
                                        <Td className="max-w-[200px]"><p className="line-clamp-2">{pt.lokasi}</p></Td>
                                        <Td className="max-w-xs"><p className="line-clamp-3 text-slate-600" title={pt.alasan}>{pt.alasan}</p></Td>
                                        <Td className="whitespace-nowrap text-slate-500">{formatTanggal(pt.created_at)}</Td>
                                        {isAdmin ? (
                                            <Td>
                                                <div className="flex items-center justify-end gap-1">
                                                    <IconButton label="Terima pengajuan" variant="success" disabled={prosesId === pt.id} onClick={() => terima(pt)}>
                                                        <CheckCircle2 />
                                                    </IconButton>
                                                    <IconButton label="Tolak pengajuan" variant="danger" disabled={prosesId === pt.id} onClick={() => tolak(pt)}>
                                                        <XCircle />
                                                    </IconButton>
                                                </div>
                                            </Td>
                                        ) : (
                                            <Td>
                                                <Badge tone="amber">Menunggu</Badge>
                                            </Td>
                                        )}
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={isAdmin ? 7 : 6}>
                                    <EmptyState
                                        icon={<MapPinned />}
                                        title={isAdmin ? "Tidak ada pengajuan" : "Belum ada pengajuan"}
                                        description={isAdmin ? "Pengajuan tempat dari siswa akan tampil di sini." : "Pengajuan yang diterima atau ditolak tidak lagi ditampilkan di sini. Cek tempat PKL Anda di Dashboard."}
                                    />
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={pengajuanTempats} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

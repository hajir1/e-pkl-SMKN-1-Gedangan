import Badge from "@/Components/Badge";
import Card from "@/Components/Card";
import EmptyState from "@/Components/EmptyState";
import Filter from "@/Components/Filter";
import FormField from "@/Components/FormField";
import IconButton from "@/Components/IconButton";
import Modal from "@/Components/Modal";
import { OptionSorting } from "@/Components/Option";
import Pagination from "@/Components/Pagination";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Select from "@/Components/Select";
import Table, { TableEmpty, Td, Tr } from "@/Components/Table";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import { roleLabel } from "@/Helpers/format";
import { useListFilter } from "@/Helpers/hooks";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { useState } from "react";

export default function Index() {
    const { pembimbings, filters, jurusans = [], tahunAjarans = [] } = usePage().props;
    const [sortModal, setSortModal] = useState(false);
    const { dataSearch, handleSearchChange, resetFilter, activeCount } = useListFilter("pembimbing.index", filters, ["tahunAjaran", "jurusan"]);
    const rows = pembimbings?.data ?? [];

    const handleDelete = (pb) =>
        AlertConfirm(
            `Akun pembimbing ${pb.name} akan dihapus. Siswa dan tempat PKL yang dibimbingnya akan kehilangan pembimbing. Lanjutkan?`,
            "warning",
            () => router.delete(route("pembimbing.destroy", pb.id), { preserveScroll: true }),
            "Ya, Hapus"
        );

    return (
        <AuthenticatedLayout>
            <Head title="Pembimbing" />
            <div className="space-y-6">
                <TitlePage eyebrow="Master Data" title="Pembimbing" quote="Kelola akun pembimbing sekolah dan pembimbing DU/DI.">
                    <Link
                        href={route("pembimbing.create")}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        <Plus className="h-4 w-4" /> Tambah Pembimbing
                    </Link>
                </TitlePage>

                <Card className="overflow-hidden">
                    <Filter
                        sortModal={sortModal}
                        setSortModal={setSortModal}
                        value={dataSearch.search}
                        onChange={handleSearchChange}
                        activeCount={activeCount}
                        placeholder="Cari nama, email, kontak, jurusan..."
                    />
                    <Table
                        headers={[
                            { nama: "#", className: "w-12" },
                            { nama: "Pembimbing" },
                            { nama: "Peran" },
                            { nama: "Kontak" },
                            { nama: "Jurusan / TA" },
                            { nama: "Aksi", className: "text-right" },
                        ]}
                        minWidth="min-w-[760px]"
                    >
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((pb, index) => {
                                    const role = pb.roles?.[0]?.name;
                                    return (
                                        <Tr key={pb.id}>
                                            <Td className="text-slate-500">{index + (pembimbings.from ?? 1)}</Td>
                                            <Td>
                                                <p className="font-medium text-slate-900">{pb.name}</p>
                                                <p className="text-xs text-slate-500">{pb.email}</p>
                                            </Td>
                                            <Td>
                                                <Badge tone={role === "pembimbing_pt" ? "violet" : "sky"}>{roleLabel(role)}</Badge>
                                                {role === "pembimbing_pt" && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {pb.tempat_yang_dibimbing?.nama ?? "Belum membimbing tempat"}
                                                    </p>
                                                )}
                                            </Td>
                                            <Td className="whitespace-nowrap">{pb.kontak || <span className="text-slate-400">Belum diisi</span>}</Td>
                                            <Td>
                                                <p>{pb.jurusan?.nama ?? <span className="text-slate-400">-</span>}</p>
                                                <p className="text-xs text-slate-500">{pb.tahun_ajaran?.tahun ?? "-"}</p>
                                            </Td>
                                            <Td>
                                                <div className="flex items-center justify-end gap-1">
                                                    <IconButton label="Ubah pembimbing" variant="primary" href={route("pembimbing.edit", pb.id)}>
                                                        <Pencil />
                                                    </IconButton>
                                                    <IconButton label="Hapus pembimbing" variant="danger" onClick={() => handleDelete(pb)}>
                                                        <Trash2 />
                                                    </IconButton>
                                                </div>
                                            </Td>
                                        </Tr>
                                    );
                                })
                            ) : (
                                <TableEmpty colSpan={6}>
                                    {activeCount > 0 || filters?.search ? (
                                        <EmptyState
                                            title="Tidak ada pembimbing yang cocok"
                                            description="Coba ubah kata kunci atau atur ulang filter."
                                            action={<SecondaryButton onClick={resetFilter}>Atur ulang filter</SecondaryButton>}
                                        />
                                    ) : (
                                        <EmptyState icon={<UserCog />} title="Belum ada pembimbing" description="Tambahkan pembimbing sekolah atau DU/DI." />
                                    )}
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={pembimbings} />
                </Card>
            </div>

            <Modal show={sortModal} onClose={() => setSortModal(false)} maxWidth="lg">
                <TitleModal title="Filter & Urutkan Pembimbing" description="Perubahan langsung diterapkan pada tabel." onClick={() => setSortModal(false)} />
                <ModalBody className="space-y-5">
                    <OptionSorting
                        dataSearch={dataSearch}
                        handleSearchChange={handleSearchChange}
                        datas={[
                            { name: "Bawaan (terbaru)", value: "" },
                            { name: "Nama", value: "name" },
                            { name: "Email", value: "email" },
                            { name: "No. HP", value: "kontak" },
                            { name: "Jurusan", value: "jurusan_id" },
                            { name: "Tahun ajaran", value: "tahunAjaran_id" },
                        ]}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField label="Tahun ajaran" htmlFor="f-ta">
                            <Select id="f-ta" name="tahunAjaran" value={dataSearch.tahunAjaran} onChange={handleSearchChange}>
                                <option value="">Semua</option>
                                {tahunAjarans.map((ta) => (
                                    <option key={ta.id} value={ta.id}>{ta.tahun}</option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Jurusan" htmlFor="f-jurusan">
                            <Select id="f-jurusan" name="jurusan" value={dataSearch.jurusan} onChange={handleSearchChange}>
                                <option value="">Semua</option>
                                {jurusans.map((j) => (
                                    <option key={j.id} value={j.id}>{j.nama}</option>
                                ))}
                            </Select>
                        </FormField>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={resetFilter}>Atur ulang</SecondaryButton>
                    <PrimaryButton type="button" onClick={() => setSortModal(false)}>Selesai</PrimaryButton>
                </ModalFooter>
            </Modal>
        </AuthenticatedLayout>
    );
}

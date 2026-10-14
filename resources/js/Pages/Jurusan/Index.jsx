import Badge from "@/Components/Badge";
import Card from "@/Components/Card";
import EmptyState from "@/Components/EmptyState";
import Filter from "@/Components/Filter";
import FormField from "@/Components/FormField";
import IconButton from "@/Components/IconButton";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Select from "@/Components/Select";
import Spinner from "@/Components/Spinner";
import Table, { TableEmpty, Td, Tr } from "@/Components/Table";
import TextInput from "@/Components/TextInput";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import { useListFilter } from "@/Helpers/hooks";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Layers, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const KOSONG = { nama: "", kepala: "", isActive: "aktif" };

function JurusanModal({ show, jurusan, onClose }) {
    const isEdit = Boolean(jurusan);
    const { data, setData, post, put, processing, errors, clearErrors, setError } = useForm(KOSONG);

    useEffect(() => {
        if (!show) return;
        clearErrors();
        setData(isEdit ? { nama: jurusan.nama ?? "", kepala: jurusan.kepala ?? "", isActive: jurusan.isActive ?? "tidak" } : KOSONG);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, jurusan?.id]);

    const submit = (e) => {
        e.preventDefault();
        const err = {};
        if (data.nama.trim().length < 3) err.nama = "Nama jurusan minimal 3 karakter";
        if (!isEdit && data.kepala.trim().length < 3) err.kepala = "Nama kepala konsentrasi minimal 3 karakter";
        if (Object.keys(err).length) return setError(err);
        const opts = { preserveScroll: true, onSuccess: (page) => !page.props.auth?.flash?.error && onClose() };
        if (isEdit) put(route("jurusan.update", jurusan.id), opts);
        else post(route("jurusan.store"), opts);
    };

    return (
        <Modal show={show} onClose={processing ? () => {} : onClose} maxWidth="lg">
            <TitleModal title={isEdit ? "Ubah Jurusan" : "Tambah Jurusan"} description={jurusan?.nama} onClick={onClose} />
            <form onSubmit={submit} noValidate>
                <ModalBody className="space-y-4">
                    <FormField label="Nama jurusan" htmlFor="nama" required error={errors.nama}>
                        <TextInput id="nama" className="w-full" maxLength={50} value={data.nama} onChange={(e) => setData("nama", e.target.value)} invalid={!!errors.nama} placeholder="Contoh: Teknik Komputer dan Jaringan" />
                    </FormField>
                    <FormField label="Kepala konsentrasi keahlian" htmlFor="kepala" required={!isEdit} error={errors.kepala}>
                        <TextInput id="kepala" className="w-full" maxLength={40} value={data.kepala} onChange={(e) => setData("kepala", e.target.value)} invalid={!!errors.kepala} />
                    </FormField>
                    <FormField label="Status" htmlFor="isActive" required error={errors.isActive} help="Hanya jurusan aktif yang bisa dipilih saat menambah siswa atau pembimbing.">
                        <Select id="isActive" value={data.isActive} onChange={(e) => setData("isActive", e.target.value)}>
                            <option value="aktif">Aktif</option>
                            <option value="tidak">Tidak aktif</option>
                        </Select>
                    </FormField>
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={processing}>Batal</SecondaryButton>
                    <PrimaryButton disabled={processing}>{processing ? <Spinner /> : <Save />} Simpan</PrimaryButton>
                </ModalFooter>
            </form>
        </Modal>
    );
}

export default function Index() {
    const { jurusans, filters } = usePage().props;
    const [form, setForm] = useState({ show: false, jurusan: null });
    const { dataSearch, handleSearchChange } = useListFilter("jurusan.index", filters, []);
    const rows = jurusans?.data ?? [];

    const handleDelete = (j) =>
        AlertConfirm(`Jurusan ${j.nama} akan dihapus.`, "warning", () => router.delete(route("jurusan.destroy", j.id), { preserveScroll: true }), "Ya, Hapus");

    return (
        <AuthenticatedLayout>
            <Head title="Jurusan" />
            <div className="space-y-6">
                <TitlePage eyebrow="Master Data" title="Jurusan" quote="Konsentrasi keahlian beserta kepala konsentrasinya.">
                    <PrimaryButton type="button" onClick={() => setForm({ show: true, jurusan: null })}>
                        <Plus /> Tambah Jurusan
                    </PrimaryButton>
                </TitlePage>
                <Card className="overflow-hidden">
                    <Filter isFilter={false} value={dataSearch.search} onChange={handleSearchChange} placeholder="Cari nama jurusan..." />
                    <Table headers={[{ nama: "#", className: "w-12" }, { nama: "Jurusan" }, { nama: "Kepala konsentrasi" }, { nama: "Status" }, { nama: "Aksi", className: "text-right" }]} minWidth="min-w-[600px]">
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((j, index) => (
                                    <Tr key={j.id}>
                                        <Td className="text-slate-500">{index + (jurusans.from ?? 1)}</Td>
                                        <Td className="font-medium text-slate-900">{j.nama}</Td>
                                        <Td>{j.kepala || <span className="text-slate-400">Belum diisi</span>}</Td>
                                        <Td>{j.isActive === "aktif" ? <Badge tone="emerald">Aktif</Badge> : <Badge>Tidak aktif</Badge>}</Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-1">
                                                <IconButton label="Ubah jurusan" variant="primary" onClick={() => setForm({ show: true, jurusan: j })}>
                                                    <Pencil />
                                                </IconButton>
                                                <IconButton label="Hapus jurusan" variant="danger" onClick={() => handleDelete(j)}>
                                                    <Trash2 />
                                                </IconButton>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={5}>
                                    <EmptyState icon={<Layers />} title={filters?.search ? "Jurusan tidak ditemukan" : "Belum ada jurusan"} />
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={jurusans} params={filters?.search ? { search: filters.search } : undefined} />
                </Card>
            </div>
            <JurusanModal show={form.show} jurusan={form.jurusan} onClose={() => setForm({ show: false, jurusan: form.jurusan })} />
        </AuthenticatedLayout>
    );
}

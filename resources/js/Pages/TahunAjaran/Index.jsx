import Badge from "@/Components/Badge";
import Card from "@/Components/Card";
import EmptyState from "@/Components/EmptyState";
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
import { formatTanggal } from "@/Helpers/format";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { CalendarRange, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const KOSONG = { tahun: "", isActive: "aktif" };

function TahunModal({ show, ta, onClose }) {
    const isEdit = Boolean(ta);
    const { data, setData, post, put, processing, errors, clearErrors, setError } = useForm(KOSONG);

    // Sebelumnya status aktif tidak ikut dimuat saat edit.
    useEffect(() => {
        if (!show) return;
        clearErrors();
        setData(isEdit ? { tahun: ta.tahun ?? "", isActive: ta.isActive ?? "tidak" } : KOSONG);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, ta?.id]);

    const submit = (e) => {
        e.preventDefault();
        if (!/^\s*\d{4}\s*-\s*\d{4}\s*$/.test(data.tahun)) {
            return setError("tahun", "Format tahun ajaran: 2025 - 2026");
        }
        const opts = { preserveScroll: true, onSuccess: (page) => !page.props.auth?.flash?.error && onClose() };
        if (isEdit) put(route("tahunAjaran.update", ta.id), opts);
        else post(route("tahunAjaran.store"), opts);
    };

    return (
        <Modal show={show} onClose={processing ? () => {} : onClose} maxWidth="md">
            <TitleModal title={isEdit ? "Ubah Tahun Ajaran" : "Tambah Tahun Ajaran"} onClick={onClose} />
            <form onSubmit={submit} noValidate>
                <ModalBody className="space-y-4">
                    <FormField label="Tahun ajaran" htmlFor="tahun" required error={errors.tahun} help="Contoh: 2025 - 2026">
                        <TextInput id="tahun" className="w-full" value={data.tahun} onChange={(e) => setData("tahun", e.target.value)} invalid={!!errors.tahun} placeholder="2025 - 2026" />
                    </FormField>
                    <FormField label="Status" htmlFor="isActive" required error={errors.isActive}>
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
    const { tahunAjarans } = usePage().props;
    const [form, setForm] = useState({ show: false, ta: null });
    const rows = tahunAjarans?.data ?? [];

    const handleDelete = (ta) =>
        AlertConfirm(`Tahun ajaran ${ta.tahun} akan dihapus.`, "warning", () => router.delete(route("tahunAjaran.destroy", ta.id), { preserveScroll: true }), "Ya, Hapus");

    return (
        <AuthenticatedLayout>
            <Head title="Tahun Ajaran" />
            <div className="space-y-6">
                <TitlePage eyebrow="Master Data" title="Tahun Ajaran" quote="Tahun ajaran aktif bisa dipilih saat registrasi dan penambahan siswa.">
                    <PrimaryButton type="button" onClick={() => setForm({ show: true, ta: null })}>
                        <Plus /> Tambah Tahun Ajaran
                    </PrimaryButton>
                </TitlePage>
                <Card className="overflow-hidden">
                    <Table headers={[{ nama: "#", className: "w-12" }, { nama: "Tahun ajaran" }, { nama: "Status" }, { nama: "Dibuat" }, { nama: "Aksi", className: "text-right" }]} minWidth="min-w-[520px]">
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((ta, index) => (
                                    <Tr key={ta.id}>
                                        <Td className="text-slate-500">{index + (tahunAjarans.from ?? 1)}</Td>
                                        <Td className="font-medium text-slate-900">{ta.tahun}</Td>
                                        <Td>{ta.isActive === "aktif" ? <Badge tone="emerald">Aktif</Badge> : <Badge>Tidak aktif</Badge>}</Td>
                                        <Td className="text-slate-500">{formatTanggal(ta.created_at)}</Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-1">
                                                <IconButton label="Ubah tahun ajaran" variant="primary" onClick={() => setForm({ show: true, ta })}>
                                                    <Pencil />
                                                </IconButton>
                                                <IconButton label="Hapus tahun ajaran" variant="danger" onClick={() => handleDelete(ta)}>
                                                    <Trash2 />
                                                </IconButton>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={5}>
                                    <EmptyState icon={<CalendarRange />} title="Belum ada tahun ajaran" />
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={tahunAjarans} />
                </Card>
            </div>
            <TahunModal show={form.show} ta={form.ta} onClose={() => setForm({ show: false, ta: form.ta })} />
        </AuthenticatedLayout>
    );
}

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
import Spinner from "@/Components/Spinner";
import Table, { TableEmpty, Td, Tr } from "@/Components/Table";
import TextInput from "@/Components/TextInput";
import Textarea from "@/Components/Textarea";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import { useListFilter } from "@/Helpers/hooks";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Building2, FileDown, MapPin, Pencil, Phone, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const KOSONG = { nama: "", kontak: "", bidang_usaha: "", lokasi: "", pembimbing_id: "" };

function TempatFormModal({ show, tempat, pembimbings, onClose }) {
    const isEdit = Boolean(tempat);
    const { data, setData, post, put, processing, errors, clearErrors, setError } = useForm(KOSONG);

    useEffect(() => {
        if (!show) return;
        clearErrors();
        setData(
            isEdit
                ? {
                      nama: tempat.nama ?? "",
                      kontak: tempat.kontak ?? "",
                      bidang_usaha: tempat.bidang_usaha ?? "",
                      lokasi: tempat.lokasi ?? "",
                      pembimbing_id: tempat.pembimbing_id ?? "",
                  }
                : KOSONG
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, tempat?.id]);

    const set = (key) => (e) => setData(key, e.target.value);

    // Pembimbing DU/DI hanya boleh membimbing satu tempat.
    const tersedia = pembimbings.filter(
        (p) => !p.tempat_yang_dibimbing || p.tempat_yang_dibimbing.id === tempat?.id
    );

    const submit = (e) => {
        e.preventDefault();
        const err = {};
        ["nama", "kontak", "bidang_usaha", "lokasi"].forEach((k) => {
            if (!String(data[k]).trim()) err[k] = "Wajib diisi";
        });
        if (Object.keys(err).length) {
            setError(err);
            return;
        }
        const opts = {
            preserveScroll: true,
            onSuccess: (page) => {
                if (!page.props.auth?.flash?.error) onClose();
            },
        };
        if (isEdit) put(route("tempat.update", tempat.id), opts);
        else post(route("tempat.store"), opts);
    };

    return (
        <Modal show={show} onClose={processing ? () => {} : onClose} maxWidth="2xl">
            <TitleModal title={isEdit ? "Ubah Tempat PKL" : "Tambah Tempat PKL"} description={isEdit ? tempat?.nama : "Data DU/DI tempat siswa melaksanakan PKL."} onClick={onClose} />
            <form onSubmit={submit} noValidate>
                <ModalBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Nama DU/DI" htmlFor="nama" required error={errors.nama} className="sm:col-span-2">
                        <TextInput id="nama" className="w-full" value={data.nama} onChange={set("nama")} invalid={!!errors.nama} />
                    </FormField>
                    <FormField label="Kontak" htmlFor="kontak" required error={errors.kontak}>
                        <TextInput id="kontak" inputMode="tel" className="w-full" value={data.kontak} onChange={set("kontak")} invalid={!!errors.kontak} />
                    </FormField>
                    <FormField label="Bidang usaha" htmlFor="bidang_usaha" required error={errors.bidang_usaha}>
                        <TextInput id="bidang_usaha" className="w-full" value={data.bidang_usaha} onChange={set("bidang_usaha")} invalid={!!errors.bidang_usaha} />
                    </FormField>
                    <FormField label="Alamat / lokasi" htmlFor="lokasi" required error={errors.lokasi} className="sm:col-span-2">
                        <Textarea id="lokasi" rows={2} value={data.lokasi} onChange={set("lokasi")} invalid={!!errors.lokasi} />
                    </FormField>
                    <FormField
                        label="Pembimbing DU/DI"
                        htmlFor="pembimbing_id"
                        error={errors.pembimbing_id}
                        className="sm:col-span-2"
                        help="Hanya pembimbing yang belum membimbing tempat lain yang ditampilkan."
                    >
                        <Select id="pembimbing_id" value={data.pembimbing_id} onChange={set("pembimbing_id")}>
                            <option value="">Belum ditentukan</option>
                            {tersedia.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </Select>
                    </FormField>
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={processing}>Batal</SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {processing ? <Spinner /> : <Save />} Simpan
                    </PrimaryButton>
                </ModalFooter>
            </form>
        </Modal>
    );
}

export default function Index() {
    const { tempats, pembimbings = [], filters } = usePage().props;
    const [sortModal, setSortModal] = useState(false);
    const [form, setForm] = useState({ show: false, tempat: null });
    const { dataSearch, handleSearchChange, resetFilter, activeCount } = useListFilter("tempat.index", filters, []);
    const rows = tempats?.data ?? [];

    const handleDelete = (t) =>
        AlertConfirm(
            `Tempat ${t.nama} akan dihapus. Siswa yang terdaftar di tempat ini tidak ikut terhapus, tetapi tidak lagi memiliki tempat PKL.`,
            "warning",
            () => router.delete(route("tempat.destroy", t.id), { preserveScroll: true }),
            "Ya, Hapus"
        );

    return (
        <AuthenticatedLayout>
            <Head title="Tempat PKL" />
            <div className="space-y-6">
                <TitlePage eyebrow="Master Data" title="Tempat PKL (DU/DI)" quote="Daftar dunia usaha / dunia industri tempat siswa melaksanakan PKL.">
                    <PrimaryButton type="button" onClick={() => setForm({ show: true, tempat: null })}>
                        <Plus /> Tambah Tempat
                    </PrimaryButton>
                </TitlePage>

                <Card className="overflow-hidden">
                    <Filter
                        sortModal={sortModal}
                        setSortModal={setSortModal}
                        value={dataSearch.search}
                        onChange={handleSearchChange}
                        activeCount={activeCount}
                        placeholder="Cari nama, bidang usaha, lokasi..."
                    />
                    <Table
                        headers={[
                            { nama: "#", className: "w-12" },
                            { nama: "Tempat" },
                            { nama: "Lokasi" },
                            { nama: "Kontak" },
                            { nama: "Pembimbing DU/DI" },
                            { nama: "Aksi", className: "text-right" },
                        ]}
                        minWidth="min-w-[800px]"
                    >
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((t, index) => (
                                    <Tr key={t.id}>
                                        <Td className="text-slate-500">{index + (tempats.from ?? 1)}</Td>
                                        <Td>
                                            <p className="font-medium text-slate-900">{t.nama}</p>
                                            <p className="text-xs text-slate-500">{t.bidang_usaha}</p>
                                        </Td>
                                        <Td className="max-w-xs">
                                            <p className="flex items-start gap-1.5 text-slate-700">
                                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                <span className="line-clamp-2">{t.lokasi}</span>
                                            </p>
                                        </Td>
                                        <Td className="whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5 text-slate-400" /> {t.kontak}
                                            </span>
                                        </Td>
                                        <Td>{t.user?.name ?? <span className="text-slate-400">Belum ditentukan</span>}</Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-1">
                                                <IconButton label="Unduh PDF daftar siswa" href={route("tempat.export", t.id)} external>
                                                    <FileDown />
                                                </IconButton>
                                                <IconButton label="Ubah tempat" variant="primary" onClick={() => setForm({ show: true, tempat: t })}>
                                                    <Pencil />
                                                </IconButton>
                                                <IconButton label="Hapus tempat" variant="danger" onClick={() => handleDelete(t)}>
                                                    <Trash2 />
                                                </IconButton>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={6}>
                                    {activeCount > 0 || filters?.search ? (
                                        <EmptyState
                                            title="Tidak ada tempat yang cocok"
                                            description="Coba ubah kata kunci atau atur ulang urutan."
                                            action={<SecondaryButton onClick={resetFilter}>Atur ulang</SecondaryButton>}
                                        />
                                    ) : (
                                        <EmptyState
                                            icon={<Building2 />}
                                            title="Belum ada tempat PKL"
                                            action={
                                                <PrimaryButton type="button" onClick={() => setForm({ show: true, tempat: null })}>
                                                    <Plus /> Tambah Tempat
                                                </PrimaryButton>
                                            }
                                        />
                                    )}
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={tempats} />
                </Card>
            </div>

            <TempatFormModal show={form.show} tempat={form.tempat} pembimbings={pembimbings} onClose={() => setForm({ show: false, tempat: form.tempat })} />

            <Modal show={sortModal} onClose={() => setSortModal(false)} maxWidth="lg">
                <TitleModal title="Urutkan Tempat PKL" onClick={() => setSortModal(false)} />
                <ModalBody>
                    <OptionSorting
                        dataSearch={dataSearch}
                        handleSearchChange={handleSearchChange}
                        datas={[
                            { name: "Bawaan (terbaru)", value: "" },
                            { name: "Nama", value: "nama" },
                            { name: "Kontak", value: "kontak" },
                            { name: "Bidang usaha", value: "bidang_usaha" },
                            { name: "Lokasi", value: "lokasi" },
                            { name: "Tanggal dibuat", value: "created_at" },
                        ]}
                    />
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={resetFilter}>Atur ulang</SecondaryButton>
                    <PrimaryButton type="button" onClick={() => setSortModal(false)}>Selesai</PrimaryButton>
                </ModalFooter>
            </Modal>
        </AuthenticatedLayout>
    );
}

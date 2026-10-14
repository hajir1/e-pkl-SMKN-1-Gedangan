import Badge from "@/Components/Badge";
import Callout from "@/Components/Callout";
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
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import { cleanParams } from "@/Helpers/format";
import { useListFilter } from "@/Helpers/hooks";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useTypeImportSiswa } from "@/state/Zustand";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Download, FileSpreadsheet, IdCard, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

/** NISN disimpan sebagai induk + kode jurusan (mis. "1234" + ".07.24"). */
const pecahNisn = (nisn = "") => {
    const i = nisn.indexOf(".");
    return i > 0 ? [nisn.slice(0, i), nisn.slice(i)] : [nisn.slice(0, 4), nisn.slice(4)];
};

function DataSiswaModal({ show, siswa, onClose }) {
    const isEdit = Boolean(siswa);
    const { type, setType } = useTypeImportSiswa();
    const mode = isEdit ? "create" : type;
    const { data, setData, post, put, processing, errors, clearErrors, reset, progress } = useForm({ induk: "", jurusan: "", nama: "", file: null });

    useEffect(() => {
        if (!show) return;
        clearErrors();
        if (isEdit) {
            const [induk, jurusan] = pecahNisn(siswa.nisn ?? "");
            setData({ induk, jurusan, nama: siswa.nama ?? "", file: null });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, siswa?.id]);

    const selesai = {
        preserveScroll: true,
        onSuccess: (page) => {
            if (!page.props.auth?.flash?.error) {
                reset();
                onClose();
            }
        },
    };

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) put(route("data_siswa.update", siswa.id), selesai);
        else if (mode === "import") post(route("data_siswas.import"), { ...selesai, forceFormData: true });
        else post(route("data_siswa.store"), selesai);
    };

    return (
        <Modal show={show} onClose={processing ? () => {} : onClose} maxWidth="lg">
            <TitleModal title={isEdit ? "Ubah Data NISN" : "Tambah Data NISN"} description={isEdit ? siswa?.nama : "Data induk siswa yang nantinya dipakai untuk aktivasi akun."} onClick={onClose} />
            <form onSubmit={submit} noValidate>
                <ModalBody className="space-y-4">
                    {!isEdit && (
                        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
                            {[
                                { v: "import", l: "Import Excel", i: <FileSpreadsheet /> },
                                { v: "create", l: "Isi Manual", i: <Plus /> },
                            ].map((t) => (
                                <button
                                    key={t.v}
                                    type="button"
                                    role="tab"
                                    aria-selected={mode === t.v}
                                    onClick={() => setType(t.v)}
                                    className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition [&_svg]:h-4 [&_svg]:w-4 ${
                                        mode === t.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    {t.i} {t.l}
                                </button>
                            ))}
                        </div>
                    )}

                    {mode === "import" ? (
                        <>
                            <Callout tone="info">
                                Gunakan format Excel data induk sekolah: data dibaca mulai baris ke-12, kolom B = no. induk, C = kode jurusan, D = nama. NISN yang sudah ada akan diperbarui.
                            </Callout>
                            <FormField label="File Excel (.xlsx / .xls, maks. 5 MB)" htmlFor="file" required error={errors.file || errors.duplicate}>
                                <TextInput id="file" type="file" accept=".xlsx,.xls" className="w-full" invalid={!!errors.file} onChange={(e) => setData("file", e.target.files?.[0] ?? null)} />
                            </FormField>
                            {errors.details && <p className="text-xs text-slate-500">Contoh data duplikat: {errors.details}</p>}
                            {progress && (
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full bg-blue-600" style={{ width: `${progress.percentage}%` }} />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField label="No. induk" htmlFor="induk" required error={errors.induk} help="3-7 karakter">
                                <TextInput id="induk" className="w-full" value={data.induk} onChange={(e) => setData("induk", e.target.value)} invalid={!!errors.induk} />
                            </FormField>
                            <FormField label="Kode jurusan" htmlFor="jurusan" required error={errors.jurusan} help="3-20 karakter">
                                <TextInput id="jurusan" className="w-full" value={data.jurusan} onChange={(e) => setData("jurusan", e.target.value)} invalid={!!errors.jurusan} />
                            </FormField>
                            <FormField label="Nama siswa" htmlFor="nama" required error={errors.nama} className="sm:col-span-2">
                                <TextInput id="nama" className="w-full" value={data.nama} onChange={(e) => setData("nama", e.target.value)} invalid={!!errors.nama} />
                            </FormField>
                            <p className="text-xs text-slate-500 sm:col-span-2">
                                NISN yang tersimpan: <span className="font-mono font-medium text-slate-800">{data.induk + data.jurusan || "-"}</span>
                            </p>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={processing}>Batal</SecondaryButton>
                    <PrimaryButton disabled={processing || (mode === "import" && !data.file)}>
                        {processing ? <Spinner /> : mode === "import" ? <Upload /> : <Save />}
                        {mode === "import" ? "Import" : "Simpan"}
                    </PrimaryButton>
                </ModalFooter>
            </form>
        </Modal>
    );
}

export default function Index() {
    const { siswas, filters, dataSiswas = [] } = usePage().props;
    const [sortModal, setSortModal] = useState(false);
    const [form, setForm] = useState({ show: false, siswa: null });
    const { dataSearch, handleSearchChange, resetFilter, activeCount } = useListFilter("data_siswa.index", filters, ["kode", "aktivasi"]);
    const rows = siswas?.data ?? [];

    const handleDelete = (s) =>
        AlertConfirm(`Data NISN ${s.nama} (${s.nisn}) akan dihapus.`, "warning", () => router.delete(route("data_siswa.destroy", s.id), { preserveScroll: true }), "Ya, Hapus");

    const handleExport = () =>
        AlertConfirm(
            "Data NISN akan diekspor ke Excel sesuai pencarian dan filter yang aktif.",
            "question",
            () => {
                window.location.href = route("data_siswas.export", cleanParams(filters ?? {}));
            },
            "Ya, Ekspor"
        );

    return (
        <AuthenticatedLayout>
            <Head title="Data NISN Siswa" />
            <div className="space-y-6">
                <TitlePage eyebrow="Master Data" title="Data NISN Siswa" quote="Data induk siswa yang dipakai untuk aktivasi dan pembuatan akun.">
                    <SecondaryButton onClick={handleExport}>
                        <Download /> Ekspor Excel
                    </SecondaryButton>
                    <PrimaryButton type="button" onClick={() => setForm({ show: true, siswa: null })}>
                        <Plus /> Tambah Data
                    </PrimaryButton>
                </TitlePage>

                <Card className="overflow-hidden">
                    <Filter sortModal={sortModal} setSortModal={setSortModal} value={dataSearch.search} onChange={handleSearchChange} activeCount={activeCount} placeholder="Cari nama atau NISN..." />
                    <Table
                        headers={[
                            { nama: "#", className: "w-12" },
                            { nama: "NISN" },
                            { nama: "Nama" },
                            { nama: "Aktivasi" },
                            { nama: "Aksi", className: "text-right" },
                        ]}
                        minWidth="min-w-[560px]"
                    >
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((s, index) => (
                                    <Tr key={s.id}>
                                        <Td className="text-slate-500">{index + (siswas.from ?? 1)}</Td>
                                        <Td className="font-mono text-slate-800">{s.nisn}</Td>
                                        <Td className="font-medium text-slate-900">{s.nama}</Td>
                                        <Td>{s.isActive ? <Badge tone="emerald">Sudah punya akun</Badge> : <Badge>Belum aktivasi</Badge>}</Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-1">
                                                <IconButton label="Ubah data" variant="primary" onClick={() => setForm({ show: true, siswa: s })}>
                                                    <Pencil />
                                                </IconButton>
                                                <IconButton label={s.isActive ? "Tidak bisa dihapus: sudah dipakai akun" : "Hapus data"} variant="danger" disabled={Boolean(s.isActive)} onClick={() => handleDelete(s)}>
                                                    <Trash2 />
                                                </IconButton>
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={5}>
                                    {activeCount > 0 || filters?.search ? (
                                        <EmptyState title="Tidak ada data yang cocok" action={<SecondaryButton onClick={resetFilter}>Atur ulang filter</SecondaryButton>} />
                                    ) : (
                                        <EmptyState icon={<IdCard />} title="Belum ada data NISN" description="Import file Excel data induk atau tambahkan secara manual." />
                                    )}
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={siswas} />
                </Card>
            </div>

            <DataSiswaModal show={form.show} siswa={form.siswa} onClose={() => setForm({ show: false, siswa: form.siswa })} />

            <Modal show={sortModal} onClose={() => setSortModal(false)} maxWidth="lg">
                <TitleModal title="Filter & Urutkan" description="Perubahan langsung diterapkan pada tabel." onClick={() => setSortModal(false)} />
                <ModalBody className="space-y-5">
                    <OptionSorting
                        dataSearch={dataSearch}
                        handleSearchChange={handleSearchChange}
                        datas={[
                            { name: "Bawaan (terbaru)", value: "" },
                            { name: "Nama", value: "nama" },
                            { name: "NISN", value: "nisn" },
                            { name: "Status aktivasi", value: "isActive" },
                        ]}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField label="Kode jurusan" htmlFor="f-kode">
                            <Select id="f-kode" name="kode" value={dataSearch.kode} onChange={handleSearchChange}>
                                <option value="">Semua</option>
                                {dataSiswas.map((k) => (
                                    <option key={k.kode} value={k.kode}>
                                        {k.kode} ({k.total})
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Status aktivasi" htmlFor="f-aktivasi">
                            <Select id="f-aktivasi" name="aktivasi" value={dataSearch.aktivasi} onChange={handleSearchChange}>
                                <option value="">Semua</option>
                                <option value="true">Sudah punya akun</option>
                                <option value="false">Belum aktivasi</option>
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

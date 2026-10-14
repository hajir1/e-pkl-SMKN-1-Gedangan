import Badge from "@/Components/Badge";
import Callout from "@/Components/Callout";
import Card, { CardBody, CardHeader } from "@/Components/Card";
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
import TempatLahirSelect from "@/Components/TempatLahirSelect";
import TextInput from "@/Components/TextInput";
import Textarea from "@/Components/Textarea";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import { cleanParams, formatTanggal } from "@/Helpers/format";
import { useListFilter } from "@/Helpers/hooks";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    Award,
    Download,
    Eye,
    FileDown,
    Pencil,
    Plus,
    Trash2,
    UserRound,
    Users,
} from "lucide-react";
import { useState } from "react";

const ttl = (s) =>
    s?.tempat_lahir && s?.tanggal_lahir
        ? `${s.tempat_lahir}, ${formatTanggal(s.tanggal_lahir, { panjang: true })}`
        : null;

/** Rute isi TTL oleh siswa hanya ada bila patch backend dipasang. */
const ttlRouteAda = () => {
    try {
        return route().has("profile.ttl");
    } catch {
        return false;
    }
};

function DetailList({ siswa }) {
    const rows = [
        ["Nama", siswa.name],
        ["NISN", siswa.data_siswa?.nisn],
        ["Email", siswa.email],
        ["Tempat, tanggal lahir", ttl(siswa)],
        ["Kontak", siswa.kontak],
        ["Jurusan", siswa.jurusan?.nama],
        ["Tahun ajaran", siswa.tahun_ajaran?.tahun],
        ["Tempat PKL", siswa.tempat?.nama],
        ["Pembimbing DU/DI", siswa.tempat?.user?.name],
        ["Pembimbing sekolah", siswa.pb_skl?.name],
    ];
    return (
        <dl className="divide-y divide-slate-100">
            {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-3 py-2.5 text-sm">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="col-span-2 break-words font-medium text-slate-900">
                        {value || <span className="font-normal text-slate-400">Belum diisi</span>}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

function NilaiList({ nilai }) {
    if (!nilai?.length) {
        return <p className="text-sm text-slate-500">Belum ada nilai dari pembimbing.</p>;
    }
    return (
        <ul className="space-y-2">
            {nilai.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{n.pembimbing?.name ?? "Pembimbing"}</p>
                        {n.keterangan && <p className="text-xs text-slate-500">{n.keterangan}</p>}
                    </div>
                    <span className="text-lg font-semibold tabular-nums text-blue-800">{n.nilai}</span>
                </li>
            ))}
        </ul>
    );
}

/** Siswa mengisi tempat & tanggal lahir yang masih kosong. */
function TtlModal({ siswa, onClose }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        tempat_lahir: "",
        tanggal_lahir: "",
    });
    const submit = (e) => {
        e.preventDefault();
        patch(route("profile.ttl"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };
    return (
        <Modal show={Boolean(siswa)} onClose={processing ? () => {} : onClose} maxWidth="lg">
            <TitleModal title="Lengkapi Tempat & Tanggal Lahir" description="Data ini dipakai pada rekap dan laporan PKL." onClick={onClose} />
            <form onSubmit={submit} noValidate>
                <ModalBody className="space-y-4">
                    <TempatLahirSelect value={data.tempat_lahir} onChange={(v) => setData("tempat_lahir", v)} error={errors.tempat_lahir} />
                    <FormField label="Tanggal lahir" htmlFor="tanggal_lahir" required error={errors.tanggal_lahir}>
                        <TextInput
                            id="tanggal_lahir"
                            type="date"
                            className="w-full"
                            max={new Date().toISOString().slice(0, 10)}
                            invalid={!!errors.tanggal_lahir}
                            value={data.tanggal_lahir}
                            onChange={(e) => setData("tanggal_lahir", e.target.value)}
                        />
                    </FormField>
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={processing}>Batal</SecondaryButton>
                    <PrimaryButton disabled={processing || !data.tempat_lahir || !data.tanggal_lahir}>
                        {processing && <Spinner />} Simpan
                    </PrimaryButton>
                </ModalFooter>
            </form>
        </Modal>
    );
}

/** Pembimbing memberi nilai akhir (sekali, tidak bisa diubah). */
function NilaiModal({ siswa, onClose }) {
    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
        user_id: "",
        nilai: "",
        keterangan: "",
    });

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        const angka = Number(data.nilai);
        if (data.nilai === "" || Number.isNaN(angka) || angka < 0 || angka > 100) {
            setError("nilai", "Nilai harus berupa angka 0 sampai 100");
            return;
        }
        if (!data.keterangan.trim()) {
            setError("keterangan", "Keterangan wajib diisi");
            return;
        }
        AlertConfirm(
            `Nilai ${data.nilai} untuk ${siswa.name} tidak bisa diubah atau dihapus setelah disimpan. Pastikan nilai sudah sesuai kinerja siswa selama PKL.`,
            "warning",
            () =>
                post(route("nilai.store"), {
                    preserveScroll: true,
                    transform: (d) => ({ ...d, user_id: siswa.id }),
                    onSuccess: () => {
                        reset();
                        onClose();
                    },
                }),
            "Ya, Simpan Nilai"
        );
    };

    return (
        <Modal show={Boolean(siswa)} onClose={processing ? () => {} : onClose} maxWidth="lg">
            <TitleModal title="Beri Nilai Akhir" description={siswa?.name} onClick={onClose} />
            <form onSubmit={submit} noValidate>
                <ModalBody className="space-y-4">
                    <Callout tone="warning">Nilai hanya bisa diberikan satu kali dan tidak dapat diubah.</Callout>
                    <FormField label="Nilai (0-100)" htmlFor="nilai" required error={errors.nilai || errors.user_id}>
                        <TextInput
                            id="nilai"
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            className="w-full sm:w-40"
                            invalid={!!errors.nilai}
                            value={data.nilai}
                            onChange={(e) => setData("nilai", e.target.value)}
                        />
                    </FormField>
                    <FormField label="Keterangan" htmlFor="keterangan" required error={errors.keterangan} help={`${data.keterangan.length}/200 karakter`}>
                        <Textarea
                            id="keterangan"
                            maxLength={200}
                            invalid={!!errors.keterangan}
                            value={data.keterangan}
                            onChange={(e) => setData("keterangan", e.target.value)}
                            placeholder="Contoh: Disiplin, mampu bekerja sama dalam tim."
                        />
                    </FormField>
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={processing}>Batal</SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {processing ? <Spinner /> : <Award />} Simpan Nilai
                    </PrimaryButton>
                </ModalFooter>
            </form>
        </Modal>
    );
}

function ProfilSiswa({ siswa }) {
    const [ttlModal, setTtlModal] = useState(false);
    const bisaIsiTtl = !ttl(siswa) && ttlRouteAda();
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
            <Card className="lg:col-span-2">
                <CardHeader
                    icon={<UserRound />}
                    title="Data PKL Saya"
                    action={
                        <a
                            href={route("exportSiswaToPdf", siswa.id)}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            <FileDown className="h-4 w-4" /> Unduh PDF
                        </a>
                    }
                />
                <CardBody className="py-1">
                    <DetailList siswa={siswa} />
                </CardBody>
                {!ttl(siswa) && (
                    <CardBody className="pt-0">
                        <Callout
                            tone="warning"
                            title="Tempat dan tanggal lahir belum diisi"
                            action={
                                bisaIsiTtl && (
                                    <PrimaryButton type="button" onClick={() => setTtlModal(true)}>
                                        Lengkapi
                                    </PrimaryButton>
                                )
                            }
                        >
                            {bisaIsiTtl ? "Lengkapi data ini agar rekap PKL Anda lengkap." : "Hubungi admin sekolah untuk melengkapi data ini."}
                        </Callout>
                    </CardBody>
                )}
            </Card>
            <Card>
                <CardHeader icon={<Award />} title="Nilai PKL" />
                <CardBody>
                    <NilaiList nilai={siswa.nilai} />
                </CardBody>
            </Card>
            {bisaIsiTtl && <TtlModal siswa={ttlModal ? siswa : null} onClose={() => setTtlModal(false)} />}
        </div>
    );
}

export default function Index() {
    const { siswas, auth, filters, jurusans = [], tahunAjarans = [], tempats = [] } = usePage().props;
    const role = auth.role;
    const isAdmin = role === "admin";
    const isPembimbing = role === "pembimbing_pt" || role === "pembimbing_sekolah";
    const [sortModal, setSortModal] = useState(false);
    const [detail, setDetail] = useState(null);
    const [nilaiFor, setNilaiFor] = useState(null);
    const { dataSearch, handleSearchChange, resetFilter, activeCount } = useListFilter("siswa.index", filters, ["tahunAjaran", "jurusan", "tempat"]);

    const rows = siswas?.data ?? [];

    if (role === "siswa") {
        return (
            <AuthenticatedLayout>
                <Head title="Data Saya" />
                <div className="space-y-6">
                    <TitlePage eyebrow="Akun" title="Data PKL Saya" quote="Ringkasan data diri, tempat PKL, pembimbing, dan nilai Anda." />
                    {rows[0] ? (
                        <ProfilSiswa siswa={rows[0]} />
                    ) : (
                        <Card>
                            <EmptyState title="Data siswa tidak ditemukan" description="Hubungi admin sekolah." />
                        </Card>
                    )}
                </div>
            </AuthenticatedLayout>
        );
    }

    const handleDelete = (siswa) =>
        AlertConfirm(
            `Akun ${siswa.name} akan dihapus dan NISN-nya dinonaktifkan. Lanjutkan?`,
            "warning",
            () => router.delete(route("siswa.destroy", siswa.id), { preserveScroll: true }),
            "Ya, Hapus"
        );

    const handleExport = () =>
        AlertConfirm(
            "Data siswa akan diekspor ke Excel sesuai pencarian dan filter yang sedang aktif.",
            "question",
            () => {
                window.location.href = route("exportSiswas", cleanParams(filters ?? {}));
            },
            "Ya, Ekspor"
        );

    const sudahDinilai = (siswa) => siswa.nilai?.some((n) => n.pembimbing?.id === auth.user.id || n.pembimbing_id === auth.user.id);

    return (
        <AuthenticatedLayout>
            <Head title="Data Siswa" />
            <div className="space-y-6">
                <TitlePage
                    eyebrow="Data PKL"
                    title={isAdmin ? "Data Siswa" : "Siswa Bimbingan"}
                    quote={isAdmin ? "Kelola akun siswa PKL beserta tempat dan pembimbingnya." : "Daftar siswa yang Anda bimbing. Beri nilai akhir setelah PKL selesai."}
                >
                    <SecondaryButton onClick={handleExport}>
                        <Download /> Ekspor Excel
                    </SecondaryButton>
                    {isAdmin && (
                        <Link
                            href={route("siswa.create")}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            <Plus className="h-4 w-4" /> Tambah Siswa
                        </Link>
                    )}
                </TitlePage>

                <Card className="overflow-hidden">
                    <Filter
                        sortModal={sortModal}
                        setSortModal={setSortModal}
                        value={dataSearch.search}
                        onChange={handleSearchChange}
                        activeCount={activeCount}
                        placeholder="Cari nama, email, tempat, pembimbing..."
                    />
                    <Table
                        headers={[
                            { nama: "#", className: "w-12" },
                            { nama: "Siswa" },
                            { nama: "Jurusan / TA" },
                            { nama: "Tempat PKL" },
                            { nama: "Pembimbing" },
                            { nama: "Nilai" },
                            { nama: "Aksi", className: "text-right" },
                        ]}
                        minWidth="min-w-[900px]"
                    >
                        <tbody>
                            {rows.length > 0 ? (
                                rows.map((siswa, index) => (
                                    <Tr key={siswa.id}>
                                        <Td className="text-slate-500">{index + (siswas.from ?? 1)}</Td>
                                        <Td>
                                            <p className="font-medium text-slate-900">{siswa.name}</p>
                                            <p className="text-xs text-slate-500">
                                                NISN {siswa.data_siswa?.nisn ?? "-"} · {siswa.email}
                                            </p>
                                        </Td>
                                        <Td>
                                            <p className="text-slate-900">{siswa.jurusan?.nama ?? "-"}</p>
                                            <p className="text-xs text-slate-500">{siswa.tahun_ajaran?.tahun ?? "Tahun ajaran belum diisi"}</p>
                                        </Td>
                                        <Td>{siswa.tempat?.nama ?? <span className="text-slate-400">Belum ada</span>}</Td>
                                        <Td>
                                            <p className="text-xs text-slate-500">
                                                DU/DI: <span className="text-slate-800">{siswa.tempat?.user?.name ?? "-"}</span>
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Sekolah: <span className="text-slate-800">{siswa.pb_skl?.name ?? "-"}</span>
                                            </p>
                                        </Td>
                                        <Td>
                                            {siswa.nilai?.length ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {siswa.nilai.map((n) => (
                                                        <Badge key={n.id} tone="blue">
                                                            <span title={n.pembimbing?.name}>{n.nilai}</span>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">Belum dinilai</span>
                                            )}
                                        </Td>
                                        <Td>
                                            <div className="flex items-center justify-end gap-1">
                                                <IconButton label="Lihat detail" onClick={() => setDetail(siswa)}>
                                                    <Eye />
                                                </IconButton>
                                                <IconButton label="Unduh PDF rekap" href={route("exportSiswaToPdf", siswa.id)} external>
                                                    <FileDown />
                                                </IconButton>
                                                {isPembimbing && !sudahDinilai(siswa) && (
                                                    <IconButton label="Beri nilai" variant="primary" onClick={() => setNilaiFor(siswa)}>
                                                        <Award />
                                                    </IconButton>
                                                )}
                                                {isAdmin && (
                                                    <>
                                                        <IconButton label="Ubah siswa" variant="primary" href={route("siswa.edit", siswa.id)}>
                                                            <Pencil />
                                                        </IconButton>
                                                        <IconButton label="Hapus siswa" variant="danger" onClick={() => handleDelete(siswa)}>
                                                            <Trash2 />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                ))
                            ) : (
                                <TableEmpty colSpan={7}>
                                    {activeCount > 0 || filters?.search ? (
                                        <EmptyState
                                            title="Tidak ada siswa yang cocok"
                                            description="Coba ubah kata kunci atau atur ulang filter."
                                            action={<SecondaryButton onClick={resetFilter}>Atur ulang filter</SecondaryButton>}
                                        />
                                    ) : (
                                        <EmptyState
                                            icon={<Users />}
                                            title={isAdmin ? "Belum ada siswa" : "Belum ada siswa bimbingan"}
                                            description={isAdmin ? "Tambahkan siswa dari data NISN yang sudah diimpor." : "Siswa akan muncul setelah admin menetapkan Anda sebagai pembimbing."}
                                        />
                                    )}
                                </TableEmpty>
                            )}
                        </tbody>
                    </Table>
                    <Pagination datas={siswas} />
                </Card>
            </div>

            <Modal show={Boolean(detail)} onClose={() => setDetail(null)} maxWidth="2xl">
                <TitleModal title="Detail Siswa" description={detail?.name} onClick={() => setDetail(null)} />
                {detail && (
                    <ModalBody className="grid gap-6 md:grid-cols-5">
                        <div className="md:col-span-3">
                            <DetailList siswa={detail} />
                        </div>
                        <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-semibold text-slate-900">Nilai</p>
                            <NilaiList nilai={detail.nilai} />
                        </div>
                    </ModalBody>
                )}
            </Modal>

            {isPembimbing && <NilaiModal siswa={nilaiFor} onClose={() => setNilaiFor(null)} />}

            <Modal show={sortModal} onClose={() => setSortModal(false)} maxWidth="lg">
                <TitleModal title="Filter & Urutkan Siswa" description="Perubahan langsung diterapkan pada tabel." onClick={() => setSortModal(false)} />
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
                            { name: "Tempat DU/DI", value: "tempat_id" },
                        ]}
                    />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <FormField label="Tahun ajaran" htmlFor="f-ta">
                            <Select id="f-ta" name="tahunAjaran" value={dataSearch.tahunAjaran} onChange={handleSearchChange}>
                                <option value="">Semua</option>
                                {tahunAjarans.map((ta) => (
                                    <option key={ta.id} value={ta.tahun}>{ta.tahun}</option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Jurusan" htmlFor="f-jurusan">
                            <Select id="f-jurusan" name="jurusan" value={dataSearch.jurusan} onChange={handleSearchChange}>
                                <option value="">Semua</option>
                                {jurusans.map((j) => (
                                    <option key={j.id} value={j.nama}>{j.nama}</option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Tempat PKL" htmlFor="f-tempat">
                            <Select id="f-tempat" name="tempat" value={dataSearch.tempat} onChange={handleSearchChange}>
                                <option value="">Semua</option>
                                {tempats.map((t) => (
                                    <option key={t.id} value={t.nama}>{t.nama}</option>
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

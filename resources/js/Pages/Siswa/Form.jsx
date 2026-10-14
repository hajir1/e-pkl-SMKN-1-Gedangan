import Callout from "@/Components/Callout";
import Card, { CardBody, CardHeader } from "@/Components/Card";
import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Select from "@/Components/Select";
import Spinner from "@/Components/Spinner";
import TempatLahirSelect from "@/Components/TempatLahirSelect";
import TextInput from "@/Components/TextInput";
import TitlePage from "@/Components/TitlePage";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Building2, KeyRound, Save, UserRound } from "lucide-react";

const KONTAK_REGEX = /^0[0-9]{9,12}$/;

export default function Form({
    jurusans = [],
    tahunAjarans = [],
    pembimbing_sekolahs = [],
    isEdit = false,
    user,
    tempats = [],
    dataSiswas = [],
}) {
    const awal = {
        nisn: isEdit ? (user?.data_siswa?.nisn ?? "") : "",
        email: isEdit ? (user?.email ?? "") : "",
        tempat_lahir: isEdit ? (user?.tempat_lahir ?? "") : "",
        tanggal_lahir: isEdit ? (user?.tanggal_lahir ?? "") : "",
        tahunAjaran_id: isEdit ? (user?.tahun_ajaran?.id ?? "") : "",
        jurusan_id: isEdit ? (user?.jurusan?.id ?? "") : "",
        pembimbing_sekolah_id: isEdit ? (user?.pb_skl?.id ?? "") : "",
        tempat_id: isEdit ? (user?.tempat?.id ?? "") : "",
        kontak: isEdit ? (user?.kontak ?? "") : "",
        password: "",
        password_confirmation: "",
    };
    const { data, setData, errors, post, put, processing, reset, setError, clearErrors } = useForm(awal);

    const set = (key) => (e) => setData(key, e.target.value);

    const validasi = () => {
        const err = {};
        if (!data.nisn) err.nisn = "Pilih siswa (NISN) terlebih dahulu";
        if (!data.email) err.email = "Email wajib diisi";
        if (!data.jurusan_id) err.jurusan_id = "Jurusan wajib dipilih";
        if (!data.tempat_lahir) err.tempat_lahir = "Tempat lahir wajib dipilih";
        if (!data.tanggal_lahir) err.tanggal_lahir = "Tanggal lahir wajib diisi";
        if (!KONTAK_REGEX.test(data.kontak)) err.kontak = "Nomor HP 10-13 digit dan diawali angka 0";
        if (!isEdit || data.password) {
            if (data.password.length < 8) err.password = "Password minimal 8 karakter";
            else if (data.password !== data.password_confirmation)
                err.password_confirmation = "Konfirmasi password tidak sama";
        }
        return err;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        const err = validasi();
        if (Object.keys(err).length) {
            setError(err);
            return;
        }
        if (isEdit) {
            put(route("siswa.update", user.id), {
                preserveScroll: true,
                onSuccess: () => reset("password", "password_confirmation"),
            });
        } else {
            post(route("siswa.store"), {
                preserveScroll: true,
                onSuccess: (page) => {
                    if (!page.props.auth?.flash?.error) reset();
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? "Ubah Siswa" : "Tambah Siswa"} />
            <div className="space-y-6">
                <TitlePage
                    eyebrow="Data Siswa"
                    title={isEdit ? `Ubah ${user?.name ?? "Siswa"}` : "Tambah Siswa"}
                    quote={
                        isEdit
                            ? "Perbarui data akun, tempat PKL, dan pembimbing siswa."
                            : "Buat akun siswa dari data NISN yang sudah diimpor admin."
                    }
                >
                    <Link
                        href={route("siswa.index")}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </TitlePage>

                {!isEdit && dataSiswas.length === 0 && (
                    <Callout
                        tone="warning"
                        title="Tidak ada NISN yang tersedia"
                        action={
                            <Link href={route("data_siswa.index")} className="text-sm font-semibold underline">
                                Kelola data NISN
                            </Link>
                        }
                    >
                        Semua NISN sudah memiliki akun. Impor atau tambahkan data siswa terlebih dahulu.
                    </Callout>
                )}

                <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader icon={<UserRound />} title="Identitas siswa" />
                            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField
                                    label="Siswa (NISN)"
                                    htmlFor="nisn"
                                    required
                                    error={errors.nisn}
                                    className="sm:col-span-2"
                                    help={isEdit ? "NISN tidak bisa diubah." : undefined}
                                >
                                    <Select id="nisn" value={data.nisn} onChange={set("nisn")} disabled={isEdit} invalid={!!errors.nisn}>
                                        <option value="">Pilih siswa</option>
                                        {dataSiswas.map((ds) => (
                                            <option key={ds.id} value={ds.nisn}>
                                                {ds.nama} · {ds.nisn}
                                            </option>
                                        ))}
                                    </Select>
                                </FormField>
                                <FormField label="Email" htmlFor="email" required error={errors.email}>
                                    <TextInput id="email" type="email" autoComplete="off" className="w-full" value={data.email} onChange={set("email")} invalid={!!errors.email} />
                                </FormField>
                                <FormField label="No. HP" htmlFor="kontak" required error={errors.kontak} help="Contoh: 081234567890">
                                    <TextInput id="kontak" inputMode="tel" className="w-full" value={data.kontak} onChange={set("kontak")} invalid={!!errors.kontak} />
                                </FormField>
                                <div className="sm:col-span-2">
                                    <TempatLahirSelect value={data.tempat_lahir} onChange={(v) => setData("tempat_lahir", v)} error={errors.tempat_lahir} />
                                </div>
                                <FormField label="Tanggal lahir" htmlFor="tanggal_lahir" required error={errors.tanggal_lahir}>
                                    <TextInput
                                        id="tanggal_lahir"
                                        type="date"
                                        className="w-full"
                                        max={new Date().toISOString().slice(0, 10)}
                                        value={data.tanggal_lahir ?? ""}
                                        onChange={set("tanggal_lahir")}
                                        invalid={!!errors.tanggal_lahir}
                                    />
                                </FormField>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader icon={<Building2 />} title="Penempatan PKL" />
                            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField label="Jurusan" htmlFor="jurusan_id" required error={errors.jurusan_id}>
                                    <Select id="jurusan_id" value={data.jurusan_id} onChange={set("jurusan_id")} invalid={!!errors.jurusan_id}>
                                        <option value="">Pilih jurusan</option>
                                        {jurusans.map((j) => (
                                            <option key={j.id} value={j.id}>{j.nama}</option>
                                        ))}
                                    </Select>
                                </FormField>
                                <FormField label="Tahun ajaran" htmlFor="tahunAjaran_id" error={errors.tahunAjaran_id}>
                                    <Select id="tahunAjaran_id" value={data.tahunAjaran_id} onChange={set("tahunAjaran_id")}>
                                        <option value="">{isEdit ? "Tidak diubah" : "Pilih tahun ajaran"}</option>
                                        {tahunAjarans.map((ta) => (
                                            <option key={ta.id} value={ta.id}>{ta.tahun}</option>
                                        ))}
                                    </Select>
                                </FormField>
                                <FormField label="Tempat PKL (DU/DI)" htmlFor="tempat_id" error={errors.tempat_id}>
                                    <Select id="tempat_id" value={data.tempat_id} onChange={set("tempat_id")}>
                                        <option value="">{isEdit ? "Tidak diubah" : "Belum ditentukan"}</option>
                                        {tempats.map((t) => (
                                            <option key={t.id} value={t.id}>{t.nama}</option>
                                        ))}
                                    </Select>
                                </FormField>
                                <FormField label="Pembimbing sekolah" htmlFor="pembimbing_sekolah_id" error={errors.pembimbing_sekolah_id}>
                                    <Select id="pembimbing_sekolah_id" value={data.pembimbing_sekolah_id} onChange={set("pembimbing_sekolah_id")}>
                                        <option value="">{isEdit ? "Tidak diubah" : "Belum ditentukan"}</option>
                                        {pembimbing_sekolahs.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </Select>
                                </FormField>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader
                                icon={<KeyRound />}
                                title="Password"
                                description={isEdit ? "Kosongkan bila tidak ingin mengganti password." : undefined}
                            />
                            <CardBody className="space-y-4">
                                <FormField label="Password" htmlFor="password" required={!isEdit} error={errors.password} help="Minimal 8 karakter.">
                                    <TextInput id="password" type="password" autoComplete="new-password" className="w-full" value={data.password} onChange={set("password")} invalid={!!errors.password} />
                                </FormField>
                                <FormField label="Konfirmasi password" htmlFor="password_confirmation" required={!isEdit} error={errors.password_confirmation}>
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        className="w-full"
                                        value={data.password_confirmation}
                                        onChange={set("password_confirmation")}
                                        invalid={!!errors.password_confirmation}
                                    />
                                </FormField>
                            </CardBody>
                        </Card>
                        <PrimaryButton disabled={processing} className="w-full">
                            {processing ? <Spinner /> : <Save />}
                            {isEdit ? "Simpan Perubahan" : "Tambah Siswa"}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

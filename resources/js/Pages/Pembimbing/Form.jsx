import Card, { CardBody, CardHeader } from "@/Components/Card";
import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Select from "@/Components/Select";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import TitlePage from "@/Components/TitlePage";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Building2, GraduationCap, KeyRound, Save, UserCog } from "lucide-react";

const KONTAK_REGEX = /^0[0-9]{9,12}$/;

const PERAN = [
    { value: "pembimbing_sekolah", label: "Pembimbing Sekolah", desc: "Guru yang membimbing siswa dari sekolah.", icon: <GraduationCap /> },
    { value: "pembimbing_pt", label: "Pembimbing DU/DI", desc: "Pembimbing dari tempat PKL (perusahaan/instansi).", icon: <Building2 /> },
];

export default function Form({ jurusans = [], tahunAjarans = [], isEdit = false, user }) {
    const { data, setData, errors, post, put, processing, reset, setError, clearErrors } = useForm({
        name: isEdit ? (user?.name ?? "") : "",
        email: isEdit ? (user?.email ?? "") : "",
        password: "",
        password_confirmation: "",
        tahunAjaran_id: isEdit ? (user?.tahun_ajaran?.id ?? "") : "",
        jurusan_id: isEdit ? (user?.jurusan?.id ?? "") : "",
        kontak: isEdit ? (user?.kontak ?? "") : "",
        role: isEdit ? (user?.roles?.[0]?.name ?? "") : "",
    });
    const set = (key) => (e) => setData(key, e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        const err = {};
        if (!data.name.trim()) err.name = "Nama wajib diisi";
        if (!data.email) err.email = "Email wajib diisi";
        if (!data.role) err.role = "Pilih peran pembimbing";
        if (!KONTAK_REGEX.test(data.kontak)) err.kontak = "Nomor HP 10-13 digit dan diawali angka 0";
        if (!isEdit) {
            if (data.password.length < 8) err.password = "Password minimal 8 karakter";
            else if (data.password !== data.password_confirmation) err.password_confirmation = "Konfirmasi password tidak sama";
        }
        if (Object.keys(err).length) {
            setError(err);
            return;
        }
        if (isEdit) {
            put(route("pembimbing.update", user.id), { preserveScroll: true });
        } else {
            post(route("pembimbing.store"), {
                preserveScroll: true,
                onSuccess: (page) => {
                    if (!page.props.auth?.flash?.error) reset();
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={isEdit ? "Ubah Pembimbing" : "Tambah Pembimbing"} />
            <div className="space-y-6">
                <TitlePage
                    eyebrow="Master Data"
                    title={isEdit ? `Ubah ${user?.name ?? "Pembimbing"}` : "Tambah Pembimbing"}
                    quote={isEdit ? "Perbarui data akun pembimbing." : "Buat akun untuk pembimbing sekolah atau DU/DI."}
                >
                    <Link
                        href={route("pembimbing.index")}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4" /> Kembali
                    </Link>
                </TitlePage>

                <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader icon={<UserCog />} title="Peran" />
                            <CardBody>
                                <fieldset>
                                    <legend className="sr-only">Peran pembimbing</legend>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {PERAN.map((p) => (
                                            <label
                                                key={p.value}
                                                className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition focus-within:ring-2 focus-within:ring-blue-500 ${
                                                    data.role === p.value ? "border-blue-600 bg-blue-50/60" : "border-slate-200 hover:border-slate-300"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={p.value}
                                                    checked={data.role === p.value}
                                                    onChange={set("role")}
                                                    className="sr-only"
                                                />
                                                <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&_svg]:h-[18px] [&_svg]:w-[18px] ${data.role === p.value ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}>
                                                    {p.icon}
                                                </span>
                                                <span>
                                                    <span className="block text-sm font-semibold text-slate-900">{p.label}</span>
                                                    <span className="block text-xs text-slate-500">{p.desc}</span>
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.role && <p role="alert" className="mt-2 text-sm text-rose-600">{errors.role}</p>}
                                </fieldset>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader title="Data pembimbing" />
                            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField label="Nama lengkap dan gelar" htmlFor="name" required error={errors.name} className="sm:col-span-2">
                                    <TextInput id="name" className="w-full" value={data.name} onChange={set("name")} invalid={!!errors.name} />
                                </FormField>
                                <FormField label="Email" htmlFor="email" required error={errors.email}>
                                    <TextInput id="email" type="email" autoComplete="off" className="w-full" value={data.email} onChange={set("email")} invalid={!!errors.email} />
                                </FormField>
                                <FormField label="No. HP" htmlFor="kontak" required error={errors.kontak} help="Contoh: 081234567890">
                                    <TextInput id="kontak" inputMode="tel" className="w-full" value={data.kontak} onChange={set("kontak")} invalid={!!errors.kontak} />
                                </FormField>
                                <FormField label="Jurusan" htmlFor="jurusan_id" error={errors.jurusan_id}>
                                    <Select id="jurusan_id" value={data.jurusan_id} onChange={set("jurusan_id")}>
                                        <option value="">{isEdit ? "Tidak diubah" : "Tidak ada"}</option>
                                        {jurusans.map((j) => (
                                            <option key={j.id} value={j.id}>{j.nama}</option>
                                        ))}
                                    </Select>
                                </FormField>
                                <FormField label="Tahun ajaran" htmlFor="tahunAjaran_id" error={errors.tahunAjaran_id}>
                                    <Select id="tahunAjaran_id" value={data.tahunAjaran_id} onChange={set("tahunAjaran_id")}>
                                        <option value="">{isEdit ? "Tidak diubah" : "Tidak ada"}</option>
                                        {tahunAjarans.map((ta) => (
                                            <option key={ta.id} value={ta.id}>{ta.tahun}</option>
                                        ))}
                                    </Select>
                                </FormField>
                            </CardBody>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        {!isEdit && (
                            <Card>
                                <CardHeader icon={<KeyRound />} title="Password" />
                                <CardBody className="space-y-4">
                                    <FormField label="Password" htmlFor="password" required error={errors.password} help="Minimal 8 karakter.">
                                        <TextInput id="password" type="password" autoComplete="new-password" className="w-full" value={data.password} onChange={set("password")} invalid={!!errors.password} />
                                    </FormField>
                                    <FormField label="Konfirmasi password" htmlFor="password_confirmation" required error={errors.password_confirmation}>
                                        <TextInput id="password_confirmation" type="password" autoComplete="new-password" className="w-full" value={data.password_confirmation} onChange={set("password_confirmation")} invalid={!!errors.password_confirmation} />
                                    </FormField>
                                </CardBody>
                            </Card>
                        )}
                        <PrimaryButton disabled={processing} className="w-full">
                            {processing ? <Spinner /> : <Save />}
                            {isEdit ? "Simpan Perubahan" : "Tambah Pembimbing"}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

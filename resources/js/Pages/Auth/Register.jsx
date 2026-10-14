import Callout from "@/Components/Callout";
import Checkbox from "@/Components/Checkbox";
import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Select from "@/Components/Select";
import Spinner from "@/Components/Spinner";
import TempatLahirSelect from "@/Components/TempatLahirSelect";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { UserPlus } from "lucide-react";

const KONTAK_REGEX = /^0[0-9]{9,12}$/;

export default function Register() {
    const { jurusans = [], tahunAjarans = [], siswa } = usePage().props;
    const captcha = useRef();
    const [setuju, setSetuju] = useState(false);
    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
        nisn: siswa?.nisn ?? "",
        email: "",
        kontak: "",
        tempat_lahir: "",
        tanggal_lahir: "",
        jurusan_id: "",
        tahunAjaran_id: "",
        "g-recaptcha-response": "",
        password: "",
        password_confirmation: "",
    });
    const set = (k) => (e) => setData(k, e.target.value);

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        const err = {};
        if (!data.email) err.email = "Email wajib diisi";
        if (!KONTAK_REGEX.test(data.kontak)) err.kontak = "Nomor HP 10-13 digit dan diawali angka 0";
        if (!data.jurusan_id) err.jurusan_id = "Pilih jurusan";
        if (!data.tahunAjaran_id) err.tahunAjaran_id = "Pilih tahun ajaran";
        if (!data.tempat_lahir) err.tempat_lahir = "Pilih tempat lahir";
        if (!data.tanggal_lahir) err.tanggal_lahir = "Isi tanggal lahir";
        if (data.password.length < 8) err.password = "Password minimal 8 karakter";
        else if (data.password !== data.password_confirmation) err.password_confirmation = "Konfirmasi password tidak sama";
        if (!data["g-recaptcha-response"]) err["g-recaptcha-response"] = "Selesaikan verifikasi CAPTCHA";
        if (Object.keys(err).length) return setError(err);

        post(route("register.store"), {
            onError: () => {
                // Token CAPTCHA hanya berlaku sekali.
                captcha.current?.reset();
                setData("g-recaptcha-response", "");
            },
            onSuccess: () => reset(),
        });
    };

    return (
        <GuestLayout wide title="Lengkapi Data Akun" description="Satu langkah lagi untuk membuat akun E-PKL Anda.">
            <Head title="Registrasi" />
            <form onSubmit={submit} noValidate className="space-y-5">
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm">
                    <p className="text-slate-500">Mendaftar sebagai</p>
                    <p className="font-semibold text-slate-900">
                        {siswa?.nama} <span className="font-mono font-normal text-slate-500">· {siswa?.nisn}</span>
                    </p>
                </div>

                {/* Error CAPTCHA dari server dikirim dengan key "error" dan sebelumnya tidak ditampilkan. */}
                {errors.error && <Callout tone="danger">{errors.error}</Callout>}
                {errors.nisn && <Callout tone="danger">{errors.nisn}</Callout>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Email" htmlFor="email" required error={errors.email}>
                        <TextInput id="email" type="email" autoComplete="email" className="w-full" value={data.email} onChange={set("email")} invalid={!!errors.email} />
                    </FormField>
                    <FormField label="No. HP / WhatsApp" htmlFor="kontak" required error={errors.kontak} help="Contoh: 081234567890">
                        <TextInput id="kontak" inputMode="tel" className="w-full" value={data.kontak} onChange={set("kontak")} invalid={!!errors.kontak} />
                    </FormField>
                    <FormField label="Jurusan" htmlFor="jurusan_id" required error={errors.jurusan_id}>
                        <Select id="jurusan_id" value={data.jurusan_id} onChange={set("jurusan_id")} invalid={!!errors.jurusan_id}>
                            <option value="">Pilih jurusan</option>
                            {jurusans.map((j) => (
                                <option key={j.id} value={j.id}>{j.nama}</option>
                            ))}
                        </Select>
                    </FormField>
                    <FormField label="Tahun ajaran" htmlFor="tahunAjaran_id" required error={errors.tahunAjaran_id}>
                        <Select id="tahunAjaran_id" value={data.tahunAjaran_id} onChange={set("tahunAjaran_id")} invalid={!!errors.tahunAjaran_id}>
                            <option value="">Pilih tahun ajaran</option>
                            {tahunAjarans.map((t) => (
                                <option key={t.id} value={t.id}>{t.tahun}</option>
                            ))}
                        </Select>
                    </FormField>
                    <div className="sm:col-span-2">
                        <TempatLahirSelect value={data.tempat_lahir} onChange={(v) => setData("tempat_lahir", v)} error={errors.tempat_lahir} />
                    </div>
                    <FormField label="Tanggal lahir" htmlFor="tanggal_lahir" required error={errors.tanggal_lahir}>
                        <TextInput id="tanggal_lahir" type="date" max={new Date().toISOString().slice(0, 10)} className="w-full" value={data.tanggal_lahir} onChange={set("tanggal_lahir")} invalid={!!errors.tanggal_lahir} />
                    </FormField>
                    <div className="hidden sm:block" />
                    <FormField label="Password" htmlFor="password" required error={errors.password} help="Minimal 8 karakter.">
                        <TextInput id="password" type="password" autoComplete="new-password" className="w-full" value={data.password} onChange={set("password")} invalid={!!errors.password} />
                    </FormField>
                    <FormField label="Konfirmasi password" htmlFor="password_confirmation" required error={errors.password_confirmation}>
                        <TextInput id="password_confirmation" type="password" autoComplete="new-password" className="w-full" value={data.password_confirmation} onChange={set("password_confirmation")} invalid={!!errors.password_confirmation} />
                    </FormField>
                </div>

                <FormField error={errors["g-recaptcha-response"]}>
                    <ReCAPTCHA ref={captcha} onChange={(token) => setData("g-recaptcha-response", token ?? "")} sitekey={import.meta.env.VITE_SITE_KEY ?? ""} />
                </FormField>

                <label className="flex items-start gap-3 text-sm text-slate-700">
                    <Checkbox className="mt-0.5" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} />
                    Saya menyatakan bahwa saya siswa/siswi SMKN 1 Gedangan dan data yang saya isi adalah benar.
                </label>

                <PrimaryButton className="w-full" disabled={processing || !setuju}>
                    {processing ? <Spinner /> : <UserPlus />} Buat Akun
                </PrimaryButton>
                <p className="text-center text-sm text-slate-600">
                    Sudah punya akun?{" "}
                    <Link href={route("login")} className="font-semibold text-blue-700 hover:underline">
                        Masuk
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}

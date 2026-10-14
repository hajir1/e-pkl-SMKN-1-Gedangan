import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import { Link, useForm, usePage } from "@inertiajs/react";
import { CheckCircle2, Save } from "lucide-react";

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = "" }) {
    // Sebelumnya `user` tidak didefinisikan sehingga halaman crash bila
    // mustVerifyEmail bernilai true.
    const { auth } = usePage().props;
    const user = auth.user;
    const isSiswa = auth.role === "siswa";
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route("profile.update"), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} noValidate className={`space-y-4 ${className}`}>
            <FormField
                label="Nama"
                htmlFor="name"
                required
                error={errors.name}
                help={isSiswa ? "Nama siswa mengikuti data induk sekolah dan hanya bisa diubah admin." : undefined}
            >
                <TextInput id="name" className="w-full" value={data.name} readOnly={isSiswa} onChange={(e) => setData("name", e.target.value)} autoComplete="name" invalid={!!errors.name} />
            </FormField>
            <FormField label="Email" htmlFor="email" required error={errors.email}>
                <TextInput id="email" type="email" className="w-full" value={data.email} onChange={(e) => setData("email", e.target.value)} autoComplete="username" invalid={!!errors.email} />
            </FormField>

            {mustVerifyEmail && !user.email_verified_at && (
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Email Anda belum terverifikasi.{" "}
                    <Link href={route("verification.send")} method="post" as="button" className="font-medium underline">
                        Kirim ulang email verifikasi
                    </Link>
                    {status === "verification-link-sent" && <p className="mt-1 font-medium text-emerald-700">Link verifikasi baru telah dikirim ke email Anda.</p>}
                </div>
            )}

            <div className="flex items-center gap-3">
                <PrimaryButton disabled={processing}>
                    {processing ? <Spinner /> : <Save />} Simpan
                </PrimaryButton>
                {recentlySuccessful && (
                    <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700" role="status">
                        <CheckCircle2 className="h-4 w-4" /> Tersimpan
                    </p>
                )}
            </div>
        </form>
    );
}

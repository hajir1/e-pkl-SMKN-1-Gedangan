import Callout from "@/Components/Callout";
import Checkbox from "@/Components/Checkbox";
import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";

export default function Login({ status, canResetPassword }) {
    const [lihat, setLihat] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ email: "", password: "", remember: false });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), { onFinish: () => reset("password") });
    };

    return (
        <GuestLayout title="Masuk ke E-PKL" description="Gunakan email dan password akun Anda.">
            <Head title="Masuk" />
            {status && (
                <Callout tone="success" className="mb-5">
                    {status}
                </Callout>
            )}
            <form onSubmit={submit} noValidate className="space-y-4">
                <FormField label="Email" htmlFor="email" error={errors.email}>
                    <TextInput id="email" type="email" name="email" autoComplete="username" isFocused className="w-full" value={data.email} onChange={(e) => setData("email", e.target.value)} invalid={!!errors.email} />
                </FormField>
                <FormField label="Password" htmlFor="password" error={errors.password}>
                    <div className="relative">
                        <TextInput
                            id="password"
                            type={lihat ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            className="w-full pr-10"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            invalid={!!errors.password}
                        />
                        <button
                            type="button"
                            onClick={() => setLihat(!lihat)}
                            aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
                            className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-slate-400 hover:text-slate-700"
                        >
                            {lihat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </FormField>
                <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <Checkbox name="remember" checked={data.remember} onChange={(e) => setData("remember", e.target.checked)} />
                        Ingat saya
                    </label>
                    {canResetPassword && (
                        <Link href={route("password.request")} className="text-sm font-medium text-blue-700 hover:underline">
                            Lupa password?
                        </Link>
                    )}
                </div>
                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? <Spinner /> : <LogIn />} Masuk
                </PrimaryButton>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
                Siswa belum punya akun?{" "}
                <Link href={route("aktivasi")} className="font-semibold text-blue-700 hover:underline">
                    Aktivasi akun
                </Link>
            </p>
        </GuestLayout>
    );
}

import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { KeyRound } from "lucide-react";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({ token, email, password: "", password_confirmation: "" });
    const submit = (e) => {
        e.preventDefault();
        post(route("password.store"), { onFinish: () => reset("password", "password_confirmation") });
    };
    return (
        <GuestLayout title="Buat Password Baru" description="Password baru minimal 8 karakter.">
            <Head title="Reset Password" />
            <form onSubmit={submit} noValidate className="space-y-4">
                <FormField label="Email" htmlFor="email" error={errors.email}>
                    <TextInput id="email" type="email" autoComplete="username" className="w-full" value={data.email} onChange={(e) => setData("email", e.target.value)} invalid={!!errors.email} />
                </FormField>
                <FormField label="Password baru" htmlFor="password" required error={errors.password}>
                    <TextInput id="password" type="password" isFocused autoComplete="new-password" className="w-full" value={data.password} onChange={(e) => setData("password", e.target.value)} invalid={!!errors.password} />
                </FormField>
                <FormField label="Konfirmasi password" htmlFor="password_confirmation" required error={errors.password_confirmation}>
                    <TextInput id="password_confirmation" type="password" autoComplete="new-password" className="w-full" value={data.password_confirmation} onChange={(e) => setData("password_confirmation", e.target.value)} invalid={!!errors.password_confirmation} />
                </FormField>
                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? <Spinner /> : <KeyRound />} Simpan Password
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}

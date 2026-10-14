import Callout from "@/Components/Callout";
import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Mail } from "lucide-react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: "" });
    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };
    return (
        <GuestLayout title="Lupa Password" description="Masukkan email akun Anda. Kami akan mengirim link untuk membuat password baru.">
            <Head title="Lupa Password" />
            {status && <Callout tone="success" className="mb-5">{status}</Callout>}
            <form onSubmit={submit} noValidate className="space-y-4">
                <FormField label="Email" htmlFor="email" required error={errors.email}>
                    <TextInput id="email" type="email" name="email" isFocused autoComplete="username" className="w-full" value={data.email} onChange={(e) => setData("email", e.target.value)} invalid={!!errors.email} />
                </FormField>
                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? <Spinner /> : <Mail />} Kirim Link Reset Password
                </PrimaryButton>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
                Ingat password Anda?{" "}
                <Link href={route("login")} className="font-semibold text-blue-700 hover:underline">
                    Masuk
                </Link>
            </p>
        </GuestLayout>
    );
}

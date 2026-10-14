import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, useForm } from "@inertiajs/react";
import { ShieldCheck } from "lucide-react";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: "" });
    const submit = (e) => {
        e.preventDefault();
        post(route("password.confirm"), { onFinish: () => reset("password") });
    };
    return (
        <GuestLayout title="Konfirmasi Password" description="Area ini aman. Masukkan password Anda untuk melanjutkan.">
            <Head title="Konfirmasi Password" />
            <form onSubmit={submit} noValidate className="space-y-4">
                <FormField label="Password" htmlFor="password" required error={errors.password}>
                    <TextInput id="password" type="password" isFocused autoComplete="current-password" className="w-full" value={data.password} onChange={(e) => setData("password", e.target.value)} invalid={!!errors.password} />
                </FormField>
                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? <Spinner /> : <ShieldCheck />} Konfirmasi
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}

import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { CheckCircle2, Save } from "lucide-react";
import { useRef } from "react";

export default function UpdatePasswordForm({ className = "" }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset("current_password");
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <form onSubmit={updatePassword} noValidate className={`space-y-4 ${className}`}>
            <FormField label="Password saat ini" htmlFor="current_password" required error={errors.current_password}>
                <TextInput id="current_password" ref={currentPasswordInput} type="password" className="w-full" value={data.current_password} onChange={(e) => setData("current_password", e.target.value)} autoComplete="current-password" invalid={!!errors.current_password} />
            </FormField>
            <FormField label="Password baru" htmlFor="password" required error={errors.password} help="Minimal 8 karakter.">
                <TextInput id="password" ref={passwordInput} type="password" className="w-full" value={data.password} onChange={(e) => setData("password", e.target.value)} autoComplete="new-password" invalid={!!errors.password} />
            </FormField>
            <FormField label="Konfirmasi password baru" htmlFor="password_confirmation" required error={errors.password_confirmation}>
                <TextInput id="password_confirmation" type="password" className="w-full" value={data.password_confirmation} onChange={(e) => setData("password_confirmation", e.target.value)} autoComplete="new-password" invalid={!!errors.password_confirmation} />
            </FormField>
            <div className="flex items-center gap-3">
                <PrimaryButton disabled={processing}>
                    {processing ? <Spinner /> : <Save />} Simpan Password
                </PrimaryButton>
                {recentlySuccessful && (
                    <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700" role="status">
                        <CheckCircle2 className="h-4 w-4" /> Password diperbarui
                    </p>
                )}
            </div>
        </form>
    );
}

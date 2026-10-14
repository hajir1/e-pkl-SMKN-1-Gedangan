import Callout from "@/Components/Callout";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { MailCheck } from "lucide-react";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});
    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };
    return (
        <GuestLayout title="Verifikasi Email" description="Klik link yang kami kirim ke email Anda untuk mengaktifkan akun. Belum menerima email? Kirim ulang di bawah.">
            <Head title="Verifikasi Email" />
            {status === "verification-link-sent" && (
                <Callout tone="success" className="mb-5">
                    Link verifikasi baru telah dikirim ke email yang Anda daftarkan.
                </Callout>
            )}
            <form onSubmit={submit} className="space-y-3">
                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? <Spinner /> : <MailCheck />} Kirim Ulang Email Verifikasi
                </PrimaryButton>
                <Link href={route("logout")} method="post" as="button" className="w-full text-center text-sm font-medium text-slate-600 hover:text-slate-900">
                    Keluar
                </Link>
            </form>
        </GuestLayout>
    );
}

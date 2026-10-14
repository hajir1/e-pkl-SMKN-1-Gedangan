import FormField from "@/Components/FormField";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import TitleModal, { ModalBody } from "@/Components/TitleModal";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowRight, HelpCircle } from "lucide-react";
import { useState } from "react";

export default function Aktivasi() {
    const [panduan, setPanduan] = useState(false);
    const { data, setData, post, processing, errors, setError } = useForm({ nisn: "" });

    const submit = (e) => {
        e.preventDefault();
        const nisn = data.nisn.trim();
        if (nisn.length < 9) return setError("nisn", "Nomor aktivasi minimal 9 karakter");
        post(route("aktivasi"), { transform: () => ({ nisn }) });
    };

    return (
        <GuestLayout title="Aktivasi Akun Siswa" description="Masukkan nomor aktivasi (nomor induk + kode jurusan) untuk membuat akun.">
            <Head title="Aktivasi Akun" />
            <form onSubmit={submit} noValidate className="space-y-4">
                <FormField label="Nomor aktivasi" htmlFor="nisn" required error={errors.nisn} help="Contoh: 12010001.001">
                    <TextInput id="nisn" name="nisn" autoComplete="off" isFocused className="w-full font-mono" value={data.nisn} onChange={(e) => setData("nisn", e.target.value)} invalid={!!errors.nisn} />
                </FormField>
                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? <Spinner /> : <ArrowRight />} Lanjutkan
                </PrimaryButton>
                <button type="button" onClick={() => setPanduan(true)} className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                    <HelpCircle className="h-4 w-4" /> Cara mengetahui nomor aktivasi
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
                Sudah punya akun?{" "}
                <Link href={route("login")} className="font-semibold text-blue-700 hover:underline">
                    Masuk
                </Link>
            </p>

            <Modal show={panduan} onClose={() => setPanduan(false)} maxWidth="md">
                <TitleModal title="Panduan Aktivasi Akun" onClick={() => setPanduan(false)} />
                <ModalBody className="space-y-3 text-sm text-slate-700">
                    <p>Aktivasi memastikan bahwa yang mendaftar benar-benar siswa aktif SMKN 1 Gedangan.</p>
                    <p>Nomor aktivasi adalah gabungan <b>nomor induk</b> dan <b>kode jurusan</b> tanpa spasi.</p>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p>Nomor induk: <span className="font-mono">1201</span></p>
                        <p>Kode jurusan: <span className="font-mono">0001.001</span></p>
                        <p className="mt-2 font-semibold text-slate-900">
                            Nomor aktivasi: <span className="font-mono">12010001.001</span>
                        </p>
                    </div>
                    <p>Jika nomor tidak ditemukan, hubungi admin sekolah.</p>
                </ModalBody>
            </Modal>
        </GuestLayout>
    );
}

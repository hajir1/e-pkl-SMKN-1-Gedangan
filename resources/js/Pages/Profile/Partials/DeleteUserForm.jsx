import Callout from "@/Components/Callout";
import DangerButton from "@/Components/DangerButton";
import FormField from "@/Components/FormField";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import { useForm } from "@inertiajs/react";
import { Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export default function DeleteUserForm({ className = "" }) {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef();
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: "" });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <p className="text-sm text-slate-600">Unduh terlebih dahulu data yang ingin Anda simpan. Tindakan ini tidak bisa dibatalkan.</p>
            <DangerButton onClick={() => setConfirming(true)}>
                <Trash2 /> Hapus Akun
            </DangerButton>

            <Modal show={confirming} onClose={processing ? () => {} : closeModal} maxWidth="md">
                <TitleModal title="Hapus akun ini?" onClick={closeModal} />
                <form onSubmit={deleteUser} noValidate>
                    <ModalBody className="space-y-4">
                        <Callout tone="danger">Semua data akun akan dihapus permanen. Masukkan password untuk konfirmasi.</Callout>
                        <FormField label="Password" htmlFor="delete_password" required error={errors.password}>
                            <TextInput id="delete_password" type="password" ref={passwordInput} className="w-full" value={data.password} onChange={(e) => setData("password", e.target.value)} isFocused invalid={!!errors.password} />
                        </FormField>
                    </ModalBody>
                    <ModalFooter>
                        <SecondaryButton onClick={closeModal} disabled={processing}>Batal</SecondaryButton>
                        <DangerButton type="submit" disabled={processing || !data.password}>
                            {processing ? <Spinner /> : <Trash2 />} Hapus Akun
                        </DangerButton>
                    </ModalFooter>
                </form>
            </Modal>
        </section>
    );
}

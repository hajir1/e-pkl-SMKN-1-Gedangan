import { KeteranganBadge, StatusBadge } from "@/Components/Badge";
import Callout from "@/Components/Callout";
import DangerButton from "@/Components/DangerButton";
import FormField from "@/Components/FormField";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Spinner from "@/Components/Spinner";
import Textarea from "@/Components/Textarea";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import { formatPeriode, formatTanggal, formatTanggalWaktu } from "@/Helpers/format";
import { useForm } from "@inertiajs/react";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { useEffect } from "react";

/**
 * Verifikasi absensi oleh admin / pembimbing:
 * PUT /jurnal/{id}/verifikasi { status: disetujui|ditolak, catatan }.
 * Catatan wajib bila ditolak (sesuai VerifikasiJurnalRequest).
 */
export default function VerifikasiModal({ jurnal, mode, onClose }) {
    const show = Boolean(jurnal && mode);
    const tolak = mode === "ditolak";
    const { data, setData, put, processing, errors, setError, clearErrors, reset } =
        useForm({ status: "", catatan: "" });

    useEffect(() => {
        if (!show) return;
        clearErrors();
        setData({ status: mode, catatan: jurnal?.catatan_verifikasi ?? "" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, mode, jurnal?.id]);

    const submit = (e) => {
        e.preventDefault();
        if (tolak && !data.catatan.trim()) {
            setError("catatan", "Catatan wajib diisi ketika absensi ditolak");
            return;
        }
        put(route("jurnal.verifikasi", jurnal.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={processing ? () => {} : onClose} maxWidth="lg">
            <TitleModal
                title={tolak ? "Tolak Absensi" : "Setujui Absensi"}
                description={jurnal?.user?.name}
                onClick={onClose}
            />
            <form onSubmit={submit} noValidate>
                <ModalBody className="space-y-4">
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                        <div>
                            <dt className="text-slate-500">Periode</dt>
                            <dd className="font-medium text-slate-900">
                                {jurnal?.minggu_mulai
                                    ? formatPeriode(jurnal.minggu_mulai, jurnal.minggu_selesai)
                                    : formatTanggal(jurnal?.created_at)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Keterangan</dt>
                            <dd className="mt-0.5">
                                <KeteranganBadge value={jurnal?.keterangan} />
                            </dd>
                        </div>
                        <div className="col-span-2">
                            <dt className="text-slate-500">Kegiatan</dt>
                            <dd className="text-slate-900">{jurnal?.kegiatan}</dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Status saat ini</dt>
                            <dd className="mt-0.5">
                                <StatusBadge
                                    status={jurnal?.status_verifikasi}
                                    mark={jurnal?.mark}
                                />
                            </dd>
                        </div>
                        <div>
                            <dt className="text-slate-500">Dikirim</dt>
                            <dd className="text-slate-900">
                                {formatTanggalWaktu(jurnal?.created_at)}
                            </dd>
                        </div>
                    </dl>

                    {jurnal?.pdf_url ? (
                        <a
                            href={jurnal.pdf_url}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
                        >
                            <FileText className="h-4 w-4" />
                            Periksa PDF absensi sebelum memverifikasi
                        </a>
                    ) : (
                        <Callout tone="warning">
                            Absensi ini tidak memiliki file PDF (data lama).
                        </Callout>
                    )}

                    <FormField
                        label={tolak ? "Alasan penolakan" : "Catatan untuk siswa"}
                        hint={tolak ? undefined : "(opsional)"}
                        required={tolak}
                        htmlFor="catatan"
                        error={errors.catatan || errors.status}
                        help={
                            tolak
                                ? "Siswa akan melihat catatan ini dan dapat memperbaiki absensinya."
                                : undefined
                        }
                    >
                        <Textarea
                            id="catatan"
                            rows={3}
                            maxLength={500}
                            invalid={!!errors.catatan}
                            value={data.catatan}
                            onChange={(e) => setData("catatan", e.target.value)}
                            placeholder={
                                tolak
                                    ? "Contoh: Tanda tangan pembimbing DU/DI belum ada pada PDF."
                                    : "Contoh: Kegiatan sudah sesuai, pertahankan."
                            }
                        />
                    </FormField>
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Batal
                    </SecondaryButton>
                    {tolak ? (
                        <DangerButton type="submit" disabled={processing}>
                            {processing ? <Spinner /> : <XCircle />}
                            Tolak Absensi
                        </DangerButton>
                    ) : (
                        <PrimaryButton
                            disabled={processing}
                            tone="emerald"
                        >
                            {processing ? <Spinner /> : <CheckCircle2 />}
                            Setujui Absensi
                        </PrimaryButton>
                    )}
                </ModalFooter>
            </form>
        </Modal>
    );
}

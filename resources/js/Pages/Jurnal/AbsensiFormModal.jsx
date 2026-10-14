import FormField from "@/Components/FormField";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Spinner from "@/Components/Spinner";
import Textarea from "@/Components/Textarea";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import { KETERANGAN } from "@/Components/Badge";
import Callout from "@/Components/Callout";
import { formatPeriode } from "@/Helpers/format";
import { useObjectUrl } from "@/Helpers/hooks";
import { storageUrl } from "@/Helpers/format";
import { useForm } from "@inertiajs/react";
import { FileText, ImagePlus, Send, Upload, X } from "lucide-react";
import { useEffect, useRef } from "react";

// Batas mengikuti config/absensi.php di backend (PDF 5 MB, foto 4 MB).
export const PDF_MAX_MB = 5;
export const PHOTO_MAX_MB = 4;
const KEGIATAN_MAX = 150;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const validasiFile = (file, jenis) => {
    if (!file) return null;
    if (jenis === "pdf") {
        const isPdf =
            file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (!isPdf) return "File absensi harus berformat PDF";
        if (file.size > PDF_MAX_MB * 1024 * 1024)
            return `File PDF maksimal ${PDF_MAX_MB} MB`;
    } else {
        if (!PHOTO_TYPES.includes(file.type))
            return "Foto harus bertipe JPG, PNG, WebP, atau AVIF";
        if (file.size > PHOTO_MAX_MB * 1024 * 1024)
            return `Foto maksimal ${PHOTO_MAX_MB} MB`;
    }
    return null;
};

const ukuran = (bytes) =>
    bytes >= 1024 * 1024
        ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
        : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Form kirim / perbaiki absensi mingguan.
 * - file_pdf wajib saat kirim, opsional saat perbaikan (PDF lama dipakai).
 * - photo opsional; backend mengonversinya ke WebP.
 * - Edit dikirim lewat POST + _method=put karena upload file tidak bisa
 *   lewat PUT langsung.
 */
export default function AbsensiFormModal({ show, onClose, jurnal = null, periode }) {
    const isEdit = Boolean(jurnal);
    const pdfRef = useRef(null);
    const photoRef = useRef(null);

    const form = useForm({
        keterangan: "",
        kegiatan: "",
        file_pdf: null,
        photo: null,
    });
    const { data, setData, errors, processing, clearErrors, setError, reset } = form;
    const photoPreview = useObjectUrl(data.photo);

    useEffect(() => {
        if (!show) return;
        clearErrors();
        setData({
            keterangan: jurnal?.keterangan ?? "",
            kegiatan: jurnal?.kegiatan ?? "",
            file_pdf: null,
            photo: null,
        });
        if (pdfRef.current) pdfRef.current.value = "";
        if (photoRef.current) photoRef.current.value = "";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, jurnal?.id]);

    const pilihFile = (field, jenis) => (e) => {
        const file = e.target.files?.[0] ?? null;
        const pesan = validasiFile(file, jenis);
        if (pesan) {
            setError(field, pesan);
            e.target.value = "";
            setData(field, null);
            return;
        }
        clearErrors(field);
        setData(field, file);
    };

    const submit = (e) => {
        e.preventDefault();
        const lokal = {};
        if (!data.keterangan) lokal.keterangan = "Keterangan wajib dipilih";
        if (!data.kegiatan.trim()) lokal.kegiatan = "Kegiatan wajib diisi";
        if (!isEdit && !data.file_pdf)
            lokal.file_pdf = "File absensi (PDF) wajib diunggah";
        if (Object.keys(lokal).length) {
            setError(lokal);
            return;
        }

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                // Backend mengembalikan redirect + flash; tutup modal hanya
                // bila tidak ada pesan error dari server.
                if (!page.props?.auth?.flash?.error) {
                    reset();
                    onClose();
                }
            },
        };

        if (isEdit) {
            form.transform((d) => {
                const payload = { ...d, _method: "put" };
                if (!d.file_pdf) delete payload.file_pdf;
                if (!d.photo) delete payload.photo;
                return payload;
            });
            form.post(route("jurnal.update", jurnal.id), options);
        } else {
            form.transform((d) => {
                const payload = { ...d };
                if (!d.photo) delete payload.photo;
                return payload;
            });
            form.post(route("jurnal.store"), options);
        }
    };

    const fotoLama = isEdit && jurnal?.photo ? storageUrl(jurnal.photo) : null;

    return (
        <Modal show={show} onClose={processing ? () => {} : onClose} maxWidth="xl">
            <TitleModal
                title={isEdit ? "Perbaiki Absensi" : "Kirim Absensi Minggu Ini"}
                description={
                    periode
                        ? `Periode ${formatPeriode(periode.mulai, periode.selesai)}`
                        : undefined
                }
                onClick={onClose}
            />
            <form onSubmit={submit} noValidate>
                <ModalBody className="space-y-5">
                    {isEdit && jurnal?.status_verifikasi === "ditolak" && (
                        <Callout tone="danger" title="Absensi ditolak pembimbing">
                            {jurnal.catatan_verifikasi ||
                                "Perbaiki absensi lalu kirim ulang."}{" "}
                            Setelah diperbaiki, status kembali menjadi
                            menunggu verifikasi.
                        </Callout>
                    )}

                    <fieldset>
                        <legend className="mb-1.5 text-sm font-medium text-slate-700">
                            Keterangan kehadiran
                            <span className="ms-0.5 text-rose-600">*</span>
                        </legend>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(KETERANGAN).map(([value, k]) => {
                                const checked = data.keterangan === value;
                                return (
                                    <label
                                        key={value}
                                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm font-medium transition focus-within:ring-2 focus-within:ring-blue-500 [&_svg]:h-5 [&_svg]:w-5 ${
                                            checked
                                                ? "border-blue-600 bg-blue-50 text-blue-800"
                                                : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="keterangan"
                                            value={value}
                                            checked={checked}
                                            onChange={() => {
                                                setData("keterangan", value);
                                                clearErrors("keterangan");
                                            }}
                                            className="sr-only"
                                        />
                                        {k.icon}
                                        {k.label}
                                    </label>
                                );
                            })}
                        </div>
                        {errors.keterangan && (
                            <p role="alert" className="mt-1.5 text-sm text-rose-600">
                                {errors.keterangan}
                            </p>
                        )}
                    </fieldset>

                    <FormField
                        label="Ringkasan kegiatan minggu ini"
                        htmlFor="kegiatan"
                        required
                        error={errors.kegiatan}
                    >
                        <Textarea
                            id="kegiatan"
                            name="kegiatan"
                            rows={3}
                            maxLength={KEGIATAN_MAX}
                            invalid={!!errors.kegiatan}
                            value={data.kegiatan}
                            onChange={(e) => setData("kegiatan", e.target.value)}
                            placeholder="Contoh: Instalasi jaringan LAN di ruang server dan dokumentasi konfigurasi router"
                        />
                        <p className="mt-1 text-right text-xs text-slate-500">
                            {data.kegiatan.length}/{KEGIATAN_MAX} karakter
                        </p>
                    </FormField>

                    <FormField
                        label="Bukti absensi (PDF)"
                        htmlFor="file_pdf"
                        required={!isEdit}
                        error={errors.file_pdf}
                        help={
                            isEdit
                                ? `Kosongkan bila tidak ingin mengganti PDF. Maksimal ${PDF_MAX_MB} MB.`
                                : `Lembar absensi/jurnal mingguan yang sudah ditandatangani. Maksimal ${PDF_MAX_MB} MB.`
                        }
                    >
                        {data.file_pdf ? (
                            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                                <FileText className="h-5 w-5 shrink-0 text-rose-600" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-800">
                                        {data.file_pdf.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {ukuran(data.file_pdf.size)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    aria-label="Hapus file PDF"
                                    onClick={() => {
                                        setData("file_pdf", null);
                                        if (pdfRef.current) pdfRef.current.value = "";
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor="file_pdf"
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 py-3 text-sm transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500 ${
                                    errors.file_pdf
                                        ? "border-rose-400"
                                        : "border-slate-300"
                                }`}
                            >
                                <Upload className="h-5 w-5 text-slate-400" />
                                <span className="text-slate-600">
                                    <span className="font-medium text-blue-700">
                                        Pilih file PDF
                                    </span>{" "}
                                    {isEdit && jurnal?.pdf_url
                                        ? "untuk mengganti PDF lama"
                                        : "dari perangkat"}
                                </span>
                            </label>
                        )}
                        <input
                            ref={pdfRef}
                            id="file_pdf"
                            name="file_pdf"
                            type="file"
                            accept="application/pdf,.pdf"
                            className="sr-only"
                            onChange={pilihFile("file_pdf", "pdf")}
                        />
                        {isEdit && jurnal?.pdf_url && !data.file_pdf && (
                            <a
                                href={jurnal.pdf_url}
                                target="_blank"
                                rel="noopener"
                                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:underline"
                            >
                                <FileText className="h-4 w-4" /> Lihat PDF saat ini
                            </a>
                        )}
                    </FormField>

                    <FormField
                        label="Foto kegiatan"
                        hint="(opsional)"
                        htmlFor="photo"
                        error={errors.photo}
                        help={`JPG, PNG, WebP, atau AVIF. Maksimal ${PHOTO_MAX_MB} MB.`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                                {photoPreview || fotoLama ? (
                                    <img
                                        src={photoPreview ?? fotoLama}
                                        alt="Pratinjau foto"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-slate-400">
                                        <ImagePlus className="h-5 w-5" />
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <label
                                    htmlFor="photo"
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500"
                                >
                                    <ImagePlus className="h-4 w-4" />
                                    {data.photo || fotoLama ? "Ganti foto" : "Pilih foto"}
                                    <input
                                        ref={photoRef}
                                        id="photo"
                                        name="photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/avif"
                                        className="sr-only"
                                        onChange={pilihFile("photo", "photo")}
                                    />
                                </label>
                                {data.photo && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData("photo", null);
                                            if (photoRef.current) photoRef.current.value = "";
                                        }}
                                        className="text-sm font-medium text-slate-500 hover:text-slate-800"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </div>
                    </FormField>

                    {form.progress && (
                        <div aria-live="polite">
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full bg-blue-600 transition-all"
                                    style={{ width: `${form.progress.percentage ?? 0}%` }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Mengunggah... {form.progress.percentage ?? 0}%
                            </p>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton disabled={processing}>
                        {processing ? <Spinner /> : <Send />}
                        {processing
                            ? "Mengirim..."
                            : isEdit
                              ? "Simpan Perbaikan"
                              : "Kirim Absensi"}
                    </PrimaryButton>
                </ModalFooter>
            </form>
        </Modal>
    );
}

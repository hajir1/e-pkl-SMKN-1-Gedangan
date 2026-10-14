import Card from "@/Components/Card";
import EmptyState from "@/Components/EmptyState";
import FormField from "@/Components/FormField";
import IconButton from "@/Components/IconButton";
import Modal from "@/Components/Modal";
import Pagination from "@/Components/Pagination";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import TitleModal, { ModalBody, ModalFooter } from "@/Components/TitleModal";
import TitlePage from "@/Components/TitlePage";
import { AlertConfirm } from "@/Helpers/Alert";
import { formatTanggal, storageUrl } from "@/Helpers/format";
import { useObjectUrl } from "@/Helpers/hooks";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Expand, ImageOff, Images, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";

const MAX_KB = 2400;
const TIPE = ["image/jpeg", "image/png", "image/avif"];

function GambarModal({ show, gambar, onClose }) {
    const isEdit = Boolean(gambar);
    const { data, setData, post, processing, errors, setError, clearErrors, reset, transform, progress } = useForm({ url: null });
    const preview = useObjectUrl(data.url);

    useEffect(() => {
        if (show) {
            reset();
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    const pilih = (e) => {
        const file = e.target.files?.[0] ?? null;
        clearErrors();
        if (file && !TIPE.includes(file.type)) {
            e.target.value = "";
            return setError("url", "Gambar harus bertipe JPG, PNG, atau AVIF");
        }
        if (file && file.size > MAX_KB * 1024) {
            e.target.value = "";
            return setError("url", "Ukuran gambar maksimal 2,4 MB");
        }
        setData("url", file);
    };

    const submit = (e) => {
        e.preventDefault();
        if (!data.url) return setError("url", "Pilih gambar terlebih dahulu");
        const opts = { preserveScroll: true, forceFormData: true, onSuccess: (page) => !page.props.auth?.flash?.error && onClose() };
        if (isEdit) {
            // Laravel tidak membaca file pada PUT multipart: kirim POST + _method.
            transform((d) => ({ ...d, _method: "put" }));
            post(route("gambar.update", gambar.id), opts);
        } else {
            transform((d) => d);
            post(route("gambar.store"), opts);
        }
    };

    return (
        <Modal show={show} onClose={processing ? () => {} : onClose} maxWidth="lg">
            <TitleModal title={isEdit ? "Ganti Gambar" : "Tambah Gambar Slider"} description="Ditampilkan pada slider halaman depan." onClick={onClose} />
            <form onSubmit={submit} noValidate>
                <ModalBody className="space-y-4">
                    <div className="aspect-video overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                        {preview || gambar?.url ? (
                            <img src={preview ?? storageUrl(gambar.url)} alt="Pratinjau" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">Pratinjau gambar</div>
                        )}
                    </div>
                    <FormField label="File gambar" htmlFor="url" required error={errors.url} help="JPG, PNG, atau AVIF. Maksimal 2,4 MB. Disarankan rasio 16:9.">
                        <TextInput id="url" type="file" accept=".jpg,.jpeg,.png,.avif,image/jpeg,image/png,image/avif" className="w-full" onChange={pilih} invalid={!!errors.url} />
                    </FormField>
                    {progress && (
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-blue-600" style={{ width: `${progress.percentage}%` }} />
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <SecondaryButton onClick={onClose} disabled={processing}>Batal</SecondaryButton>
                    <PrimaryButton disabled={processing || !data.url}>{processing ? <Spinner /> : <Upload />} Simpan</PrimaryButton>
                </ModalFooter>
            </form>
        </Modal>
    );
}

function Thumb({ g }) {
    const [error, setError] = useState(false);
    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                <ImageOff className="h-6 w-6" />
            </div>
        );
    }
    return <img src={storageUrl(g.url)} alt="Gambar slider" loading="lazy" onError={() => setError(true)} className="h-full w-full object-cover transition group-hover:scale-[1.02]" />;
}

export default function Index() {
    const { gambars } = usePage().props;
    const [form, setForm] = useState({ show: false, gambar: null });
    const [lihat, setLihat] = useState(null);
    const rows = gambars?.data ?? [];

    const handleDelete = (g) =>
        AlertConfirm("Gambar ini akan dihapus dari slider halaman depan.", "warning", () => router.delete(route("gambar.destroy", g.id), { preserveScroll: true }), "Ya, Hapus");

    return (
        <AuthenticatedLayout>
            <Head title="Gambar Slider" />
            <div className="space-y-6">
                <TitlePage eyebrow="Master Data" title="Gambar Slider" quote="Gambar yang tampil bergantian di halaman depan.">
                    <PrimaryButton type="button" onClick={() => setForm({ show: true, gambar: null })}>
                        <Plus /> Tambah Gambar
                    </PrimaryButton>
                </TitlePage>

                {rows.length === 0 ? (
                    <Card>
                        <EmptyState icon={<Images />} title="Belum ada gambar slider" description="Halaman depan akan memakai gambar bawaan sampai Anda menambahkan gambar." />
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <ul className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                            {rows.map((g) => (
                                <li key={g.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white">
                                    <button type="button" onClick={() => setLihat(g)} className="block aspect-video w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Lihat gambar ukuran penuh">
                                        <Thumb g={g} />
                                    </button>
                                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                                        <span className="text-xs text-slate-500">Ditambahkan {formatTanggal(g.created_at)}</span>
                                        <div className="flex items-center gap-1">
                                            <IconButton label="Lihat" onClick={() => setLihat(g)}>
                                                <Expand />
                                            </IconButton>
                                            <IconButton label="Ganti gambar" variant="primary" onClick={() => setForm({ show: true, gambar: g })}>
                                                <Pencil />
                                            </IconButton>
                                            <IconButton label="Hapus gambar" variant="danger" onClick={() => handleDelete(g)}>
                                                <Trash2 />
                                            </IconButton>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Pagination datas={gambars} />
                    </Card>
                )}
            </div>

            <GambarModal show={form.show} gambar={form.gambar} onClose={() => setForm({ show: false, gambar: form.gambar })} />
            <Modal show={Boolean(lihat)} onClose={() => setLihat(null)} maxWidth="4xl">
                <TitleModal title="Pratinjau Gambar" onClick={() => setLihat(null)} />
                <ModalBody>{lihat && <img src={storageUrl(lihat.url)} alt="Gambar slider" className="mx-auto max-h-[70vh] w-auto rounded-lg" />}</ModalBody>
            </Modal>
        </AuthenticatedLayout>
    );
}

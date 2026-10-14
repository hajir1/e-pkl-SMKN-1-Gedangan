import Callout from "@/Components/Callout";
import Card, { CardBody, CardHeader } from "@/Components/Card";
import Checkbox from "@/Components/Checkbox";
import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Select from "@/Components/Select";
import Spinner from "@/Components/Spinner";
import Textarea from "@/Components/Textarea";
import TextInput from "@/Components/TextInput";
import TitlePage from "@/Components/TitlePage";
import { formatTanggal } from "@/Helpers/format";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useTypeAjuanTempat } from "@/state/Zustand";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Building2, Clock3, PenLine, School, Send } from "lucide-react";

const KONTAK_REGEX = /^0[0-9]{9,12}$/;
const KOSONG = { tempat_id: "", nama: "", kontak: "", bidang_usaha: "", lokasi: "", alasan: "", checked: false };

export default function Form() {
    const { auth, tempats = [], pengajuanTempats = [] } = usePage().props;
    const { type, setType } = useTypeAjuanTempat();
    const mode = type === "siswa" ? "siswa" : "sekolah";
    const { data, setData, errors, post, processing, reset, setError, clearErrors } = useForm(KOSONG);
    const isSiswa = auth.role === "siswa";
    const milikSaya = pengajuanTempats.find((p) => p.user_id === auth.user.id);

    const gantiMode = (m) => {
        setType(m);
        reset();
        clearErrors();
    };

    const pilihTempat = (e) => {
        const t = tempats.find((tp) => String(tp.id) === e.target.value);
        setData({
            ...data,
            tempat_id: t?.id ?? "",
            nama: t?.nama ?? "",
            kontak: t?.kontak ?? "",
            bidang_usaha: t?.bidang_usaha ?? "",
            lokasi: t?.lokasi ?? "",
        });
    };

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        const err = {};
        if (mode === "sekolah" && !data.tempat_id) err.tempat_id = "Pilih tempat PKL dari daftar sekolah";
        if (mode === "siswa") {
            if (!data.nama.trim()) err.nama = "Nama DU/DI wajib diisi";
            if (!KONTAK_REGEX.test(data.kontak)) err.kontak = "Nomor 10-13 digit dan diawali angka 0";
            if (!data.bidang_usaha.trim()) err.bidang_usaha = "Bidang usaha wajib diisi";
            if (!data.lokasi.trim()) err.lokasi = "Lokasi wajib diisi";
        }
        if (!data.alasan.trim()) err.alasan = "Alasan wajib diisi";
        if (Object.keys(err).length) return setError(err);

        post(route("pengajuanTempat.store"), {
            preserveScroll: true,
            // tempat_id hanya dikirim untuk pilihan "Dari sekolah".
            transform: ({ checked, tempat_id, ...d }) => (mode === "sekolah" ? { ...d, tempat_id } : d),
            onSuccess: (page) => !page.props.auth?.flash?.error && reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Ajukan Tempat PKL" />
            <div className="space-y-6">
                <TitlePage eyebrow="Tempat PKL" title="Ajukan Tempat PKL" quote="Pilih tempat yang disediakan sekolah atau usulkan tempat sendiri. Admin akan meninjau pengajuan Anda.">
                    <Link href={route("pengajuanTempat.index")} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                        <ArrowLeft className="h-4 w-4" /> Daftar Pengajuan
                    </Link>
                </TitlePage>

                {isSiswa && milikSaya ? (
                    <Callout tone="info" title="Pengajuan Anda sedang ditinjau">
                        <span className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" /> {milikSaya.nama}, diajukan {formatTanggal(milikSaya.created_at)}.
                        </span>
                        Jika diterima, Anda otomatis ditempatkan di tempat tersebut dan pihak sekolah akan menghubungi Anda.
                    </Callout>
                ) : (
                    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader title="Sumber tempat" />
                                <CardBody className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        { v: "sekolah", l: "Dari sekolah", d: "Pilih DU/DI yang sudah bekerja sama dengan sekolah.", i: <School /> },
                                        { v: "siswa", l: "Usulkan sendiri", d: "Isi data DU/DI baru yang ingin Anda tuju.", i: <PenLine /> },
                                    ].map((o) => (
                                        <button
                                            key={o.v}
                                            type="button"
                                            aria-pressed={mode === o.v}
                                            onClick={() => gantiMode(o.v)}
                                            className={`flex gap-3 rounded-xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                                mode === o.v ? "border-blue-600 bg-blue-50/60" : "border-slate-200 hover:border-slate-300"
                                            }`}
                                        >
                                            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&_svg]:h-[18px] [&_svg]:w-[18px] ${mode === o.v ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"}`}>{o.i}</span>
                                            <span>
                                                <span className="block text-sm font-semibold text-slate-900">{o.l}</span>
                                                <span className="block text-xs text-slate-500">{o.d}</span>
                                            </span>
                                        </button>
                                    ))}
                                </CardBody>
                            </Card>

                            <Card>
                                <CardHeader icon={<Building2 />} title="Data tempat PKL" />
                                <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {mode === "sekolah" ? (
                                        <>
                                            <FormField label="Tempat PKL" htmlFor="tempat_id" required error={errors.tempat_id || errors.nama} className="sm:col-span-2">
                                                <Select id="tempat_id" value={data.tempat_id} onChange={pilihTempat} invalid={!!(errors.tempat_id || errors.nama)}>
                                                    <option value="">{tempats.length ? "Pilih tempat" : "Belum ada tempat dari sekolah"}</option>
                                                    {tempats.map((t) => (
                                                        <option key={t.id} value={t.id}>{t.nama}</option>
                                                    ))}
                                                </Select>
                                            </FormField>
                                            {data.tempat_id && (
                                                <dl className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:col-span-2 sm:grid-cols-3">
                                                    <div>
                                                        <dt className="text-slate-500">Bidang usaha</dt>
                                                        <dd className="font-medium text-slate-900">{data.bidang_usaha || "-"}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-slate-500">Kontak</dt>
                                                        <dd className="font-medium text-slate-900">{data.kontak || "-"}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-slate-500">Lokasi</dt>
                                                        <dd className="font-medium text-slate-900">{data.lokasi || "-"}</dd>
                                                    </div>
                                                </dl>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <FormField label="Nama DU/DI" htmlFor="nama" required error={errors.nama} className="sm:col-span-2">
                                                <TextInput id="nama" className="w-full" value={data.nama} onChange={(e) => setData("nama", e.target.value)} invalid={!!errors.nama} />
                                            </FormField>
                                            <FormField label="Kontak DU/DI" htmlFor="kontak" required error={errors.kontak} help="Contoh: 081234567890">
                                                <TextInput id="kontak" inputMode="tel" className="w-full" value={data.kontak} onChange={(e) => setData("kontak", e.target.value)} invalid={!!errors.kontak} />
                                            </FormField>
                                            <FormField label="Bidang usaha" htmlFor="bidang_usaha" required error={errors.bidang_usaha}>
                                                <TextInput id="bidang_usaha" className="w-full" value={data.bidang_usaha} onChange={(e) => setData("bidang_usaha", e.target.value)} invalid={!!errors.bidang_usaha} />
                                            </FormField>
                                            <FormField label="Lokasi / alamat" htmlFor="lokasi" required error={errors.lokasi} className="sm:col-span-2">
                                                <Textarea id="lokasi" rows={2} maxLength={255} value={data.lokasi} onChange={(e) => setData("lokasi", e.target.value)} invalid={!!errors.lokasi} />
                                            </FormField>
                                        </>
                                    )}
                                    <FormField label="Alasan memilih tempat ini" htmlFor="alasan" required error={errors.alasan} className="sm:col-span-2" help={`${data.alasan.length}/1000 karakter`}>
                                        <Textarea id="alasan" rows={4} maxLength={1000} value={data.alasan} onChange={(e) => setData("alasan", e.target.value)} invalid={!!errors.alasan} placeholder="Uraikan alasan Anda memilih tempat ini." />
                                    </FormField>
                                </CardBody>
                            </Card>
                        </div>
                        <div className="space-y-4">
                            <Card>
                                <CardBody className="space-y-4">
                                    <label className="flex items-start gap-3 text-sm text-slate-700">
                                        <Checkbox className="mt-0.5" checked={data.checked} onChange={(e) => setData("checked", e.target.checked)} />
                                        <span>Saya yakin tempat ini sesuai untuk saya dan siap menanggung konsekuensi dari pilihan ini.</span>
                                    </label>
                                    {/* Sebelumnya disabled={(processing, !data.checked)}: operator koma membuat tombol tetap aktif saat proses. */}
                                    <PrimaryButton className="w-full" disabled={processing || !data.checked}>
                                        {processing ? <Spinner /> : <Send />} Kirim Pengajuan
                                    </PrimaryButton>
                                </CardBody>
                            </Card>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

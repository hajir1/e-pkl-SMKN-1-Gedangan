import Callout from "@/Components/Callout";
import Card, { CardBody, CardHeader } from "@/Components/Card";
import FormField from "@/Components/FormField";
import PrimaryButton from "@/Components/PrimaryButton";
import Spinner from "@/Components/Spinner";
import TextInput from "@/Components/TextInput";
import TitlePage from "@/Components/TitlePage";
import { formatTanggal } from "@/Helpers/format";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Check, Download, FileText, History, Send } from "lucide-react";
import { StatusLaporan } from "./Index";

const LANGKAH = [
    { key: "judul", label: "Ajukan judul" },
    { key: "konfirmasi", label: "Konfirmasi pembimbing" },
    { key: "export", label: "Unduh laporan" },
];

/** step dari backend: null = belum, 1 = ditolak/revisi, 2 = menunggu, 3 = diterima. */
const posisi = (step) => (step === 3 ? 2 : step === 2 ? 1 : 0);

function Stepper({ step }) {
    const aktif = posisi(step);
    return (
        <ol className="flex items-center gap-2 sm:gap-4" aria-label="Tahapan laporan">
            {LANGKAH.map((l, i) => {
                const selesai = i < aktif;
                const sekarang = i === aktif;
                return (
                    <li key={l.key} className="flex flex-1 items-center gap-2 sm:gap-3" aria-current={sekarang ? "step" : undefined}>
                        <span
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                                selesai ? "bg-emerald-600 text-white" : sekarang ? "bg-blue-700 text-white ring-4 ring-blue-100" : "bg-slate-100 text-slate-500"
                            }`}
                        >
                            {selesai ? <Check className="h-4 w-4" /> : i + 1}
                        </span>
                        <span className={`hidden text-sm sm:block ${sekarang ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                            {l.label}
                            {i === 0 && step === 1 && <span className="block text-xs font-normal text-rose-600">Perlu revisi</span>}
                        </span>
                        {i < LANGKAH.length - 1 && <span className={`h-px flex-1 ${selesai ? "bg-emerald-300" : "bg-slate-200"}`} />}
                    </li>
                );
            })}
        </ol>
    );
}

function Ringkasan({ siswa }) {
    const rows = [
        ["Nama siswa", siswa?.name],
        ["Judul laporan", siswa?.laporan?.judul],
        ["Email", siswa?.email],
        ["Kontak", siswa?.kontak],
        ["Tempat, tanggal lahir", siswa?.tempat_lahir && siswa?.tanggal_lahir ? `${siswa.tempat_lahir}, ${formatTanggal(siswa.tanggal_lahir, { panjang: true })}` : null],
        ["Jurusan", siswa?.jurusan?.nama],
        ["Tahun ajaran", siswa?.tahun_ajaran?.tahun],
        ["Tempat PKL", siswa?.tempat?.nama],
        ["Pembimbing DU/DI", siswa?.tempat?.user?.name],
        ["Pembimbing sekolah", siswa?.pb_skl?.name],
    ];
    return (
        <dl className="divide-y divide-slate-100">
            {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-3 py-2.5 text-sm">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="col-span-2 font-medium text-slate-900">{v || <span className="font-normal text-slate-400">Belum diisi</span>}</dd>
                </div>
            ))}
        </dl>
    );
}

export default function Create() {
    const { laporan, laporans = [], step, siswa } = usePage().props;
    const { data, setData, errors, post, processing, reset, setError } = useForm({ judul: "" });
    const menunggu = laporans.find((l) => l.status === "pending");

    const submit = (e) => {
        e.preventDefault();
        if (data.judul.trim().length < 10) return setError("judul", "Judul minimal 10 karakter");
        post(route("laporan.store"), {
            preserveScroll: true,
            onSuccess: (page) => !page.props.auth?.flash?.error && reset(),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Laporan PKL" />
            <div className="space-y-6">
                <TitlePage eyebrow="Laporan PKL" title="Laporan PKL" quote="Ajukan judul laporan, tunggu persetujuan pembimbing, lalu unduh format dan rekap laporan.">
                    <Link href={route("laporan.index")} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                        <History className="h-4 w-4" /> Riwayat Judul
                    </Link>
                </TitlePage>

                <Card>
                    <CardBody>
                        <Stepper step={step} />
                    </CardBody>
                </Card>

                {(step === null || step === undefined || step === 1) && (
                    <Card>
                        <CardHeader icon={<FileText />} title={step === 1 ? "Ajukan judul baru" : "Ajukan judul laporan"} description="Judul akan ditinjau oleh pembimbing Anda." />
                        <CardBody className="space-y-4">
                            {step === 1 && (
                                <Callout tone="danger" title="Judul sebelumnya ditolak">
                                    {laporan?.judul ? <>Judul &ldquo;{laporan.judul}&rdquo; ditolak pembimbing. </> : null}
                                    Silakan ajukan judul yang sudah direvisi.
                                </Callout>
                            )}
                            <form onSubmit={submit} noValidate className="space-y-4">
                                <FormField label="Judul laporan" htmlFor="judul" required error={errors.judul} help={`${data.judul.length}/255 karakter, minimal 10.`}>
                                    <TextInput
                                        id="judul"
                                        className="w-full"
                                        maxLength={255}
                                        autoComplete="off"
                                        placeholder="Contoh: Sistem Informasi Inventaris Menggunakan Laravel"
                                        value={data.judul}
                                        onChange={(e) => setData("judul", e.target.value)}
                                        invalid={!!errors.judul}
                                    />
                                </FormField>
                                <PrimaryButton disabled={processing}>
                                    {processing ? <Spinner /> : <Send />} Ajukan Judul
                                </PrimaryButton>
                            </form>
                        </CardBody>
                    </Card>
                )}

                {step === 2 && (
                    <Callout tone="info" title="Judul sedang ditinjau pembimbing">
                        {menunggu ? <>&ldquo;{menunggu.judul}&rdquo; diajukan {formatTanggal(menunggu.created_at)}. </> : null}
                        Anda akan bisa mengunduh laporan setelah judul diterima.
                    </Callout>
                )}

                {step === 3 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
                        <Card className="lg:col-span-2">
                            <CardHeader title="Data laporan" description="Data ini dipakai pada halaman identitas laporan PKL." />
                            <CardBody className="py-1">
                                <Ringkasan siswa={siswa} />
                            </CardBody>
                        </Card>
                        <Card>
                            <CardHeader icon={<Download />} title="Unduhan" />
                            <CardBody className="space-y-2">
                                <a href={route("exportFormatlaporan")} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 hover:border-blue-300 hover:bg-blue-50/40">
                                    Format penulisan laporan <Download className="h-4 w-4 text-blue-700" />
                                </a>
                                <a href={route("exportLaporan")} target="_blank" rel="noopener" className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 hover:border-blue-300 hover:bg-blue-50/40">
                                    Rekap laporan PKL (PDF) <Download className="h-4 w-4 text-blue-700" />
                                </a>
                            </CardBody>
                        </Card>
                    </div>
                )}

                {laporans.length > 0 && step !== 3 && (
                    <Card>
                        <CardHeader icon={<History />} title="Judul yang pernah diajukan" />
                        <ul className="divide-y divide-slate-100">
                            {laporans.map((l) => (
                                <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                                    <span className="min-w-0 text-sm text-slate-800">{l.judul}</span>
                                    <StatusLaporan status={l.status} />
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

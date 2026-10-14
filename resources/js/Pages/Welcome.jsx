import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Footer from "@/Components/Footer";
import { assetUrl, storageUrl } from "@/Helpers/format";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowRight, CalendarCheck2, ClipboardCheck, FileText, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import Slider from "react-slick";

const FITUR = [
    { icon: <CalendarCheck2 />, title: "Absensi mingguan", desc: "Siswa mengirim satu absensi setiap minggu lengkap dengan PDF bukti dan foto kegiatan." },
    { icon: <ClipboardCheck />, title: "Verifikasi pembimbing", desc: "Pembimbing sekolah dan DU/DI menyetujui atau menolak absensi dengan catatan." },
    { icon: <FileText />, title: "Rekap & laporan", desc: "Rekap kehadiran, nilai, dan laporan PKL siap diunduh dalam format Excel dan PDF." },
];

export default function Welcome({ gambars = [] }) {
    const { auth } = usePage().props;
    const masuk = Boolean(auth?.user);

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Selamat Datang" />
            <section
                className="relative overflow-hidden bg-blue-950 text-white"
                style={{ backgroundImage: `url(${assetUrl("header2.avif")})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-blue-900/85 to-emerald-900/75" />
                <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                    <nav className="flex items-center justify-between py-5">
                        <a href="https://smkn1gedangan-malang.sch.id" target="_blank" rel="noopener" className="flex items-center gap-3">
                            <img src={assetUrl("img/logo.png")} alt="" className="h-10 w-10 rounded-xl bg-white object-contain p-1" />
                            <span className="leading-tight">
                                <span className="block font-semibold">E-PKL</span>
                                <span className="block text-xs text-blue-100">SMKN 1 Gedangan</span>
                            </span>
                        </a>
                        {masuk ? (
                            <Link href={route("dashboard")} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm hover:bg-blue-50">
                                <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </Link>
                        ) : (
                            <Link href={route("login")} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm hover:bg-blue-50">
                                <LogIn className="h-4 w-4" /> Masuk
                            </Link>
                        )}
                    </nav>

                    <div className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-20">
                        <div>
                            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-200 ring-1 ring-inset ring-white/20">Sistem Rekap Praktik Kerja Lapangan</p>
                            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                                Monitoring PKL yang <span className="text-emerald-300">rapi dan terukur</span>.
                            </h1>
                            <p className="mt-4 max-w-lg text-base text-blue-100 sm:text-lg">Absensi mingguan, verifikasi pembimbing, penilaian, dan dokumentasi PKL dalam satu platform.</p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {masuk ? (
                                    <Link href={route("dashboard")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600">
                                        Buka Dashboard <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={route("login")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600">
                                            <LogIn className="h-4 w-4" /> Masuk
                                        </Link>
                                        <Link href={route("aktivasi")} className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 hover:bg-white/20">
                                            <UserPlus className="h-4 w-4" /> Aktivasi Akun Siswa
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        {gambars.length > 0 && (
                            <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
                                <Slider infinite={gambars.length > 1} fade slidesToShow={1} slidesToScroll={1} autoplay autoplaySpeed={3500} arrows={false} dots={gambars.length > 1}>
                                    {gambars.map((g) => (
                                        <div key={g.id}>
                                            <img src={storageUrl(g.url)} alt="Dokumentasi kegiatan PKL" loading="lazy" className="aspect-video w-full object-cover" />
                                        </div>
                                    ))}
                                </Slider>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
                <div className="grid gap-4 md:grid-cols-3">
                    {FITUR.map((f) => (
                        <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 [&_svg]:h-5 [&_svg]:w-5">{f.icon}</span>
                            <h2 className="mt-4 font-semibold text-slate-900">{f.title}</h2>
                            <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}

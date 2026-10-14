import { assetUrl } from "@/Helpers/format";
import { Link } from "@inertiajs/react";
import { CalendarCheck2, FileCheck2, ShieldCheck } from "lucide-react";

/**
 * Layout halaman tamu (login, aktivasi, registrasi, lupa password).
 * Desktop: panel identitas di kiri + form di kanan. Mobile: form saja.
 */
export default function GuestLayout({
    title,
    description,
    children,
    wide = false,
}) {
    return (
        <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <aside
                className="relative hidden overflow-hidden bg-blue-900 lg:block"
                style={{
                    backgroundImage: `url(${assetUrl("header2.avif")})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-blue-900/85 to-emerald-900/80" />
                <div className="relative flex h-full flex-col justify-between p-10 text-white">
                    <Link href={route("welcome")} className="flex items-center gap-3">
                        <img
                            src={assetUrl("img/logo.png")}
                            alt=""
                            className="h-11 w-11 rounded-xl bg-white object-contain p-1.5"
                        />
                        <span className="leading-tight">
                            <span className="block text-base font-semibold">
                                E-PKL
                            </span>
                            <span className="block text-sm text-blue-100">
                                SMKN 1 Gedangan
                            </span>
                        </span>
                    </Link>
                    <div className="max-w-md">
                        <h2 className="text-3xl font-semibold leading-tight tracking-tight">
                            Rekap Praktik Kerja Lapangan dalam satu tempat.
                        </h2>
                        <p className="mt-3 text-blue-100">
                            Absensi mingguan, verifikasi pembimbing, dan
                            rekapitulasi PKL siswa SMKN 1 Gedangan.
                        </p>
                        <ul className="mt-8 space-y-3 text-sm text-blue-50">
                            <li className="flex items-center gap-3">
                                <CalendarCheck2 className="h-5 w-5 text-emerald-300" />
                                Absensi dikirim satu kali setiap minggu
                            </li>
                            <li className="flex items-center gap-3">
                                <FileCheck2 className="h-5 w-5 text-emerald-300" />
                                Bukti PDF diverifikasi pembimbing
                            </li>
                            <li className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                                Akses data sesuai peran pengguna
                            </li>
                        </ul>
                    </div>
                    <p className="text-xs text-blue-200">
                        © {new Date().getFullYear()} SMKN 1 Gedangan, Malang
                    </p>
                </div>
            </aside>

            <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
                <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
                    <Link
                        href={route("welcome")}
                        className="mb-8 flex items-center gap-3 lg:hidden"
                    >
                        <img
                            src={assetUrl("img/logo.png")}
                            alt=""
                            className="h-10 w-10 rounded-xl bg-white object-contain p-1 ring-1 ring-slate-200"
                        />
                        <span className="leading-tight">
                            <span className="block text-sm font-semibold text-slate-900">
                                E-PKL
                            </span>
                            <span className="block text-xs text-slate-500">
                                SMKN 1 Gedangan
                            </span>
                        </span>
                    </Link>
                    {title && (
                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                {title}
                            </h1>
                            {description && (
                                <p className="mt-1.5 text-sm text-slate-500">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
}

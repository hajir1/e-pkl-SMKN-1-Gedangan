import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeft, Lock, SearchX } from "lucide-react";

const PESAN = {
    403: { title: "Akses ditolak", desc: "Anda tidak memiliki izin untuk membuka halaman ini.", icon: <Lock /> },
    404: { title: "Halaman tidak ditemukan", desc: "Halaman yang Anda cari tidak ada atau sudah dipindahkan.", icon: <SearchX /> },
};

export default function NotFound({ status = 404 }) {
    const { auth } = usePage().props;
    const p = PESAN[status] ?? PESAN[404];
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <Head title={p.title} />
            <div className="max-w-md text-center">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 [&_svg]:h-7 [&_svg]:w-7">{p.icon}</span>
                <p className="mt-6 text-sm font-semibold text-blue-700">{status}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{p.title}</h1>
                <p className="mt-2 text-slate-600">{p.desc}</p>
                <div className="mt-8 flex justify-center gap-3">
                    <Link href={auth?.user ? route("dashboard") : route("welcome")} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
                        <ArrowLeft className="h-4 w-4" /> {auth?.user ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
                    </Link>
                </div>
            </div>
        </div>
    );
}

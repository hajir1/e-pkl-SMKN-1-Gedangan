import Card, { CardBody, CardHeader } from "@/Components/Card";
import TitlePage from "@/Components/TitlePage";
import { assetUrl, roleLabel } from "@/Helpers/format";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import { BookOpenText, Building2, CalendarCheck2, ClipboardCheck, Database, LogOut, UserRound } from "lucide-react";

const AKUN = {
    icon: <UserRound />,
    title: "Akun",
    items: ["Email dan password bisa diubah di menu Profil Saya.", "Setelah selesai, selalu pilih Keluar agar sesi login dihapus, terutama di perangkat bersama."],
};

const LAPORAN_PEMBIMBING = {
    icon: <BookOpenText />,
    title: "Judul laporan",
    items: [
        "Admin, pembimbing sekolah, dan pembimbing DU/DI dapat menerima atau menolak judul laporan siswa.",
        "Jika diterima, siswa dapat mulai menyusun laporan. Jika ditolak, siswa diminta mengajukan judul revisi.",
    ],
    image: "img/sampleLaporan.png",
};

const VERIFIKASI = {
    icon: <ClipboardCheck />,
    title: "Verifikasi absensi mingguan",
    items: [
        "Siswa mengirim satu absensi setiap minggu (Senin sampai Minggu) dengan lampiran PDF.",
        "Buka menu Absensi, pilih tab Menunggu, lalu periksa PDF bukti setiap siswa.",
        "Pilih Setujui, atau Tolak dengan catatan alasan. Siswa dapat memperbaiki absensi yang ditolak.",
        "Dashboard menampilkan jumlah absensi yang menunggu verifikasi dan siswa yang sudah absen minggu ini.",
    ],
};

const NILAI = {
    icon: <ClipboardCheck />,
    title: "Nilai akhir",
    items: ["Nilai diberikan di menu Siswa pada akhir masa PKL.", "Setiap pembimbing hanya bisa memberi nilai satu kali dan nilai tidak dapat diubah."],
};

const PANDUAN = {
    siswa: [
        {
            icon: <UserRound />,
            title: "Aktivasi dan login",
            items: [
                "Buka halaman Aktivasi Akun dan masukkan nomor aktivasi (nomor induk + kode jurusan).",
                "Jika nomor tidak ditemukan, hubungi admin atau pembimbing sekolah.",
                "Lengkapi data registrasi, lalu masuk dengan email dan password yang Anda buat.",
            ],
        },
        {
            icon: <CalendarCheck2 />,
            title: "Absensi mingguan",
            items: [
                "Absensi dikirim satu kali setiap minggu, paling lambat Minggu pukul 23.59.",
                "Pilih keterangan (hadir, izin, atau sakit), tulis ringkasan kegiatan, dan lampirkan PDF absensi (maks. 5 MB). Foto kegiatan bersifat opsional.",
                "Absensi bisa diubah selama belum disetujui. Jika ditolak, baca catatan pembimbing lalu perbaiki.",
                "Absensi yang dihapus masuk ke Sampah dan bisa dipulihkan.",
            ],
        },
        {
            icon: <BookOpenText />,
            title: "Laporan PKL",
            items: [
                "Ajukan judul laporan yang unik (tidak boleh sama dengan siswa lain).",
                "Jika judul ditolak, ajukan judul revisi. Jika diterima, unduh format penulisan dan rekap laporan.",
            ],
        },
        {
            icon: <Building2 />,
            title: "Pengajuan tempat PKL",
            items: [
                "Ajukan tempat dari daftar sekolah atau usulkan tempat sendiri.",
                "Pengajuan ditinjau admin. Jika diterima, Anda otomatis ditempatkan di tempat tersebut dan sekolah akan menghubungi Anda.",
            ],
        },
        AKUN,
    ],
    pembimbing: [
        {
            icon: <UserRound />,
            title: "Login dan dashboard",
            items: ["Masuk dengan akun yang dibuat oleh admin.", "Dashboard menampilkan siswa bimbingan, absensi yang menunggu verifikasi, dan status absensi minggu ini."],
        },
        VERIFIKASI,
        LAPORAN_PEMBIMBING,
        NILAI,
        AKUN,
    ],
    admin: [
        {
            icon: <Database />,
            title: "Data master",
            items: [
                "Data NISN siswa wajib diisi lebih dulu (import Excel atau manual) agar siswa bisa aktivasi akun. Data yang sudah dipakai akun tidak bisa dihapus.",
                "Kelola jurusan dan tahun ajaran; hanya data berstatus aktif yang bisa dipilih saat registrasi.",
                "Kelola tempat PKL (DU/DI). Satu tempat hanya bisa memiliki satu pembimbing DU/DI.",
                "Tambahkan akun pembimbing sekolah, pembimbing DU/DI, dan siswa. Siswa yang ditambahkan admin tidak perlu aktivasi.",
                "Kelola gambar slider halaman depan.",
            ],
        },
        {
            icon: <Building2 />,
            title: "Pengajuan tempat",
            items: [
                "Tinjau pengajuan tempat dari siswa. Menerima pengajuan otomatis menempatkan siswa, dan tempat baru otomatis ditambahkan ke daftar DU/DI.",
                "Informasikan keputusan kepada siswa secara langsung atau melalui kontak yang terdaftar.",
            ],
        },
        VERIFIKASI,
        LAPORAN_PEMBIMBING,
        AKUN,
    ],
};

export default function Dokumentasi() {
    const { auth } = usePage().props;
    const kunci = auth.role === "siswa" ? "siswa" : auth.role === "admin" ? "admin" : "pembimbing";
    const bagian = PANDUAN[kunci];

    return (
        <AuthenticatedLayout>
            <Head title="Panduan" />
            <div className="space-y-6">
                <TitlePage eyebrow="Bantuan" title="Panduan Aplikasi" quote={`Langkah penggunaan E-PKL untuk ${roleLabel(auth.role)}.`} />
                <nav aria-label="Daftar isi" className="flex flex-wrap gap-2">
                    {bagian.map((b, i) => (
                        <a key={b.title} href={`#bagian-${i}`} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-blue-300 hover:text-blue-800">
                            {b.title}
                        </a>
                    ))}
                </nav>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
                    {bagian.map((b, i) => (
                        <Card key={b.title} id={`bagian-${i}`} className="scroll-mt-24">
                            <CardHeader icon={b.icon ?? <LogOut />} title={b.title} />
                            <CardBody>
                                <ol className="space-y-3">
                                    {b.items.map((t, j) => (
                                        <li key={j} className="flex gap-3 text-sm text-slate-700">
                                            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">{j + 1}</span>
                                            <span className="pt-0.5">{t}</span>
                                        </li>
                                    ))}
                                </ol>
                                {b.image && <img src={assetUrl(b.image)} alt="Contoh judul laporan" loading="lazy" className="mt-4 w-full rounded-xl border border-slate-200" onError={(e) => (e.currentTarget.style.display = "none")} />}
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

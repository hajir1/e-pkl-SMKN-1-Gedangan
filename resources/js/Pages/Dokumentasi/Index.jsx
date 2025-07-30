import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage } from "@inertiajs/react";
import React, { useEffect } from "react";

const Dashboard = () => {
    const { auth } = usePage().props;
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <h1 className="text-2xl font-bold mt-8 text-slate-900 text-center">
                Panduan Aplikasi untuk {auth.role.replace(/_/g, " ")}
            </h1>
            <div className="flex justify-center mt-8 p-2">
                {auth.role === "siswa" && (
                    <div className="w-full md:w-4/5">
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>
                                ketika pertama kali buka halaman registrasi{" "}
                                {auth.user.name} akan di arahkan ke nomor
                                verifikasi siswa .
                            </li>
                            <li>
                                Pastikan nomor verifikasi telah terdaftar di
                                database. Jika Tidak ditemukan , silahkan
                                hubungi admin/pembimbing untuk proses lebih
                                lanjut
                            </li>
                            <li>
                                Jika nomor registrasi ada , {auth.user.name}{" "}
                                akan diarahkan ke halaman register .
                            </li>
                            <li>
                                Silahkan registrasi akun di halaman tersebut
                            </li>
                            <li>
                                Login dengan user yang {auth.user.name} telah
                                daftarkan.
                            </li>
                            <li>
                                Jika berhasil, {auth.user.name} akan Masuk ke
                                dashboard.
                            </li>
                            <li>
                                {auth.user.name} bisa memantau jumlah kehadiran
                                setiap hari di halaman dashboard
                            </li>
                            <li>
                                {auth.user.name} juga bisa mendapatkan panduan
                                laporan dan halaman awal di website{" "}
                                <b>e-pkl-v2</b> mendatang
                            </li>
                            <li>
                                <b>
                                    {auth.user.name} juga bisa membuat judul
                                    laporan yeng bersifat unik , yang artinya
                                    judul tidak boleh sama dengan siswa lainnya{" "}
                                    <b>(semakin cepat semakin baik)</b>
                                </b>
                            </li>
                            <li>
                                jika judul di tolak oleh pembimbing ,maka siswa
                                akan di arahkan ke halaman revisi
                            </li>

                            <li>
                                jika judul di terima oleh pembimbing ,maka siswa
                                bisa memulai membuat laporan dengan referensi
                                yang ada pada website <b>epkl</b>
                            </li>

                            <li>
                                {auth.user.name} bisa mengajukan lokasi pkl jika
                                dirasa saat ini tidak cocok dengan diri pribadi.
                            </li>
                            <li>
                                Pengajuan lokasi perlu persetujuan admin , jika
                                disetujui , admin akan memberi informasi secara
                                langsung atau dari nomor wa yang telah terdaftar
                            </li>
                            <li>
                                {auth.user.name} bisa menambah jurnal &nbsp;
                                <b> yang hanya bisa diisi 1x setiap hari</b>
                            </li>
                            <li>
                                <b>
                                    Jurnal akan di pantau setiap hari oleh
                                    pembimbing sekolah dan pembimbing pt ,
                                    pastikan jurnal dikirim sebaik mungkin
                                </b>
                            </li>
                            <li>
                                <b>Nilai akan diisi pada akhir proses magang</b>
                            </li>
                            <li>
                                {auth.user.name} bisa mengubah email dan
                                password di halaman edit akun
                            </li>
                            <li>
                                Setelah semua telah dikerjakan , pastikan untuk
                                logout
                                <b>
                                    {" "}
                                    agar data pengguna bisa di hapus dari
                                    session,
                                </b>
                                &nbsp;karena session memungkinkan user bisa
                                langsung masuk ke dashboard tanpa login pada
                                kunjungan berikutnya
                            </li>
                        </ol>
                    </div>
                )}
                {auth.role === "pembimbing_sekolah" && (
                    <div className="w-full md:w-4/5">
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>
                                {auth.role.replace(/_/g, " ")} Login dengan user
                                yang telah dibuatkan oleh admin
                            </li>
                            <li>
                                Jika berhasil, {auth.role.replace(/_/g, " ")}{" "}
                                akan Masuk ke dashboard.
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} bisa memantau
                                jumlah kehadiran siswa setiap hari di halaman
                                dashboard
                            </li>
                            <li>
                                <b>
                                    {auth.role.replace(/_/g, " ")} mempunyai
                                    data siswa yang di bimbing
                                </b>
                            </li>
                            <li>
                                <b>
                                    Admin ,Pembimbing Pt DuDi , dan Pembimbing
                                    Sekolah berhak menyetujui / menolak Judul
                                    laporan yang di buat oleh siswa
                                </b>
                            </li>
                            <li>
                                <b>
                                    Jika disetujui , siswa dapat memulai membuat
                                    laporan , dan jika ditolak maka siswa harus
                                    membuat revisi judul
                                </b>
                            </li>
                            <li>
                                <img
                                    src="./img/sampleLaporan.png"
                                    className="w-full h-auto"
                                    alt=""
                                    srcSet=""
                                />
                            </li>
                            <li>
                                <b>
                                    {auth.role.replace(/_/g, " ")} mengetahui
                                    seluruh jurnal yang telah dikirim oleh siswa
                                    yang di bimbingnya
                                </b>
                            </li>
                            <li>
                                <b>
                                    Untuk menandai telah membaca jurnal yang
                                    dikirim siswa,{" "}
                                    {auth.role.replace(/_/g, " ")} bisa meng
                                    klik tombol yang ada pada kolom mark
                                </b>
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} bisa memberi
                                nilai pada siswa pada akhir masa pkl.
                                <b> Nilai hanya bisa diisi 1x per semester</b>
                            </li>
                            <li>
                                {auth.user.name} bisa mengubah email dan
                                password di halaman edit akun
                            </li>
                            <li>
                                Setelah semua telah dikerjakan , pastikan untuk
                                logout
                                <b>
                                    {" "}
                                    agar data pengguna bisa di hapus dari
                                    session,
                                </b>
                                &nbsp; karena session memungkinkan user bisa
                                langsung masuk ke dashboard tanpa login pada
                                kunjungan berikutnya
                            </li>
                        </ol>
                    </div>
                )}
                {auth.role === "pembimbing_pt" && (
                    <div className="w-full md:w-4/5">
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>
                                {auth.role.replace(/_/g, " ")} Login dengan user
                                yang telah dibuatkan oleh admin
                            </li>
                            <li>
                                Jika berhasil, {auth.role.replace(/_/g, " ")}{" "}
                                akan Masuk ke dashboard.
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} bisa memantau
                                jumlah kehadiran siswa setiap hari di halaman
                                dashboard
                            </li>
                            <li>
                                <b>
                                    {auth.role.replace(/_/g, " ")} mempunyai
                                    data siswa yang di bimbing
                                </b>
                            </li>
                            <li>
                                <b>
                                    Admin ,Pembimbing Pt DuDi , dan Pembimbing
                                    Sekolah berhak menyetujui / menolak Judul
                                    laporan yang di buat oleh siswa
                                </b>
                            </li>
                            <li>
                                <b>
                                    Jika disetujui , siswa dapat memulai membuat
                                    laporan , dan jika ditolak maka siswa harus
                                    membuat revisi judul
                                </b>
                            </li>
                            <li>
                                <img
                                    src="./img/sampleLaporan.png"
                                    className="w-full h-auto"
                                    alt=""
                                    srcSet=""
                                />
                            </li>
                            <li>
                                <b>
                                    {auth.role.replace(/_/g, " ")} mengetahui
                                    seluruh jurnal yang telah dikirim oleh siswa
                                    yang di bimbingnya
                                </b>
                            </li>
                            <li>
                                <b>
                                    Untuk menandai telah membaca jurnal yang
                                    dikirim siswa,{" "}
                                    {auth.role.replace(/_/g, " ")} bisa meng
                                    klik tombol yang ada pada kolom mark
                                </b>
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} bisa memberi
                                nilai pada siswa pada akhir masa pkl.
                                <b> Nilai hanya bisa diisi 1x per semester</b>
                            </li>
                            <li>
                                {auth.user.name} bisa mengubah email dan
                                password di halaman edit akun
                            </li>
                            <li>
                                Setelah semua telah dikerjakan , pastikan untuk
                                logout
                                <b>
                                    {" "}
                                    agar data pengguna bisa di hapus dari
                                    session,
                                </b>
                                &nbsp; karena session memungkinkan user bisa
                                langsung masuk ke dashboard tanpa login pada
                                kunjungan berikutnya
                            </li>
                        </ol>
                    </div>
                )}

                {auth.role === "admin" && (
                    <div className="w-full md:w-4/5">
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>
                                Login dengan user role admin yang telah dibuat
                                pertama kali
                            </li>
                            <li>
                                Jika berhasil, {auth.role.replace(/_/g, " ")}{" "}
                                akan masuk ke dashboard.
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} bisa memantau
                                jumlah tempat , siswa, pembimbing pt, pembimbing
                                sekolah saat ini
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} bisa mengubah
                                gambar slider yang ada pada halaman welcome
                            </li>
                            <li>
                                <b>
                                    {auth.role.replace(/_/g, " ")} wajib mendata
                                    user yang nantinya bisa verifikasi dan
                                    registrasi sebagai siswa
                                </b>
                            </li>
                            <li>
                                Penambahan data bisa melalui excel atau manual
                            </li>
                            <li>
                                <b>
                                    Jika telah di verifikasi oleh siswa , data
                                    tidak bisa dihapus
                                </b>
                            </li>
                            <li>
                                <b>
                                    Admin ,Pembimbing Pt DuDi , dan Pembimbing
                                    Sekolah berhak menyetujui / menolak Judul
                                    laporan yang di buat oleh siswa
                                </b>
                            </li>
                            <li>
                                <b>
                                    Jika disetujui , siswa dapat memulai membuat
                                    laporan , dan jika ditolak maka siswa harus
                                    membuat revisi judul
                                </b>
                            </li>
                            <li>
                                <img
                                    src="./img/sampleLaporan.png"
                                    className="w-full h-auto"
                                    alt=""
                                    srcSet=""
                                />
                            </li>
                            <li>
                                <b>
                                    {auth.role.replace(/_/g, " ")} berhak
                                    menyetujui / menolak pengajuan tempat dan
                                    dilakukan oleh siswa
                                </b>
                            </li>
                            <li>
                                <b>
                                    Jika disetujui, siswa akan secara otomatis
                                    terdaftar sebagai peserta magang di tempat
                                    yang telah diajukan sebelumnya. Apabila
                                    tempat tersebut merupakan tempat baru, maka
                                    data tempat tersebut akan otomatis
                                    ditambahkan ke dalam daftar tempat DU/DI.
                                </b>
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} berhak memberi
                                tau secara langsung atau lewat kontak mengenai
                                usulan pengajuan tempat dari siswa
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} dapat membuat
                                data jurusan dan apabila ingin digunakan bisa di
                                set menjadi aktif
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} dapat membuat
                                data tahun ajaran dan apabila ingin digunakan
                                bisa di set menjadi aktif
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} dapat membuat
                                data tempat du/di dan hanya{" "}
                                <b>bisa di set 1 pembimbing pt</b>
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")}{" "}
                                <b>
                                    {" "}
                                    bisa menambah user baru untuk pembimbing pt
                                    dan pembimbing sekolah
                                </b>
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")}{" "}
                                <b>
                                    bisa menambah user baru untuk siswa yang
                                    nantinya tak perlu lagi verifikasi untuk
                                    login ke dashboard
                                </b>
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")}{" "}
                                <b>
                                    berhak menambah / mengubah tempat pkl
                                    ,pembimbing sekolah,jurusan dan tahun ajaran
                                    untuk siswa yang telah verifikasi dan
                                    register
                                </b>
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")}{" "}
                                <b>
                                    tak bisa mengubah nama siswa kecuali dari
                                    halaman data siswa
                                </b>
                            </li>
                            <li>
                                {auth.role.replace(/_/g, " ")} mengetahui
                                seluruh jurnal yang telah diisi siswa
                            </li>
                            <li>
                                Untuk menandai telah membaca jurnal yang dikirim
                                siswa, {auth.role.replace(/_/g, " ")} bisa meng
                                klik tombol yang ada pada kolom mark
                            </li>
                            <li>
                                {auth.user.name} bisa mengubah email dan
                                password di halaman edit akun
                            </li>
                            <li>
                                Setelah semua telah dikerjakan , pastikan untuk
                                logout
                                <b>
                                    {" "}
                                    agar data pengguna bisa di hapus dari
                                    session,
                                </b>
                                &nbsp;karena session memungkinkan user bisa
                                langsung masuk ke dashboard tanpa login pada
                                kunjungan berikutnya
                            </li>
                        </ol>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default Dashboard;

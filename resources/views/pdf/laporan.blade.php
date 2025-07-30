<!DOCTYPE html>
<html lang="en">
<head>
    <title>Laporan {{ $user->name }}</title>
    <style>
        body{
            font-family: 'Times New Roman', Times, serif;
            color: black;
            font-size: 12pt;
            line-height: 1.5;
            text-align: justify;
            width: 100%;
            position: relative;
        }
        h3{
            text-transform: uppercase;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- halaman pertama -->
    <h3>LAPORAN PRAKTEK KERJA LAPANGAN <br>{{ $user->laporan->judul }}</h3>

    <p align="center" style="margin-top:12rem;">Oleh:<br> <span style="text-transform: uppercase;">{{ $user->name }}</span> <br>NIS : {{ $user->dataSiswa->nisn }}</p>

    <img src="{{ public_path("img/logo.png") }}" width="240" height="240" style="position:relative;left:50%;transform:translateX(-50%);margin-top:4rem;" alt="">
    <h4 align="center" style="position:absolute;bottom:0; text-transform: uppercase;left:50%;transform:translateX(-50%);">PEMERINTAH PROVINSI JAWA TIMUR <br>DINAS PENDIDIKAN <br>SMK NEGERI 1 GEDANGAN <br>KABUPATEN MALANG <br>TAHUN {{ $user->tahunAjaran->tahun ?? "Belum Diisi" }} </h4>

    <div style="page-break-after: always;"></div>

    <!-- halaman kedua -->
    <h3>HALAMAN PENGESESAHAN</h3>
    <p align="center" style="font-size: 12pt;text-transform:capitalize">Praktek Kerja Lapangan<br>{{ $user->laporan->judul }}</p>

    <p align="center" style="margin-top:3rem;">Oleh:<br> <span style="text-transform: uppercase;">{{ $user->name }}</span> <br>NIS : {{ $user->dataSiswa->nisn }}</p>

    <p align="center" style="margin-top:3rem;">Telah Disetujui <br>Pada Tanggal:..............</p>

    <p align="center" style="margin-top:7rem;">Mengetahui dan Mengesahkan</p>

    <table style="width: 100%;">
        <tbody>
            <tr>
                <td align="left" style="width: 50%;">
                    <p align="center">Pembimbing Sekolah</p>
                    <p align="center " style="margin-top:6rem;font-weight: bold;">{{ $user->pbSkl->name ?? "Belum Diisi" }}</p>
                </td>

                <td align="right" style="width: 50%;">
                    <p align="center">Pembimbing Du/Di</p>
                    <p align="center " style="margin-top:6rem;font-weight: bold;">{{ $user->tempat->user->name ?? "Belum Diisi" }}</p>
                </td>
            </tr>
        </tbody>
    </table>

    <p align="center" style="margin-top:6rem;">Kepala Konsentrasi Keahlian</p>
    <p align="center" style="margin-top:6rem;font-weight:bold">{{ $user->jurusan->kepala ?? "Belum Diisi" }}</p>

    <div style="page-break-after: always;"></div>


    <!-- halaman ketiga -->
    <h3>IDENTITAS SISWA</h3>
    <table style="margin-top: 1rem;">
            <tbody>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Nama      
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->name }}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Email       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->email }}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Kontak       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->kontak }}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Tempat , Tanggal Lahir       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->tempat_lahir ?? "Belum Diisi"}},
                            {{ $user->tanggal_lahir ?? "Belum Diisi"}}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Jurusan       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->jurusan?->nama ?? "Belum Diisi"}}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Tahun Ajaran       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->tahunAjaran?->tahun?? "Belum Diisi"}}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Tempat Pkl       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->tempat?->nama ?? "Belum Diisi"}}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Pembimbing Pkl       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->tempat?->user?->name ?? "Belum Diisi"}}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Pembimbing Sekolah       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $user->pbSkl?->name ?? "Belum Diisi"}}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Jumlah Jurnal       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $jumlahJurnals ?? "Belum Diisi" }}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Jumlah Hadir Pkl       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $hadirs ?? "Belum Pernah" }}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Jumlah Sakit Saat Pkl       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $sakits ?? "Belum Pernah" }}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Jumlah Izin Saat Pkl       
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        <div>: {{ $izins ?? "Belum Pernah" }}</div>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 0.5rem 3rem;" class="label">     
                        Nilai     
                    </td>
                    <td align="left" style="padding: 0.5rem 3rem;">
                        @if (count($user->nilai) > 0)
                            @foreach ($user->nilai as $n)
                                <div>{{ $n->nilai ?? "Belum Diisi" }}</div>
                            @endforeach
                        @endif
                    </td>
                </tr>
            </tbody>
    </table> 

     <table style="width: 100%;margin-top:10rem;">
        <tbody>
            <tr>
                <td align="right" style="width: 40%;">
                    <p style="margin-right: 1rem;">Penulis, </p>
                    <p style="margin-top:6rem;margin-right: 1rem;">{{ $user->name }}</p>
                </td>
            </tr>
        </tbody>
    </table>

    <div style="page-break-after: always;"></div>


    <!-- halaman keempat -->
    <h3>KATA PENGANTAR</h3>
    <p style="text-align: justify;text-indent:1.6rem;">
        Puja dan puji syukur kami panjatkan kehadirat Allah SWT yang telah melimpahkan rahmat dan memberikan banyak kesempatan, sehingga saya dapat menyelesaikan laporan PKL (Praktik Kerja Lapangan) dengan tepat waktu.
    </p>
    <p style="text-align: justify;text-indent:1.6rem;">
        Laporan ini disusun sebagai bukti berakhirnya magang industri selama kurang lebih 6 bulan di {{ $user->tempat->name ?? "Belum Diisi" }} dan guna melengkapi persyaratan dalam menyelesaikan PKL saya selaku siswa di SMKN 1 Gedangan jurusan {{ $user->jurusan->nama }} dan meningkatkan peran serta saya selaku siswa untuk menerapkan materi yang telah dipelajari untuk di praktikan dalam dunia kerja industri. 
    </p>
    <p style="text-align: justify;text-indent:1.6rem;">
        Dalam penyusunan laporan ini, kami menyadari sepenuhnya bahwa selesainya PKL tidak terlepas dari dukungan, semangat, serta bimbingan dari berbagai pihak, baik bersifat moril maupun material.
    </p>
    <p>Oleh karena itu, saya ingin menyampaikan ucapan terima kasih kepada: </p>
    <ol>
        <li>Bapak Ainun Huda, M.Pd. selaku kepala sekolah SMKN 1 Gedangan</li>
        <li>Kedua orang tua yang telah memberikan dukungan dan motivasi kepada saya</li>
        <li>{{ $user->pbSkl->name ?? "Belum Diisi"}} selaku pembimbing dari sekolah</li>
        <li>{{ $user->tempat->user->name ?? "Belum Diisi" }} selaku pembimbing dari Pt/Du Di</li>
        <li>Rekan rekan di {{ $user->tempat->nama ?? "Belum Diisi" }}</li>
        <li>Teman - teman yang selalu memberikan motivasi dan dukungan</li>
    </ol>
    <p style="text-align: justify;text-indent:1.6rem;">Terima kasih atas setiap dukungan dan motivasi dalam penyusunan laporan ini.Semoga laporan ini dapat bermanfaat bagi semua pihak yang membacanya dan menjadi referensi bagi adik-adik kelas yang akan melaksanakan kegiatan PKL di masa mendatang. Saya menyadari bahwa laporan ini masih jauh dari sempurna, oleh karena itu saya meminta maaf yang sebesar besarnya jika ada tulisan yang kurang berkenan di hati, serta mengharapkan saran dan kritik yang membangun.</p>
    <table style="width: 100%;margin-top:10rem;">
        <tbody>
            <tr>
                <td align="right" style="width: 40%;">
                    <p style="margin-right: 1rem;">Gedangan , {{ now()->format("d-m-Y") }} </p>
                    <p style="margin-top:6rem;margin-right: 1rem;">{{ $user->name }}</p>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>
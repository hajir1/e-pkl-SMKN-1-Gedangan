@php
    // Sebelumnya kolom "Dilihat Pembimbing" membaca $s["dilihat"] yang tidak
    // ada di tabel jurnals (selalu "belum"), dan judul memakai colspan 7
    // untuk 6 kolom data. Sekarang mengikuti data absensi mingguan.
    $statusLabel = ['pending' => 'Menunggu', 'disetujui' => 'Disetujui', 'ditolak' => 'Ditolak'];
@endphp
<table>
    <thead>
    <tr>
        <th colspan="10" style="font-weight: bold; text-transform: uppercase;" align="center">Data Absensi PKL SMKN 1 Gedangan</th>
    </tr>
    <tr>
        <th align="center" style="font-weight: bold;">No</th>
        <th align="center" style="font-weight: bold;" width="25">Nama</th>
        <th align="center" style="font-weight: bold;" width="25">Periode Minggu</th>
        <th align="center" style="font-weight: bold;" width="15">Keterangan</th>
        <th align="center" style="font-weight: bold;" width="40">Kegiatan</th>
        <th align="center" style="font-weight: bold;" width="20">Dikirim Pada</th>
        <th align="center" style="font-weight: bold;" width="15">Status</th>
        <th align="center" style="font-weight: bold;" width="25">Diverifikasi Oleh</th>
        <th align="center" style="font-weight: bold;" width="35">Catatan Verifikasi</th>
        <th align="center" style="font-weight: bold;" width="25">Tanda Tangan</th>
    </tr>
    </thead>
    <tbody>
    @foreach($siswas as $s)
        @php
            $status = $s->status_verifikasi ?? ($s->mark ? 'disetujui' : 'pending');
        @endphp
        <tr>
            <td align="center">{{ $loop->iteration }}</td>
            <td align="center">{{ $s->user?->name }}</td>
            <td align="center">
                @if($s->minggu_mulai)
                    {{ $s->minggu_mulai->format('d-m-Y') }} s/d {{ \Carbon\Carbon::parse($s->minggu_selesai)->format('d-m-Y') }}
                @else
                    {{ \Carbon\Carbon::parse($s->created_at)->format('d-m-Y') }}
                @endif
            </td>
            <td align="center">{{ ucfirst($s->keterangan) }}</td>
            <td>{{ $s->kegiatan }}</td>
            <td align="center">{{ \Carbon\Carbon::parse($s->created_at)->format('d-m-Y H:i') }}</td>
            <td align="center">{{ $statusLabel[$status] ?? $status }}</td>
            <td align="center">{{ $s->verifikator?->name ?? '-' }}</td>
            <td>{{ $s->catatan_verifikasi ?? '' }}</td>
            <td></td>
        </tr>
    @endforeach
    </tbody>
</table>

<?php

namespace App\Http\Controllers;

use App\Models\Jurnal;
use App\Models\Nilai;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class NilaiController extends Controller
{
    /**
     * Pembimbing memberi nilai kepada siswa bimbingannya.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            "user_id"=>"required|integer|exists:users,id",
            "nilai"=> "required|string|max:20",
            "keterangan"=>"required|max:200",
        ],[
            "nilai.required"=>"Nilai Wajib Diisi",
            "keterangan.required"=>"Keterangan Wajib Diisi Minimal 1 Kata",
            "keterangan.max"=>"Keterangan Maksimal 200 Kata",
        ]);

        $pembimbing = Auth::user();
        $siswa = User::with('tempat')->role('siswa')->findOrFail($validate["user_id"]);

        // pembimbing_id dulu diambil dari request sehingga bisa dipalsukan;
        // sekarang selalu pengguna yang login, dan siswa harus bimbingannya.
        $membimbing = ($pembimbing->hasRole('pembimbing_sekolah') && (int) $siswa->pembimbing_sekolah_id === (int) $pembimbing->id)
            || ($pembimbing->hasRole('pembimbing_pt') && $siswa->tempat && (int) $siswa->tempat->pembimbing_id === (int) $pembimbing->id);
        abort_unless($membimbing, 403);

        $nilaiId = Nilai::with("siswa")->where("user_id","=",$siswa->id)->where("pembimbing_id","=",$pembimbing->id)->first();

        if($nilaiId){
           return redirect()->route("siswa.index")->with("error","Anda Telah Menambah Nilai Untuk {$nilaiId->siswa->name}");
        }

        Nilai::create([
            "user_id"=>$siswa->id,
            "pembimbing_id"=>$pembimbing->id,
            "nilai"=>$validate["nilai"],
            "keterangan"=>$validate["keterangan"],
        ]);

        return redirect()->route("siswa.index")->with("success","Sukses Menambah Nilai Baru");
    }

    /**
     * Endpoint lama untuk "menandai" jurnal (PUT nilai/{id}). Dipertahankan
     * agar tombol yang sudah ada tetap berjalan, tetapi sekarang memakai
     * aturan verifikasi yang sama dengan JurnalController@verifikasi.
     */
    public function update(Request $request, string $id)
    {
        $jurnal = Jurnal::with('user.tempat')->findOrFail($id);
        Gate::authorize('verify', $jurnal);

        $jurnal->mark = true;
        $jurnal->status_verifikasi = Jurnal::STATUS_DISETUJUI;
        $jurnal->diverifikasi_oleh = Auth::id();
        $jurnal->diverifikasi_at = now();
        $jurnal->save();
        Jurnal::flushCacheFor($jurnal->user_id);

        return redirect()->back()->with("success","Sukses Menandai Jurnal");
    }
}

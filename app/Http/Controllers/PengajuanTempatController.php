<?php

namespace App\Http\Controllers;

use App\Models\PengajuanTempat;
use App\Models\Tempat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PengajuanTempatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         return Inertia::render("PengajuanTempat/Index",[
            // Siswa hanya melihat pengajuannya sendiri.
            "pengajuanTempats"=>PengajuanTempat::with("user")
                ->when(Auth::user()->hasRole("siswa"), fn($q) => $q->where("user_id", Auth::id()))
                ->latest()->paginate()->withQueryString()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("PengajuanTempat/Form",[
            "tempats"=>Tempat::get(),
            "pengajuanTempats"=>PengajuanTempat::when(Auth::user()->hasRole("siswa"), fn($q) => $q->where("user_id", Auth::id()))->latest()->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

        $isSiswa = Auth::user()->hasRole("siswa");

        // Pilihan "Dari sekolah": data tempat disalin dari tabel tempats.
        // Sebelumnya siswa selalu ditolak ("Nama Tempat Telah Terdaftar Dari
        // Sekolah") saat memilih tempat yang disediakan sekolah.
        if ($isSiswa && $request->filled("tempat_id")) {
            $request->validate([
                "tempat_id"=>["required", Rule::exists("tempats","id")],
                "alasan"=>"required|string|max:1000",
            ],[
                "tempat_id.exists"=>"Tempat Tidak Ditemukan",
                "alasan.required"=>"Alasan Wajib Diisi",
            ]);
            if (PengajuanTempat::where("user_id", Auth::id())->exists()) {
                return redirect()->route("pengajuanTempat.create")->with("error","Anda Masih Memiliki Pengajuan Yang Belum Diproses");
            }
            $tempat = Tempat::findOrFail($request->integer("tempat_id"));
            PengajuanTempat::create([
                "user_id"=>Auth::id(),
                "nama"=>$tempat->nama,
                "kontak"=>$tempat->kontak,
                "bidang_usaha"=>$tempat->bidang_usaha,
                "lokasi"=>$tempat->lokasi,
                "alasan"=>$request->input("alasan"),
                "is"=>"sekolah",
            ]);
            return redirect()->route("pengajuanTempat.create")->with("success","Sukses Mengajukan Tempat Ke Admin Sekolah");
        }

        $validate = $request->validate([
            // Admin boleh mengajukan untuk siswa tertentu; siswa selalu untuk dirinya sendiri.
            "user_id"=>[$isSiswa ? "nullable" : "required", Rule::exists("users","id")],
            'nama' => ['required','string','max:255', function ($attribute, $value, $fail) use($isSiswa) {
            if (
                $isSiswa && Tempat::where('nama', $value)->exists()
            ) {
                $fail('Nama Tempat Telah Terdaftar Dari Sekolah.');
            }
            }],
            "kontak"=>['required',"regex:/^0[0-9]{9,12}$/"],
            "bidang_usaha"=>"string|required|max:255",
            "lokasi"=>"required|string|max:255",
            "alasan"=>"required|string|max:1000",
        ],[
            "nama.required"=>"Nama Du/Di Wajib Diisi",
            "kontak.required"=>"Kontak Du/Di Wajib Diisi",
            "kontak.regex"=>"Kontak Wajib 10 - 13 Karakter Dan Diawali Angka 0",
            "bidang_usaha.required"=>"Bidang Usaha Du/Di Wajib Diisi",
            "lokasi.required"=>"Lokasi Bidang Usaha Du/Di Wajib Diisi",
            "alasan.required"=>"Alasan Wajib Diisi",
        ]);
        if ($isSiswa) {
            $validate["user_id"] = Auth::id();
            if (PengajuanTempat::where("user_id", Auth::id())->exists()) {
                return redirect()->route("pengajuanTempat.create")->with("error","Anda Masih Memiliki Pengajuan Yang Belum Diproses");
            }
        }
        // Field "is" ditentukan server, bukan dari request.
        $validate["is"] = $isSiswa ? "siswa" : "sekolah";

        PengajuanTempat::create($validate);

        return redirect()->route("pengajuanTempat.create")->with("success","Sukses Mengajukan Tempat Ke Admin Sekolah");
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
       try {
         // Data diambil dari pengajuan yang tersimpan, bukan dari request,
         // supaya admin tidak tanpa sengaja memindahkan siswa lain.
         DB::transaction(function() use($id){
            $pengajuan = PengajuanTempat::lockForUpdate()->findOrFail($id);
            $tempatId =Tempat::where("nama","=",$pengajuan->nama)->first();
            if(!$tempatId){
                $tempatId =  Tempat::create([
                "nama"=>$pengajuan->nama,
                "kontak"=>$pengajuan->kontak,
                "bidang_usaha"=>$pengajuan->bidang_usaha,
                "lokasi"=>$pengajuan->lokasi,
                ]);
            }
            User::where("id","=",$pengajuan->user_id)->update([
                "tempat_id"=>$tempatId->id
            ]);
            $pengajuan->delete();
        });
       } catch (\Exception $e) {
            Log::error("Transaction Pengajuan Tempat gagal: " . $e->getMessage());
            return redirect()->back()->with("error", "Terjadi kesalahan, coba beberapa saat lagi");
       }

        return redirect()->back()->with("success","Berhasil Mengubah Tempat Du/Di Dan Mengubah Data Siswa");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        PengajuanTempat::findOrFail($id)->delete();
        return redirect()->back()->with("success","Berhasil Menolak Tempat Usulan Pemohon");
    }
}

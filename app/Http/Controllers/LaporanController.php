<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\StepLaporan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LaporanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $datas = Laporan::query()->with(["user.tempat"])
            // Sebelumnya siswa bisa melihat judul laporan seluruh siswa.
            ->when(Auth::user()->hasRole("siswa"),function($query){
                $query->where("user_id","=",Auth::id());
            })
            ->when(Auth::user()->getRoleNames()->contains("pembimbing_sekolah"),function($query){
                $query->whereHas("user",function($q2){
                    $q2->where("pembimbing_sekolah_id","=",Auth::user()->id);
                });
            })
            ->when(Auth::user()->getRoleNames()->contains("pembimbing_pt"),function($query){
                $query->whereHas("user.tempat",function($q2){
                    $q2->where("pembimbing_id","=",Auth::user()->id);
                });
            })
        ->latest()->paginate(10)->withQueryString();


        return Inertia::render("Laporan/Index",[
            "laporans"=>$datas,
            
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("Laporan/Create",[
            "laporans"=>Laporan::where("user_id","=",Auth::id())->get(),
            "step"=>StepLaporan::where("user_id","=",Auth::user()->id)->pluck("step")->first(),
            "siswa"=> User::with(["jurusan","tahunAjaran","pbSkl","tempat.user","nilai.pembimbing","dataSiswa","laporan"])->where("id","=",Auth::user()->id)->first(),
            "laporan"=>Laporan::where("user_id","=",Auth::user()->id)->where("status","=","tolak")->first()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // user_id & status tidak lagi diambil dari request: sebelumnya siswa
        // bisa membuat judul atas nama siswa lain, dan aturan "enum:pending"
        // tidak valid sehingga mengirim field status memicu error 500.
        $data = $request->validate([
            "judul"=>"string|required|min:10|max:255|unique:laporans,judul",
        ],[
            "judul.min"=>"Judul Wajib Diisi Minimal 10 Karakter Huruf",
            "judul.unique"=>"Judul Telah Digunakan"
        ]);
        $data["user_id"] = Auth::id();

        $masihAktif = Laporan::where("user_id","=",$data["user_id"])->whereIn("status",["pending","terima"])->exists();
        if($masihAktif){
            return redirect()->back()->with("error","Anda Sudah Memiliki Judul Laporan Yang Menunggu / Diterima");
        }

        try {
          DB::transaction(function()use ($data){
              $laporan = new Laporan(["judul"=>$data["judul"],"user_id"=>$data["user_id"]]);
              $laporan->status = "pending";
              $laporan->save();

            StepLaporan::updateOrcreate([
                "user_id"=>$data["user_id"],
                
            ],[
                "user_id"=>$data["user_id"],
                "step"=> 2
            ]);
          });
        } catch (\Throwable $th) {
            report($th);
            return redirect()->back()->with("error","Terjadi Kesalahan, Coba Beberapa Saat Lagi");
        }

        return redirect()->back()->with("success","Sukses Menambah Judul Baru");
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
    public function edit(Request $request, string $id)
    {
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            "status"=>["required","in:terima,tolak"],
        ]);

        $laporanId = Laporan::with("user.tempat")->findOrFail($id);
        abort_unless($this->bolehKelola($laporanId), 403);

            try {
                DB::transaction(function() use($data,$laporanId){
                    $laporanId->status = $data["status"];
                    $laporanId->save();
                
                $stepLaporanId = StepLaporan::firstOrCreate(["user_id"=>$laporanId->user_id],["step"=>1]);

                if($data["status"] === "terima"){
                    $stepLaporanId->update([
                        "step"=>3
                    ]);
                }else{
                    $stepLaporanId->update([
                        "step"=>1
                    ]);
                }
                $stepLaporanId->save();
                });
            } catch (\Throwable $th) {
                report($th);
            return redirect()->back()->with("error","Terjadi Kesalahan, Coba Beberapa Saat Lagi");
            }           
        return redirect()->back()->with("success","Berhasil Mengubah Data");

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $laporanId = Laporan::with("user.tempat")->findOrFail($id);
        // Siswa hanya boleh menghapus judul miliknya yang belum diterima.
        $milikSendiri = Auth::user()->hasRole("siswa") && (int) $laporanId->user_id === (int) Auth::id() && $laporanId->status !== "terima";
        abort_unless($milikSendiri || $this->bolehKelola($laporanId), 403);

        $laporanId->delete();
        StepLaporan::where("user_id","=",$laporanId->user_id)->update([
            "step"=>1
        ]);
        return redirect()->back()->with("success","Sukses Menghapus Judul Laporan");

    }

    /**
     * Admin, pembimbing sekolah siswa, atau pembimbing PT dari tempat siswa.
     */
    private function bolehKelola(Laporan $laporan): bool
    {
        $user = Auth::user();
        $siswa = $laporan->user;

        return $user->hasRole("admin")
            || ($siswa && $user->hasRole("pembimbing_sekolah") && (int) $siswa->pembimbing_sekolah_id === (int) $user->id)
            || ($siswa && $user->hasRole("pembimbing_pt") && $siswa->tempat && (int) $siswa->tempat->pembimbing_id === (int) $user->id);
    }
}

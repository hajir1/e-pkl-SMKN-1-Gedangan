<?php

namespace App\Http\Controllers;

use App\Models\Gambar;
use App\Models\Jurnal;
use App\Models\Jurusan;
use App\Models\Laporan;
use App\Models\PengajuanTempat;
use App\Models\TahunAjaran;
use App\Models\Tempat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request )
    {

         // lalu baru paginasi manual di controller
        $page = request()->get('page', 1);
        $perPage = 10;


        // statistik siswa
        $rekapSiswa = Jurnal::where("user_id","=",Auth::user()->id)->select("keterangan",DB::raw("count(*) as total"))->groupBy("keterangan")->pluck("total","keterangan");

        // statistik pembimbing
        $rekapPb = collect();
        if(Auth::user()->getRoleNames()->contains("pembimbing_pt") || Auth::user()->getRoleNames()->contains("pembimbing_sekolah")){
            $rekapPb = User::query()->with(["tempat","roles"])
            ->when(Auth::user()->getRoleNames()->contains("pembimbing_sekolah"),function($query){
                $query->withCount(["jurnals","jurnals as jurnals_pending_count"=>fn($q)=>$q->where("status_verifikasi",Jurnal::STATUS_PENDING)])->where("pembimbing_sekolah_id","=",Auth::user()->id);
            })
            ->when(Auth::user()->getRoleNames()->contains("pembimbing_pt"),function($query){
                $query->withCount(["jurnals","jurnals as jurnals_pending_count"=>fn($q)=>$q->where("status_verifikasi",Jurnal::STATUS_PENDING)])->whereHas("tempat",function($q2){
                        $q2->where("pembimbing_id",Auth::user()->id);
                    });
                })
            ->get();
        }

        // statistik admin
        $statistik = collect();      
        if(Auth::user()->getRoleNames()->contains("admin")){
            $statistik = [
            "tempat"=>Tempat::count(),
            "siswa"=>User::with("roles")->role("siswa")->count(),
            "pembimbingPt"=>User::with("roles")->role("pembimbing_pt")->count(),
            "pembimbingSekolah"=>User::with("roles")->role("pembimbing_sekolah")->count(),
            "pengajuanTempat"=>PengajuanTempat::count(),
            "slider"=>Gambar::count(),
            "jurusan"=>Jurusan::count(),
            "tahunAjaran"=>TahunAjaran::count(),
            "jurnal"=>Jurnal::count(),
            "jurnalPending"=>Jurnal::where("status_verifikasi",Jurnal::STATUS_PENDING)->count(),
            "laporan"=>Laporan::count(),
        ];
        }


        $page = $request->input("page", 1);
        // get users aktif and set to cache
        $cacheKeyUsers = 'user_active_' . Auth::user()->jurusan_id;
        $userActives = Cache::remember($cacheKeyUsers, 3600 * 24, function () {
            return User::with(['roles', 'datasiswa', 'jurusan'])
                ->where('isVisibilityJurnal', true)
                ->where('jurusan_id', Auth::user()->jurusan_id)
                ->orderBy('name')
                ->get(); // ambil semua, cache dulu
        });

        // jurnals by user_id and set to cache
        // Sebelumnya user_id dari query string dipakai apa adanya, sehingga
        // siapa pun bisa melihat jurnal siswa mana pun (IDOR). Sekarang hanya
        // jurnal milik sendiri, siswa yang membagikan jurnalnya (ada di daftar
        // userActives), atau siswa yang boleh dilihat sesuai role.
        $targetId = $request->integer("user_id");
        $jurnals = new LengthAwarePaginator([], 0, 10, $page, ['path' => $request->url()]);
        if ($targetId > 0) {
            $boleh = $targetId === Auth::id()
                || $userActives->contains("id", $targetId)
                || Jurnal::query()->visibleTo(Auth::user())->where("jurnals.user_id", $targetId)->exists();

            if ($boleh) {
                $versi = Jurnal::cacheVersion($targetId);
                $jurnals = Cache::remember("jurnals_user_{$targetId}_v{$versi}_page_{$page}", 3600, function () use ($targetId) {
                    return Jurnal::with('user')
                        ->where('user_id', $targetId)
                        ->latest()
                        ->paginate(10);
                });
            }
        }


        return Inertia::render("Dashboard",[
            "rekapSiswa"=>$rekapSiswa ?? [],
            "rekapPb"=>$rekapPb,
            "statistik"=>$statistik,
            "userActives"=>$userActives,
            "jurnals"=>$jurnals,
            // Ringkasan tambahan untuk dashboard per role (status absensi
            // minggu ini, antrean verifikasi, info PKL). Semua angka diambil
            // dari database; frontend tetap berjalan bila prop ini tidak ada.
            "ringkasan"=>$this->ringkasan(Auth::user()),
        ]);
    }

    /**
     * Data ringkasan dashboard sesuai role pengguna.
     */
    private function ringkasan(User $user): array
    {
        $awal = Jurnal::awalMinggu();
        $data = [
            "periode" => [
                "mulai" => $awal->toDateString(),
                "selesai" => $awal->copy()->addDays(6)->toDateString(),
            ],
        ];

        $hitungStatus = function ($query): array {
            $rows = (clone $query)
                ->select("status_verifikasi", DB::raw("count(*) as total"))
                ->groupBy("status_verifikasi")
                ->pluck("total", "status_verifikasi");

            return [
                "total" => (int) $rows->sum(),
                "pending" => (int) ($rows[Jurnal::STATUS_PENDING] ?? 0),
                "disetujui" => (int) ($rows[Jurnal::STATUS_DISETUJUI] ?? 0),
                "ditolak" => (int) ($rows[Jurnal::STATUS_DITOLAK] ?? 0),
            ];
        };

        if ($user->hasRole("siswa")) {
            $siswa = User::with(["tempat.user:id,name", "pbSkl:id,name", "laporan"])->find($user->id);

            $data["mingguIni"] = Jurnal::withTrashed()
                ->where("user_id", $user->id)
                ->whereDate("minggu_mulai", $awal->toDateString())
                ->first();
            $data["statusCounts"] = $hitungStatus(Jurnal::query()->where("user_id", $user->id));
            $data["terbaru"] = Jurnal::query()->where("user_id", $user->id)->latest()->limit(5)->get();
            $data["infoPkl"] = [
                "tempat" => $siswa?->tempat ? $siswa->tempat->only(["id", "nama", "lokasi", "kontak", "bidang_usaha"]) : null,
                "pembimbingPt" => $siswa?->tempat?->user ? ["name" => $siswa->tempat->user->name] : null,
                "pembimbingSekolah" => $siswa?->pbSkl ? ["name" => $siswa->pbSkl->name] : null,
            ];
            $data["laporan"] = $siswa?->laporan ? $siswa->laporan->only(["judul", "status"]) : null;
            $data["pengajuan"] = PengajuanTempat::where("user_id", $user->id)->latest()->first(["nama", "is", "created_at"]);
        }

        if ($user->hasRole(["pembimbing_pt", "pembimbing_sekolah", "admin"])) {
            $terlihat = Jurnal::query()->visibleTo($user);

            $data["statusCounts"] = $hitungStatus($terlihat);
            $data["menunggu"] = (clone $terlihat)->with("user:id,name")
                ->where("status_verifikasi", Jurnal::STATUS_PENDING)
                ->latest()->limit(5)->get();
            $data["sudahAbsenIds"] = (clone $terlihat)
                ->whereDate("minggu_mulai", $awal->toDateString())
                ->distinct()->pluck("jurnals.user_id")->map(fn ($id) => (int) $id)->values();
        }

        if ($user->hasRole("admin")) {
            $data["absensiMingguIni"] = [
                "totalSiswa" => User::role("siswa")->count(),
                "sudah" => $data["sudahAbsenIds"]->count(),
            ];
            // Admin tidak perlu daftar id semua siswa.
            unset($data["sudahAbsenIds"]);
        }

        return $data;
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
        $request->validate([
            "isVisibilityJurnal"=>["required","boolean"],
        ]);

        $user =User::findOrFail($id);

        // Sebelumnya pengguna mana pun bisa mengubah pengaturan milik pengguna lain.
        abort_unless((int) $user->id === (int) Auth::id() || Auth::user()->hasRole("admin"), 403);

        $user->isVisibilityJurnal = $request->boolean("isVisibilityJurnal");

        $user->save();
        Cache::forget('user_active_' . $user->jurusan_id);
        Cache::forget('user_active_' . Auth::user()->jurusan_id);
        return back()->with('success', 'Data berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

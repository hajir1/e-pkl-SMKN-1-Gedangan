<?php

namespace App\Http\Controllers;

use App\Http\Requests\SiswaRequest;
use App\Models\Datasiswa;
use App\Models\Jurusan;
use App\Models\StepLaporan;
use App\Models\TahunAjaran;
use App\Models\Tempat;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SiswaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $sortableRelations = [
            'jurusan_id' => ['table' => 'jurusans', 'foreign_key' => 'users.jurusan_id', 'column' => 'jurusans.nama'],
            'tahunAjaran_id' => ['table' => 'tahun_ajarans', 'foreign_key' => 'users.tahunAjaran_id', 'column' => 'tahun_ajarans.tahun'],
            'tempat_id' => ['table' => 'tempats', 'foreign_key' => 'users.tempat_id', 'column' => 'tempats.nama'],
        ];
        $sortBy = $request->input('sort_by');
        $sortOrder = strtolower((string) $request->input('sort_order', 'asc')) === 'desc' ? 'desc' : 'asc';
        // Whitelist kolom urutan; sebelumnya sort_by/sort_order dari request
        // langsung masuk ke orderBy().
        $sortableColumns = ['name','email','kontak','created_at','updated_at','tempat_lahir','tanggal_lahir','jurusan_id','tahunAjaran_id','tempat_id'];
        $orderColumn = in_array(str_replace('users.', '', (string) $sortBy), $sortableColumns, true)
            ? 'users.'.str_replace('users.', '', (string) $sortBy)
            : 'users.created_at';
        $orderDirection = $request->filled('sort_order') ? $sortOrder : 'desc';

        if(Auth::user()->getRoleNames()->contains('siswa'))  {
            $cachedUsers = Cache::remember("siswa_" . Auth::id(), 3600 * 24 * 7, function () {
                return User::with([
                    "jurusan",
                    "tahunAjaran",
                    "pbSkl",
                    "tempat.user",
                    "nilai.pembimbing",
                    "dataSiswa"
                ])->where("id", Auth::user()->id)->get(); // pakai get(), karena bisa lebih dari 1 record (walau jarang)
            });

            // Manual pagination (meski hanya 1 data)
            $perPage = 10;
            $page = $request->input('page', 1);
            $pagedUsers = new LengthAwarePaginator(
                $cachedUsers->forPage($page, $perPage),
                $cachedUsers->count(),
                $perPage,
                $page,
                ['path' => $request->url(), 'query' => $request->query()]
            );

            $datas = $pagedUsers;
        }else{      
        $datas = User::query()->with(["jurusan","tahunAjaran","pbSkl","tempat.user","nilai.pembimbing","dataSiswa"])
        ->whereHas("dataSiswa", function($query) {
            $query->where("isActive", "=", true);
        })
        ->when(Auth::user()->getRoleNames()->contains("pembimbing_sekolah"),function($query){
            $query->where("pembimbing_sekolah_id","=",Auth::user()->id);
        })
        ->when(Auth::user()->getRoleNames()->contains("pembimbing_pt"),function($query){
            $query->whereHas("tempat",function($q2){
                $q2->where("pembimbing_id","=",Auth::user()->id);
            });
        })
        ->when(Auth::user()->getRoleNames()->contains("siswa"),function($query){
            $query->where("id","=",Auth::user()->id);
        })
        ->when($request->filled("jurusan"),function($query)use($request){
            $query->whereHas("jurusan",function($q2) use($request){
                $q2->where("nama","=",$request->input("jurusan"));
            });
        })
        ->when($request->filled("tahunAjaran"),function($query)use($request){
            $query->whereHas("tahunAjaran",function($q2) use($request){
                $q2->where("tahun","=",$request->input("tahunAjaran"));
            });
        })
        ->when($request->filled("tempat"),function($query)use($request){
            $query->whereHas("tempat",function($q2) use($request){
                $q2->where("nama","=",$request->input("tempat"));
            });
        })
        ->when($request->filled("search"),function($query) use($request){
            $query->where(function($q2)use($request){
                $q2->where("users.name","like","%{$request->search}%")
            ->orWhere("users.email","like","%{$request->search}%")
            ->orWhere("users.kontak","like","%{$request->search}%")
            ->orWhereHas("jurusan",function($q2) use($request){
                $q2->where("nama", "like","%". $request->search . "%");
                })
            ->orWhereHas("tahunAjaran",function($q2) use($request){
                $q2->where("tahun", "like","%". $request->search . "%");
            })
            ->orWhereHas("tempat",function($q2) use($request){
                $q2->where("nama", "like","%". $request->search . "%");
            })
            ->orWhereHas("tempat.user",function($q2) use($request){
                $q2->where("name", "like","%". $request->search . "%");
            })
            ->orWhereHas("pbSkl",function($q2) use($request){
                $q2->where("name", "like","%". $request->search . "%");
            });
        });
        })
        ->when(array_key_exists($sortBy, $sortableRelations),function($query) use($sortableRelations,$sortBy,$sortOrder){
             $relation = $sortableRelations[$sortBy];
                $query->join($relation['table'], $relation['foreign_key'], '=', "{$relation['table']}.id")
                    ->orderBy($relation['column'], $sortOrder)
                    ->select('users.*');
        })

        ->orderBy($orderColumn,$orderDirection)
        ->role("siswa")->paginate(10)->withQueryString();
        }

        return Inertia::render("Siswa/Index",[
            "siswas"=> $datas,
            "filters"=> $request->only(["search","sort_by","sort_order","tahunAjaran","tempat","jurusan"]),
            'jurusans'=> Jurusan::get(),
            'tahunAjarans'=> TahunAjaran::get(),
            'tempats'=> Tempat::get(),
    ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("Siswa/Form",[
            "pembimbing_sekolahs"=> User::with("roles")->role('pembimbing_sekolah')->get(),
            "jurusans"=>Jurusan::where("isActive","=","aktif")->get(),
            "tempats"=>Tempat::get(),
            "dataSiswas"=>Datasiswa::where("isActive","=",false)->get(),
            "tahunAjarans"=>TahunAjaran::where("isActive","=","aktif")->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SiswaRequest $request):RedirectResponse
    {
         
        $validate = $request->validated();

        $dataSiswa = Datasiswa::where("nisn","=",$validate["nisn"])->firstOrFail();

        DB::transaction(function () use ($dataSiswa, $validate) {
            $dataSiswa->isActive = true;
            $dataSiswa->save();

            $siswa = User::create([
                "name"=> $dataSiswa->nama,
                "nisn_id"=> $dataSiswa->id,
                'tempat_lahir' => $validate["tempat_lahir"],
                'tanggal_lahir' => $validate["tanggal_lahir"],
                "email"=> $validate["email"],
                "jurusan_id"=> $validate["jurusan_id"],
                "tahunAjaran_id"=> $validate["tahunAjaran_id"] ?? null,
                "pembimbing_sekolah_id"=> $validate["pembimbing_sekolah_id"] ?? null,
                "tempat_id"=> $validate["tempat_id"] ?? null,
                "kontak"=> $validate["kontak"],
                "password"=> Hash::make($validate["password"]),
            ]);
            $siswa->syncRoles("siswa");
        });

        return redirect()->route("siswa.create")->with("success","Sukses Menambah Data Siswa Baru");
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
      
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
          return Inertia::render("Siswa/Form",[
            "user"=> User::with(["jurusan","tahunAjaran","pbSkl","tempat.user","dataSiswa"])->role("siswa")->where("id","=",$id)->firstOrFail(),
            "pembimbing_sekolahs"=> User::with("roles")->role('pembimbing_sekolah')->get(),
            "dataSiswas"=>Datasiswa::get(),
            "jurusans"=>Jurusan::where("isActive","=","aktif")->get(),
            "tempats"=>Tempat::get(),
            "tahunAjarans"=>TahunAjaran::where("isActive","=","aktif")->get(),
            "isEdit"=>true
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SiswaRequest $request, string $id)
    {
        $siswaId = User::role("siswa")->findOrFail($id);
        $validate = $request->validated();
        $dataSiswa = Datasiswa::where("nisn","=",$validate["nisn"])->firstOrFail();
        $siswaId->name = $dataSiswa->nama;
        $siswaId->nisn_id = $dataSiswa->id;

        $siswaId->email = $validate["email"];
        $siswaId->tempat_lahir= $validate["tempat_lahir"];
        $siswaId->tanggal_lahir= $validate["tanggal_lahir"];
        $siswaId->tahunAjaran_id =  $request->filled("tahunAjaran_id") ?$validate["tahunAjaran_id"]:$siswaId->tahunAjaran_id;
        $siswaId->pembimbing_sekolah_id =  $request->filled("pembimbing_sekolah_id") ?$validate["pembimbing_sekolah_id"]:$siswaId->pembimbing_sekolah_id;
        $siswaId->jurusan_id =  $request->filled("jurusan_id") ?$validate["jurusan_id"]:$siswaId->jurusan_id;
        $siswaId->tempat_id =  $request->filled("tempat_id") ?$validate["tempat_id"]:$siswaId->tempat_id;
        $siswaId->kontak = $validate["kontak"];
        if (!empty($validate["password"])) {
            $siswaId->password = Hash::make($validate["password"]);
        }
        
        $siswaId->save();
        Cache::forget("siswa_" . $siswaId->id);
        return redirect()->back()->with("success","Sukses Mengubah Data Milik $siswaId->name");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $siswaId = User::with(["dataSiswa"])->role("siswa")->findOrFail($id);
        // jgn hapus total, cukup nonaktifkan saja
        DB::transaction(function () use ($siswaId) {
            if ($siswaId->dataSiswa) {
                $siswaId->dataSiswa->isActive = false;
                $siswaId->dataSiswa->save();
            }
            $siswaId->delete();
        });
        Cache::forget("siswa_" . $siswaId->id);
        return redirect()->route("siswa.index")->with("success","Sukses Menghapus Data Siswa");
    }
}

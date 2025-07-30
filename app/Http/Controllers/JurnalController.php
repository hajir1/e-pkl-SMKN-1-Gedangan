<?php

namespace App\Http\Controllers;

use App\Models\Jurnal;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

use function PHPUnit\Framework\fileExists;

class JurnalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $jurnal = Jurnal::query()->with("user")
        ->when(Auth::user()->getRoleNames()->contains("siswa"),function($query){
            $query->where("user_id",'=', Auth::user()->id);
        })
       ->when(Auth::user()->getRoleNames()->contains("pembimbing_pt"), function ($query) {
        $query->whereHas('user.tempat', function ($q2) {
           
            $q2->where('pembimbing_id', Auth::id());
        });
        })
       ->when(Auth::user()->getRoleNames()->contains("pembimbing_sekolah"), function ($query) {
            $query->whereHas('user.pbSkl', function ($q2) {
                $q2->where('id', Auth::id());
            });
        })
        ->when($request->filled("marking"),function($query) use($request){
            $query->where("mark","=",filter_var($request->input("marking"),FILTER_VALIDATE_BOOLEAN));
        })
        ->when($request->filled("keterangan"),function($query)use($request){
            $query->where("jurnals.keterangan","=",$request->input("keterangan"));
        })
        ->when($request->filled("start_date") && !$request->filled("end_date"),function($query)use($request){
            $query->whereDate("jurnals.created_at","=",$request->start_date);
        })
        ->when($request->filled(["start_date","end_date"]),function($query)use($request){
            $query->whereBetween("jurnals.created_at",[$request->start_date, $request->end_date]);
        })
        ->when($request->filled("search"),function($query)use($request){
           $query->where(function($q) use($request) {
             $q->whereHas("user",function($q2)use($request){
                $q2->where("name","like","{$request->search}%");
            })
            ->orWhere("jurnals.keterangan","like","{$request->search}%")
            ->orWhere("jurnals.kegiatan","like","{$request->search}%");
           });
        })
        ->when($request->input("sort_by") === "nama",function($query)use($request){
                $query->join("users", "users.id","=","jurnals.user_id")
                ->orderBy("users.name",$request->input("sort_order","desc"))
                ->select("jurnals.*");
        })
        ->when($request->input("sort_by") !== "nama",function($query)use($request){
                $query->orderBy($request->input("sort_by","jurnals.created_at"),$request->input("sort_order","desc"));
        })
        ->latest()->paginate(10)->withQueryString();
        



        return Inertia::render("Jurnal/Index",[
            "jurnals"=>$jurnal,
            "user"=> Jurnal::with(["user.tempat.user","user.pbSkl"])->where("user_id","=",Auth::user()->id)->first(),
            "filters"=> $request->only(["search","sort_by","sort_order","tahunAjaran","start_date","end_date","keterangan","marking"])
        ]);
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

        $today = Carbon::today();

        $sudahAda = Jurnal::where("user_id","=",Auth::user()->id)->whereDate("created_at","=",$today)->exists();

        if($sudahAda){
            return redirect()->back()->with("error","Mohon Maaf, Jurnal Hanya Bisa Diisi 1x setiap Hari");
        }

        $validate = $request->validate([
            "keterangan"=>"required",
            "kegiatan"=>"required|max:150",
            "photo"=>"required|file|max:2400|mimes:jpg,jpeg,avif,png"
        ],[
            "photo.max"=>"File Gambar Maksimal 2400 Kb (2,4 mb)",
            "kegiatan.max"=>"Kegiatan Wajib Diisi 1 - 150 karakter Huruf",
            "photo.mimes"=>"Gambar harus Bertipe Jpg,Jpeg,Avif,Png"
        ]);

        if($request->hasFile("photo")){
            // upload to storage
            $sourcePath = $request->file('photo')->store('jurnals/'.now()->format("Y")."-".Auth::user()->jurusan->nama."-".Auth::user()->name."/" , 'public');
            

            $backupPath = env("BACKUP_PHOTOS") .  $sourcePath;

            // buat folder jika belum ada
            if(!file_exists(dirname($backupPath))) {
                mkdir(dirname($backupPath), 0777, true);
            }
            // Simpan juga ke folder backup
            if(!copy(storage_path("app/public/".$sourcePath), $backupPath)){
                return Inertia::render("Jurnal/Index")->with("error","Gambar gagal disimpan");
            };
            $validate["photo"] = $sourcePath ?? null;
        }
        Jurnal::create(
            [
                "user_id"=>Auth::user()->id,
                "keterangan"=>$validate["keterangan"],
                "kegiatan"=>$validate["kegiatan"],
                "photo"=>$validate["photo"],
            ]);
        Cache::forget("jurnals". Auth::user()->id);
        return redirect()->back()->with("success","Sukses Menambah Jurnal");
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
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validate = $request->validate([
            "keterangan"=>"required",
            "kegiatan"=>"required|max:150",
            "photo"=>"nullable"
        ],[
            "photo.max"=>"File Gambar Maksimal 2400 Kb (2,4 mb)",
            "kegiatan.max"=>"Kegiatan Wajib Diisi 1 - 150 karakter Huruf",
            "photo.mimes"=>"Gambar harus Bertipe Jpg,Jpeg,Avif,Png"
        ]);

        $jrnlId = Jurnal::findOrFail($id);

            if($request->hasFile("photo")){
                if($jrnlId->photo){
                    $backupPath = env("BACKUP_PHOTOS"). $jrnlId->photo;

                // hapus file jika ada
                if(fileExists(storage_path("app/public/".$jrnlId->photo))){
                    File::delete(storage_path("app/public/".$jrnlId->photo));
                }

                if(fileExists($backupPath)){
                    File::delete($backupPath);
                }
            }

            // simpan ke folder public
            $sourcePath = $request->file('photo')->store('jurnals/'.now()->format("Y")."-".Auth::user()->jurusan->nama."-".Auth::user()->name."/" , 'public');
            $backupPath = env("BACKUP_PHOTOS"). $sourcePath;


            // buat folder backup jika belum ada
            if(!file_exists(dirname($backupPath))) {
                mkdir(dirname($backupPath), 0777, true);
            }
            
            // Simpan juga ke folder backup
            if(!copy(storage_path("app/public/".$sourcePath), $backupPath)){
                return Inertia::render("Jurnal/Index")->with("error","Gambar gagal disimpan");
            };
            
            $validate["photo"] = $sourcePath ?? null;
        }

        $jrnlId->keterangan = $validate["keterangan"];
        $jrnlId->kegiatan = $validate["kegiatan"];
        $jrnlId->photo = $validate["photo"] ?? $jrnlId->photo;
        $jrnlId->save();
        Cache::forget("jurnals". $jrnlId->user_id);
        return redirect()->back()->with("success","Sukses Mengubah Jurnal");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $jrnlId = Jurnal::findOrFail($id);
        

        $jrnlId->delete();
        Cache::forget("jurnals". $jrnlId->user_id);
        return redirect()->back()->with("success","Sukses Menghapus Jurnal");
    }
}

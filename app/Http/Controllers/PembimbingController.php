<?php

namespace App\Http\Controllers;

use App\Models\Jurusan;
use App\Models\TahunAjaran;
use App\Models\Tempat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PembimbingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $datas = User::query()->with(["jurusan","tahunAjaran","roles","tempatYangDibimbing"])
         ->when($request->filled("tahunAjaran"),function($query) use($request){
            $query->whereHas("tahunAjaran",function($q2) use($request){
                $q2->where("id","=",$request->input("tahunAjaran"));
            });
        })
        ->when($request->filled("jurusan"),function($query) use($request){
            $query->whereHas("jurusan",function($q2) use($request){
                $q2->where("id","=",$request->input("jurusan"));
            });
        })
        ->when($request->filled("search"),function($query) use($request){
            // Dibungkus where(function) agar orWhere tidak membatalkan filter
            // role di bawah (sebelumnya pencarian bisa menampilkan admin/siswa).
            $query->where(fn($q) => $q->where("users.name","like","%{$request->search}%")
            ->orWhere("users.email","like","%{$request->search}%")
            ->orWhere("users.kontak","like","%{$request->search}%")
            ->orWhereHas("jurusan",function($q2) use($request){
                $q2->where("nama", "like","%". $request->search . "%");
                })
            ->orWhereHas("tahunAjaran",function($q2) use($request){
                $q2->where("tahun", "like","%". $request->search . "%");
            }));
        })
        ->when($request->input('sort_by') === "jurusan_id",function($query) use($request){
                $query->join("jurusans","users.jurusan_id","=","jurusans.id")
                ->orderBy("jurusans.nama",strtolower((string) $request->input("sort_order","asc")) === "desc" ? "desc" : "asc")
                ->select("users.*");
        })
        ->when($request->input('sort_by') === "tahunAjaran_id",function($query) use($request){
                $query->join("tahun_ajarans","users.tahunAjaran_id","=","tahun_ajarans.id")
                ->orderBy("tahun_ajarans.tahun",strtolower((string) $request->input("sort_order","asc")) === "desc" ? "desc" : "asc")
                ->select("users.*");
        })
        ->orderBy(
            in_array($request->input("sort_by"), ["name","email","kontak","created_at","jurusan_id","tahunAjaran_id"], true) ? "users.".$request->input("sort_by") : "users.created_at",
            strtolower((string) $request->input("sort_order","desc")) === "asc" ? "asc" : "desc"
        )
        
        ->role(["pembimbing_pt","pembimbing_sekolah"])->paginate(10)->withQueryString();
        
        return Inertia::render("Pembimbing/Index",[
            "pembimbings"=> $datas,
            "filters"=> $request->only(["search","sort_by","sort_order","tahunAjaran","jurusan"]),
            'jurusans'=> Jurusan::get(),
            'tahunAjarans'=> TahunAjaran::get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render("Pembimbing/Form",[
            "jurusans"=>Jurusan::where("isActive","=","aktif")->get(),
            "tahunAjarans"=>TahunAjaran::where("isActive","=","aktif")->get(),
            "tempats"=>Tempat::get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            "name"=>['required'],
            "email"=>['required', 'string', 'email',"unique:users,email"],
            "jurusan_id"=>['nullable','exists:jurusans,id'],
            "tahunAjaran_id"=>['nullable','exists:tahun_ajarans,id'],
            "kontak"=>['required',"regex:/^0[0-9]{9,12}$/"],
            "password"=>['required','string','min:8',"confirmed"],
            // Sebelumnya role bebas, sehingga form pembimbing bisa membuat akun admin.
            "role"=>['required',Rule::in(["pembimbing_pt","pembimbing_sekolah"])],
        ],[
            "nama.required"=>"Nama Wajib Diisi ",
            "email.required"=>"email Wajib Diisi",
            "email.unique"=>"Email Telah Terdaftar",
            "kontak.required"=>"Kontak Wajib Diisi",
            "kontak.regex"=>"Kontak Wajib 10 - 13 Karakter",
            "password.required"=>"Password Wajib Diisi",
            "password.min"=>"Password Minimal 8 Karakter",
            "role.in"=>"Role Harus Pembimbing PT atau Pembimbing Sekolah",
            "password.confirmed"=>"Konfirmasi Password Tidak Sama"
        ]);

        $user = User::create([
            "name"=> $validate["name"],
            "email"=> $validate["email"],
            "jurusan_id"=> $validate["jurusan_id"] ?? null,
            "tahunAjaran_id"=> $validate["tahunAjaran_id"] ?? null,
            "kontak"=> $validate["kontak"],
            "password"=> Hash::make($validate["password"]),
        ]);
        $user->syncRoles($validate["role"]);

        return redirect()->route("pembimbing.create")->with("success","Sukses Menambah Pembimbing Baru");
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
         return Inertia::render("Pembimbing/Form",[
            "user"=> User::with(["tahunAjaran","jurusan","roles"])->where("id",'=',$id)->first(),
            "jurusans"=>Jurusan::where("isActive","=","aktif")->get(),
            "tahunAjarans"=>TahunAjaran::where("isActive","=","aktif")->get(),
            "tempats"=>Tempat::get(),
            "isEdit"=>true
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $pbId = User::with("tempatYangDibimbing")->role(["pembimbing_pt","pembimbing_sekolah"])->findOrFail($id);
        $validate = $request->validate([
            "name"=>['required'],
            "email"=>['required', 'string', 'email',Rule::unique("users","email")->ignore($id)],
            "jurusan_id"=>['nullable','exists:jurusans,id'],
            "tahunAjaran_id"=>['nullable','exists:tahun_ajarans,id'],
            "kontak"=>['required',"regex:/^0[0-9]{9,12}$/"],
            "role"=>['required',Rule::in(["pembimbing_pt","pembimbing_sekolah"])],
        ],[
            "nama.required"=>"Nama Wajib Diisi",
            "email.required"=>"email Wajib Diisi",
            "email.unique"=>"Email Telah Terdaftar",
            "kontak.required"=>"Kontak Wajib Diisi",
            "kontak.regex"=>"Kontak Wajib 10 - 13 Karakter",
            "role.in"=>"Role Harus Pembimbing PT atau Pembimbing Sekolah",
        ]);

        // Dicek sebelum menyimpan; sebelumnya data tetap tersimpan walau
        // perubahan role ditolak.
        if($validate["role"] === "pembimbing_sekolah"  &&
            $pbId->hasRole("pembimbing_pt") &&
            $pbId->tempatYangDibimbing){
            return redirect()->route("pembimbing.edit",$id)->with("error","Pembimbing PT tidak bisa diubah ke role Pembimbing Sekolah karena sudah membimbing tempat PKL.");
        }
        if($validate["role"] === "pembimbing_pt" &&
            $pbId->hasRole("pembimbing_sekolah") &&
            User::where("pembimbing_sekolah_id",$pbId->id)->exists()){
            return redirect()->route("pembimbing.edit",$id)->with("error","Pembimbing Sekolah tidak bisa diubah ke role Pembimbing PT karena masih memiliki siswa bimbingan.");
        }
       
        $pbId->name = $validate["name"];
        $pbId->email = $validate["email"];
        $pbId->tahunAjaran_id =  $request->filled("tahunAjaran_id") ?$validate["tahunAjaran_id"]:$pbId->tahunAjaran_id;
        $pbId->jurusan_id =  $request->filled("jurusan_id") ?$validate["jurusan_id"]:$pbId->jurusan_id;
        $pbId->kontak = $validate["kontak"];
        
        $pbId->save();
        
        $pbId->syncRoles($validate["role"]);
        return redirect()->route("pembimbing.edit",$id)->with("success","Sukses Mengubah Data Pembimbing Milik $request->name");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Hanya akun pembimbing yang boleh dihapus lewat menu ini.
        $pbId = User::role(["pembimbing_pt","pembimbing_sekolah"])->findOrFail($id);
        if($pbId){
            $pbId->delete();
        }
         return redirect()->route("pembimbing.index")->with("success","Sukses Menghapus Data Pembimbing");
    }
}

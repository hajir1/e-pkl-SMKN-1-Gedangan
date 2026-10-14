<?php

namespace App\Http\Controllers;

use App\Models\Gambar;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GambarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        
        // Kunci cache dipisah dari FeController: sebelumnya keduanya memakai
        // 'welcome_gambars' dengan tipe data berbeda (paginator vs collection),
        // sehingga halaman yang dibuka belakangan menerima data yang salah.
        $page = max(1, $request->integer('page', 1));
        $gambars = Cache::remember('admin_gambars_page_'.$page, 3600, function () {
            return Gambar::latest()->paginate(30); // Ambil semua data
        });

   
        // Step 3: Kirim ke Inertia
        return Inertia::render('Gambar/Index', [
            'gambars' => $gambars
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
         $validate = $request->validate([
            "url"=>"required|file|max:2400|mimes:jpg,jpeg,avif,png|mimetypes:image/jpeg,image/png,image/avif"
        ],[
            "url.required"=>"Gambar Wajib Diisi",
            "url.mimes"=>"Gambar harus Bertipe Jpg,Jpeg,Avif,Png",
            "url.max"=>"File Gambar Maksimal 2400 Kb (2,4 mb)"
        ]);


        if($request->hasFile("url")){
            // upload to public
            $sourcePath = $request->file('url')->store('headers', 'public');

            // backup path
            $backupPath = config("filesystems.backup_photos") . $sourcePath;

            if(config("filesystems.backup_photos")){
                File::ensureDirectoryExists(dirname($backupPath), 0755);
                // Simpan juga ke folder backup
                if(!copy(storage_path("app/public/".$sourcePath), $backupPath)){
                    Storage::disk("public")->delete($sourcePath);
                    return redirect()->back()->with("error","Gambar gagal disimpan");
                }
            }
           
            $validate["url"] =  $sourcePath ?? null;
        }
        Gambar::create($validate);
        $this->flushCache();
        return redirect()->back()->with("success","Sukses Menambah Slider / Gambar Baru");
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
            "url"=>"required|file|max:2400|mimes:jpg,jpeg,avif,png|mimetypes:image/jpeg,image/png,image/avif"
        ],[
            "url.required"=>"Gambar Wajib Diisi",
            "url.mimes"=>"Gambar harus Bertipe Jpg,Jpeg,Avif,Png",
            "url.max"=>"File Gambar Maksimal 2400 Kb (2,4 mb)"
        ]);
        
        $gambarId = Gambar::findOrFail($id);
        if ($request->hasFile('url')) {
            if ($gambarId->url) {
                
            
                $backupPath = config("filesystems.backup_photos") . $gambarId->url; // Lokasi kedua (backup)

                // Hapus file di lokasi pertama (public)
                if (File::exists(storage_path("app/public/". $gambarId->url))) {
                    File::delete(storage_path("app/public/". $gambarId->url));
                }

                // Hapus file di lokasi kedua (backup)
                if (config("filesystems.backup_photos") && File::exists($backupPath)) {
                    File::delete($backupPath);
                }
            }

            $sourcePath = $request->file('url')->store('headers', 'public'); //lokasi pertama

            $backupPath = config("filesystems.backup_photos") . $sourcePath;

            // upload to public

            if (config("filesystems.backup_photos")) {
                File::ensureDirectoryExists(dirname($backupPath), 0755);
                // Simpan juga ke folder backup
                if(!copy(storage_path("app/public/".$sourcePath), $backupPath)){
                    return redirect()->back()->with("error","Kesalahan Server Mengenai Gambar , Coba Beberapa Saat Lagi");
                }
            }

            $gambarId->url =  $sourcePath ?? null;
        }
        $gambarId->save();
        $this->flushCache();

        return redirect()->back()->with("success","Sukses Mengubah Gambar");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $gmbrId = Gambar::findOrFail($id);
        
        if($gmbrId->url){
            $backupPath = config("filesystems.backup_photos") . $gmbrId->url;

            if (File::exists(storage_path("app/public/". $gmbrId->url))) {
                    File::delete(storage_path("app/public/". $gmbrId->url));
            }
            if(config("filesystems.backup_photos") && File::exists($backupPath)){
                File::delete($backupPath);
            }
        }
        $gmbrId->delete();
        $this->flushCache();
        return redirect()->back()->with("success","Sukses Menghapus Gambar");
    }

    private function flushCache(): void
    {
        Cache::forget('welcome_gambars');
        for ($page = 1; $page <= 20; $page++) {
            Cache::forget('admin_gambars_page_'.$page);
        }
    }
}

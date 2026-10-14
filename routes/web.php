<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DataSiswaController;
use App\Http\Controllers\FeController;
use App\Http\Controllers\GambarController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\JurnalController;
use App\Http\Controllers\JurusanController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\NilaiController;
use App\Http\Controllers\PembimbingController;
use App\Http\Controllers\PengajuanTempatController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\TahunAjaranController;
use App\Http\Controllers\TempatController;
use App\Http\Controllers\TrashJurnalController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [FeController::class,"welcome"])->name("welcome");



// excel diluar middlewre auth dan verified ,sementara pdf di dalam middleware auth
Route::get('data_siswa/export/', [ImportController::class, 'exportDataSiswas'])->name('data_siswas.export')->middleware(['auth',"role:admin",'throttle:6,1']);

Route::get('jurnals/export/', [ImportController::class, 'exportJurnals'])->name('jurnals.export')->middleware(['auth',"role:admin|pembimbing_pt|pembimbing_sekolah|siswa",'throttle:6,1']);

Route::get('siswas/export/', [ImportController::class, 'exportSiswas'])->name('exportSiswas')->middleware(['auth',"role:admin|pembimbing_pt|pembimbing_sekolah",'throttle:6,1']);


Route::middleware(['auth', 'verified'])->group(function(){
    

    // Hak akses per siswa dicek di ImportController@exportSiswaToPdf.
    Route::get('siswa/export/{id}', [ImportController::class, 'exportSiswaToPdf'])->name('exportSiswaToPdf')->middleware("role:admin|pembimbing_pt|pembimbing_sekolah|siswa");

    
    Route::get('/dashboard', [DashboardController::class,"index"])->middleware("role:admin|pembimbing_sekolah|pembimbing_pt|siswa")->name("dashboard");
    
    Route::put('/dashboard/update/{id}', [DashboardController::class,"update"])->middleware("role:admin|pembimbing_sekolah|pembimbing_pt|siswa")->name("dashboard.update");
    Route::get('/dokumentasi', function(){
        return Inertia::render("Dokumentasi/Index");
    })->middleware("role:admin|pembimbing_sekolah|pembimbing_pt|siswa")->name("dokumentasi");
    
    Route::resource("data_siswa",DataSiswaController::class)->middleware(["role:admin"]);
    
    Route::post('data_siswa/import', [ImportController::class, 'importRegisterUser'])->name('data_siswas.import')->middleware(["role:admin"]);


    Route::get('laporan/export/format_penulisan_laporan', [ImportController::class, 'exportFormatlaporan'])->name('exportFormatlaporan')->middleware(['role:siswa','throttle:6,1']);

    Route::get('laporan/export/laporan', [ImportController::class, 'exportLaporan'])->name('exportLaporan')->middleware(['role:siswa','throttle:6,1']);

    Route::resource("laporan",LaporanController::class)->only(["index"])->middleware(["role:siswa|admin|pembimbing_pt|pembimbing_sekolah"]);
    Route::resource("laporan",LaporanController::class)->only(["create","store"])->middleware(["role:siswa"]);
    // Menerima / menolak judul: admin & pembimbing siswa. Hapus: juga siswa pemilik. Dicek lagi di controller.
    Route::resource("laporan",LaporanController::class)->only(["update"])->middleware(["role:admin|pembimbing_pt|pembimbing_sekolah"]);
    Route::resource("laporan",LaporanController::class)->only(["destroy"])->middleware(["role:siswa|admin|pembimbing_pt|pembimbing_sekolah"]);

    Route::resource("jurusan",JurusanController::class)->middleware(["role:admin"]);
    Route::resource("gambar",GambarController::class)->middleware(["role:admin"]);
    Route::resource("tahunAjaran",TahunAjaranController::class)->middleware(["role:admin"]);
    
    Route::resource("tempat",TempatController::class)->middleware(["role:admin"]);
    Route::get("tempat/export/{id}",[ImportController::class,"exportTempat"])->name("tempat.export")->middleware(['role:admin','throttle:20,1']);

    
    Route::resource("pembimbing",PembimbingController::class)->middleware(["role:admin"]);
    // Sebelumnya semua aksi (tambah/ubah/hapus siswa) terbuka untuk siswa & pembimbing.
    Route::resource("siswa",SiswaController::class)->only(["index"])->middleware(["role:admin|pembimbing_pt|pembimbing_sekolah|siswa"]);
    Route::resource("siswa",SiswaController::class)->except(["index","show"])->middleware(["role:admin"]);

    // Absensi mingguan
    Route::resource("jurnal",JurnalController::class)->only(["index","create","show","edit","destroy"])->middleware(["role:admin|pembimbing_pt|pembimbing_sekolah|siswa"]);
    Route::resource("jurnal",JurnalController::class)->only(["store","update"])->middleware(["role:siswa",'throttle:20,1']);
    Route::put('jurnal/{jurnal}/verifikasi', [JurnalController::class, 'verifikasi'])->name('jurnal.verifikasi')->middleware(["role:admin|pembimbing_pt|pembimbing_sekolah"]);
    Route::get('jurnal/{jurnal}/pdf', [JurnalController::class, 'pdf'])->name('jurnal.pdf')->middleware(["role:admin|pembimbing_pt|pembimbing_sekolah|siswa"]);

    Route::resource("trashJurnal",TrashJurnalController::class)->only(["index","update","destroy"])->middleware(["role:siswa"]);
   
    Route::resource("pengajuanTempat",PengajuanTempatController::class)->only(["index","create","store"])->middleware(["role:siswa|admin"]);
    Route::resource("pengajuanTempat",PengajuanTempatController::class)->only(["update","destroy"])->middleware(["role:admin"]);

    // Sebelumnya tanpa middleware role: siswa bisa memberi nilai & menandai jurnal.
    Route::resource("nilai",NilaiController::class)->only(["store"])->middleware(["role:pembimbing_pt|pembimbing_sekolah"]);
    Route::resource("nilai",NilaiController::class)->only(["update"])->middleware(["role:admin|pembimbing_pt|pembimbing_sekolah"]);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Siswa melengkapi TTL yang kosong (halaman Data Siswa).
    Route::patch('/profile/ttl', [ProfileController::class, 'updateTtl'])->name('profile.ttl')->middleware('role:siswa');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

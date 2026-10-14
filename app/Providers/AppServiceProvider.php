<?php

namespace App\Providers;

use App\Models\Jurnal;
use App\Models\Laporan;
use App\Models\PengajuanTempat;
use App\Policies\JurnalPolicy;
use App\Services\ImageToWebpConverter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ImageToWebpConverter::class, fn () => ImageToWebpConverter::fromConfig());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Gate::policy(Jurnal::class, JurnalPolicy::class);

        Inertia::share([
            // Hitungan hanya untuk admin; sebelumnya dikirim ke semua halaman,
            // termasuk tamu yang belum login.
            "ptCount"=>function(){
                return Auth::user()?->hasRole("admin") ? PengajuanTempat::count() : 0;
            },
            "lpCount"=>function(){
                return Auth::user()?->hasRole("admin") ? Laporan::where("status","=","pending")->count() : 0;
            },
            "absensiPendingCount"=>function(){
                $user = Auth::user();
                if(!$user || $user->hasRole("siswa")){
                    return 0;
                }
                return Jurnal::query()->visibleTo($user)->where("status_verifikasi",Jurnal::STATUS_PENDING)->count();
            },
            "trashJurnalCount"=>function(){
               if(Auth::user()?->id){
                 return Jurnal::onlyTrashed()->where("user_id","=",Auth::user()->id)->count();
               }
            },
        ]);
    }
}

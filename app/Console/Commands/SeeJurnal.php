<?php

namespace App\Console\Commands;

use App\Models\Jurnal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SeeJurnal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:see-jurnal';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Laporkan absensi minggu lalu yang belum diverifikasi admin/pembimbing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Sebelumnya perintah ini menandai SEMUA jurnal sebagai sudah dilihat
        // setiap Senin, sehingga verifikasi oleh admin/pembimbing tidak ada
        // artinya. Sekarang hanya mencatat absensi minggu lalu yang masih
        // menunggu verifikasi.
        $mingguLalu = Jurnal::awalMinggu()->subWeek()->toDateString();
        $pending = Jurnal::whereDate("minggu_mulai", $mingguLalu)
            ->where("status_verifikasi", Jurnal::STATUS_PENDING)
            ->count();

        Log::channel("marking")->info("Absensi minggu {$mingguLalu} yang belum diverifikasi: {$pending} (dicek " . now()->format("d-m-Y H:i:s") . ")");
        $this->info("{$pending} absensi minggu {$mingguLalu} belum diverifikasi.");
    }
}

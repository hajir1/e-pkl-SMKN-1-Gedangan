<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Mengubah absensi harian menjadi mingguan:
 * - minggu_mulai: tanggal Senin dari minggu absensi.
 * - unique (user_id, minggu_mulai): database menolak absensi ganda dalam
 *   minggu yang sama, termasuk saat dua request dikirim bersamaan.
 * - file_pdf + kolom verifikasi oleh admin/pembimbing.
 *
 * Data lama (harian) tetap disimpan. Untuk setiap siswa per minggu, hanya
 * entri paling awal yang diberi minggu_mulai; entri lain di minggu yang sama
 * dibiarkan NULL (data historis) supaya index unik bisa dibuat.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jurnals', function (Blueprint $table) {
            $table->date('minggu_mulai')->nullable()->after('user_id');
            $table->string('file_pdf')->nullable()->after('photo');
            $table->string('status_verifikasi', 20)->default('pending')->after('mark');
            $table->foreignId('diverifikasi_oleh')->nullable()->after('status_verifikasi')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('diverifikasi_at')->nullable()->after('diverifikasi_oleh');
            $table->text('catatan_verifikasi')->nullable()->after('diverifikasi_at');
        });

        // Data lama yang sudah ditandai (mark = true) dianggap sudah disetujui.
        DB::table('jurnals')->where('mark', true)->update(['status_verifikasi' => 'disetujui']);

        $timezone = config('app.timezone');
        $terpakai = [];

        DB::table('jurnals')
            ->select(['id', 'user_id', 'created_at'])
            ->orderBy('user_id')
            ->orderBy('created_at')
            ->orderBy('id')
            ->chunk(1000, function ($rows) use (&$terpakai, $timezone) {
                foreach ($rows as $row) {
                    if (! $row->created_at) {
                        continue;
                    }

                    $minggu = Carbon::parse($row->created_at, $timezone)
                        ->startOfWeek(Carbon::MONDAY)
                        ->toDateString();
                    $key = $row->user_id.'|'.$minggu;

                    if (isset($terpakai[$key])) {
                        continue;
                    }
                    $terpakai[$key] = true;

                    DB::table('jurnals')->where('id', $row->id)->update(['minggu_mulai' => $minggu]);
                }
            });

        Schema::table('jurnals', function (Blueprint $table) {
            $table->unique(['user_id', 'minggu_mulai'], 'jurnals_user_minggu_unique');
            $table->index('status_verifikasi');
        });
    }

    public function down(): void
    {
        Schema::table('jurnals', function (Blueprint $table) {
            $table->dropUnique('jurnals_user_minggu_unique');
            $table->dropIndex(['status_verifikasi']);
            $table->dropConstrainedForeignId('diverifikasi_oleh');
            $table->dropColumn(['minggu_mulai', 'file_pdf', 'status_verifikasi', 'diverifikasi_at', 'catatan_verifikasi']);
        });
    }
};

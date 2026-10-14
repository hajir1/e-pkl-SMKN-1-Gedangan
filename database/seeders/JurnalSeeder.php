<?php

namespace Database\Seeders;

use App\Models\Jurnal;
use App\Models\User;
use Illuminate\Database\Seeder;

class JurnalSeeder extends Seeder
{
    /**
     * Membuat contoh absensi mingguan untuk setiap akun siswa yang ada.
     *
     * Sebelumnya membuat 1000 jurnal untuk user_id 1-2 (salah satunya admin,
     * dan user_id 2 belum tentu ada), yang juga melanggar aturan 1 absensi
     * per minggu.
     */
    public function run(): void
    {
        User::role('siswa')->each(function (User $siswa) {
            for ($minggu = 1; $minggu <= 8; $minggu++) {
                Jurnal::factory()->mingguLalu($minggu)->create(['user_id' => $siswa->id]);
            }
        });
    }
}

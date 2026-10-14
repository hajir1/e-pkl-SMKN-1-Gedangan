<?php

namespace Tests\Feature;

use App\Models\Jurnal;
use App\Models\PengajuanTempat;
use App\Models\Tempat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Endpoint dan prop tambahan yang dipakai frontend hasil redesign.
 */
class FrontendSupportTest extends TestCase
{
    use RefreshDatabase;

    private User $siswa;
    private User $siswaLain;
    private User $pembimbingSekolah;
    private User $admin;
    private Tempat $tempat;

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['admin', 'pembimbing_sekolah', 'pembimbing_pt', 'siswa'] as $role) {
            Role::findOrCreate($role, 'web');
        }

        $this->admin = User::factory()->create()->assignRole('admin');
        $this->pembimbingSekolah = User::factory()->create()->assignRole('pembimbing_sekolah');

        $this->tempat = Tempat::create([
            'nama' => 'PT Sekolah',
            'kontak' => '(0341) 123456',
            'bidang_usaha' => 'Jasa',
            'lokasi' => 'Malang',
        ]);

        $this->siswa = User::factory()->create([
            'pembimbing_sekolah_id' => $this->pembimbingSekolah->id,
            'tempat_id' => $this->tempat->id,
            'tempat_lahir' => null,
            'tanggal_lahir' => null,
        ])->assignRole('siswa');
        $this->siswaLain = User::factory()->create(['pembimbing_sekolah_id' => $this->pembimbingSekolah->id])->assignRole('siswa');
    }

    public function test_dashboard_siswa_berisi_ringkasan_minggu_ini(): void
    {
        $jurnal = Jurnal::factory()->create(['user_id' => $this->siswa->id]);

        $this->actingAs($this->siswa)->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->where('ringkasan.periode.mulai', Jurnal::awalMinggu()->toDateString())
                ->where('ringkasan.mingguIni.id', $jurnal->id)
                ->where('ringkasan.statusCounts.total', 1)
                ->where('ringkasan.statusCounts.pending', 1)
                ->where('ringkasan.infoPkl.tempat.nama', 'PT Sekolah')
                ->has('ringkasan.terbaru', 1)
                ->etc());
    }

    public function test_dashboard_pembimbing_hanya_menghitung_siswa_bimbingan(): void
    {
        Jurnal::factory()->create(['user_id' => $this->siswa->id]);
        $luar = User::factory()->create()->assignRole('siswa');
        Jurnal::factory()->create(['user_id' => $luar->id]);

        $this->actingAs($this->pembimbingSekolah)->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ringkasan.statusCounts.pending', 1)
                ->where('ringkasan.sudahAbsenIds', [$this->siswa->id])
                ->has('ringkasan.menunggu', 1)
                ->etc());
    }

    public function test_dashboard_admin_menampilkan_cakupan_absensi(): void
    {
        Jurnal::factory()->create(['user_id' => $this->siswa->id]);

        $this->actingAs($this->admin)->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('ringkasan.absensiMingguIni.totalSiswa', 2)
                ->where('ringkasan.absensiMingguIni.sudah', 1)
                ->missing('ringkasan.sudahAbsenIds')
                ->etc());
    }

    public function test_siswa_bisa_mengisi_ttl_yang_kosong(): void
    {
        $this->actingAs($this->siswa)
            ->patch(route('profile.ttl'), ['tempat_lahir' => 'KABUPATEN MALANG', 'tanggal_lahir' => '2008-05-01'])
            ->assertSessionHas('success');

        $this->siswa->refresh();
        $this->assertSame('KABUPATEN MALANG', $this->siswa->tempat_lahir);

        // Setelah terisi, perubahan harus lewat admin.
        $this->actingAs($this->siswa)
            ->patch(route('profile.ttl'), ['tempat_lahir' => 'KOTA BATU', 'tanggal_lahir' => '2008-05-01'])
            ->assertSessionHas('error');
        $this->assertSame('KABUPATEN MALANG', $this->siswa->refresh()->tempat_lahir);
    }

    public function test_ttl_hanya_untuk_siswa_dan_divalidasi(): void
    {
        $this->actingAs($this->pembimbingSekolah)
            ->patch(route('profile.ttl'), ['tempat_lahir' => 'X', 'tanggal_lahir' => '2000-01-01'])
            ->assertForbidden();

        $this->actingAs($this->siswa)
            ->patch(route('profile.ttl'), ['tempat_lahir' => '', 'tanggal_lahir' => now()->addDay()->toDateString()])
            ->assertSessionHasErrors(['tempat_lahir', 'tanggal_lahir']);
    }

    public function test_siswa_bisa_mengajukan_tempat_dari_sekolah(): void
    {
        $this->actingAs($this->siswaLain)
            ->post(route('pengajuanTempat.store'), ['tempat_id' => $this->tempat->id, 'alasan' => 'Dekat rumah'])
            ->assertSessionHas('success');

        $pengajuan = PengajuanTempat::firstOrFail();
        $this->assertSame('PT Sekolah', $pengajuan->nama);
        $this->assertSame('sekolah', $pengajuan->is);
        $this->assertSame($this->siswaLain->id, (int) $pengajuan->user_id);
    }

    public function test_pengajuan_usulan_siswa_tetap_seperti_sebelumnya(): void
    {
        $this->actingAs($this->siswaLain)
            ->post(route('pengajuanTempat.store'), [
                'nama' => 'PT Sekolah',
                'kontak' => '081234567890',
                'bidang_usaha' => 'Jasa',
                'lokasi' => 'Malang',
                'alasan' => 'Tes',
            ])
            ->assertSessionHasErrors('nama');

        $this->actingAs($this->siswaLain)
            ->post(route('pengajuanTempat.store'), [
                'nama' => 'CV Baru',
                'kontak' => '081234567890',
                'bidang_usaha' => 'Jasa',
                'lokasi' => 'Malang',
                'alasan' => 'Tes',
            ])
            ->assertSessionHas('success');
        $this->assertSame('siswa', PengajuanTempat::firstOrFail()->is);
    }
}

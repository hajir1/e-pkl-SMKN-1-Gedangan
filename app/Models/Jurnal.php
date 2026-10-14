<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Absensi PKL mingguan siswa (nama tabel tetap "jurnals" agar kompatibel).
 */
class Jurnal extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_DISETUJUI = 'disetujui';
    public const STATUS_DITOLAK = 'ditolak';

    public const STATUSES = [self::STATUS_PENDING, self::STATUS_DISETUJUI, self::STATUS_DITOLAK];

    public const KETERANGAN = ['hadir', 'izin', 'sakit'];

    /**
     * Kolom yang boleh diisi massal. Kolom verifikasi (status, verifikator,
     * mark) sengaja tidak dimasukkan agar tidak bisa disisipkan lewat request.
     */
    protected $fillable = ['photo', 'file_pdf', 'keterangan', 'kegiatan', 'user_id', 'minggu_mulai'];

    protected $attributes = [
        'mark' => false,
        'status_verifikasi' => self::STATUS_PENDING,
    ];

    protected $appends = ['minggu_selesai', 'pdf_url'];

    protected function casts(): array
    {
        return [
            'mark' => 'boolean',
            'minggu_mulai' => 'date:Y-m-d',
            'diverifikasi_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifikator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }

    /**
     * Senin pada minggu tanggal tersebut (zona waktu aplikasi).
     */
    public static function awalMinggu(?CarbonInterface $tanggal = null): Carbon
    {
        return Carbon::instance($tanggal ?? now())
            ->setTimezone(config('app.timezone'))
            ->startOfWeek(CarbonInterface::MONDAY)
            ->startOfDay();
    }

    public function getMingguSelesaiAttribute(): ?string
    {
        return $this->minggu_mulai?->copy()->addDays(6)->format('Y-m-d');
    }

    public function getPdfUrlAttribute(): ?string
    {
        return $this->file_pdf && $this->exists ? route('jurnal.pdf', $this->id) : null;
    }

    public function isPending(): bool
    {
        return $this->status_verifikasi === self::STATUS_PENDING;
    }

    /**
     * Batasi data sesuai role pengguna: siswa hanya miliknya, pembimbing PT
     * hanya siswa di tempat yang ia bimbing, pembimbing sekolah hanya siswa
     * bimbingannya, admin semua.
     */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->hasRole('admin')) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($user) {
            $matched = false;

            if ($user->hasRole('siswa')) {
                $q->orWhere('jurnals.user_id', $user->id);
                $matched = true;
            }
            if ($user->hasRole('pembimbing_pt')) {
                $q->orWhereHas('user.tempat', fn (Builder $t) => $t->where('pembimbing_id', $user->id));
                $matched = true;
            }
            if ($user->hasRole('pembimbing_sekolah')) {
                $q->orWhereHas('user', fn (Builder $u) => $u->where('pembimbing_sekolah_id', $user->id));
                $matched = true;
            }

            if (! $matched) {
                $q->whereRaw('1 = 0');
            }
        });
    }

    /**
     * Filter & urutan yang dipakai halaman daftar jurnal dan export Excel.
     * Kolom urutan dibatasi whitelist agar input sort_by/sort_order tidak
     * bisa dipakai untuk memanipulasi query.
     */
    public function scopeFilter(Builder $query, Request $request): Builder
    {
        $sortable = ['created_at', 'updated_at', 'keterangan', 'kegiatan', 'mark', 'minggu_mulai', 'status_verifikasi', 'diverifikasi_at'];
        $sortBy = str_replace('jurnals.', '', (string) $request->input('sort_by', 'created_at'));
        $sortOrder = strtolower((string) $request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        return $query
            ->when($request->filled('marking'), function (Builder $q) use ($request) {
                $q->where('jurnals.mark', filter_var($request->input('marking'), FILTER_VALIDATE_BOOLEAN));
            })
            ->when(in_array($request->input('status'), self::STATUSES, true), function (Builder $q) use ($request) {
                $q->where('jurnals.status_verifikasi', $request->input('status'));
            })
            ->when(in_array($request->input('keterangan'), self::KETERANGAN, true), function (Builder $q) use ($request) {
                $q->where('jurnals.keterangan', $request->input('keterangan'));
            })
            ->when($this->validDate($request->input('start_date')) && ! $request->filled('end_date'), function (Builder $q) use ($request) {
                $q->whereDate('jurnals.created_at', '=', $request->input('start_date'));
            })
            ->when($this->validDate($request->input('start_date')) && $this->validDate($request->input('end_date')), function (Builder $q) use ($request) {
                // end_date sebelumnya dibandingkan dengan jam 00:00 sehingga
                // data pada hari terakhir tidak ikut terambil.
                $q->whereBetween('jurnals.created_at', [
                    Carbon::parse($request->input('start_date'))->startOfDay(),
                    Carbon::parse($request->input('end_date'))->endOfDay(),
                ]);
            })
            ->when($request->filled('search'), function (Builder $q) use ($request) {
                $search = (string) $request->input('search');
                $q->where(function (Builder $q2) use ($search) {
                    $q2->whereHas('user', fn (Builder $u) => $u->where('name', 'like', "%{$search}%"))
                        ->orWhere('jurnals.keterangan', 'like', "{$search}%")
                        ->orWhere('jurnals.kegiatan', 'like', "{$search}%");
                });
            })
            ->when($sortBy === 'nama', function (Builder $q) use ($sortOrder) {
                $q->join('users', 'users.id', '=', 'jurnals.user_id')
                    ->orderBy('users.name', $sortOrder)
                    ->select('jurnals.*');
            }, function (Builder $q) use ($sortBy, $sortable, $sortOrder) {
                $q->orderBy('jurnals.'.(in_array($sortBy, $sortable, true) ? $sortBy : 'created_at'), $sortOrder);
            })
            ->orderByDesc('jurnals.id');
    }

    /**
     * Cache dashboard memakai kunci per halaman, sehingga Cache::forget()
     * dengan satu kunci tidak pernah menghapusnya. Versi dinaikkan setiap
     * kali data jurnal siswa berubah.
     */
    public static function cacheVersion(int $userId): int
    {
        return (int) Cache::get("jurnals_version_{$userId}", 1);
    }

    public static function flushCacheFor(int $userId): void
    {
        Cache::forever("jurnals_version_{$userId}", self::cacheVersion($userId) + 1);
        Cache::forget("jurnals{$userId}");
    }

    private function validDate(mixed $value): bool
    {
        if (! is_string($value) || $value === '') {
            return false;
        }

        try {
            Carbon::parse($value);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }
}

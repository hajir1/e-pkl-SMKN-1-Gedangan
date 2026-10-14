<?php

namespace App\Http\Controllers;

use App\Exceptions\FileConversionException;
use App\Http\Requests\Jurnal\StoreJurnalRequest;
use App\Http\Requests\Jurnal\UpdateJurnalRequest;
use App\Http\Requests\Jurnal\VerifikasiJurnalRequest;
use App\Models\Jurnal;
use App\Services\AbsensiFileService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JurnalController extends Controller
{
    public function __construct(private AbsensiFileService $files)
    {
    }

    /**
     * Daftar absensi sesuai hak akses role.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $jurnal = Jurnal::query()->with(['user', 'verifikator:id,name'])
            ->visibleTo($user)
            ->filter($request)
            ->paginate(10)->withQueryString();

        $awalMinggu = Jurnal::awalMinggu();
        $mingguIni = $user->hasRole('siswa')
            ? Jurnal::withTrashed()->where('user_id', $user->id)->whereDate('minggu_mulai', $awalMinggu->toDateString())->first()
            : null;

        return Inertia::render('Jurnal/Index', [
            'jurnals' => $jurnal,
            'user' => Jurnal::with(['user.tempat.user', 'user.pbSkl'])->where('user_id', '=', $user->id)->first(),
            'filters' => $request->only(['search', 'sort_by', 'sort_order', 'tahunAjaran', 'start_date', 'end_date', 'keterangan', 'marking', 'status']),
            // Info tambahan untuk frontend: periode minggu berjalan dan
            // absensi minggu ini (null bila siswa belum mengirim).
            'periodeMinggu' => [
                'mulai' => $awalMinggu->toDateString(),
                'selesai' => $awalMinggu->copy()->addDays(6)->toDateString(),
            ],
            'absensiMingguIni' => $mingguIni,
            'sudahAbsenMingguIni' => (bool) $mingguIni,
        ]);
    }

    public function create()
    {
        return redirect()->route('jurnal.index');
    }

    /**
     * Siswa mengirim absensi mingguan (PDF wajib, foto opsional -> WebP).
     */
    public function store(StoreJurnalRequest $request)
    {
        $user = $request->user();
        $awalMinggu = Jurnal::awalMinggu();

        $existing = Jurnal::withTrashed()
            ->where('user_id', $user->id)
            ->whereDate('minggu_mulai', $awalMinggu->toDateString())
            ->first();

        if ($existing) {
            $pesan = $existing->trashed()
                ? 'Absensi minggu ini ada di Sampah. Pulihkan atau hapus permanen terlebih dahulu.'
                : 'Mohon Maaf, Absensi Hanya Bisa Dikirim 1x Setiap Minggu ('.$awalMinggu->format('d-m-Y').' s/d '.$awalMinggu->copy()->addDays(6)->format('d-m-Y').')';

            return redirect()->back()->with('error', $pesan);
        }

        $pdfPath = null;
        $photoPath = null;

        try {
            $pdfPath = $this->files->storePdf($request->file('file_pdf'), $user);
            if ($request->hasFile('photo')) {
                $photoPath = $this->files->storePhotoAsWebp($request->file('photo'), $user);
            }

            Jurnal::create([
                'user_id' => $user->id,
                'minggu_mulai' => $awalMinggu->toDateString(),
                'keterangan' => $request->validated('keterangan'),
                'kegiatan' => $request->validated('kegiatan'),
                'file_pdf' => $pdfPath,
                'photo' => $photoPath,
            ]);
        } catch (UniqueConstraintViolationException) {
            // Dua request bersamaan: index unik (user_id, minggu_mulai) menolak yang kedua.
            $this->files->deletePdf($pdfPath);
            $this->files->deletePhoto($photoPath);

            return redirect()->back()->with('error', 'Mohon Maaf, Absensi Hanya Bisa Dikirim 1x Setiap Minggu');
        } catch (FileConversionException $e) {
            $this->files->deletePdf($pdfPath);
            $this->files->deletePhoto($photoPath);

            return redirect()->back()->with('error', $e->getMessage());
        } catch (\Throwable $e) {
            $this->files->deletePdf($pdfPath);
            $this->files->deletePhoto($photoPath);
            Log::error('Gagal menyimpan absensi: '.$e->getMessage(), ['user_id' => $user->id]);

            return redirect()->back()->with('error', 'Absensi gagal disimpan, coba beberapa saat lagi.');
        }

        Jurnal::flushCacheFor($user->id);

        return redirect()->back()->with('success', 'Sukses Mengirim Absensi Minggu Ini');
    }

    public function show(string $id)
    {
        return redirect()->route('jurnal.index');
    }

    public function edit(string $id)
    {
        return redirect()->route('jurnal.index');
    }

    /**
     * Siswa memperbaiki absensinya selama belum disetujui. Absensi yang
     * ditolak otomatis kembali berstatus pending setelah diperbaiki.
     */
    public function update(UpdateJurnalRequest $request, string $id)
    {
        $jurnal = Jurnal::with('user.tempat')->findOrFail($id);
        Gate::authorize('update', $jurnal);

        $user = $request->user();
        $newPdf = null;
        $newPhoto = null;

        try {
            if ($request->hasFile('file_pdf')) {
                $newPdf = $this->files->storePdf($request->file('file_pdf'), $user);
            }
            if ($request->hasFile('photo')) {
                $newPhoto = $this->files->storePhotoAsWebp($request->file('photo'), $user);
            }
        } catch (FileConversionException $e) {
            $this->files->deletePdf($newPdf);
            $this->files->deletePhoto($newPhoto);

            return redirect()->back()->with('error', $e->getMessage());
        }

        $oldPdf = $jurnal->file_pdf;
        $oldPhoto = $jurnal->photo;

        $jurnal->keterangan = $request->validated('keterangan');
        $jurnal->kegiatan = $request->validated('kegiatan');
        $jurnal->file_pdf = $newPdf ?? $jurnal->file_pdf;
        $jurnal->photo = $newPhoto ?? $jurnal->photo;

        if ($jurnal->status_verifikasi === Jurnal::STATUS_DITOLAK) {
            $jurnal->status_verifikasi = Jurnal::STATUS_PENDING;
            $jurnal->mark = false;
            $jurnal->diverifikasi_oleh = null;
            $jurnal->diverifikasi_at = null;
        }
        $jurnal->save();

        // File lama baru dihapus setelah data tersimpan.
        if ($newPdf) {
            $this->files->deletePdf($oldPdf);
        }
        if ($newPhoto) {
            $this->files->deletePhoto($oldPhoto);
        }

        Jurnal::flushCacheFor($jurnal->user_id);

        return redirect()->back()->with('success', 'Sukses Mengubah Absensi');
    }

    /**
     * Hapus sementara (masuk Sampah). File tetap disimpan sampai dihapus
     * permanen dari Sampah.
     */
    public function destroy(string $id)
    {
        $jurnal = Jurnal::with('user.tempat')->findOrFail($id);
        Gate::authorize('delete', $jurnal);

        $jurnal->delete();
        Jurnal::flushCacheFor($jurnal->user_id);

        return redirect()->back()->with('success', 'Sukses Menghapus Absensi');
    }

    /**
     * Verifikasi oleh admin / pembimbing siswa yang bersangkutan.
     */
    public function verifikasi(VerifikasiJurnalRequest $request, string $id)
    {
        $jurnal = Jurnal::with('user.tempat')->findOrFail($id);
        Gate::authorize('verify', $jurnal);

        $status = $request->validated('status');

        DB::transaction(function () use ($jurnal, $status, $request) {
            $jurnal->status_verifikasi = $status;
            $jurnal->mark = $status === Jurnal::STATUS_DISETUJUI;
            $jurnal->catatan_verifikasi = $request->validated('catatan');
            $jurnal->diverifikasi_oleh = $request->user()->id;
            $jurnal->diverifikasi_at = now();
            $jurnal->save();
        });

        Jurnal::flushCacheFor($jurnal->user_id);

        return redirect()->back()->with(
            'success',
            $status === Jurnal::STATUS_DISETUJUI ? 'Absensi berhasil disetujui' : 'Absensi ditolak dan dikembalikan ke siswa'
        );
    }

    /**
     * Unduh / tampilkan PDF absensi. File disimpan di disk privat sehingga
     * hanya bisa diakses lewat route ini setelah lolos pengecekan hak akses.
     */
    public function pdf(string $id)
    {
        $jurnal = Jurnal::withTrashed()->with('user.tempat')->findOrFail($id);
        Gate::authorize('view', $jurnal);

        $disk = Storage::disk($this->files->pdfDisk());
        abort_unless($jurnal->file_pdf && $disk->exists($jurnal->file_pdf), 404);

        $nama = 'absensi-'.str($jurnal->user?->name ?? 'siswa')->slug().'-'.($jurnal->minggu_mulai?->format('Y-m-d') ?? $jurnal->id).'.pdf';

        return $disk->response($jurnal->file_pdf, $nama, [
            'Content-Type' => 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
        ], 'inline');
    }
}

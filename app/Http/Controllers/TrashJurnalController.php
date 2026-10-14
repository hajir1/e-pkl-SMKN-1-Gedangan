<?php

namespace App\Http\Controllers;

use App\Models\Jurnal;
use App\Services\AbsensiFileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TrashJurnalController extends Controller
{
    public function __construct(private AbsensiFileService $files)
    {
    }

    public function index()
    {
        return Inertia::render('TrashJurnal/Index', [
            'trasheds' => Jurnal::onlyTrashed()->where('user_id', '=', Auth::id())->latest('deleted_at')->paginate(10),
        ]);
    }

    /**
     * Pulihkan absensi dari Sampah.
     *
     * Index unik (user_id, minggu_mulai) ikut menghitung data di Sampah,
     * jadi absensi yang dipulihkan tidak mungkin bentrok dengan absensi lain
     * pada minggu yang sama. Pengecekan sebelumnya memakai tanggal hari ini,
     * bukan tanggal absensi yang dipulihkan.
     */
    public function update(Request $request, string $id)
    {
        $jurnal = Jurnal::onlyTrashed()->findOrFail($id);
        Gate::authorize('restore', $jurnal);

        $jurnal->restore();
        Jurnal::flushCacheFor($jurnal->user_id);

        return redirect()->back()->with('success', 'Sukses Me restore Jurnal');
    }

    public function destroy(string $id)
    {
        $jurnal = Jurnal::onlyTrashed()->findOrFail($id);
        Gate::authorize('forceDelete', $jurnal);

        $this->files->deletePhoto($jurnal->photo);
        $this->files->deletePdf($jurnal->file_pdf);
        $jurnal->forceDelete();
        Jurnal::flushCacheFor($jurnal->user_id);

        return back()->with('success', 'Data dihapus permanen.');
    }
}

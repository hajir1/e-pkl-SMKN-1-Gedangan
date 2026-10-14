<?php

namespace App\Exports;

use App\Models\Jurnal;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromView;

class JurnalExport implements FromView
{

    public function __construct(public $request) {
    }
    /**
    * @return \Illuminate\Support\Collection
    */
    public function view():View
    {
        // Memakai scope yang sama dengan halaman daftar absensi, sehingga hak
        // akses dan whitelist kolom urutan konsisten.
        $siswas = Jurnal::query()->with(["user","verifikator:id,name"])
            ->visibleTo(Auth::user())
            ->filter($this->request)
            ->get();
        return view("excel.jurnal",compact("siswas"));
    }
}

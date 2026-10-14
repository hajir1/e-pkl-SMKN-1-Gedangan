<?php

namespace App\Http\Requests\Jurnal;

use App\Models\Jurnal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJurnalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Jurnal::class) ?? false;
    }

    protected function pdfRequired(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $pdfMax = (int) config('absensi.pdf_max_kb', 5120);
        $photoMax = (int) config('absensi.photo_max_kb', 4096);

        return [
            'keterangan' => ['required', Rule::in(Jurnal::KETERANGAN)],
            'kegiatan' => ['required', 'string', 'max:150'],
            'file_pdf' => [
                $this->pdfRequired() ? 'required' : 'nullable',
                'file',
                'mimes:pdf',
                'mimetypes:application/pdf,application/x-pdf',
                "max:{$pdfMax}",
            ],
            'photo' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp,avif',
                'mimetypes:image/jpeg,image/png,image/webp,image/avif',
                "max:{$photoMax}",
            ],
        ];
    }

    public function messages(): array
    {
        $pdfMax = round(config('absensi.pdf_max_kb', 5120) / 1024, 1);
        $photoMax = round(config('absensi.photo_max_kb', 4096) / 1024, 1);

        return [
            'keterangan.required' => 'Keterangan Wajib Dipilih',
            'keterangan.in' => 'Keterangan harus hadir, izin, atau sakit',
            'kegiatan.required' => 'Kegiatan Wajib Diisi 1 - 150 karakter Huruf',
            'kegiatan.max' => 'Kegiatan Wajib Diisi 1 - 150 karakter Huruf',
            'file_pdf.required' => 'File absensi (PDF) wajib diunggah',
            'file_pdf.file' => 'File absensi gagal diunggah',
            'file_pdf.mimes' => 'File absensi harus berformat PDF',
            'file_pdf.mimetypes' => 'File absensi harus berformat PDF',
            'file_pdf.max' => "File PDF maksimal {$pdfMax} MB",
            'file_pdf.uploaded' => "File PDF gagal diunggah, pastikan ukurannya tidak lebih dari {$pdfMax} MB",
            'photo.file' => 'File gambar gagal diunggah',
            'photo.mimes' => 'Gambar harus bertipe Jpg, Jpeg, Png, WebP, atau Avif',
            'photo.mimetypes' => 'Gambar harus bertipe Jpg, Jpeg, Png, WebP, atau Avif',
            'photo.max' => "File gambar maksimal {$photoMax} MB",
            'photo.uploaded' => "File gambar gagal diunggah, pastikan ukurannya tidak lebih dari {$photoMax} MB",
        ];
    }
}

<?php

namespace App\Http\Requests\Jurnal;

use App\Models\Jurnal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifikasiJurnalRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Hak akses per absensi dicek di controller lewat JurnalPolicy@verify.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([Jurnal::STATUS_DISETUJUI, Jurnal::STATUS_DITOLAK])],
            'catatan' => ['nullable', 'required_if:status,'.Jurnal::STATUS_DITOLAK, 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Status verifikasi wajib dipilih',
            'status.in' => 'Status verifikasi harus disetujui atau ditolak',
            'catatan.required_if' => 'Catatan wajib diisi ketika absensi ditolak',
            'catatan.max' => 'Catatan maksimal 500 karakter',
        ];
    }
}

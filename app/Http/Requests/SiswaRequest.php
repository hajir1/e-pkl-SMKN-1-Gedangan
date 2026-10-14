<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SiswaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $siswaId = $this->route("siswa");

        return [
            "nisn"=>['required',Rule::exists("datasiswas","nisn"), function ($attribute, $value, $fail) use ($siswaId) {
                // Satu NISN hanya boleh dipakai satu akun siswa.
                $dipakai = \App\Models\User::query()
                    ->whereHas("dataSiswa", fn ($q) => $q->where("nisn", $value))
                    ->when($siswaId, fn ($q) => $q->where("id", "!=", $siswaId))
                    ->exists();
                if ($dipakai) {
                    $fail("Nisn Telah Digunakan Oleh Siswa Lain");
                }
            }],
            "email"=>['required', 'string', 'email',Rule::unique("users","email")->ignore($siswaId)],
            "jurusan_id"=>['required', Rule::exists("jurusans","id")],
            "tempat_lahir"=>['required','string','max:100'],
            "tanggal_lahir"=>['required','date','before:today'],
            "tahunAjaran_id"=>['nullable', Rule::exists("tahun_ajarans","id")],
            "pembimbing_sekolah_id"=>['nullable', 'integer', function ($attribute, $value, $fail) {
                if (! \App\Models\User::role("pembimbing_sekolah")->whereKey($value)->exists()) {
                    $fail("Pembimbing Sekolah Tidak Ditemukan");
                }
            }],
            "tempat_id"=>['nullable', Rule::exists("tempats","id")],
            "kontak"=>['required',"regex:/^0[0-9]{9,12}$/"],
            // Wajib saat membuat siswa baru; sebelumnya nullable sehingga
            // Hash::make(null) membuat error.
            "password"=>[$this->isMethod("post") ? 'required' : 'nullable', 'string', 'min:8'],
        ];
    }
    public function messages() : array {
        return [
            "nisn.required"=>"Nisn Wajib Diisi",
            "email.required"=>"email Wajib Diisi",
            "tempat_lahir.required"=>"Tempat Lahir Wajib dipilih",
            "tanggal_lahir.required"=>"Tempat Lahir Wajib Diisi",
            "email.unique"=>"Email Telah Terdaftar",
            "kontak.required"=>"Kontak Wajib Diisi",
            "kontak.regex"=>"Kontak Wajib 10 - 13 Karakter Dan Diawali Angka 0",
            "jurusan_id.required"=>"Jurusan Wajib Diisi",
            "password.required"=>"Password Wajib Diisi",
            "password.min"=>"Password Minimal 8 Karakter",
            "tanggal_lahir.date"=>"Tanggal Lahir Tidak Valid",
            "tempat_id.exists"=>"Tempat Du/Di Tidak Ditemukan",
            "jurusan_id.exists"=>"Jurusan Tidak Ditemukan",
            "password.confirmed"=>"Konfirmasi Password Tidak Sama"
        ];
    }
}

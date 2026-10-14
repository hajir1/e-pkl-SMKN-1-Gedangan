<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
class UserRequest extends FormRequest
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
        return [
            // NISN harus terdaftar di data registrasi dan belum dipakai akun lain
            // (sebelumnya satu NISN bisa didaftarkan berkali-kali).
            'nisn' => ['required','string','max:255', Rule::exists('datasiswas','nisn'), function ($attribute, $value, $fail) {
                if (User::whereHas('dataSiswa', fn ($q) => $q->where('nisn', $value))->exists()) {
                    $fail('Nomor Aktivasi telah di registrasi. Silahkan Login');
                }
            }],
            'jurusan_id' => ['required', Rule::exists('jurusans','id')],
            'tahunAjaran_id' => ['required', Rule::exists('tahun_ajarans','id')],
            'g-recaptcha-response' => 'required',
            'kontak' => 'required|regex:/^0[0-9]{9,12}$/',
            'tempat_lahir' => 'required|string|max:100',
            'tanggal_lahir' => 'required|date|before:today',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];
    }
    public function messages() : array {
        return [
            "nisn.required"=>"Nomor Aktivasi Wajib Diisi",
            "nisn.exists"=>"Nomor Aktivasi Tidak Ditemukan",
            "tanggal_lahir.date"=>"Tanggal Lahir Tidak Valid",
            "jurusan_id.required"=>"Jurusan Wajib Dipilih",
            "tempat_lahir.required"=>"Tempat Lahir Wajib Dipilih",
            "tanggal_lahir.required"=>"Tanggal Lahir Wajib Diisi",
            "tahunAjaran_id.required"=>"tahun Ajaran Wajib Dipilih",
            "kontak.regex"=>"Kontak Wajib Diisi 10 - 13 Karakter Dan Diawali Angka 0",
            "email.required"=>"Email Wajib Diisi",
            "email.unique"=>"Email Telah Digunakan",
            "password.required"=>"Password Wajib Diisi",
            "password.confirmed"=>"Pastikan Konfirmasi dan Password Sama",
            "g-recaptcha-response.required"=>"Captcha Wajib Di Centang"
        ];
    }
}

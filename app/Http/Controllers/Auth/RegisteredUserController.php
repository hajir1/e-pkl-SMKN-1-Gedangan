<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\Datasiswa;
use App\Models\Jurusan;
use App\Models\StepLaporan;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{

    public function index()  {
        return redirect()->route("aktivasi");
    }
    /**
     * Display the registration view.
     */
   public function edit($id): RedirectResponse|Response
    {
        // Token yang dimanipulasi sebelumnya memicu DecryptException (error 500).
        try {
            $siswaId = Crypt::decrypt($id);
        } catch (DecryptException) {
            return redirect()->route("aktivasi")->with("error", "Link registrasi tidak valid.");
        }

        $siswa = Datasiswa::find($siswaId);

        if (!$siswa) {
            return redirect()->route("aktivasi")->with("error", "Data siswa tidak ditemukan.");
        }

        // Sebelumnya dicocokkan berdasarkan nama, padahal nama siswa bisa sama.
        if(User::where("nisn_id", $siswa->id)->exists()){
            return redirect()->route("login")->with("error", "Nomor Aktivasi telah di registrasi. Silahkan Login");
        }

        return Inertia::render('Auth/Register', [
            "siswa" => $siswa,
            "jurusans"=>Jurusan::where("isActive","=","aktif")->get(),
            "tahunAjarans" => TahunAjaran::where("isActive","=","aktif")->get(),
        ]);
    }


    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(UserRequest $request): RedirectResponse
    {
        $request->validated();



        try {
            $response = Http::asForm()->timeout(10)->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => config('services.recaptcha.secret'),
                'response' => $request->input('g-recaptcha-response'),
                'remoteip' => $request->ip(),
            ]);
            $captchaOk = (bool) ($response->json('success') ?? false);
        } catch (\Throwable $e) {
            report($e);
            $captchaOk = false;
        }

        if (!$captchaOk) {
        return back()->withErrors(['error' => 'Verifikasi CAPTCHA gagal.']);
        }

        $regisId = Datasiswa::where("nisn",$request->nisn)->firstOrFail();

        $user = DB::transaction(function () use ($request, $regisId) {
        $regisId->isActive = true;
        $regisId->save();

        $user = User::create([
            'name' => $regisId->nama,   
            'nisn_id' => $regisId->id,   
            'jurusan_id' => $request->jurusan_id,
            'kontak' => $request->kontak,
            'tahunAjaran_id' => $request->tahunAjaran_id,
            'email' => $request->email,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'password' => Hash::make($request->password),
        ]);
        $user->assignRole("siswa");

        return $user;
        });

        event(new Registered($user));
        
        return redirect()->route('login')->with("success","Sukses Aktivasi dan Registrasi Akun Baru");
    }
}

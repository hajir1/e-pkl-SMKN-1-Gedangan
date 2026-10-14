<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Siswa melengkapi tempat & tanggal lahir yang masih kosong.
     *
     * Sebelumnya halaman Data Siswa memakai PUT siswa.update untuk ini,
     * padahal route tersebut khusus admin (403 untuk siswa). Hanya kolom
     * yang masih kosong yang boleh diisi; perubahan berikutnya lewat admin.
     */
    public function updateTtl(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user->hasRole('siswa'), 403);

        if ($user->tempat_lahir && $user->tanggal_lahir) {
            return back()->with('error', 'Tempat dan tanggal lahir sudah diisi. Hubungi admin untuk mengubahnya.');
        }

        $validated = $request->validate([
            'tempat_lahir' => ['required', 'string', 'max:100'],
            'tanggal_lahir' => ['required', 'date', 'before:today'],
        ], [
            'tempat_lahir.required' => 'Tempat lahir wajib dipilih',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi',
            'tanggal_lahir.before' => 'Tanggal lahir tidak valid',
        ]);

        $user->forceFill($validated)->save();
        \Illuminate\Support\Facades\Cache::forget('siswa_'.$user->id);

        return back()->with('success', 'Tempat dan tanggal lahir berhasil disimpan');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}

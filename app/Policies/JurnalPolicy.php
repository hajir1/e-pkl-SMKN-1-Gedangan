<?php

namespace App\Policies;

use App\Models\Jurnal;
use App\Models\User;

class JurnalPolicy
{
    /**
     * Admin, siswa pemilik, pembimbing PT dari tempat PKL siswa, dan
     * pembimbing sekolah dari siswa tersebut boleh melihat absensi.
     */
    public function view(User $user, Jurnal $jurnal): bool
    {
        return $user->hasRole('admin')
            || $this->isOwner($user, $jurnal)
            || $this->isPembimbingOf($user, $jurnal);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('siswa');
    }

    /**
     * Hanya siswa pemilik yang boleh mengubah, dan hanya selama absensi
     * belum disetujui (absensi yang ditolak boleh diperbaiki lalu dikirim
     * ulang).
     */
    public function update(User $user, Jurnal $jurnal): bool
    {
        return $this->isOwner($user, $jurnal)
            && $jurnal->status_verifikasi !== Jurnal::STATUS_DISETUJUI;
    }

    public function delete(User $user, Jurnal $jurnal): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $this->isOwner($user, $jurnal)
            && $jurnal->status_verifikasi !== Jurnal::STATUS_DISETUJUI;
    }

    public function restore(User $user, Jurnal $jurnal): bool
    {
        return $this->isOwner($user, $jurnal);
    }

    public function forceDelete(User $user, Jurnal $jurnal): bool
    {
        return $this->isOwner($user, $jurnal);
    }

    /**
     * Verifikasi hanya oleh admin atau pembimbing dari siswa tersebut.
     * Siswa tidak pernah boleh memverifikasi, termasuk absensinya sendiri.
     */
    public function verify(User $user, Jurnal $jurnal): bool
    {
        if ($this->isOwner($user, $jurnal)) {
            return false;
        }

        return $user->hasRole('admin') || $this->isPembimbingOf($user, $jurnal);
    }

    private function isOwner(User $user, Jurnal $jurnal): bool
    {
        return $user->hasRole('siswa') && (int) $jurnal->user_id === (int) $user->id;
    }

    private function isPembimbingOf(User $user, Jurnal $jurnal): bool
    {
        $siswa = $jurnal->user;
        if (! $siswa) {
            return false;
        }

        if ($user->hasRole('pembimbing_sekolah') && (int) $siswa->pembimbing_sekolah_id === (int) $user->id) {
            return true;
        }

        if ($user->hasRole('pembimbing_pt') && $siswa->tempat && (int) $siswa->tempat->pembimbing_id === (int) $user->id) {
            return true;
        }

        return false;
    }
}

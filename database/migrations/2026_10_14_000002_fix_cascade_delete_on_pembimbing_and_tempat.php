<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sebelumnya foreign key berikut memakai ON DELETE CASCADE:
 * - users.pembimbing_sekolah_id: menghapus pembimbing sekolah ikut menghapus
 *   SEMUA siswa bimbingannya (beserta jurnal, nilai, laporan).
 * - tempats.pembimbing_id: menghapus pembimbing PT ikut menghapus tempat PKL,
 *   lalu (lewat users.tempat_id) semua siswa di tempat tersebut.
 * - users.tempat_id: menghapus tempat PKL ikut menghapus siswanya.
 * Diubah menjadi SET NULL agar data siswa tidak hilang.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['pembimbing_sekolah_id']);
            $table->dropForeign(['tempat_id']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('pembimbing_sekolah_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('tempat_id')->references('id')->on('tempats')->nullOnDelete();
        });

        Schema::table('tempats', function (Blueprint $table) {
            $table->dropForeign(['pembimbing_id']);
        });
        Schema::table('tempats', function (Blueprint $table) {
            $table->foreign('pembimbing_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['pembimbing_sekolah_id']);
            $table->dropForeign(['tempat_id']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('pembimbing_sekolah_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('tempat_id')->references('id')->on('tempats')->cascadeOnDelete();
        });

        Schema::table('tempats', function (Blueprint $table) {
            $table->dropForeign(['pembimbing_id']);
        });
        Schema::table('tempats', function (Blueprint $table) {
            $table->foreign('pembimbing_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};

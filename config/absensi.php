<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Absensi Mingguan
    |--------------------------------------------------------------------------
    |
    | Siswa hanya boleh mengirim satu absensi untuk setiap minggu (Senin -
    | Minggu, zona waktu mengikuti config app.timezone).
    |
    */

    // Ukuran maksimal file PDF absensi (KB).
    'pdf_max_kb' => (int) env('ABSENSI_PDF_MAX_KB', 5120),

    // Ukuran maksimal foto sebelum dikonversi (KB).
    'photo_max_kb' => (int) env('ABSENSI_PHOTO_MAX_KB', 4096),

    // Batas dimensi foto (piksel) untuk mencegah "decompression bomb".
    'photo_max_pixels' => (int) env('ABSENSI_PHOTO_MAX_PIXELS', 40_000_000),

    // Sisi terpanjang foto setelah konversi; foto lebih besar akan diperkecil.
    'photo_max_side' => (int) env('ABSENSI_PHOTO_MAX_SIDE', 1920),

    // Kualitas WebP (0 - 100).
    'webp_quality' => (int) env('ABSENSI_WEBP_QUALITY', 80),

    // Disk penyimpanan. PDF disimpan di disk privat dan hanya bisa diunduh
    // lewat route yang memeriksa hak akses. Foto tetap di disk public agar
    // tampilan frontend yang sudah ada tetap berjalan.
    'pdf_disk' => env('ABSENSI_PDF_DISK', 'local'),
    'photo_disk' => env('ABSENSI_PHOTO_DISK', 'public'),

];

<?php

namespace App\Services;

use App\Exceptions\FileConversionException;
use Illuminate\Http\UploadedFile;

/**
 * Mengonversi gambar upload (JPG, PNG, WebP, GIF, AVIF bila didukung GD)
 * menjadi WebP memakai ekstensi GD bawaan PHP, tanpa dependensi tambahan.
 *
 * Gambar selalu di-decode lalu di-encode ulang, sehingga metadata EXIF dan
 * payload yang disisipkan di dalam file ikut terbuang.
 */
class ImageToWebpConverter
{
    public function __construct(
        private int $quality = 80,
        private int $maxSide = 1920,
        private int $maxPixels = 40_000_000,
    ) {
    }

    public static function fromConfig(): self
    {
        return new self(
            (int) config('absensi.webp_quality', 80),
            (int) config('absensi.photo_max_side', 1920),
            (int) config('absensi.photo_max_pixels', 40_000_000),
        );
    }

    public static function isSupported(): bool
    {
        return extension_loaded('gd') && function_exists('imagewebp');
    }

    /**
     * @return string isi biner file WebP
     */
    public function convert(UploadedFile $file): string
    {
        if (! self::isSupported()) {
            throw new FileConversionException('Server belum mendukung konversi WebP (ekstensi GD dengan dukungan WebP tidak aktif).');
        }

        $path = $file->getRealPath();
        if ($path === false || ! is_readable($path)) {
            throw new FileConversionException('File gambar tidak dapat dibaca.');
        }

        $info = @getimagesize($path);
        if ($info === false) {
            throw new FileConversionException('File yang diunggah bukan gambar yang valid.');
        }

        [$width, $height, $type] = $info;
        if ($width < 1 || $height < 1 || ($width * $height) > $this->maxPixels) {
            throw new FileConversionException('Resolusi gambar terlalu besar.');
        }

        $image = $this->load($path, $type);

        try {
            $image = $this->fixOrientation($image, $path, $type);
            $image = $this->resize($image);

            imagepalettetotruecolor($image);
            imagealphablending($image, true);
            imagesavealpha($image, true);

            ob_start();
            $ok = imagewebp($image, null, max(0, min(100, $this->quality)));
            $binary = ob_get_clean();
        } finally {
            imagedestroy($image);
        }

        if (! $ok || ! is_string($binary) || $binary === '') {
            throw new FileConversionException('Gagal mengonversi gambar ke format WebP.');
        }

        return $binary;
    }

    private function load(string $path, int $type): \GdImage
    {
        $image = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false,
            IMAGETYPE_GIF => @imagecreatefromgif($path),
            default => (defined('IMAGETYPE_AVIF') && $type === IMAGETYPE_AVIF && function_exists('imagecreatefromavif'))
                ? @imagecreatefromavif($path)
                : null,
        };

        if ($image === null) {
            throw new FileConversionException('Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.');
        }
        if ($image === false) {
            throw new FileConversionException('Gambar rusak atau tidak dapat diproses.');
        }

        return $image;
    }

    private function fixOrientation(\GdImage $image, string $path, int $type): \GdImage
    {
        if ($type !== IMAGETYPE_JPEG || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($path);
        $angle = match ((int) ($exif['Orientation'] ?? 1)) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        if ($angle === 0) {
            return $image;
        }

        $rotated = imagerotate($image, $angle, 0);
        if ($rotated === false) {
            return $image;
        }
        imagedestroy($image);

        return $rotated;
    }

    private function resize(\GdImage $image): \GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $longest = max($width, $height);

        if ($this->maxSide <= 0 || $longest <= $this->maxSide) {
            return $image;
        }

        $ratio = $this->maxSide / $longest;
        $resized = imagescale($image, max(1, (int) round($width * $ratio)), max(1, (int) round($height * $ratio)));
        if ($resized === false) {
            return $image;
        }
        imagedestroy($image);

        return $resized;
    }
}

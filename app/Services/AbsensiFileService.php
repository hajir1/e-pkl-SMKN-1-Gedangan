<?php

namespace App\Services;

use App\Exceptions\FileConversionException;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Menyimpan dan menghapus file absensi (PDF + foto WebP) beserta salinan
 * backup-nya. Nama file selalu dibuat server (UUID), tidak pernah memakai
 * nama asli dari klien.
 */
class AbsensiFileService
{
    public function __construct(private ImageToWebpConverter $converter)
    {
    }

    public function folderFor(User $user): string
    {
        // Sebelumnya nama folder disusun langsung dari nama jurusan & nama
        // siswa, sehingga karakter seperti "/" atau ".." ikut masuk ke path.
        $jurusan = Str::slug($user->jurusan?->nama ?? 'tanpa-jurusan') ?: 'tanpa-jurusan';
        $nama = Str::slug($user->name) ?: 'siswa';

        return 'jurnals/'.now()->format('Y').'-'.$jurusan.'-'.$nama.'-'.$user->id;
    }

    /**
     * Validasi isi (bukan hanya ekstensi) lalu simpan PDF ke disk privat.
     */
    public function storePdf(UploadedFile $file, User $user): string
    {
        $path = $file->getRealPath();
        $handle = $path ? @fopen($path, 'rb') : false;
        if ($handle === false) {
            throw new FileConversionException('File PDF tidak dapat dibaca.');
        }
        $head = (string) fread($handle, 1024);
        fseek($handle, max(0, $file->getSize() - 2048));
        $tail = (string) fread($handle, 2048);
        fclose($handle);

        if (! str_contains($head, '%PDF-') || ! str_contains($tail, '%%EOF')) {
            throw new FileConversionException('File absensi harus berupa dokumen PDF yang valid.');
        }

        $target = $this->folderFor($user).'/absensi-'.Str::uuid().'.pdf';
        $stored = Storage::disk($this->pdfDisk())->putFileAs(dirname($target), $file, basename($target));
        if (! $stored) {
            throw new FileConversionException('File PDF gagal disimpan, coba beberapa saat lagi.');
        }

        return $stored;
    }

    /**
     * Konversi foto ke WebP lalu simpan ke disk foto (+ backup bila diatur).
     */
    public function storePhotoAsWebp(UploadedFile $file, User $user): string
    {
        $binary = $this->converter->convert($file);

        $target = $this->folderFor($user).'/foto-'.Str::uuid().'.webp';
        if (! Storage::disk($this->photoDisk())->put($target, $binary)) {
            throw new FileConversionException('Gambar gagal disimpan, coba beberapa saat lagi.');
        }

        $this->backup($target, $binary);

        return $target;
    }

    public function deletePdf(?string $path): void
    {
        if ($path) {
            Storage::disk($this->pdfDisk())->delete($path);
        }
    }

    public function deletePhoto(?string $path): void
    {
        if (! $path) {
            return;
        }

        Storage::disk($this->photoDisk())->delete($path);

        $backup = $this->backupPath($path);
        if ($backup && File::exists($backup)) {
            File::delete($backup);
        }
    }

    public function pdfDisk(): string
    {
        return (string) config('absensi.pdf_disk', 'local');
    }

    public function photoDisk(): string
    {
        return (string) config('absensi.photo_disk', 'public');
    }

    private function backup(string $relativePath, string $binary): void
    {
        $backup = $this->backupPath($relativePath);
        if (! $backup) {
            return;
        }

        try {
            File::ensureDirectoryExists(dirname($backup), 0755);
            File::put($backup, $binary);
        } catch (\Throwable $e) {
            // Backup hanya salinan kedua; kegagalannya tidak boleh menggagalkan absensi.
            Log::warning('Backup foto absensi gagal: '.$e->getMessage(), ['path' => $relativePath]);
        }
    }

    private function backupPath(string $relativePath): ?string
    {
        $base = config('filesystems.backup_photos');
        if (! $base || str_contains($relativePath, '..')) {
            return null;
        }

        return rtrim($base, '/\\').DIRECTORY_SEPARATOR.ltrim($relativePath, '/\\');
    }
}

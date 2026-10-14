<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Dilempar ketika file upload gagal divalidasi isinya atau gagal dikonversi.
 * Pesannya aman ditampilkan ke pengguna.
 */
class FileConversionException extends RuntimeException
{
}

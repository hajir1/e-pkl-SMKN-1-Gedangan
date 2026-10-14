<?php

namespace App\Http\Requests\Jurnal;

class UpdateJurnalRequest extends StoreJurnalRequest
{
    public function authorize(): bool
    {
        // Kepemilikan & status dicek di controller lewat JurnalPolicy@update.
        return $this->user() !== null;
    }

    protected function pdfRequired(): bool
    {
        // Saat edit, PDF lama dipakai bila tidak ada file baru.
        return false;
    }
}

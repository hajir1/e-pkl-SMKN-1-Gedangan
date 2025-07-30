<?php

namespace App\Exports;

use App\Models\Tempat;
use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class TempatExport implements FromView
{
     public function __construct(public $id) {
    }
    /**
    * @return \Illuminate\Support\Collection
    */
    public function view():View
    {
        $tempats = Tempat::with("siswas")->whereHas("siswas",function($q2){
            $q2->where("tempat_id","=",$this->id);
        })->get();
        
        return view("excel.tempat",compact("tempats"));
    }
}

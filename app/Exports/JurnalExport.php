<?php

namespace App\Exports;

use App\Models\Jurnal;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromView;

class JurnalExport implements FromView
{

    public function __construct(public $request) {
    }
    /**
    * @return \Illuminate\Support\Collection
    */
    public function view():View
    {
        $siswas = Jurnal::query()->with("user")
        ->when(Auth::user()->getRoleNames()->contains("siswa"),function($query){
            $query->where("user_id",'=', Auth::user()->id);
        })
       ->when(Auth::user()->getRoleNames()->contains("pembimbing_pt"), function ($query) {
        $query->whereHas('user.tempat', function ($q2) {
           
            $q2->where('pembimbing_id', Auth::id());
        });
        })
       ->when(Auth::user()->getRoleNames()->contains("pembimbing_sekolah"), function ($query) {
            $query->whereHas('user.pbSkl', function ($q2) {
                $q2->where('id', Auth::id());
            });
        })
        ->when($this->request->filled("marking"),function($query) {
            $query->where("mark","=",filter_var($this->request->input("marking"),FILTER_VALIDATE_BOOLEAN));
        })
        ->when($this->request->filled("keterangan"),function($query){
            $query->where("jurnals.keterangan","=",$this->request->input("keterangan"));
        })
        ->when($this->request->filled("start_date") && !$this->request->filled("end_date"),function($query){
            $query->whereDate("jurnals.created_at","=",$this->request->start_date);
        })
        ->when($this->request->filled(["start_date","end_date"]),function($query){
            $query->whereBetween("jurnals.created_at",[$this->request->start_date, $this->request->end_date]);
        })->when($this->request->filled("search"),function($query){
           $query->where(function($q)  {
             $q->whereHas("user",function($q2){
                $q2->where("name","like","{$this->request->search}%");
            })
            ->orWhere("jurnals.keterangan","like","{$this->request->search}%")
            ->orWhere("jurnals.kegiatan","like","{$this->request->search}%");
           });
        })
        ->when($this->request->input("sort_by") === "nama",function($query){
                $query->join("users", "users.id","=","jurnals.user_id")
                ->orderBy("users.name",$this->request->input("sort_order","desc"))
                ->select("jurnals.*");
        })
        ->when($this->request->input("sort_by") !== "nama",function($query){
                $query->orderBy($this->request->input("sort_by","jurnals.created_at"),$this->request->input("sort_order","desc"));
        })
        ->latest()->get();
        return view("excel.jurnal",compact("siswas"));
    }
}

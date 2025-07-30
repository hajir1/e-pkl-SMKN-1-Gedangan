<?php

namespace App\Http\Controllers;

use App\Models\Jurnal;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

use function PHPUnit\Framework\fileExists;

class TrashJurnalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
          return Inertia::render("TrashJurnal/Index",[
            "trasheds"=>Jurnal::onlyTrashed()->where("user_id","=",Auth::user()->id)->paginate(10)
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $today = Carbon::today();

        $sudahAda = Jurnal::where("user_id","=",Auth::user()->id)->whereDate("created_at","=",$today)->exists();

        if($sudahAda){
            return redirect()->back()->with("error","Mohon Maaf, Jurnal Pada Tanggal $today Telah Ada");
        }
        Jurnal::withTrashed()->findOrFail($id)->restore();
        return redirect()->back()->with("success","Sukses Me restore Jurnal");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $jrnlId = Jurnal::withTrashed()->findOrFail($id);
        if($jrnlId->photo){
            $backupPath = env("BACKUP_PHOTOS") . $jrnlId->photo;

            if(fileExists(storage_path("app/public/".$jrnlId->photo))){
                File::delete(storage_path("app/public/".$jrnlId->photo));
            }
            if(fileExists($backupPath)){
                File::delete($backupPath);
            }
        }
        $jrnlId->forceDelete();
        return back()->with('success', 'Data dihapus permanen.');
    }
}

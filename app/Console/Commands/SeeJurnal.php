<?php

namespace App\Console\Commands;

use App\Models\Jurnal;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SeeJurnal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:see-jurnal';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Jurnal command to see the details of the jurnal automatically';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Jurnal::where("mark","=",false)->update(["mark" => true]);
        Log::channel("marking")->info("Mark added At " . now()->format("d-m-Y h-i-s"));
    }
}

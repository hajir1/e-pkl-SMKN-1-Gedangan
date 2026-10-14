<?php

namespace Database\Factories;

use App\Models\Jurnal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Jurnal>
 */
class JurnalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            "user_id"=> User::factory(),
            "minggu_mulai"=> Jurnal::awalMinggu()->toDateString(),
            "photo"=> null,
            "file_pdf"=> null,
            "kegiatan"=>$this->faker->sentence(),
            "keterangan"=>$this->faker->randomElement(Jurnal::KETERANGAN),
        ];
    }

    /**
     * Absensi untuk minggu ke-n sebelum minggu ini (0 = minggu ini).
     */
    public function mingguLalu(int $n): static
    {
        return $this->state(function () use ($n) {
            $minggu = Jurnal::awalMinggu()->subWeeks($n);

            return [
                "minggu_mulai"=> $minggu->toDateString(),
                "created_at"=> $minggu->copy()->addDays(rand(0, 5))->setTime(rand(7, 16), rand(0, 59)),
            ];
        });
    }
}

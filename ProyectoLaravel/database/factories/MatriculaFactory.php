<?php

namespace Database\Factories;

use App\Models\Matricula;
use App\Models\Alumno;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Matricula>
 */
class MatriculaFactory extends Factory
{
    protected $model = Matricula::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'idMatricula' => (string) Str::uuid(),
            'idAlumno' => Alumno::inRandomOrder()->first()->id ?? Alumno::factory(),
            'ciclo' => $this->faker->randomElement(['01-2024', '02-2024', '01-2025']),
            'fecha' => $this->faker->date(),
            'pago' => $this->faker->randomElement(['SÍ', 'NO', 'PND']),
        ];
    }
}

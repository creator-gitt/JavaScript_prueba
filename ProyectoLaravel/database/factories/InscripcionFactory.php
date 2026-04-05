<?php

namespace Database\Factories;

use App\Models\Inscripcion;
use App\Models\Alumno;
use App\Models\Materia;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Inscripcion>
 */
class InscripcionFactory extends Factory
{
    protected $model = Inscripcion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'idInscripcion' => (string) Str::uuid(),
            'idAlumno' => Alumno::inRandomOrder()->first()->id ?? Alumno::factory(),
            'idMateria' => Materia::inRandomOrder()->first()->id ?? Materia::factory(),
            'ciclo' => $this->faker->randomElement(['01-2024', '02-2024', '01-2025']),
            'fecha' => $this->faker->date(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Docente;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Docente>
 */
class DocenteFactory extends Factory
{
    protected $model = Docente::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'idDocente' => (string) Str::uuid(),
            'codigo' => 'D' . $this->faker->unique()->numberBetween(10000, 99999),
            'nombre' => $this->faker->name(),
            'direccion' => $this->faker->address(),
            'email' => $this->faker->unique()->safeEmail(),
            'telefono' => $this->faker->numerify('####-####'),
            'escalafon' => $this->faker->randomElement(['I', 'II', 'III', 'IV', 'V']),
        ];
    }
}

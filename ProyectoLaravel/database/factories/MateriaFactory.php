<?php

namespace Database\Factories;

use App\Models\Materia;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Materia>
 */
class MateriaFactory extends Factory
{
    protected $model = Materia::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'idMateria' => (string) Str::uuid(),
            'codigo' => 'MAT-' . $this->faker->unique()->numberBetween(100, 999),
            'nombre' => $this->faker->randomElement([
                'Programación I', 'Programación II', 'Bases de Datos', 'Redes', 'Sistemas Operativos',
                'Matemática I', 'Matemática II', 'Física I', 'Cálculo Diferencial', 'Ética Profesional',
                'Inglés Técnico', 'Desarrollo Web', 'Inteligencia Artificial', 'Diseño Gráfico', 'Arquitectura de Computadoras'
            ]) . ' ' . $this->faker->optional()->city(),
            'uv' => $this->faker->numberBetween(2, 4),
        ];
    }
}

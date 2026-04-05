<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear Usuario Admin de prueba
        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@sistema.com',
        ]);

        // 2. Crear 500 Alumnos
        echo "Generando 500 Alumnos...\n";
        \App\Models\Alumno::factory(500)->create();

        // 3. Crear 500 Docentes
        echo "Generando 500 Docentes...\n";
        \App\Models\Docente::factory(500)->create();

        // 4. Crear 500 Materias
        echo "Generando 500 Materias...\n";
        \App\Models\Materia::factory(500)->create();

        // 5. Crear 500 Matrículas (asignadas a alumnos existentes)
        echo "Generando 500 Matrículas...\n";
        \App\Models\Matricula::factory(500)->create();

        // 6. Crear 500 Inscripciones (asignadas a alumnos y materias existentes)
        echo "Generando 500 Inscripciones...\n";
        \App\Models\Inscripcion::factory(500)->create();
    }
}

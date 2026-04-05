<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            $table->uuid('idInscripcion')->unique();
            $table->foreignId('idAlumno')->constrained('alumnos')->onDelete('cascade');
            $table->foreignId('idMateria')->constrained('materias')->onDelete('cascade');
            $table->string('ciclo', 20);
            $table->date('fecha');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscripciones');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matriculas', function (Blueprint $table) {
            $table->id();
            $table->uuid('idMatricula')->unique();
            $table->foreignId('idAlumno')->constrained('alumnos')->onDelete('cascade');
            $table->string('ciclo', 20);
            $table->date('fecha');
            $table->string('pago', 5);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matriculas');
    }
};

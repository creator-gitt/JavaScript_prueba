<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('docentes', function (Blueprint $table) {
            $table->id();
            $table->uuid('idDocente')->unique();
            $table->string('codigo', 10)->unique();
            $table->string('nombre', 100);
            $table->string('direccion', 150);
            $table->string('email', 150);
            $table->string('telefono', 15);
            $table->string('escalafon', 50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('docentes');
    }
};

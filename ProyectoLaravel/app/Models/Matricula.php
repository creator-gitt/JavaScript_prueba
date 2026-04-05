<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matricula extends Model
{
    use HasFactory;

    protected $fillable = [
        'idMatricula', 'idAlumno', 'ciclo', 'fecha', 'pago'
    ];

    public function alumno() {
        return $this->belongsTo(Alumno::class, 'idAlumno');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alumno extends Model
{
    use HasFactory;

    protected $fillable = [
        'idAlumno', 'codigo', 'nombre', 'direccion', 'email', 'telefono'
    ];

    public function matriculas() {
        return $this->hasMany(Matricula::class, 'idAlumno');
    }

    public function inscripciones() {
        return $this->hasMany(Inscripcion::class, 'idAlumno');
    }
}

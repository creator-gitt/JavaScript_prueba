<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';

    protected $fillable = [
        'idAlumno',
        'idMateria',
        'ciclo',
        'fecha',
    ];

    public function alumno()
    {
        return $this->belongsTo(Alumno::class, 'idAlumno');
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'idMateria');
    }
}

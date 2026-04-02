<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Matricula extends Model
{
    use HasFactory;

    protected $fillable = [
        'idAlumno',
        'ciclo',
        'fecha',
        'pago',
    ];

    public function alumno()
    {
        // Using 'idAlumno' as the foreign key to match the manual field
        return $this->belongsTo(Alumno::class, 'idAlumno');
    }
}

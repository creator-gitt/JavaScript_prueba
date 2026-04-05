<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Materia extends Model
{
    use HasFactory;

    protected $fillable = [
        'idMateria', 'codigo', 'nombre', 'uv'
    ];

    public function inscripciones() {
        return $this->hasMany(Inscripcion::class, 'idMateria');
    }
}

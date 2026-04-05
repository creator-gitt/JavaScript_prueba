<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Docente extends Model
{
    use HasFactory;

    protected $fillable = [
        'idDocente', 'codigo', 'nombre', 'direccion', 'email', 'telefono', 'escalafon'
    ];
}

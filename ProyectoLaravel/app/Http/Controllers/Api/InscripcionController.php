<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use Illuminate\Http\Request;

class InscripcionController extends Controller
{
    public function index(Request $request)
    {
        $query = Inscripcion::with(['alumno', 'materia']);
        if ($request->has('buscar') && $request->buscar != '' && $request->buscar != 'undefined') {
            $buscar = $request->buscar;
            $query->whereHas('alumno', function($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%");
            })->orWhereHas('materia', function($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%");
            })->orWhere('ciclo', 'like', "%{$buscar}%");
        }
        
        $inscripciones = $query->orderBy('fecha', 'desc')->get()->map(function ($inscripcion) {
            $inscripcion->nombreAlumno = $inscripcion->alumno ? $inscripcion->alumno->nombre : 'Desconocido';
            $inscripcion->nombreMateria = $inscripcion->materia ? $inscripcion->materia->nombre : 'Desconocida';
            return $inscripcion;
        });

        return response()->json($inscripciones);
    }

    public function store(Request $request)
    {
        $inscripcion = Inscripcion::create($request->all());
        return response()->json(true);
    }

    public function show(Inscripcion $inscripcion)
    {
        return response()->json($inscripcion);
    }

    public function update(Request $request, Inscripcion $inscripcion)
    {
        $inscripcion->update($request->all());
        return response()->json(true);
    }

    public function destroy(Inscripcion $inscripcion)
    {
        $inscripcion->delete();
        return response()->json(true);
    }
}

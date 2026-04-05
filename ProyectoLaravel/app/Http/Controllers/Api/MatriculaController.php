<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Matricula;
use Illuminate\Http\Request;

class MatriculaController extends Controller
{
    public function index(Request $request)
    {
        $query = Matricula::with('alumno');
        if ($request->has('buscar') && $request->buscar != '' && $request->buscar != 'undefined') {
            $buscar = $request->buscar;
            $query->whereHas('alumno', function($q) use ($buscar) {
                $q->where('nombre', 'like', "%{$buscar}%");
            })->orWhere('ciclo', 'like', "%{$buscar}%");
        }
        
        $matriculas = $query->orderBy('fecha', 'desc')->get()->map(function ($matricula) {
            $matricula->nombreAlumno = $matricula->alumno ? $matricula->alumno->nombre : 'Desconocido';
            return $matricula;
        });

        return response()->json($matriculas);
    }

    public function store(Request $request)
    {
        $matricula = Matricula::create($request->all());
        return response()->json(true);
    }

    public function show(Matricula $matricula)
    {
        return response()->json($matricula);
    }

    public function update(Request $request, Matricula $matricula)
    {
        $matricula->update($request->all());
        return response()->json(true);
    }

    public function destroy(Matricula $matricula)
    {
        $matricula->delete();
        return response()->json(true);
    }
}

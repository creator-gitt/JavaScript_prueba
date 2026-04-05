<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumno;
use Illuminate\Http\Request;

class AlumnoController extends Controller
{
    public function index(Request $request)
    {
        $query = Alumno::query();
        if ($request->has('buscar') && $request->buscar != '' && $request->buscar != 'undefined') {
            $buscar = $request->buscar;
            $query->where('nombre', 'like', "%{$buscar}%")
                  ->orWhere('codigo', 'like', "%{$buscar}%");
        }
        return response()->json($query->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $alumno = Alumno::create($request->all());
        return response()->json(true);
    }

    public function show(Alumno $alumno)
    {
        return response()->json($alumno);
    }

    public function update(Request $request, Alumno $alumno)
    {
        $alumno->update($request->all());
        return response()->json(true);
    }

    public function destroy(Alumno $alumno)
    {
        $alumno->delete();
        return response()->json(true);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Docente;
use Illuminate\Http\Request;

class DocenteController extends Controller
{
    public function index(Request $request)
    {
        $query = Docente::query();
        if ($request->has('buscar') && $request->buscar != '' && $request->buscar != 'undefined') {
            $buscar = $request->buscar;
            $query->where('nombre', 'like', "%{$buscar}%")
                  ->orWhere('codigo', 'like', "%{$buscar}%");
        }
        return response()->json($query->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $docente = Docente::create($request->all());
        return response()->json(true);
    }

    public function show(Docente $docente)
    {
        return response()->json($docente);
    }

    public function update(Request $request, Docente $docente)
    {
        $docente->update($request->all());
        return response()->json(true);
    }

    public function destroy(Docente $docente)
    {
        $docente->delete();
        return response()->json(true);
    }
}

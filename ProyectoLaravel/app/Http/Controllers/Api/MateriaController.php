<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Materia;
use Illuminate\Http\Request;

class MateriaController extends Controller
{
    public function index(Request $request)
    {
        $query = Materia::query();
        if ($request->has('buscar') && $request->buscar != '' && $request->buscar != 'undefined') {
            $buscar = $request->buscar;
            $query->where('nombre', 'like', "%{$buscar}%")
                  ->orWhere('codigo', 'like', "%{$buscar}%");
        }
        return response()->json($query->orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $materia = Materia::create($request->all());
        return response()->json(true);
    }

    public function show(Materia $materia)
    {
        return response()->json($materia);
    }

    public function update(Request $request, Materia $materia)
    {
        $materia->update($request->all());
        return response()->json(true);
    }

    public function destroy(Materia $materia)
    {
        $materia->delete();
        return response()->json(true);
    }
}

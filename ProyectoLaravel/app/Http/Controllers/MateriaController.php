<?php

namespace App\Http\Controllers;

use App\Models\Materia;
use Illuminate\Http\Request;

class MateriaController extends Controller
{
    public function index()
    {
        $materias = Materia::orderBy('nombre')->get();
        return view('materias.index', compact('materias'));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'idMateria' => 'nullable|integer',
            'codigo' => 'required|string|max:10|unique:materias,codigo,' . $request->idMateria,
            'nombre' => 'required|string|max:100',
            'uv' => 'required|numeric|min:1',
        ]);

        if ($request->filled('idMateria') && $request->idMateria > 0) {
            $materia = Materia::findOrFail($request->idMateria);
            $materia->update($validatedData);
            return redirect()->route('materias.index')->with('success', "Materia {$materia->nombre} modificada correctamente.");
        } else {
            $materia = Materia::create($validatedData);
            return redirect()->route('materias.index')->with('success', "Materia {$materia->nombre} guardada correctamente.");
        }
    }
}

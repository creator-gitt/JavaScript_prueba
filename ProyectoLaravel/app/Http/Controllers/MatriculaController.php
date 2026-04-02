<?php

namespace App\Http\Controllers;

use App\Models\Matricula;
use App\Models\Alumno;
use Illuminate\Http\Request;

class MatriculaController extends Controller
{
    public function index()
    {
        // Paginating or getting all. We will also load the relation.
        $matriculas = Matricula::with('alumno')->orderBy('id', 'desc')->get();
        // Get all alumnos for the dropdown
        $alumnos = Alumno::orderBy('nombre')->get();
        
        return view('matriculas.index', compact('matriculas', 'alumnos'));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'idMatricula' => 'nullable|integer',
            'idAlumno' => 'required|exists:alumnos,id',
            'ciclo' => 'required|string|max:20',
            'fecha' => 'required|date',
            'pago' => 'required|string|in:Si,No',
        ]);

        if ($request->filled('idMatricula') && $request->idMatricula > 0) {
            $matricula = Matricula::findOrFail($request->idMatricula);
            $matricula->update($validatedData);
            return redirect()->route('matriculas.index')->with('success', "Matrícula modificada correctamente.");
        } else {
            Matricula::create($validatedData);
            return redirect()->route('matriculas.index')->with('success', "Matrícula guardada correctamente.");
        }
    }
}

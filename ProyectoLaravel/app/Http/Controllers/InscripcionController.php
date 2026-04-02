<?php

namespace App\Http\Controllers;

use App\Models\Inscripcion;
use App\Models\Alumno;
use App\Models\Materia;
use Illuminate\Http\Request;

class InscripcionController extends Controller
{
    public function index()
    {
        $inscripciones = Inscripcion::with(['alumno', 'materia'])->orderBy('id', 'desc')->get();
        $alumnos = Alumno::orderBy('nombre')->get();
        $materias = Materia::orderBy('nombre')->get();
        
        return view('inscripciones.index', compact('inscripciones', 'alumnos', 'materias'));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'idInscripcion' => 'nullable|integer',
            'idAlumno' => 'required|exists:alumnos,id',
            'idMateria' => 'required|exists:materias,id',
            'ciclo' => 'required|string|max:20',
            'fecha' => 'required|date',
        ]);

        if ($request->filled('idInscripcion') && $request->idInscripcion > 0) {
            $inscripcion = Inscripcion::findOrFail($request->idInscripcion);
            $inscripcion->update($validatedData);
            return redirect()->route('inscripciones.index')->with('success', "Inscripción modificada correctamente.");
        } else {
            Inscripcion::create($validatedData);
            return redirect()->route('inscripciones.index')->with('success', "Inscripción guardada correctamente.");
        }
    }
}

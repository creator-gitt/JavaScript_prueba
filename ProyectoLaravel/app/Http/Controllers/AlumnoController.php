<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use Illuminate\Http\Request;

class AlumnoController extends Controller
{
    public function index()
    {
        $alumnos = Alumno::orderBy('nombre')->get();
        return view('alumnos.index', compact('alumnos'));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'idAlumno' => 'nullable|integer',
            'codigo' => 'required|string|max:10|unique:alumnos,codigo,' . $request->idAlumno,
            'nombre' => 'required|string|max:100',
            'direccion' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'telefono' => 'required|string|max:15',
        ]);

        if ($request->filled('idAlumno') && $request->idAlumno > 0) {
            $alumno = Alumno::findOrFail($request->idAlumno);
            $alumno->update($validatedData);
            return redirect()->route('alumnos.index')->with('success', "Alumno {$alumno->nombre} modificado correctamente.");
        } else {
            $alumno = Alumno::create($validatedData);
            return redirect()->route('alumnos.index')->with('success', "Alumno {$alumno->nombre} guardado correctamente.");
        }
    }
}

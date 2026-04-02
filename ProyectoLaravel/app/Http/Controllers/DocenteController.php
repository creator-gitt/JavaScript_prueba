<?php

namespace App\Http\Controllers;

use App\Models\Docente;
use Illuminate\Http\Request;

class DocenteController extends Controller
{
    public function index()
    {
        $docentes = Docente::orderBy('nombre')->get();
        return view('docentes.index', compact('docentes'));
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'idDocente' => 'nullable|integer',
            'codigo' => 'required|string|max:10|unique:docentes,codigo,' . $request->idDocente,
            'nombre' => 'required|string|max:100',
            'direccion' => 'required|string|max:150',
            'email' => 'required|email|max:150',
            'telefono' => 'required|string|max:15',
            'escalafon' => 'required|string|max:50',
        ]);

        if ($request->filled('idDocente') && $request->idDocente > 0) {
            $docente = Docente::findOrFail($request->idDocente);
            $docente->update($validatedData);
            return redirect()->route('docentes.index')->with('success', "Docente {$docente->nombre} modificado correctamente.");
        } else {
            $docente = Docente::create($validatedData);
            return redirect()->route('docentes.index')->with('success', "Docente {$docente->nombre} guardado correctamente.");
        }
    }
}

@extends('layouts.app')

@section('content')
<div class="row mt-4">
    <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
        <form id="frmInscripciones" action="{{ route('inscripciones.store') }}" method="POST">
            @csrf
            
            <input type="hidden" name="idInscripcion" id="idInscripcion" value="{{ old('idInscripcion') }}">

            <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                    <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-journal-text me-2"></i> REGISTRO DE INSCRIPCIONES</h5>
                </div>
                <div class="card-body p-3 p-md-4">
                    
                    @if ($errors->any())
                        <div class="alert alert-danger">
                            <ul class="mb-0">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    @endif

                    <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">ALUMNO:</label>
                        <div class="col-sm-9">
                            <select name="idAlumno" required class="form-select bg-body-tertiary border-0 shadow-sm text-body">
                                <option value="" disabled {{ old('idAlumno') ? '' : 'selected' }}>Seleccione un alumno...</option>
                                @foreach($alumnos as $alumno)
                                    <option value="{{ $alumno->id }}" {{ old('idAlumno') == $alumno->id ? 'selected' : '' }}>
                                        {{ $alumno->nombre }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">MATERIA:</label>
                        <div class="col-sm-9">
                            <select name="idMateria" required class="form-select bg-body-tertiary border-0 shadow-sm text-body">
                                <option value="" disabled {{ old('idMateria') ? '' : 'selected' }}>Seleccione una materia...</option>
                                @foreach($materias as $materia)
                                    <option value="{{ $materia->id }}" {{ old('idMateria') == $materia->id ? 'selected' : '' }}>
                                        {{ $materia->nombre }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">CICLO:</label>
                        <div class="col-sm-9 col-md-5">
                            <input name="ciclo" value="{{ old('ciclo') }}" placeholder="Ciclo (ej: 01-2026)" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-4 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">FECHA:</label>
                        <div class="col-sm-9 col-md-5">
                            <input name="fecha" value="{{ old('fecha') }}" required type="date" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0 pb-3 text-center">
                    <button type="submit" id="btnGuardarInscripcion" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                        <i class="bi bi-floppy me-1"></i> GUARDAR
                    </button>
                    <a href="{{ route('inscripciones.index') }}" id="btnCancelarInscripcion" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                        <i class="bi bi-x-circle me-1"></i> NUEVO
                    </a>
                    <button type="button" onclick="document.getElementById('listaInscripciones').classList.toggle('d-none')" id="btnBuscarInscripcion" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                        <i class="bi bi-search me-1"></i> BUSCAR
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Busqueda (Listado) -->
<div class="row mt-4 d-none" id="listaInscripciones">
    <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
        <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
            <div class="card-header bg-success text-white text-center py-2 rounded-top-4 border-0">
                <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-search me-2"></i> BÚSQUEDA DE INSCRIPCIONES</h5>
            </div>
            <div class="card-body p-3 p-md-4">
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>ALUMNO</th>
                                <th>MATERIA</th>
                                <th>CICLO</th>
                                <th>FECHA</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($inscripciones as $inscripcion)
                            <tr>
                                <td>{{ $inscripcion->alumno ? $inscripcion->alumno->nombre : 'Desconocido' }}</td>
                                <td>{{ $inscripcion->materia ? $inscripcion->materia->nombre : 'Desconocida' }}</td>
                                <td>{{ $inscripcion->ciclo }}</td>
                                <td>{{ $inscripcion->fecha }}</td>
                                <td>
                                    <button type="button" class="btn btn-sm btn-info" onclick="modificarInscripcion({{ $inscripcion }})">Editar</button>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="text-center">No hay inscripciones registradas.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
    function modificarInscripcion(inscripcion) {
        document.getElementById('idInscripcion').value = inscripcion.id;
        document.querySelector('select[name="idAlumno"]').value = inscripcion.idAlumno;
        document.querySelector('select[name="idMateria"]').value = inscripcion.idMateria;
        document.querySelector('input[name="ciclo"]').value = inscripcion.ciclo;
        document.querySelector('input[name="fecha"]').value = inscripcion.fecha;
        document.getElementById('listaInscripciones').classList.add('d-none');
    }
</script>
@endsection

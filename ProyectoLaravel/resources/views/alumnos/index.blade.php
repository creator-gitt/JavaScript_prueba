@extends('layouts.app')

@section('content')
<div class="row mt-4">
    <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
        <form id="frmAlumnos" action="{{ route('alumnos.store') }}" method="POST">
            @csrf
            
            {{-- We use a hidden input for updates (in a real scenario with separate forms it might be PUT, but we'll use POST for this combined create/update approach) --}}
            <input type="hidden" name="idAlumno" id="idAlumno" value="{{ old('idAlumno') }}">

            <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                    <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-person-badge me-2"></i> REGISTRO DE ALUMNOS</h5>
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
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">CÓDIGO:</label>
                        <div class="col-sm-9 col-md-4">
                            <input name="codigo" value="{{ old('codigo') }}" placeholder="Ej. A001" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">NOMBRE:</label>
                        <div class="col-sm-9">
                            <input name="nombre" value="{{ old('nombre') }}" placeholder="Nombre completo" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">DIRECCIÓN:</label>
                        <div class="col-sm-9">
                            <input name="direccion" value="{{ old('direccion') }}" placeholder="Dirección de residencia" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">EMAIL:</label>
                        <div class="col-sm-9 col-md-8">
                            <input name="email" value="{{ old('email') }}" placeholder="correo@ejemplo.com" required type="email" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-4 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">TELÉFONO:</label>
                        <div class="col-sm-9 col-md-5">
                            <input name="telefono" value="{{ old('telefono') }}" placeholder="Ej. 7777-7777" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0 pb-3 text-center">
                    <button type="submit" id="btnGuardarAlumno" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                        <i class="bi bi-floppy me-1"></i> GUARDAR
                    </button>
                    <a href="{{ route('alumnos.index') }}" id="btnCancelarAlumno" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                        <i class="bi bi-x-circle me-1"></i> NUEVO
                    </a>
                    <button type="button" onclick="document.getElementById('listaAlumnos').classList.toggle('d-none')" id="btnBuscarAlumno" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                        <i class="bi bi-search me-1"></i> BUSCAR
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Busqueda (Listado) -->
<div class="row mt-4 d-none" id="listaAlumnos">
    <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
        <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
            <div class="card-header bg-success text-white text-center py-2 rounded-top-4 border-0">
                <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-search me-2"></i> BÚSQUEDA DE ALUMNOS</h5>
            </div>
            <div class="card-body p-3 p-md-4">
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>NOMBRE</th>
                                <th>EMAIL</th>
                                <th>TELÉFONO</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($alumnos as $alumno)
                            <tr>
                                <td>{{ $alumno->codigo }}</td>
                                <td>{{ $alumno->nombre }}</td>
                                <td>{{ $alumno->email }}</td>
                                <td>{{ $alumno->telefono }}</td>
                                <td>
                                    <!-- AQUI usamos JS para poblar el formulario de arriba sin recargar -->
                                    <button type="button" class="btn btn-sm btn-info" onclick="modificarAlumno({{ $alumno }})">Editar</button>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="text-center">No hay alumnos registrados.</td>
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
    function modificarAlumno(alumno) {
        document.getElementById('idAlumno').value = alumno.id;
        document.querySelector('input[name="codigo"]').value = alumno.codigo;
        document.querySelector('input[name="nombre"]').value = alumno.nombre;
        document.querySelector('input[name="direccion"]').value = alumno.direccion;
        document.querySelector('input[name="email"]').value = alumno.email;
        document.querySelector('input[name="telefono"]').value = alumno.telefono;
        document.getElementById('listaAlumnos').classList.add('d-none');
    }
</script>
@endsection

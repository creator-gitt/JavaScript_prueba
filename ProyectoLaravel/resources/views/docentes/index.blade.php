@extends('layouts.app')

@section('content')
<div class="row mt-4">
    <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
        <form id="frmDocentes" action="{{ route('docentes.store') }}" method="POST">
            @csrf
            
            <input type="hidden" name="idDocente" id="idDocente" value="{{ old('idDocente') }}">

            <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                    <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-briefcase-fill me-2"></i> REGISTRO DE DOCENTES</h5>
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
                            <input name="codigo" value="{{ old('codigo') }}" placeholder="Ej. D001" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
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
                            <input name="email" value="{{ old('email') }}" placeholder="docente@universidad.edu" required type="email" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">TELÉFONO:</label>
                        <div class="col-sm-9 col-md-5">
                            <input name="telefono" value="{{ old('telefono') }}" placeholder="Ej. 7777-7777" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-4 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">ESCALAFÓN:</label>
                        <div class="col-sm-9 col-md-6">
                            <select name="escalafon" required class="form-select bg-body-tertiary border-0 shadow-sm text-body">
                                <option value="" disabled {{ old('escalafon') ? '' : 'selected' }}>Seleccione...</option>
                                <option value="tecnico" {{ old('escalafon') == 'tecnico' ? 'selected' : '' }}>Técnico</option>
                                <option value="profesor" {{ old('escalafon') == 'profesor' ? 'selected' : '' }}>Profesor</option>
                                <option value="ingeniero" {{ old('escalafon') == 'ingeniero' ? 'selected' : '' }}>Licenciado/Ingeniero</option>
                                <option value="maestria" {{ old('escalafon') == 'maestria' ? 'selected' : '' }}>Maestría</option>
                                <option value="doctor" {{ old('escalafon') == 'doctor' ? 'selected' : '' }}>Doctorado</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0 pb-3 text-center">
                    <button type="submit" id="btnGuardarDocente" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                        <i class="bi bi-floppy me-1"></i> GUARDAR
                    </button>
                    <a href="{{ route('docentes.index') }}" id="btnCancelarDocente" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                        <i class="bi bi-x-circle me-1"></i> NUEVO
                    </a>
                    <button type="button" onclick="document.getElementById('listaDocentes').classList.toggle('d-none')" id="btnBuscarDocente" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                        <i class="bi bi-search me-1"></i> BUSCAR
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Busqueda (Listado) -->
<div class="row mt-4 d-none" id="listaDocentes">
    <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
        <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
            <div class="card-header bg-success text-white text-center py-2 rounded-top-4 border-0">
                <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-search me-2"></i> BÚSQUEDA DE DOCENTES</h5>
            </div>
            <div class="card-body p-3 p-md-4">
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>NOMBRE</th>
                                <th>TELÉFONO</th>
                                <th>ESCALAFÓN</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($docentes as $docente)
                            <tr>
                                <td>{{ $docente->codigo }}</td>
                                <td>{{ $docente->nombre }}</td>
                                <td>{{ $docente->telefono }}</td>
                                <td>{{ ucfirst($docente->escalafon) }}</td>
                                <td>
                                    <button type="button" class="btn btn-sm btn-info" onclick="modificarDocente({{ $docente }})">Editar</button>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="text-center">No hay docentes registrados.</td>
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
    function modificarDocente(docente) {
        document.getElementById('idDocente').value = docente.id;
        document.querySelector('input[name="codigo"]').value = docente.codigo;
        document.querySelector('input[name="nombre"]').value = docente.nombre;
        document.querySelector('input[name="direccion"]').value = docente.direccion;
        document.querySelector('input[name="email"]').value = docente.email;
        document.querySelector('input[name="telefono"]').value = docente.telefono;
        document.querySelector('select[name="escalafon"]').value = docente.escalafon;
        document.getElementById('listaDocentes').classList.add('d-none');
    }
</script>
@endsection

@extends('layouts.app')

@section('content')
<div class="row mt-4">
    <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
        <form id="frmMaterias" action="{{ route('materias.store') }}" method="POST">
            @csrf
            
            <input type="hidden" name="idMateria" id="idMateria" value="{{ old('idMateria') }}">

            <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                    <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-book-half me-2"></i> REGISTRO DE MATERIAS</h5>
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
                            <input name="codigo" value="{{ old('codigo') }}" placeholder="Ej. MAT1" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-3 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">NOMBRE:</label>
                        <div class="col-sm-9">
                            <input name="nombre" value="{{ old('nombre') }}" placeholder="Nombre de la materia" required type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                    <div class="row mb-4 align-items-center">
                        <label class="col-sm-3 col-form-label fw-semibold text-secondary">UV (Unidades):</label>
                        <div class="col-sm-9 col-md-4">
                            <input name="uv" value="{{ old('uv') }}" placeholder="Ej. 4" required type="number" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0 pb-3 text-center">
                    <button type="submit" id="btnGuardarMateria" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                        <i class="bi bi-floppy me-1"></i> GUARDAR
                    </button>
                    <a href="{{ route('materias.index') }}" id="btnCancelarMateria" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                        <i class="bi bi-x-circle me-1"></i> NUEVO
                    </a>
                    <button type="button" onclick="document.getElementById('listaMaterias').classList.toggle('d-none')" id="btnBuscarMateria" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                        <i class="bi bi-search me-1"></i> BUSCAR
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>

<!-- Busqueda (Listado) -->
<div class="row mt-4 d-none" id="listaMaterias">
    <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
        <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
            <div class="card-header bg-success text-white text-center py-2 rounded-top-4 border-0">
                <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-search me-2"></i> BÚSQUEDA DE MATERIAS</h5>
            </div>
            <div class="card-body p-3 p-md-4">
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>CÓDIGO</th>
                                <th>NOMBRE</th>
                                <th>UV</th>
                                <th>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($materias as $materia)
                            <tr>
                                <td>{{ $materia->codigo }}</td>
                                <td>{{ $materia->nombre }}</td>
                                <td>{{ $materia->uv }}</td>
                                <td>
                                    <button type="button" class="btn btn-sm btn-info" onclick="modificarMateria({{ $materia }})">Editar</button>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center">No hay materias registradas.</td>
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
    function modificarMateria(materia) {
        document.getElementById('idMateria').value = materia.id;
        document.querySelector('input[name="codigo"]').value = materia.codigo;
        document.querySelector('input[name="nombre"]').value = materia.nombre;
        document.querySelector('input[name="uv"]').value = materia.uv;
        document.getElementById('listaMaterias').classList.add('d-none');
    }
</script>
@endsection

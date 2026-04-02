<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@yield('title', 'Sistema Académico')</title>
    
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" />
    <!-- AlertifyJS CSS -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/alertify.min.css"/>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/default.min.css"/>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/semantic.min.css"/>
    
    @yield('styles')
</head>
<body>
    <nav class="navbar navbar-expand-lg bg-light mb-4">
        <div class="container-fluid">
            <a class="navbar-brand" href="{{ url('/') }}">::.. SISTEMA ACADEMICO ..::</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    {{-- Usaremos rutas estandar de Laravel cuando existan, ej: {{ route('alumnos.index') }} --}}
                    <a class="nav-link" href="{{ route('alumnos.index') }}">Alumnos</a>
                    <a class="nav-link" href="{{ route('materias.index') }}">Materias</a>
                    <a class="nav-link" href="{{ route('docentes.index') }}">Docentes</a>
                    <a class="nav-link" href="{{ route('matriculas.index') }}">Matrículas</a>
                    <a class="nav-link" href="{{ route('inscripciones.index') }}">Inscripciones</a>
                </div>
            </div>
        </div>
    </nav>

    <div class="container-fluid">
        {{-- Mensajes de flash (alertas) --}}
        @if (session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif
        @if (session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        {{-- Contenido inyectado por las vistas que extiendan esta plantilla --}}
        @yield('content')
    </div>

    <!-- Scripts Base -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/alertify.min.js"></script>
    
    @yield('scripts')
</body>
</html>

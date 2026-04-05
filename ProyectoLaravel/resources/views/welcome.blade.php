<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sistema Academico Laravel</title>
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="{{ asset('School.png') }}" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/alertify.min.css"/>
    <!-- Default theme -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/default.min.css"/>
    <!-- Semantic UI theme -->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/semantic.min.css"/>
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
            --bg-body: #f1f5f9;
            --bg-surface: #ffffff;
            --text-primary: #334155;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
            --card-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            --sidebar-bg: rgba(15, 23, 42, 0.85); /* Glassmorphism base */
        }

        [data-theme="dark"] {
            --bg-body: #080f1e;
            --bg-surface: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --border-color: rgba(255, 255, 255, 0.08);
            --card-shadow: 0 10px 20px -5px rgba(0,0,0,0.3);
            --sidebar-bg: rgba(8, 15, 30, 0.85); /* Glassmorphism dark */
        }
        
        /* Compatibilidad Dark Mode para Formularios Bootstrap */
        [data-theme="dark"] .bg-white { background-color: var(--bg-surface) !important; }
        [data-theme="dark"] .bg-light { background-color: rgba(0, 0, 0, 0.2) !important; }
        [data-theme="dark"] .text-dark { color: #f8fafc !important; }
        [data-theme="dark"] .text-muted { color: #94a3b8 !important; }
        [data-theme="dark"] .text-secondary { color: #cbd5e1 !important; }
        [data-theme="dark"] .small { color: #cbd5e1 !important; }
        [data-theme="dark"] .border-light, [data-theme="dark"] .border { border-color: var(--border-color) !important; }
        [data-theme="dark"] .table {
            --bs-table-bg: transparent;
            --bs-table-color: #f8fafc;
            --bs-table-hover-bg: rgba(255, 255, 255, 0.05);
            --bs-table-hover-color: #f8fafc;
        }
        [data-theme="dark"] .table > :not(caption) > * > * { border-bottom-color: var(--border-color); border-color: var(--border-color); }
        
        /* Unified Input Group Backgrounds */
        [data-theme="dark"] .form-control, 
        [data-theme="dark"] .form-select,
        [data-theme="dark"] .input-group-text {
            background-color: #0f172a !important; /* Fondo sólido unificado sin transparencias superpuestas */
            border-color: var(--border-color) !important;
            color: #f8fafc !important;
        }
        [data-theme="dark"] .input-group {
            background-color: transparent !important; /* Sin capa extra */
        }
        [data-theme="dark"] .form-control::placeholder {
            color: rgba(248, 250, 252, 0.4) !important;
        }
        [data-theme="dark"] .form-control:focus, [data-theme="dark"] .form-select:focus {
            background-color: #1a2235 !important;
            border-color: #3b82f6 !important;
            color: #f8fafc !important;
            box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25);
        }
        /* Respetar padding original quitando los overrides manuales de padding */
        [data-theme="dark"] .btn-light {
            background-color: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            color: #f8fafc !important;
        }
        [data-theme="dark"] .btn-light:hover {
            background-color: rgba(255, 255, 255, 0.2) !important;
        }

        body {
            background-color: var(--bg-body);
            color: var(--text-primary);
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            margin: 0;
            overflow-x: hidden;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        #app {
            display: flex;
            min-height: 100vh;
        }
        
        /* Scrollbar Personalizado MAC OS Style */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.02); 
        }
        [data-theme="dark"] ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02); 
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.4); 
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.6); 
        }

        /* Utilidades Gradientes de Iconos */
        .icon-gradient-blue { background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .icon-gradient-green { background: linear-gradient(135deg, #34d399 0%, #059669 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .icon-gradient-orange { background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        /* Sidebar Styles */
        .sidebar {
            width: 260px;
            min-width: 260px;
            background: var(--sidebar-bg);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            color: #f8fafc;
            flex-shrink: 0;
            box-shadow: 4px 0 15px rgba(0,0,0,0.05);
            z-index: 1000;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: sticky;
            top: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
            overflow: hidden;
        }

        /* Estado Colapsado Profesional */
        .sidebar-collapsed .sidebar {
            width: 0 !important;
            min-width: 0 !important;
            margin-left: 0;
            opacity: 0;
            border-right: 0;
            pointer-events: none;
        }
        
        .sidebar-collapsed .main-content {
            width: 100%;
            flex: 1;
        }
        
        .sidebar-brand {
            height: 70px;
            display: flex;
            align-items: center;
            padding: 0 1.5rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .nav-link-custom {
            color: #94a3b8 !important;
            border-radius: 0.5rem;
            padding: 0.75rem 1.25rem;
            margin: 0.25rem 1rem;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
            display: flex;
            align-items: center;
        }
        
        .nav-link-custom:hover, .nav-link-custom.active {
            background-color: #1e293b;
            color: #f8fafc !important;
            transform: translateX(3px);
        }
        
        /* Main Content */
        .main-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
        }
        
        .topbar {
            height: 70px;
            background: var(--bg-surface);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            box-shadow: 0 1px 2px 0 rgba(0,0,0,0.02);
            z-index: 900;
            transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        
        .surface-card {
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            box-shadow: var(--card-shadow);
            transition: all 0.3s ease-in-out;
            color: var(--text-primary);
        }
        .surface-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }
        .text-theme-secondary {
            color: var(--text-secondary);
        }
        [data-theme="dark"] h1, [data-theme="dark"] h2, [data-theme="dark"] h3, [data-theme="dark"] h4, [data-theme="dark"] h5, [data-theme="dark"] h6 {
            color: var(--text-primary);
        }
        
        .search-bar-top {
            width: 300px;
            background-color: #f1f5f9;
            border-radius: 9999px;
            padding: 0.4rem 1.2rem;
            display: flex;
            align-items: center;
            border: 1px solid transparent;
            transition: all 0.2s;
        }
        
        .search-bar-top:focus-within {
            background-color: #ffffff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .search-bar-top input {
            border: none;
            background: transparent;
            outline: none;
            width: 100%;
            margin-left: 0.5rem;
            font-size: 0.9rem;
        }
        
        /* General Utils */
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.3s ease-in-out; }
        /* Welcome Screen Styles */
        .welcome-hero {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border-radius: 1.5rem;
            color: white;
            padding: 3rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .welcome-hero::after {
            content: '';
            position: absolute;
            top: -50px;
            right: -50px;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
            border-radius: 50%;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            padding: 1.5rem;
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.08);
        }

        .welcome-illustration {
            max-width: 450px;
            filter: drop-shadow(0 20px 30px rgba(0,0,0,0.2));
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
    </style>
</head>
<body>
    <div id="app">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-brand cursor-pointer btn-nav-spa" data-target="welcome-screen" title="Ir al Inicio">
                <div class="bg-primary text-white rounded p-1 me-2 d-flex justify-content-center align-items-center" style="width: 32px; height: 32px;">
                    <i class="bi bi-mortarboard-fill fs-5"></i>
                </div>
                <span class="fs-5 fw-bold tracking-wide">Sistema Académico</span>
            </div>
            
            <div class="mt-4">
                <p class="text-uppercase text-white fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.05em; margin: 0 1.5rem 0.5rem 1.5rem;">Gestión</p>
                <div class="navbar-nav w-100 flex-column">
                    <a class="nav-link nav-link-custom btn-nav-spa" data-target="form-alumnos" href="#">
                        <i class="bi bi-people fs-5 me-3"></i> <span>Alumnos</span>
                    </a>
                    <a class="nav-link nav-link-custom btn-nav-spa" data-target="form-docentes" href="#">
                        <i class="bi bi-person-workspace fs-5 me-3"></i> <span>Docentes</span>
                    </a>
                    <a class="nav-link nav-link-custom btn-nav-spa" data-target="form-materias" href="#">
                        <i class="bi bi-journal-bookmark-fill fs-5 me-3"></i> <span>Materias</span>
                    </a>
                </div>
                
                <p class="text-uppercase text-white fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.05em; margin: 1.5rem 1.5rem 0.5rem 1.5rem;">Administración</p>
                <div class="navbar-nav w-100 flex-column">
                    <a class="nav-link nav-link-custom btn-nav-spa" data-target="form-matriculas" href="#">
                        <i class="bi bi-layout-text-sidebar-reverse fs-5 me-3"></i> <span>Matrículas</span>
                    </a>
                    <a class="nav-link nav-link-custom btn-nav-spa" data-target="form-inscripciones" href="#">
                        <i class="bi bi-pen fs-5 me-3"></i> <span>Inscripciones</span>
                    </a>
                </div>
            </div>

            <!-- Controles movidos a la esquina inferior -->
            <div class="mt-auto p-3 d-flex align-items-center justify-content-between border-top border-white border-opacity-10">
                <div class="d-flex align-items-center cursor-pointer">
                    <span class="me-2 fw-semibold text-white d-none d-md-block" style="font-size:0.85rem;">Admin</span>
                    <img src="https://ui-avatars.com/api/?name=Admin&background=eff6ff&color=1d4ed8&rounded=true" alt="User Avatar" class="rounded-circle shadow-sm" width="32" height="32">
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Topbar con Botón de Toggle -->
            <header class="topbar">
                <div class="d-flex align-items-center">
                    <button id="sidebarToggle" class="btn btn-light rounded-circle me-3 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                        <i class="bi bi-list fs-4"></i>
                    </button>
                    <div class="search-bar-top d-none d-md-flex">
                        <i class="bi bi-search text-muted"></i>
                        <input type="text" placeholder="Buscar funciones o expedientes...">
                    </div>
                </div>

                <div class="d-flex align-items-center gap-3">
                    <button id="themeToggle" class="btn btn-light rounded-circle d-flex align-items-center justify-content-center shadow-sm border" style="width: 42px; height: 42px;" title="Alternar Modo Oscuro">
                        <i class="bi bi-moon-stars-fill fs-5" id="themeIcon"></i>
                    </button>
                    <div class="d-none d-lg-block text-end me-2">
                        <div class="fw-bold small text-dark">Portal Académico</div>
                        <div class="text-success small d-flex align-items-center justify-content-end" style="font-size: 0.7rem;">
                            <span class="p-1 me-1 rounded-circle bg-success" style="width: 6px; height: 6px;"></span> En línea
                        </div>
                    </div>
                </div>
            </header>

            <!-- App Container -->
            <div id="appSistema" class="container-fluid p-4 p-md-5 overflow-auto">
                <!-- Welcome Home Screen -->
                <div id="welcome-screen" class="modulo-seccion fade-in">
                    <div class="welcome-hero mb-5">
                        <div class="row align-items-center">
                            <div class="col-lg-7">
                                <h4 class="text-primary-emphasis fw-bold mb-2 tracking-tight" style="color: #60a5fa !important;">Panel de Control</h4>
                                <h1 class="display-4 fw-extrabold mb-4">¡Bienvenido de nuevo, Administrador!</h1>
                                <p class="lead text-slate-300 mb-5" style="color: #94a3b8; font-size: 1.1rem; line-height: 1.6;">
                                    Tu centro de mando académico está listo. Gestiona alumnos, docentes y trámites institucionales con eficiencia y estilo desde un solo lugar.
                                </p>
                                <div class="d-flex gap-3 flex-wrap">
                                    <div class="stat-card">
                                        <div class="text-white small mb-1 uppercase tracking-wider">Fecha de Hoy</div>
                                        <div class="fs-5 fw-bold text-white">@{{ new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="text-white small mb-1 uppercase tracking-wider">Estado Sistema</div>
                                        <div class="fs-5 fw-bold text-success d-flex align-items-center">
                                            <span class="p-1 px-3 me-2 rounded-pill bg-success text-white fs-6 fw-bold">ON</span>
                                            Servidor Activo
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-5 d-none d-lg-block text-center">
                                <div class="bg-white p-4 rounded-5 shadow-lg d-inline-block transition-all welcome-illustration" style="border: 4px solid rgba(255,255,255,0.1);">
                                    <img src="{{ asset('School.png') }}" alt="School Logo" class="img-fluid" style="max-height: 300px; width: auto; object-fit: contain;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- NUEVOS KPIs -->
                    <div class="row g-3 mb-4 mt-2">
                        <div class="col-md-4">
                            <div class="surface-card p-3 rounded-4 d-flex align-items-center">
                                <div class="bg-primary bg-opacity-10 text-primary rounded p-3 me-3 fs-4"><i class="bi bi-people-fill"></i></div>
                                <div>
                                    <div class="text-theme-secondary small fw-bold text-uppercase">Total Alumnos</div>
                                    <div class="fs-3 fw-bolder">1,240 <span class="text-success fs-6 ms-2"><i class="bi bi-arrow-up-short"></i>5%</span></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="surface-card p-3 rounded-4 d-flex align-items-center">
                                <div class="bg-warning bg-opacity-10 text-warning rounded p-3 me-3 fs-4"><i class="bi bi-person-workspace"></i></div>
                                <div>
                                    <div class="text-theme-secondary small fw-bold text-uppercase">Docentes Activos</div>
                                    <div class="fs-3 fw-bolder">85</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="surface-card p-3 rounded-4 d-flex align-items-center">
                                <div class="bg-success bg-opacity-10 text-success rounded p-3 me-3 fs-4"><i class="bi bi-journal-check"></i></div>
                                <div>
                                    <div class="text-theme-secondary small fw-bold text-uppercase">Matrículas Hoy</div>
                                    <div class="fs-3 fw-bolder">312</div>
                                </div>
                            </div>
                        </div>
                    </div>



                    <!-- Accesos Rápidos Convertidos -->
                    <h6 class="fw-bold mt-5 mb-4 text-theme-secondary text-uppercase" style="letter-spacing: 0.1em; font-size: 0.85rem;">Accesos Rápidos</h6>
                    <div class="row g-4 d-flex align-items-stretch">
                        <div class="col-md-4">
                            <div class="surface-card p-4 rounded-4 h-100 cursor-pointer position-relative overflow-hidden" @click="abrirVentana('alumnos')">
                                <div class="bg-primary bg-opacity-10 rounded-4 p-3 d-inline-flex mb-3 align-items-center justify-content-center" style="width: 56px; height: 56px;">
                                    <i class="bi bi-people fs-2 icon-gradient-blue"></i>
                                </div>
                                <h5 class="fw-bold">Gestión de Alumnos</h5>
                                <p class="text-theme-secondary small mb-0">Registra nuevos ingresos, busca expedientes y actualiza información de contacto.</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="surface-card p-4 rounded-4 h-100 cursor-pointer position-relative overflow-hidden" @click="abrirVentana('matriculas')">
                                <div class="bg-success bg-opacity-10 rounded-4 p-3 d-inline-flex mb-3 align-items-center justify-content-center" style="width: 56px; height: 56px;">
                                    <i class="bi bi-layout-text-sidebar-reverse fs-2 icon-gradient-green"></i>
                                </div>
                                <h5 class="fw-bold">Trámites de Matrícula</h5>
                                <p class="text-theme-secondary small mb-0">Controla el proceso de matriculación anual y el estado de pagos de los estudiantes.</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="surface-card p-4 rounded-4 h-100 cursor-pointer position-relative overflow-hidden" @click="abrirVentana('docentes')">
                                <div class="bg-warning bg-opacity-10 rounded-4 p-3 d-inline-flex mb-3 align-items-center justify-content-center" style="width: 56px; height: 56px;">
                                    <i class="bi bi-person-workspace fs-2 icon-gradient-orange"></i>
                                </div>
                                <h5 class="fw-bold">Directorio Docente</h5>
                                <p class="text-theme-secondary small mb-0">Administra la planta académica, sus especialidades y registros contractuales.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="form-alumnos" class="modulo-seccion d-none">
                    <alumnos @buscar='buscar("busqueda_alumnos","obtenerAlumnos")' :forms="forms" ref="alumnos"></alumnos>
                    <busqueda_alumnos @modificar='modificar("alumnos","modificarAlumno", $event)' ref="busqueda_alumnos"></busqueda_alumnos>
                </div>

                <div id="form-materias" class="modulo-seccion d-none">
                    <materias @buscar='buscar("busqueda_materias","obtenerMaterias")' :forms="forms" ref="materias"></materias>
                    <busqueda_materias @modificar='modificar("materias","modificarMateria", $event)' ref="busqueda_materias"></busqueda_materias>
                </div>

                <div id="form-docentes" class="modulo-seccion d-none">
                    <docentes @buscar='buscar("busqueda_docentes","obtenerDocentes")' :forms="forms" ref="docentes"></docentes>
                    <busqueda_docentes @modificar='modificar("docentes","modificarDocente", $event)' ref="busqueda_docentes"></busqueda_docentes>
                </div>

                <div id="form-matriculas" class="modulo-seccion d-none">
                    <matriculas @buscar='buscar("busqueda_matriculas","obtenerMatriculas")' :forms="forms" ref="matriculas"></matriculas>
                    <busqueda_matriculas @modificar='modificar("matriculas","modificarMatricula", $event)' ref="busqueda_matriculas"></busqueda_matriculas>
                </div>

                <div id="form-inscripciones" class="modulo-seccion d-none">
                    <inscripciones @buscar='buscar("busqueda_inscripciones","obtenerInscripciones")' :forms="forms" ref="inscripciones"></inscripciones>
                    <busqueda_inscripciones @modificar='modificar("inscripciones","modificarInscripcion", $event)' ref="busqueda_inscripciones"></busqueda_inscripciones>
                </div>
            </div>
        </main>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/crypto-js.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="//cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/alertify.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    
    <!-- Integración de Vite (Carga el frontend modular) -->
    @vite(['resources/js/main.js'])
</body>
</html>

const matricula = {
    props:['forms'],
    data(){
        return{
            matricula:{
                idMatricula:0,
                codigo:"",
                idAlumno: null,
                nombreAlumno:"",
                carrera:"",
                ciclo:"",
                fecha:"",
                estado:"Activo"
            },
            accion:'nuevo',
            idMatricula:0,
            // Búsqueda de alumno
            buscarAlumno:'',
            alumnosEncontrados:[],
            alumnoSeleccionado: null,
            buscandoAlumno: false,
            sinAlumnos: false,
            // Selector de carrera por pestañas
            tabActiva: 0,
            facultades: [
                {
                    nombre: 'Ing. y Arquitectura',
                    icono: 'bi-cpu',
                    carreras: [
                        'Ingeniería en Sistemas Informáticos',
                        'Ingeniería Civil',
                        'Ingeniería Industrial',
                        'Ingeniería Mecatrónica',
                        'Ingeniería Eléctrica',
                        'Ingeniería Mecánica',
                        'Ingeniería Química',
                        'Ingeniería Biomédica',
                        'Ingeniería en Telecomunicaciones',
                        'Ingeniería Ambiental',
                        'Ingeniería en Energías Renovables',
                        'Ingeniería de Alimentos',
                        'Ingeniería en Petróleos y Gas',
                        'Ingeniería de Minas',
                        'Arquitectura',
                        'Licenciatura en Diseño de Interiores',
                        'Licenciatura en Urbanismo',
                    ]
                },
                {
                    nombre: 'Ciencias de la Salud',
                    icono: 'bi-heart-pulse',
                    carreras: [
                        'Doctorado en Medicina',
                        'Licenciatura en Enfermería',
                        'Doctorado en Cirugía Dental',
                        'Licenciatura en Nutrición y Dietética',
                        'Licenciatura en Psicología Clínica',
                        'Licenciatura en Fisioterapia',
                        'Licenciatura en Laboratorio Clínico',
                        'Licenciatura en Química y Farmacia',
                        'Licenciatura en Optometría',
                        'Licenciatura en Radiología',
                        'Licenciatura en Anestesiología',
                        'Doctorado en Medicina Veterinaria',
                        'Licenciatura en Fonoaudiología',
                    ]
                },
                {
                    nombre: 'Economía y Negocios',
                    icono: 'bi-graph-up-arrow',
                    carreras: [
                        'Licenciatura en Administración de Empresas',
                        'Licenciatura en Contaduría Pública',
                        'Licenciatura en Mercadeo',
                        'Licenciatura en Economía',
                        'Licenciatura en Finanzas y Banca',
                        'Licenciatura en Negocios Internacionales',
                        'Licenciatura en Turismo y Hotelería',
                        'Licenciatura en Administración Pública',
                        'Licenciatura en Recursos Humanos',
                        'Licenciatura en Logística y Aduanas',
                    ]
                },
                {
                    nombre: 'Jurídicas y Sociales',
                    icono: 'bi-balance-scale',
                    carreras: [
                        'Licenciatura en Ciencias Jurídicas (Derecho)',
                        'Licenciatura en Relaciones Internacionales',
                        'Licenciatura en Ciencias Políticas',
                        'Licenciatura en Sociología',
                        'Licenciatura en Trabajo Social',
                        'Licenciatura en Antropología',
                        'Licenciatura en Historia',
                        'Licenciatura en Criminología',
                        'Licenciatura en Arqueología',
                    ]
                },
                {
                    nombre: 'Artes y Comunicaciones',
                    icono: 'bi-palette',
                    carreras: [
                        'Licenciatura en Ciencias de la Comunicación',
                        'Licenciatura en Diseño Gráfico',
                        'Licenciatura en Diseño Industrial',
                        'Licenciatura en Diseño de Modas',
                        'Licenciatura en Artes Plásticas',
                        'Licenciatura en Animación Digital',
                        'Licenciatura en Música',
                        'Licenciatura en Artes Escénicas',
                        'Licenciatura en Cinematografía',
                        'Licenciatura en Publicidad',
                    ]
                },
                {
                    nombre: 'Cs. Agronómicas',
                    icono: 'bi-tree',
                    carreras: [
                        'Ingeniería Agronómica',
                        'Ingeniería Agroindustrial',
                        'Ingeniería Forestal',
                        'Ingeniería en Acuicultura',
                    ]
                },
                {
                    nombre: 'Carreras Técnicas',
                    icono: 'bi-tools',
                    carreras: [
                        'Técnico en Desarrollo de Software',
                        'Técnico en Mantenimiento de Hardware',
                        'Técnico en Diseño Gráfico Web',
                        'Técnico en Enfermería',
                        'Técnico en Gastronomía',
                        'Técnico en Mecánica Automotriz',
                        'Técnico en Turismo',
                        'Técnico en Marketing Digital',
                        'Técnico en Control de Calidad',
                        'Técnico en Asistencia Dental',
                    ]
                },
            ]
        }
    },
    methods:{
        buscarMatricula(){
            this.forms.busqueda_matricula.mostrar = !this.forms.busqueda_matricula.mostrar;
            this.$emit('buscar');
        },
        // Busca alumnos en tiempo real mientras el usuario escribe
        async buscarAlumnos(){
            this.alumnoSeleccionado = null;
            this.matricula.idAlumno = null;
            this.matricula.nombreAlumno = '';
            if(this.buscarAlumno.trim().length === 0){
                this.alumnosEncontrados = [];
                this.sinAlumnos = false;
                return;
            }
            this.buscandoAlumno = true;
            const q = this.buscarAlumno.toLowerCase();
            this.alumnosEncontrados = await db.alumnos.filter(
                a => a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q)
            ).toArray();
            this.sinAlumnos = this.alumnosEncontrados.length === 0;
            this.buscandoAlumno = false;
        },
        // Selecciona un alumno de la lista
        seleccionarAlumno(alumno){
            this.alumnoSeleccionado = alumno;
            this.matricula.idAlumno = alumno.idAlumno;
            this.matricula.nombreAlumno = alumno.nombre;
            this.buscarAlumno = alumno.nombre;
            this.alumnosEncontrados = [];
            this.sinAlumnos = false;
        },
        // Selecciona una carrera desde el panel de pestañas
        seleccionarCarrera(carrera){
            this.matricula.carrera = carrera;
        },
        modificarMatricula(mat){
            this.accion = 'modificar';
            this.idMatricula = mat.idMatricula;
            this.matricula.codigo = mat.codigo;
            this.matricula.idAlumno = mat.idAlumno;
            this.matricula.nombreAlumno = mat.nombreAlumno;
            this.matricula.carrera = mat.carrera;
            this.matricula.ciclo = mat.ciclo;
            this.matricula.fecha = mat.fecha;
            this.matricula.estado = mat.estado;
            this.buscarAlumno = mat.nombreAlumno;
            this.alumnoSeleccionado = { idAlumno: mat.idAlumno, nombre: mat.nombreAlumno };
        },
        async guardarMatricula() {
            if(!this.alumnoSeleccionado){
                alertify.error('Debe seleccionar un alumno registrado.');
                return;
            }
            if(!this.matricula.carrera){
                alertify.error('Debe seleccionar una carrera.');
                return;
            }
            let datos = {
                idMatricula: this.accion=='modificar' ? this.idMatricula : this.getId(),
                codigo: this.matricula.codigo,
                idAlumno: this.matricula.idAlumno,
                nombreAlumno: this.matricula.nombreAlumno,
                carrera: this.matricula.carrera,
                ciclo: this.matricula.ciclo,
                fecha: this.matricula.fecha,
                estado: this.matricula.estado
            };
            await db.matricula.put(datos);
            this.limpiarFormulario();
            alertify.success(`Matrícula de ${datos.nombreAlumno} guardada correctamente`);
        },
        getId(){
            return new Date().getTime();
        },
        limpiarFormulario(){
            this.accion = 'nuevo';
            this.idMatricula = 0;
            this.matricula.codigo = '';
            this.matricula.idAlumno = null;
            this.matricula.nombreAlumno = '';
            this.matricula.carrera = '';
            this.matricula.ciclo = '';
            this.matricula.fecha = '';
            this.matricula.estado = 'Activo';
            this.buscarAlumno = '';
            this.alumnoSeleccionado = null;
            this.alumnosEncontrados = [];
            this.sinAlumnos = false;
        },
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-card-checklist me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Gestión de Matrículas</h5>
                <span v-if="accion=='modificar'" class="badge bg-warning text-dark ms-2">Editando</span>
            </div>
            <form id="frmMatricula" @submit.prevent="guardarMatricula" @reset.prevent="limpiarFormulario">
                <div class="card border-0 shadow-sm" style="max-width: 680px;">
                    <div class="card-body p-4">

                        <div class="row mb-3">
                            <div class="col-6">
                                <label class="form-label text-muted small fw-semibold text-uppercase">Código</label>
                                <input placeholder="MATR-001" required v-model="matricula.codigo" type="text" class="form-control form-control-sm" pattern="[A-Z]{4}[0-9]{3}" title="Formato requerido: 4 letras mayúsculas seguidas de 3 dígitos (ej. MATR001)" @input="matricula.codigo = matricula.codigo.toUpperCase()">
                            </div>
                            <div class="col-6">
                                <label class="form-label text-muted small fw-semibold text-uppercase">Fecha</label>
                                <input required v-model="matricula.fecha" type="date" class="form-control form-control-sm">
                            </div>
                        </div>

                        <!-- Búsqueda de alumno en tiempo real -->
                        <div class="mb-3 position-relative">
                            <label class="form-label text-muted small fw-semibold text-uppercase">
                                Alumno
                                <span v-if="alumnoSeleccionado" class="badge bg-success ms-1">
                                    <i class="bi bi-check-circle me-1"></i>Seleccionado
                                </span>
                            </label>
                            <input
                                type="text"
                                v-model="buscarAlumno"
                                @input="buscarAlumnos"
                                placeholder="Escribe el nombre o código del alumno..."
                                class="form-control form-control-sm"
                                :class="sinAlumnos ? 'is-invalid' : alumnoSeleccionado ? 'is-valid' : ''"
                                autocomplete="off">
                            <!-- Lista de sugerencias -->
                            <ul v-if="alumnosEncontrados.length > 0"
                                class="list-group position-absolute w-100 shadow-sm"
                                style="z-index:100; top:100%; max-height:160px; overflow-y:auto;">
                                <li v-for="a in alumnosEncontrados" :key="a.idAlumno"
                                    class="list-group-item list-group-item-action py-1 px-3 small"
                                    style="cursor:pointer;"
                                    @mousedown.prevent="seleccionarAlumno(a)">
                                    <span class="fw-semibold">{{ a.nombre }}</span>
                                    <span class="text-muted ms-2">{{ a.codigo }}</span>
                                </li>
                            </ul>
                            <!-- Mensaje de error -->
                            <div v-if="sinAlumnos" class="invalid-feedback d-block">
                                <i class="bi bi-exclamation-triangle me-1"></i>
                                Alumno no encontrado. <strong>Regístralo primero en el módulo Alumnos.</strong>
                            </div>
                        </div>

                        <!-- Selector de Carrera por Pestañas -->
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-semibold text-uppercase d-flex align-items-center gap-2">
                                Carrera
                                <span v-if="matricula.carrera" class="badge bg-success fw-normal text-truncate" style="max-width:260px;">
                                    <i class="bi bi-check-circle me-1"></i>{{ matricula.carrera }}
                                </span>
                                <span v-else class="text-danger small fw-normal">(ninguna seleccionada)</span>
                            </label>

                            <!-- Tabs de Facultades -->
                            <div class="border rounded overflow-hidden">
                                <ul class="nav nav-tabs nav-fill flex-nowrap overflow-auto border-0" style="background:#f8f9fa;">
                                    <li class="nav-item" v-for="(fac, idx) in facultades" :key="idx">
                                        <a href="#"
                                           class="nav-link py-2 px-2 small text-nowrap"
                                           :class="tabActiva === idx ? 'active fw-semibold' : 'text-secondary'"
                                           @click.prevent="tabActiva = idx">
                                            <i :class="'bi ' + fac.icono + ' me-1'"></i>{{ fac.nombre }}
                                        </a>
                                    </li>
                                </ul>
                                <!-- Lista de carreras de la pestaña activa -->
                                <div class="p-2" style="max-height:200px; overflow-y:auto; background:#fff;">
                                    <div class="row g-1">
                                        <div class="col-12" v-for="carrera in facultades[tabActiva].carreras" :key="carrera">
                                            <button type="button"
                                                @click="seleccionarCarrera(carrera)"
                                                class="btn btn-sm w-100 text-start py-1 px-3"
                                                :class="matricula.carrera === carrera
                                                    ? 'text-white'
                                                    : 'btn-outline-secondary'"
                                                :style="matricula.carrera === carrera
                                                    ? 'background-color:#1a3a5c; border-color:#1a3a5c;'
                                                    : ''">
                                                <i class="bi bi-mortarboard me-2 opacity-50"></i>{{ carrera }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row mb-1">
                            <div class="col-6">
                                <label class="form-label text-muted small fw-semibold text-uppercase">Ciclo</label>
                                <input placeholder="01-2026" required v-model="matricula.ciclo" type="text" class="form-control form-control-sm">
                            </div>
                            <div class="col-6">
                                <label class="form-label text-muted small fw-semibold text-uppercase">Estado</label>
                                <select v-model="matricula.estado" class="form-select form-select-sm">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="Pendiente">Pendiente</option>
                                </select>
                            </div>
                        </div>

                    </div>
                    <div class="card-footer bg-white border-top d-flex gap-2 px-4 py-3">
                        <button type="submit" class="btn btn-sm px-3" style="background-color:#1a3a5c; color:white;"
                            :disabled="!alumnoSeleccionado || !matricula.carrera">
                            <i class="bi bi-save me-1"></i>Guardar
                        </button>
                        <button type="reset" class="btn btn-sm btn-outline-secondary px-3">
                            <i class="bi bi-arrow-counterclockwise me-1"></i>Nuevo
                        </button>
                        <button type="button" @click="buscarMatricula" class="btn btn-sm btn-outline-success px-3 ms-auto">
                            <i class="bi bi-search me-1"></i>Buscar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `
};
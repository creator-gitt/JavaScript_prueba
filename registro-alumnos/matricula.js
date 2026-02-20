const matricula = {
    props:['forms'],
    data(){
        return{
            matricula:{
                codigo:"",
                alumnoId: null,
                _alumnoNombre:"",
                carreraId: null,
                _carreraNombre:"",
                periodoId: null,
                _periodoCiclo:"",
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
            // Periodos disponibles
            periodosDisponibles: [],
            // Carreras disponibles (desde BD)
            carrerasDisponibles: [],
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
            this.matricula.alumnoId = alumno.idAlumno;
            this.matricula._alumnoNombre = alumno.nombre;
            this.buscarAlumno = alumno.nombre;
            this.alumnosEncontrados = [];
            this.sinAlumnos = false;
        },
        seleccionarCarrera(carrera){
            this.matricula.carreraId = carrera.idCarrera;
            this.matricula._carreraNombre = carrera.nombre;
        },
        seleccionarPeriodo(periodo){
            this.matricula.periodoId = periodo.idPeriodo;
            this.matricula._periodoCiclo = periodo.ciclo + ' - ' + periodo.año;
        },
        async cargarPeriodos(){
            this.periodosDisponibles = await db.periodos.where('estado').equals('abierto').toArray();
        },
        async cargarCarreras(){
            this.carrerasDisponibles = await db.carreras.toArray();
        },
        modificarMatricula(mat){
            this.accion = 'modificar';
            this.idMatricula = mat.idMatricula || mat.id;
            this.matricula.codigo = mat.codigo;
            this.matricula.alumnoId = mat.alumnoId;
            this.matricula._alumnoNombre = mat._alumnoNombre || '';
            this.matricula.carreraId = mat.carreraId;
            this.matricula._carreraNombre = mat._carreraNombre || '';
            this.matricula.periodoId = mat.periodoId;
            this.matricula._periodoCiclo = mat._periodoCiclo || '';
            this.matricula.estado = mat.estado;
            this.buscarAlumno = mat._alumnoNombre || '';
            this.alumnoSeleccionado = { idAlumno: mat.alumnoId, nombre: mat._alumnoNombre || '' };
        },
        async guardarMatricula() {
            if(!this.alumnoSeleccionado || !this.matricula.alumnoId){
                alertify.error('Debe seleccionar un alumno registrado.');
                return;
            }
            if(!this.matricula.carreraId){
                alertify.error('Debe seleccionar una carrera.');
                return;
            }
            if(!this.matricula.periodoId){
                alertify.error('Debe seleccionar un período académico.');
                return;
            }

            // Verificar que no exista ya una matrícula activa para este alumno en este período
            const duplicada = await db.matricula
                .where('alumnoId').equals(this.matricula.alumnoId)
                .filter(m => m.periodoId === this.matricula.periodoId && (this.accion !== 'modificar' || m.idMatricula !== this.idMatricula))
                .first();
            if (duplicada) {
                alertify.error('Este alumno ya tiene una matrícula en el período seleccionado.');
                return;
            }

            const datos = {
                codigo:         this.matricula.codigo,
                alumnoId:       this.matricula.alumnoId,
                _alumnoNombre:  this.matricula._alumnoNombre,
                carreraId:      this.matricula.carreraId,
                _carreraNombre: this.matricula._carreraNombre,
                periodoId:      this.matricula.periodoId,
                _periodoCiclo:  this.matricula._periodoCiclo,
                estado:         this.matricula.estado,
                fechaCreacion:  new Date().toISOString()
            };

            if (this.accion === 'modificar') {
                await db.matricula.update(this.idMatricula, datos);
                alertify.success(`Matrícula de ${datos._alumnoNombre} actualizada correctamente.`);
            } else {
                await db.matricula.add(datos);
                alertify.success(`Matrícula de ${datos._alumnoNombre} guardada correctamente.`);
            }
            this.limpiarFormulario();
        },
        limpiarFormulario(){
            this.accion = 'nuevo';
            this.idMatricula = 0;
            this.matricula.codigo = '';
            this.matricula.alumnoId = null;
            this.matricula._alumnoNombre = '';
            this.matricula.carreraId = null;
            this.matricula._carreraNombre = '';
            this.matricula.periodoId = null;
            this.matricula._periodoCiclo = '';
            this.matricula.estado = 'Activo';
            this.buscarAlumno = '';
            this.alumnoSeleccionado = null;
            this.alumnosEncontrados = [];
            this.sinAlumnos = false;
        },
    },
    async mounted(){
        await this.cargarPeriodos();
        await this.cargarCarreras();
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-card-checklist me-2 fs-5 text-body-secondary"></i>
                <h5 class="mb-0 fw-semibold text-body">Gestión de Matrículas</h5>
                <span v-if="accion=='modificar'" class="badge bg-warning text-dark ms-2">Editando</span>
            </div>
            <form id="frmMatricula" @submit.prevent="guardarMatricula" @reset.prevent="limpiarFormulario">
                <div class="card border-0 shadow-sm bg-body-tertiary" style="max-width: 680px;">
                    <div class="card-body p-4">

                        <div class="row mb-3">
                            <div class="col-12">
                                <label class="form-label text-body-secondary small fw-bold text-uppercase">Código</label>
                                <input placeholder="MATR-001" required v-model="matricula.codigo" type="text" class="form-control form-control-sm bg-transparent" @input="matricula.codigo = matricula.codigo.toUpperCase()">
                            </div>
                        </div>

                        <!-- Búsqueda de alumno en tiempo real -->
                        <div class="mb-3 position-relative">
                            <label class="form-label text-body-secondary small fw-bold text-uppercase">
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
                                class="form-control form-control-sm bg-transparent"
                                :class="sinAlumnos ? 'is-invalid' : alumnoSeleccionado ? 'is-valid' : ''"
                                autocomplete="off">
                            <!-- Lista de sugerencias -->
                            <ul v-if="alumnosEncontrados.length > 0"
                                class="list-group position-absolute w-100 shadow-sm bg-body-tertiary"
                                style="z-index:100; top:100%; max-height:160px; overflow-y:auto;">
                                <li v-for="a in alumnosEncontrados" :key="a.idAlumno"
                                    class="list-group-item list-group-item-action bg-transparent py-1 px-3 small border-0"
                                    style="cursor:pointer;"
                                    @mousedown.prevent="seleccionarAlumno(a)">
                                    <span class="fw-semibold text-body">{{ a.nombre }}</span>
                                    <span class="text-body-secondary ms-2 small">{{ a.codigo }}</span>
                                </li>
                            </ul>
                            <!-- Mensaje de error -->
                            <div v-if="sinAlumnos" class="invalid-feedback d-block">
                                <i class="bi bi-exclamation-triangle me-1"></i>
                                Alumno no encontrado. <strong>Regístralo primero en el módulo Alumnos.</strong>
                            </div>
                        </div>

                        <!-- Selector de Carrera desde BD -->
                        <div class="mb-3">
                            <label class="form-label text-body-secondary small fw-bold text-uppercase d-flex align-items-center gap-2">
                                Carrera
                                <span v-if="matricula._carreraNombre" class="badge bg-success fw-normal text-truncate" style="max-width:260px;">
                                    <i class="bi bi-check-circle me-1"></i>{{ matricula._carreraNombre }}
                                </span>
                                <span v-else class="text-danger small fw-normal">(ninguna seleccionada)</span>
                            </label>
                            <div class="border rounded p-2 bg-body-secondary bg-opacity-10" style="max-height:160px; overflow-y:auto;">
                                <div v-if="!carrerasDisponibles || carrerasDisponibles.length === 0" class="text-body-secondary small">
                                    <i class="bi bi-info-circle me-1"></i>No hay carreras registradas. Añadelas en el módulo Carreras.
                                </div>
                                <button v-for="c in carrerasDisponibles" :key="c.idCarrera" type="button"
                                    @click="seleccionarCarrera(c)"
                                    class="btn btn-sm w-100 text-start py-1 px-2 mb-1"
                                    :class="matricula.carreraId === c.idCarrera ? 'text-white' : 'btn-outline-secondary'"
                                    :style="matricula.carreraId === c.idCarrera ? 'background-color:#1a3a5c;border-color:#1a3a5c;' : ''">
                                    <i class="bi bi-mortarboard me-2 opacity-50"></i>{{ c.nombre }}
                                </button>
                            </div>
                        </div>

                        <!-- Selector de Período Académico -->
                        <div class="mb-3">
                            <label class="form-label text-body-secondary small fw-bold text-uppercase">Período Académico</label>
                            <select v-model="matricula.periodoId" class="form-select form-select-sm bg-transparent"
                                @change="seleccionarPeriodo(periodosDisponibles.find(p => p.idPeriodo === matricula.periodoId) || {})">
                                <option :value="null" disabled>-- Selecciona un período --</option>
                                <option v-for="p in periodosDisponibles" :key="p.idPeriodo" :value="p.idPeriodo">
                                    {{ p.ciclo }} — {{ p.año }}
                                </option>
                            </select>
                            <div v-if="periodosDisponibles.length === 0" class="text-danger small mt-1">
                                <i class="bi bi-exclamation-triangle me-1"></i>No hay períodos activos. Créalos en el módulo Períodos.
                            </div>
                        </div>


                        <div class="row mb-1">
                            <div class="col-12">
                                <label class="form-label text-body-secondary small fw-bold text-uppercase">Estado</label>
                                <select v-model="matricula.estado" class="form-select form-select-sm bg-transparent">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="Pendiente">Pendiente</option>
                                </select>
                            </div>
                        </div>

                    </div>
                    <div class="card-footer bg-transparent border-top d-flex gap-2 px-4 py-3">
                        <button type="submit" class="btn btn-sm px-3" style="background-color:#1a3a5c; color:white;"
                            :disabled="!alumnoSeleccionado || !matricula.carreraId || !matricula.periodoId">
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
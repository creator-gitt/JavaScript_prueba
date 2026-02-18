const inscripciones = {
    props:['forms'],
    data(){
        return{
            inscripcion:{
                idInscripcion:0,
                idMatricula:"",
                alumno:"",
                idMateria:"",
                materia:"",
                fecha:"",
                ciclo:""
            },
            accion:'nuevo',
            // Cantidad de materias que el alumno quiere inscribir (1-5)
            cantidadMaterias: 5,
            // Materias ya inscritas para la matrícula seleccionada
            materiasInscritas: [],
            // Datos relacionales cargados desde DB
            matriculasActivas:[],
            materiasDisponibles:[],
            // Mensajes de advertencia
            sinMatriculas: false,
            sinMaterias: false,
        }
    },
    async mounted(){
        await this.cargarDatosRelacionales();
    },
    watch:{
        // Recarga los datos cada vez que se abre el panel
        'forms.inscripciones.mostrar'(visible){
            if(visible) this.cargarDatosRelacionales();
        }
    },
    methods:{
        getRomano(n) {
            const romanos = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
            return romanos[n - 1] || n;
        },
        // Carga matrículas activas y materias desde la DB
        async cargarDatosRelacionales(){
            this.matriculasActivas = await db.matricula
                .filter(m => m.estado === 'Activo')
                .toArray();
            this.sinMatriculas = this.matriculasActivas.length === 0;

            this.materiasDisponibles = await db.materias.toArray();
            this.sinMaterias = this.materiasDisponibles.length === 0;
        },
        // Al seleccionar una matrícula, rellena el alumno y carga sus materias ya inscritas
        async onMatriculaChange(){
            const mat = this.matriculasActivas.find(m => m.idMatricula == this.inscripcion.idMatricula);
            if(mat){
                this.inscripcion.alumno = mat.nombreAlumno;
                this.inscripcion.ciclo  = mat.ciclo || '';
            } else {
                this.inscripcion.alumno = '';
                this.inscripcion.ciclo  = '';
            }
            this.inscripcion.idMateria = '';
            this.inscripcion.materia   = '';
            await this.cargarMateriasInscritas();
        },
        // Carga las materias ya inscritas para la matrícula activa
        async cargarMateriasInscritas(){
            if(!this.inscripcion.idMatricula){
                this.materiasInscritas = [];
                return;
            }
            this.materiasInscritas = await db.inscripciones
                .filter(i => i.idMatricula == this.inscripcion.idMatricula)
                .toArray();
        },
        // Al seleccionar una materia, guarda el nombre
        onMateriaChange(){
            const mat = this.materiasDisponibles.find(m => m.idMateria == this.inscripcion.idMateria);
            if(mat){
                this.inscripcion.materia = mat.nombre;
            } else {
                this.inscripcion.materia = '';
            }
        },
        buscarInscripcion(){
            this.forms.busqueda_inscripciones.mostrar = !this.forms.busqueda_inscripciones.mostrar;
            this.$emit('buscar');
        },
        modificarInscripcion(ins){
            this.accion = 'modificar';
            this.idInscripcion = ins.idInscripcion;
            this.inscripcion.idMatricula = ins.idMatricula;
            this.inscripcion.alumno  = ins.alumno;
            this.inscripcion.idMateria = ins.idMateria || '';
            this.inscripcion.materia = ins.materia;
            this.inscripcion.fecha   = ins.fecha;
            this.inscripcion.ciclo   = ins.ciclo;
            this.cargarMateriasInscritas();
        },
        async guardarInscripcion() {
            if(!this.inscripcion.idMatricula){
                alertify.error('Debe seleccionar una matrícula activa.');
                return;
            }
            if(!this.inscripcion.idMateria){
                alertify.error('Debe seleccionar una materia.');
                return;
            }

            // Recargar las materias inscritas para tener datos frescos
            await this.cargarMateriasInscritas();

            // Al modificar, excluir el registro actual del conteo
            const esModificar = this.accion === 'modificar';
            const inscripcionesFiltradas = esModificar
                ? this.materiasInscritas.filter(i => i.idInscripcion != this.idInscripcion)
                : this.materiasInscritas;

            // 1) Verificar materia duplicada (comparar idMateria como string para evitar fallos de tipo)
            const yaInscrito = inscripcionesFiltradas.some(
                i => String(i.idMateria) === String(this.inscripcion.idMateria)
            );
            if(yaInscrito){
                alertify.error(`¡No puedes inscribir "${this.inscripcion.materia}" dos veces! Esa materia ya está registrada para este alumno. Inscribe una materia diferente.`);
                return;
            }

            // 2) Verificar límite según la cantidad elegida por el usuario
            const limite = parseInt(this.cantidadMaterias) || 5;
            if(inscripcionesFiltradas.length >= limite){
                alertify.error(`Este alumno ya tiene ${inscripcionesFiltradas.length} materia(s) inscrita(s) y el límite que elegiste es ${limite}. Cambia el límite o elimina una materia.`);
                return;
            }

            let datos = {
                idInscripcion: esModificar ? this.idInscripcion : this.getId(),
                idMatricula:   this.inscripcion.idMatricula,
                alumno:        this.inscripcion.alumno,
                idMateria:     this.inscripcion.idMateria,
                materia:       this.inscripcion.materia,
                fecha:         this.inscripcion.fecha,
                ciclo:         this.inscripcion.ciclo
            };
            await db.inscripciones.put(datos);
            // Actualizar lista local sin recargar todo
            await this.cargarMateriasInscritas();
            // Limpiar solo la selección de materia para inscribir otra rápidamente
            this.inscripcion.idMateria = '';
            this.inscripcion.materia   = '';
            this.inscripcion.fecha     = '';
            alertify.success(`"${datos.materia}" inscrita correctamente (${this.materiasInscritas.length}/${limite})`);
        },
        getId(){
            return new Date().getTime();
        },
        limpiarFormulario(){
            this.accion = 'nuevo';
            this.idInscripcion = 0;
            this.inscripcion.idMatricula = '';
            this.inscripcion.alumno  = '';
            this.inscripcion.idMateria = '';
            this.inscripcion.materia = '';
            this.inscripcion.fecha   = '';
            this.inscripcion.ciclo   = '';
            this.materiasInscritas   = [];
            this.cantidadMaterias    = 5;
            this.cargarDatosRelacionales();
        },
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-pencil-square me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Registro de Inscripciones</h5>
                <span v-if="accion=='modificar'" class="badge bg-warning text-dark ms-2">Editando</span>
            </div>

            <!-- Alertas de prerrequisitos faltantes -->
            <div v-if="sinMatriculas" class="alert alert-warning d-flex align-items-center py-2 mb-3" style="max-width:560px;">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div class="small">
                    <strong>No hay matrículas activas.</strong>
                    Ve al módulo <strong>Matrícula</strong> y crea una primero.
                </div>
            </div>
            <div v-if="sinMaterias" class="alert alert-warning d-flex align-items-center py-2 mb-3" style="max-width:560px;">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div class="small">
                    <strong>No hay materias registradas.</strong>
                    Ve al módulo <strong>Materias</strong> y regístralas primero.
                </div>
            </div>

            <form id="frmInscripcion" @submit.prevent="guardarInscripcion" @reset.prevent="limpiarFormulario">
                <div class="card border-0 shadow-sm" style="max-width: 560px;">
                    <div class="card-body p-4">

                        <!-- Cantidad de materias a inscribir -->
                        <div class="mb-3 p-3 rounded" style="background:#f0f4f8; border:1px solid #d0dce8;">
                            <label class="form-label text-muted small fw-semibold text-uppercase mb-2">
                                <i class="bi bi-list-ol me-1"></i>¿Cuántas materias quieres inscribir este ciclo?
                            </label>
                            <div class="d-flex gap-2 flex-wrap">
                                <button v-for="n in [1,2,3,4,5]" :key="n"
                                    type="button"
                                    @click="cantidadMaterias = n"
                                    class="btn btn-sm px-3 fw-semibold"
                                    :class="cantidadMaterias == n ? 'text-white' : 'btn-outline-secondary'"
                                    :style="cantidadMaterias == n ? 'background-color:#1a3a5c; border-color:#1a3a5c;' : ''">
                                    {{ n }}
                                </button>
                            </div>
                            <!-- Barra de progreso -->
                            <div v-if="inscripcion.idMatricula" class="mt-2">
                                <div class="d-flex justify-content-between small text-muted mb-1">
                                    <span>Materias inscritas</span>
                                    <span class="fw-semibold"
                                        :class="materiasInscritas.length >= cantidadMaterias ? 'text-danger' : 'text-success'">
                                        {{ materiasInscritas.length }} / {{ cantidadMaterias }}
                                    </span>
                                </div>
                                <div class="progress" style="height:6px;">
                                    <div class="progress-bar"
                                        :class="materiasInscritas.length >= cantidadMaterias ? 'bg-danger' : 'bg-success'"
                                        :style="'width:' + Math.min((materiasInscritas.length / cantidadMaterias) * 100, 100) + '%'">
                                    </div>
                                </div>
                                <!-- Lista rápida de materias ya inscritas -->
                                <div v-if="materiasInscritas.length > 0" class="mt-2">
                                    <span v-for="mi in materiasInscritas" :key="mi.idInscripcion"
                                        class="badge me-1 mb-1 fw-normal"
                                        style="background-color:#1a3a5c; font-size:0.72rem;">
                                        <i class="bi bi-check me-1"></i>{{ mi.materia }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Selector de Matrícula -->
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-semibold text-uppercase">
                                Matrícula
                                <span v-if="sinMatriculas" class="text-danger ms-1 small fw-normal">(ninguna activa)</span>
                            </label>
                            <select v-model="inscripcion.idMatricula" @change="onMatriculaChange"
                                class="form-select form-select-sm"
                                :class="sinMatriculas ? 'is-invalid' : ''"
                                required :disabled="sinMatriculas">
                                <option value="" disabled>Seleccione una matrícula activa...</option>
                                <option v-for="m in matriculasActivas" :key="m.idMatricula" :value="m.idMatricula">
                                    {{ m.codigo }} — {{ m.nombreAlumno }} ({{ m.carrera }})
                                </option>
                            </select>
                        </div>

                        <!-- Alumno (solo lectura) -->
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-semibold text-uppercase">Alumno</label>
                            <input :value="inscripcion.alumno" type="text" class="form-control form-control-sm bg-light"
                                placeholder="Se rellena al seleccionar la matrícula" readonly>
                        </div>

                        <!-- Selector de Materia -->
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-semibold text-uppercase">
                                Materia
                                <span v-if="sinMaterias" class="text-danger ms-1 small fw-normal">(ninguna registrada)</span>
                            </label>
                            <select v-model="inscripcion.idMateria" @change="onMateriaChange"
                                class="form-select form-select-sm"
                                :class="sinMaterias ? 'is-invalid' : ''"
                                required :disabled="sinMaterias || materiasInscritas.length >= cantidadMaterias">
                                <option value="" disabled>Seleccione una materia...</option>
                                <option v-for="m in materiasDisponibles" :key="m.idMateria" :value="m.idMateria"
                                    :disabled="materiasInscritas.some(i => String(i.idMateria) === String(m.idMateria))">
                                    {{ m.codigo }} — {{ m.nombre }} ({{ m.uv }} UV)
                                    <template v-if="materiasInscritas.some(i => String(i.idMateria) === String(m.idMateria))"> ✓ ya inscrita</template>
                                </option>
                            </select>
                            <div v-if="materiasInscritas.length >= cantidadMaterias && inscripcion.idMatricula"
                                class="form-text text-danger">
                                <i class="bi bi-lock-fill me-1"></i>Límite alcanzado. Ya inscribiste {{ cantidadMaterias }} materia(s).
                            </div>
                        </div>

                        <div class="row mb-1">
                            <div class="col-6">
                                <label class="form-label text-muted small fw-semibold text-uppercase">Fecha</label>
                                <input required v-model="inscripcion.fecha" type="date" class="form-control form-control-sm">
                            </div>
                            <div class="col-6">
                                <label class="form-label text-muted small fw-semibold text-uppercase">Ciclo</label>
                                <input :value="inscripcion.ciclo" type="text" class="form-control form-control-sm bg-light"
                                    placeholder="Se toma de la matrícula" readonly>
                            </div>
                        </div>

                    </div>
                    <div class="card-footer bg-white border-top d-flex gap-2 px-4 py-3">
                        <button type="submit" class="btn btn-sm px-3" style="background-color:#1a3a5c; color:white;"
                            :disabled="sinMatriculas || sinMaterias || materiasInscritas.length >= cantidadMaterias">
                            <i class="bi bi-save me-1"></i>Inscribir
                        </button>
                        <button type="reset" class="btn btn-sm btn-outline-secondary px-3">
                            <i class="bi bi-arrow-counterclockwise me-1"></i>Nuevo
                        </button>
                        <button type="button" @click="buscarInscripcion" class="btn btn-sm btn-outline-success px-3 ms-auto">
                            <i class="bi bi-search me-1"></i>Listado
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `
};
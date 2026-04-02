const inscripciones = {
    props: ['forms'],
    data() {
        return {
            inscripcion: {
                idInscripcion: 0,
                idAlumno: 0,
                idMateria: 0,
                ciclo: "",
                fecha: ""
            },
            accion: 'nuevo',
            idInscripcion: 0,
            alumnos: [],
            materias: []
        }
    },
    methods: {
        buscarInscripcion() {
            this.forms.busqueda_inscripciones.mostrar = !this.forms.busqueda_inscripciones.mostrar;
            this.$emit('buscar');
        },
        modificarInscripcion(inscripcion) {
            this.accion = 'modificar';
            this.idInscripcion = inscripcion.idInscripcion;
            this.inscripcion.idAlumno = inscripcion.idAlumno;
            this.inscripcion.idMateria = inscripcion.idMateria;
            this.inscripcion.ciclo = inscripcion.ciclo;
            this.inscripcion.fecha = inscripcion.fecha;
        },
        async guardarInscripcion() {
            let datos = {
                idInscripcion: this.accion == 'modificar' ? this.idInscripcion : this.getId(),
                idAlumno: this.inscripcion.idAlumno,
                idMateria: this.inscripcion.idMateria,
                ciclo: this.inscripcion.ciclo,
                fecha: this.inscripcion.fecha
            };
            try {
                if (this.accion === 'nuevo') {
                    await Database.query(`INSERT INTO inscripciones (idInscripcion, idAlumno, idMateria, ciclo, fecha) VALUES (?, ?, ?, ?, ?)`, 
                        [datos.idInscripcion, datos.idAlumno, datos.idMateria, datos.ciclo, datos.fecha]);
                } else {
                    await Database.query(`UPDATE inscripciones SET idAlumno=?, idMateria=?, ciclo=?, fecha=? WHERE idInscripcion=?`, 
                        [datos.idAlumno, datos.idMateria, datos.ciclo, datos.fecha, datos.idInscripcion]);
                }
            } catch (error) {
                alertify.error(`Error BD: ${error.message}`);
                return;
            }
            fetch(`private/modulos/inscripciones/inscripcion.php?accion=${this.accion}&inscripciones=${JSON.stringify(datos)}`)
                .then(response=>response.json())
                .then(data=>{
                    if(data!=true) alertify.error(`Error al sincronizar con el servidor: ${data}`);
                });
            this.limpiarFormulario();
            alertify.success(`Inscripción guardada correctamente`);
            this.$emit('buscar');
        },
        getId() {
            return new Date().getTime();
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idInscripcion = 0;
            this.inscripcion.idAlumno = 0;
            this.inscripcion.idMateria = 0;
            this.inscripcion.ciclo = '';
            this.inscripcion.fecha = '';
        },
        async cargarDatos() {
            try {
                this.alumnos = await Database.query(`SELECT idAlumno, nombre FROM alumnos ORDER BY nombre`);
                this.materias = await Database.query(`SELECT idMateria, nombre FROM materias ORDER BY nombre`);
            } catch (e) {
                console.error("Error cargando catálogos de inscripción:", e);
            }
        }
    },
    mounted() {
        this.cargarDatos();
    },
    template: `
        <div class="row mt-4">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
                <form id="frmInscripciones" @submit.prevent="guardarInscripcion" @reset.prevent="limpiarFormulario">
                    <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                        <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                            <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-journal-text me-2"></i> REGISTRO DE INSCRIPCIONES</h5>
                        </div>
                        <div class="card-body p-3 p-md-4">
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">ALUMNO:</label>
                                <div class="col-sm-9">
                                    <select title="Seleccione un alumno" required v-model="inscripcion.idAlumno" class="form-select bg-body-tertiary border-0 shadow-sm text-body">
                                        <option value="0" disabled>Seleccione un alumno...</option>
                                        <option v-for="alumno in alumnos" :key="alumno.idAlumno" :value="alumno.idAlumno">
                                            {{ alumno.nombre }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">MATERIA:</label>
                                <div class="col-sm-9">
                                    <select title="Seleccione una materia" required v-model="inscripcion.idMateria" class="form-select bg-body-tertiary border-0 shadow-sm text-body">
                                        <option value="0" disabled>Seleccione una materia...</option>
                                        <option v-for="materia in materias" :key="materia.idMateria" :value="materia.idMateria">
                                            {{ materia.nombre }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">CICLO:</label>
                                <div class="col-sm-9 col-md-5">
                                    <input placeholder="Ciclo (ej: 01-2026)" required v-model="inscripcion.ciclo" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-4 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">FECHA:</label>
                                <div class="col-sm-9 col-md-5">
                                    <input required v-model="inscripcion.fecha" type="date" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 pb-3 text-center">
                            <button type="submit" id="btnGuardarInscripcion" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                                <i class="bi bi-floppy me-1"></i> GUARDAR
                            </button>
                            <button type="reset" id="btnCancelarInscripcion" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                                <i class="bi bi-x-circle me-1"></i> NUEVO
                            </button>
                            <button type="button" @click="buscarInscripcion" id="btnBuscarInscripcion" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                                <i class="bi bi-search me-1"></i> BUSCAR
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};
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
            db.inscripciones.put(datos);
            this.limpiarFormulario();
            alertify.success(`Inscripción guardada correctamente`);
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
            this.alumnos = await db.alumnos.toArray();
            this.materias = await db.materias.toArray();
        }
    },
    mounted() {
        this.cargarDatos();
    },
    template: `
        <div class="row">
            <div class="col-6">
                <form id="frmInscripciones" @submit.prevent="guardarInscripcion" @reset.prevent="limpiarFormulario">
                    <div class="card text-bg-dark mb-3" style="max-width: 36rem;">
                        <div class="card-header">REGISTRO DE INSCRIPCIONES</div>
                        <div class="card-body">
                            <div class="row p-1">
                                <div class="col-3">
                                    ALUMNO:
                                </div>
                                <div class="col-9">
                                    <select required v-model="inscripcion.idAlumno" class="form-select">
                                        <option value="0">Seleccione un alumno</option>
                                        <option v-for="alumno in alumnos" :value="alumno.idAlumno">{{ alumno.nombre }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col-3">
                                    MATERIA:
                                </div>
                                <div class="col-9">
                                    <select required v-model="inscripcion.idMateria" class="form-select">
                                        <option value="0">Seleccione una materia</option>
                                        <option v-for="materia in materias" :value="materia.idMateria">{{ materia.nombre }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col-3">
                                    CICLO:
                                </div>
                                <div class="col-6">
                                    <input placeholder="Ciclo (ej: 01-2026)" required v-model="inscripcion.ciclo" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col-3">
                                    FECHA:
                                </div>
                                <div class="col-6">
                                    <input required v-model="inscripcion.fecha" type="date" class="form-control">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="row">
                                <div class="col text-center">
                                    <button type="submit" id="btnGuardarInscripcion" class="btn btn-primary">GUARDAR</button>
                                    <button type="reset" id="btnCancelarInscripcion" class="btn btn-warning">NUEVO</button>
                                    <button type="button" @click="buscarInscripcion" id="btnBuscarInscripcion" class="btn btn-success">BUSCAR</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};

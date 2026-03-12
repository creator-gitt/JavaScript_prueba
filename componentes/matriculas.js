const matriculas = {
    props: ['forms'],
    data() {
        return {
            matricula: {
                idMatricula: 0,
                idAlumno: 0,
                ciclo: "",
                fecha: "",
                pago: "No"
            },
            accion: 'nuevo',
            idMatricula: 0,
            alumnos: []
        }
    },
    methods: {
        buscarMatricula() {
            this.forms.busqueda_matriculas.mostrar = !this.forms.busqueda_matriculas.mostrar;
            this.$emit('buscar');
        },
        modificarMatricula(matricula) {
            this.accion = 'modificar';
            this.idMatricula = matricula.idMatricula;
            this.matricula.idAlumno = matricula.idAlumno;
            this.matricula.ciclo = matricula.ciclo;
            this.matricula.fecha = matricula.fecha;
            this.matricula.pago = matricula.pago;
        },
        async guardarMatricula() {
            let datos = {
                idMatricula: this.accion == 'modificar' ? this.idMatricula : this.getId(),
                idAlumno: this.matricula.idAlumno,
                ciclo: this.matricula.ciclo,
                fecha: this.matricula.fecha,
                pago: this.matricula.pago
            };
            db.matriculas.put(datos);
            this.limpiarFormulario();
            alertify.success(`Matrícula guardada correctamente`);
        },
        getId() {
            return new Date().getTime();
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idMatricula = 0;
            this.matricula.idAlumno = 0;
            this.matricula.ciclo = '';
            this.matricula.fecha = '';
            this.matricula.pago = 'No';
        },
        async obtenerAlumnos() {
            this.alumnos = await db.alumnos.toArray();
        }
    },
    mounted() {
        this.obtenerAlumnos();
    },
    template: `
        <div class="row">
            <div class="col-6">
                <form id="frmMatriculas" @submit.prevent="guardarMatricula" @reset.prevent="limpiarFormulario">
                    <div class="card text-bg-dark mb-3" style="max-width: 36rem;">
                        <div class="card-header">REGISTRO DE MATRICULAS</div>
                        <div class="card-body">
                            <div class="row p-1">
                                <div class="col-3">
                                    ALUMNO:
                                </div>
                                <div class="col-9">
                                    <select required v-model="matricula.idAlumno" class="form-select">
                                        <option value="0">Seleccione un alumno</option>
                                        <option v-for="alumno in alumnos" :value="alumno.idAlumno">{{ alumno.nombre }}</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col-3">
                                    CICLO:
                                </div>
                                <div class="col-6">
                                    <input placeholder="Ciclo (ej: 01-2026)" required v-model="matricula.ciclo" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col-3">
                                    FECHA:
                                </div>
                                <div class="col-6">
                                    <input required v-model="matricula.fecha" type="date" class="form-control">
                                </div>
                            </div>
                            <div class="row p-1">
                                <div class="col-3">
                                    PAGADO:
                                </div>
                                <div class="col-3">
                                    <select required v-model="matricula.pago" class="form-select">
                                        <option value="Si">Si</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="row">
                                <div class="col text-center">
                                    <button type="submit" id="btnGuardarMatricula" class="btn btn-primary">GUARDAR</button>
                                    <button type="reset" id="btnCancelarMatricula" class="btn btn-warning">NUEVO</button>
                                    <button type="button" @click="buscarMatricula" id="btnBuscarMatricula" class="btn btn-success">BUSCAR</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};

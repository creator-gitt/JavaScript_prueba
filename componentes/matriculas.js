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
            try {
                if (this.accion === 'nuevo') {
                    await Database.query(`INSERT INTO matriculas (idMatricula, idAlumno, ciclo, fecha, pago) VALUES (?, ?, ?, ?, ?)`, 
                        [datos.idMatricula, datos.idAlumno, datos.ciclo, datos.fecha, datos.pago]);
                } else {
                    await Database.query(`UPDATE matriculas SET idAlumno=?, ciclo=?, fecha=?, pago=? WHERE idMatricula=?`, 
                        [datos.idAlumno, datos.ciclo, datos.fecha, datos.pago, datos.idMatricula]);
                }
            } catch (error) {
                alertify.error(`Error BD: ${error.message}`);
                return;
            }
            fetch(`private/modulos/matriculas/matricula.php?accion=${this.accion}&matriculas=${JSON.stringify(datos)}`)
                .then(response=>response.json())
                .then(data=>{
                    if(data!=true) alertify.error(`Error al sincronizar con el servidor: ${data}`);
                });
            this.limpiarFormulario();
            alertify.success(`Matrícula guardada correctamente`);
            this.$emit('buscar');
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
            try {
                this.alumnos = await Database.query(`SELECT idAlumno, nombre FROM alumnos ORDER BY nombre`);
            } catch(e) {
                console.error("Error cargando alumnos:", e);
            }
        }
    },
    mounted() {
        this.obtenerAlumnos();
    },
    template: `
        <div class="row mt-4">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
                <form id="frmMatriculas" @submit.prevent="guardarMatricula" @reset.prevent="limpiarFormulario">
                    <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                        <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                            <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-person-lines-fill me-2"></i> REGISTRO DE MATRÍCULAS</h5>
                        </div>
                        <div class="card-body p-3 p-md-4">
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">ALUMNO:</label>
                                <div class="col-sm-9">
                                    <select title="Seleccione un alumno" required v-model="matricula.idAlumno" class="form-select bg-body-tertiary border-0 shadow-sm text-body">
                                        <option value="0" disabled>Seleccione un alumno...</option>
                                        <option v-for="alumno in alumnos" :key="alumno.idAlumno" :value="alumno.idAlumno">
                                            {{ alumno.nombre }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">CICLO:</label>
                                <div class="col-sm-9 col-md-5">
                                    <input placeholder="Ciclo (ej: 01-2026)" required v-model="matricula.ciclo" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">FECHA:</label>
                                <div class="col-sm-9 col-md-5">
                                    <input required v-model="matricula.fecha" type="date" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-4 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">PAGADO:</label>
                                <div class="col-sm-9 col-md-4">
                                    <select required v-model="matricula.pago" class="form-select bg-body-tertiary border-0 shadow-sm text-body">
                                        <option value="Si">Sí</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 pb-3 text-center">
                            <button type="submit" id="btnGuardarMatricula" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                                <i class="bi bi-floppy me-1"></i> GUARDAR
                            </button>
                            <button type="reset" id="btnCancelarMatricula" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                                <i class="bi bi-x-circle me-1"></i> NUEVO
                            </button>
                            <button type="button" @click="buscarMatricula" id="btnBuscarMatricula" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                                <i class="bi bi-search me-1"></i> BUSCAR
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};
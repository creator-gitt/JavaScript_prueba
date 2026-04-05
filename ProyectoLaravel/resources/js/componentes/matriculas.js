export default {
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
            const method = this.accion === 'nuevo' ? 'POST' : 'PUT';
            const url = this.accion === 'nuevo' ? '/api/matriculas' : '/api/matriculas/' + this.idMatricula;
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
                .then(response=>response.json())
                .then(data=>{
                    if(data!=true) alertify.error(`Error al sincronizar con el servidor: ${data}`);
                });
            
            // Actualización Instantánea Optimista
            const refBusqueda = this.$parent.$refs.busqueda_matriculas;
            if (refBusqueda) {
                // Resolver el nombre del alumno para la tabla
                const alumnoSelect = this.alumnos.find(a => a.idAlumno === datos.idAlumno);
                const objParaTabla = {
                    ...datos,
                    nombreAlumno: alumnoSelect ? alumnoSelect.nombre : 'Desconocido'
                };
                
                if (this.accion === 'nuevo') {
                    refBusqueda.matriculas_cache.unshift(objParaTabla); 
                } else {
                    const index = refBusqueda.matriculas_cache.findIndex(x => x.idMatricula === this.idMatricula);
                    if (index !== -1) {
                        refBusqueda.matriculas_cache[index] = objParaTabla;
                    }
                }
                refBusqueda.filtrarMatriculas();
            }
            
            this.limpiarFormulario();
            alertify.success(`Matrícula guardada correctamente`);
            this.buscarMatricula(); // Cambiar automáticamente a la vista de búsqueda
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
            fetch(`/api/alumnos`)
                .then(response=>response.json())
                .then(data=>{
                    this.alumnos = data;
                });
        }
    },
    mounted() {
        this.obtenerAlumnos();
    },
    template: `
        <div class="row w-100 m-0 mb-4">
            <div class="col-12 col-xl-11 mx-auto">
                <form id="frmMatriculas" @submit.prevent="guardarMatricula" @reset.prevent="limpiarFormulario" class="bg-white rounded-4 shadow-sm border border-light p-4 p-md-5">
                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                            <i class="bi bi-person-lines-fill fs-4"></i>
                        </div>
                        <div>
                            <h4 class="mb-1 fw-bold text-dark">Registro de Matrículas</h4>
                            <p class="mb-0 text-muted small">Inscribe estudiantes en sus respectivos ciclos académicos</p>
                        </div>
                    </div>

                    <div class="row g-4 mt-1">
                        <div class="col-md-8">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Estudiante</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-person-badge"></i></span>
                                <select title="Seleccione un alumno" required v-model="matricula.idAlumno" class="form-select border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                                    <option value="0" disabled>Seleccione un alumno...</option>
                                    <option v-for="alumno in alumnos" :key="alumno.idAlumno" :value="alumno.idAlumno">
                                        {{ alumno.nombre }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Ciclo</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-calendar3"></i></span>
                                <input placeholder="Ej. 01-2026" required v-model="matricula.ciclo" type="text" class="form-control border-start-0 ps-0 text-dark fs-6 font-monospace" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Fecha de Matrícula</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-calendar-date"></i></span>
                                <input required v-model="matricula.fecha" type="date" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Estado de Pago</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-cash-coin"></i></span>
                                <select required v-model="matricula.pago" class="form-select border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                                    <option value="Si">Completado</option>
                                    <option value="No">Pendiente</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                        <button type="button" @click="buscarMatricula" class="btn btn-light text-muted fw-semibold px-4 py-2 border shadow-sm rounded-pill transition-all hover-translate">
                            <i class="bi bi-search me-2"></i> Buscar Matrículas
                        </button>
                        <button type="reset" class="btn btn-light text-muted fw-semibold px-4 py-2 border shadow-sm rounded-pill transition-all hover-translate">
                            <i class="bi bi-eraser me-2"></i> Limpiar Campos
                        </button>
                        <button type="submit" class="btn btn-primary fw-semibold px-5 py-2 shadow rounded-pill transition-all hover-translate">
                            <i class="bi bi-check2-circle me-2"></i> Guardar Registro
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
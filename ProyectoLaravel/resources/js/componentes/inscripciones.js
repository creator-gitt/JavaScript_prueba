export default {
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
            const method = this.accion === 'nuevo' ? 'POST' : 'PUT';
            const url = this.accion === 'nuevo' ? '/api/inscripciones' : '/api/inscripciones/' + this.idInscripcion;
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
            const refBusqueda = this.$parent.$refs.busqueda_inscripciones;
            if (refBusqueda) {
                const alumnoSelect = this.alumnos.find(a => a.idAlumno === datos.idAlumno);
                const materiaSelect = this.materias.find(m => m.idMateria === datos.idMateria);
                const objParaTabla = {
                    ...datos,
                    nombreAlumno: alumnoSelect ? alumnoSelect.nombre : 'Desconocido',
                    nombreMateria: materiaSelect ? materiaSelect.nombre : 'Desconocida'
                };
                
                if (this.accion === 'nuevo') {
                    refBusqueda.inscripciones_cache.unshift(objParaTabla); 
                } else {
                    const index = refBusqueda.inscripciones_cache.findIndex(x => x.idInscripcion === this.idInscripcion);
                    if (index !== -1) {
                        refBusqueda.inscripciones_cache[index] = objParaTabla;
                    }
                }
                refBusqueda.filtrarInscripciones();
            }
            
            this.limpiarFormulario();
            alertify.success(`Inscripción guardada correctamente`);
            this.buscarInscripcion(); // Cambiar automáticamente a la vista de búsqueda
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
            fetch(`/api/alumnos`)
                .then(response=>response.json())
                .then(data=>{
                    this.alumnos = data;
                });
            fetch(`/api/materias`)
                .then(response=>response.json())
                .then(data=>{
                    this.materias = data;
                });
        }
    },
    mounted() {
        this.cargarDatos();
    },
    template: `
        <div class="row w-100 m-0 mb-4">
            <div class="col-12 col-xl-11 mx-auto">
                <form id="frmInscripciones" @submit.prevent="guardarInscripcion" @reset.prevent="limpiarFormulario" class="bg-white rounded-4 shadow-sm border border-light p-4 p-md-5">
                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                            <i class="bi bi-journal-text fs-4"></i>
                        </div>
                        <div>
                            <h4 class="mb-1 fw-bold text-dark">Registro de Inscripciones</h4>
                            <p class="mb-0 text-muted small">Asigna materias a los estudiantes para el ciclo actual</p>
                        </div>
                    </div>

                    <div class="row g-4 mt-1">
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Estudiante</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-person-badge"></i></span>
                                <select title="Seleccione un alumno" required v-model="inscripcion.idAlumno" class="form-select border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                                    <option value="0" disabled>Seleccione un alumno...</option>
                                    <option v-for="alumno in alumnos" :key="alumno.idAlumno" :value="alumno.idAlumno">
                                        {{ alumno.nombre }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Asignatura</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-book"></i></span>
                                <select title="Seleccione una materia" required v-model="inscripcion.idMateria" class="form-select border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                                    <option value="0" disabled>Seleccione una materia...</option>
                                    <option v-for="materia in materias" :key="materia.idMateria" :value="materia.idMateria">
                                        {{ materia.nombre }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Ciclo</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-calendar3"></i></span>
                                <input placeholder="Ej. 01-2026" required v-model="inscripcion.ciclo" type="text" class="form-control border-start-0 ps-0 text-dark fs-6 font-monospace" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Fecha de Inscripción</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-calendar-date"></i></span>
                                <input required v-model="inscripcion.fecha" type="date" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                        <button type="button" @click="buscarInscripcion" class="btn btn-light text-muted fw-semibold px-4 py-2 border shadow-sm rounded-pill transition-all hover-translate">
                            <i class="bi bi-search me-2"></i> Explorar Registros
                        </button>
                        <button type="reset" class="btn btn-light text-muted fw-semibold px-4 py-2 border shadow-sm rounded-pill transition-all hover-translate">
                            <i class="bi bi-eraser me-2"></i> Descartar
                        </button>
                        <button type="submit" class="btn btn-primary fw-semibold px-5 py-2 shadow rounded-pill transition-all hover-translate">
                            <i class="bi bi-check2-circle me-2"></i> Confirmar & Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
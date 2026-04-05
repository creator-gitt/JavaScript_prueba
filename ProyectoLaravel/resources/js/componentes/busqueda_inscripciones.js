export default {
    data() {
        return {
            buscar: '',
            inscripciones_cache: [],
            inscripciones: []
        }
    },
    methods: {
        modificarInscripcion(inscripcion) {
            this.$emit('modificar', inscripcion);
        },
        async obtenerInscripciones() {
            fetch(`/api/inscripciones`)
                .then(response => response.json())
                .then(data => {
                    this.inscripciones_cache = data;
                    this.filtrarInscripciones();
                });
        },
        filtrarInscripciones() {
            const normalizar = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const terminos = normalizar(this.buscar).split(' ').filter(t => t.length > 0);
            
            this.inscripciones = this.inscripciones_cache.filter(i => {
                const dataString = normalizar(`${i.nombreAlumno} ${i.nombreMateria} ${i.ciclo} ${i.fecha}`);
                return terminos.every(t => dataString.includes(t));
            });
        },
        async eliminarInscripcion(inscripcion, e) {
            e.stopPropagation();
            alertify.confirm('Eliminar Inscripcion', `¿Está seguro de eliminar esta inscripción?`, async () => {
                // Borrado Optimista (Inmediato)
                const index = this.inscripciones_cache.findIndex(x => x.idInscripcion === inscripcion.idInscripcion);
                if (index !== -1) {
                    this.inscripciones_cache.splice(index, 1);
                    this.filtrarInscripciones();
                }
                
                // Transacción en segundo plano
                fetch(`/api/inscripciones/${inscripcion.idInscripcion}`, { method: 'DELETE' })
                    .then(response => response.json())
                    .then(data => {
                        if(data!=true) {
                            alertify.error(`Error al sincronizar con el servidor: ${data}`);
                            this.obtenerInscripciones();
                        }
                    });
                alertify.success(`Inscripción eliminada correctamente`);
            }, () => { });
        },
        mostrarFormulario(ventana){
            this.$emit('regresar', ventana);
        }
    },
    mounted() {
        this.obtenerInscripciones();
    },
    template: `
        <div class="row w-100 m-0">
            <div class="col-12 col-xl-11 mx-auto">
                <div class="bg-white rounded-4 shadow-sm border border-light p-4 p-md-5">
                    <div class="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                        <div class="d-flex align-items-center">
                            <div class="bg-success bg-opacity-10 text-success rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                                <i class="bi bi-search fs-4"></i>
                            </div>
                            <div>
                                <h4 class="mb-1 fw-bold text-dark">Archivo de Inscripciones</h4>
                                <p class="mb-0 text-muted small">Consulta interrelaciones entre estudiantes y materias</p>
                            </div>
                        </div>
                        <button type="button" @click="mostrarFormulario('inscripciones')" class="btn btn-light text-muted fw-semibold rounded-pill px-4 shadow-sm border transition-all">
                            <i class="bi bi-arrow-left me-2"></i> Ir al Registro
                        </button>
                    </div>

                    <div class="mb-4">
                        <div class="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
                            <span class="input-group-text bg-white border-end-0 pe-1 text-muted ps-4"><i class="bi bi-search"></i></span>
                            <input autocomplete="off" type="search" @keyup="filtrarInscripciones()" v-model="buscar" placeholder="Busca por alumno, materia o ciclo académico..." class="form-control border-start-0 ps-2 bg-white fs-6" style="outline: none; box-shadow: none;">
                        </div>
                    </div>
                    
                    <div class="table-responsive rounded-3 border border-light shadow-sm">
                        <table class="table table-hover align-middle mb-0 bg-white">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Estudiante</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Materias Cursadas</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Ciclo</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Fecha de Alta</th>
                                    <th class="py-3 px-4 text-end text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="inscripcion in inscripciones" :key="inscripcion.idInscripcion" @click="modificarInscripcion(inscripcion)" class="cursor-pointer transition-all">
                                    <td class="py-3 px-4">
                                        <div class="d-flex align-items-center">
                                            <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 36px; height: 36px;">
                                                <i class="bi bi-person"></i>
                                            </div>
                                            <span class="fw-semibold text-dark">{{ inscripcion.nombreAlumno }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span class="text-dark fw-medium">{{ inscripcion.nombreMateria }}</span>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-1 rounded font-monospace">{{ inscripcion.ciclo }}</span>
                                    </td>
                                    <td class="py-3 px-4 text-muted small"><i class="bi bi-calendar-event me-2"></i>{{ inscripcion.fecha }}</td>
                                    <td class="py-3 px-4 text-end">
                                        <div class="d-flex justify-content-end gap-2">
                                            <button @click.stop="modificarInscripcion(inscripcion)" class="btn btn-light btn-sm text-primary p-2 border-0 shadow-none transition-all rounded-circle" title="Actualizar">
                                                <i class="bi bi-pencil-square fs-5"></i>
                                            </button>
                                            <button @click.stop="eliminarInscripcion(inscripcion, $event)" class="btn btn-light btn-sm text-danger p-2 border-0 shadow-none transition-all rounded-circle" title="Retirar">
                                                <i class="bi bi-trash fs-5"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="inscripciones.length == 0">
                                    <td colspan="5" class="text-center py-5">
                                        <div class="d-flex flex-column align-items-center text-muted">
                                            <i class="bi bi-inbox fs-1 mb-3 opacity-50"></i>
                                            <p class="mb-0 fw-medium">No hay registros de inscripciones actualmente.</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `
};
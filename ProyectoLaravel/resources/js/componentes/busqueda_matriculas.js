export default {
    data() {
        return {
            buscar: '',
            matriculas_cache: [],
            matriculas: [],
            alumnos: []
        }
    },
    methods: {
        modificarMatricula(matricula) {
            this.$emit('modificar', matricula);
        },
        async obtenerMatriculas() {
            fetch(`/api/matriculas`)
                .then(response => response.json())
                .then(data => {
                    this.matriculas_cache = data;
                    this.filtrarMatriculas();
                });
        },
        filtrarMatriculas() {
            const normalizar = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const terminos = normalizar(this.buscar).split(' ').filter(t => t.length > 0);
            
            this.matriculas = this.matriculas_cache.filter(m => {
                const dataString = normalizar(`${m.nombreAlumno} ${m.ciclo} ${m.fecha} ${m.pago}`);
                return terminos.every(t => dataString.includes(t));
            });
        },
        async eliminarMatricula(matricula, e) {
            e.stopPropagation();
            alertify.confirm('Eliminar Matricula', `¿Está seguro de eliminar esta matrícula?`, async () => {
                // Borrado Optimista (Inmediato)
                const index = this.matriculas_cache.findIndex(x => x.idMatricula === matricula.idMatricula);
                if (index !== -1) {
                    this.matriculas_cache.splice(index, 1);
                    this.filtrarMatriculas();
                }
                
                // Transacción en segundo plano
                fetch(`/api/matriculas/${matricula.idMatricula}`, { method: 'DELETE' })
                    .then(response => response.json())
                    .then(data => {
                        if(data!=true) {
                            alertify.error(`Error al sincronizar con el servidor: ${data}`);
                            this.obtenerMatriculas();
                        }
                    });
                alertify.success(`Matrícula eliminada correctamente`);
            }, () => { });
        },
        mostrarFormulario(ventana){
            this.$emit('regresar', ventana);
        }
    },
    mounted() {
        this.obtenerMatriculas();
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
                                <h4 class="mb-1 fw-bold text-dark">Archivo de Matrículas</h4>
                                <p class="mb-0 text-muted small">Consulta rápida de inscripciones por ciclo</p>
                            </div>
                        </div>
                        <button type="button" @click="mostrarFormulario('matriculas')" class="btn btn-light text-muted fw-semibold rounded-pill px-4 shadow-sm border transition-all">
                            <i class="bi bi-arrow-left me-2"></i> Nuevo Registro
                        </button>
                    </div>

                    <div class="mb-4">
                        <div class="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
                            <span class="input-group-text bg-white border-end-0 pe-1 text-muted ps-4"><i class="bi bi-search"></i></span>
                            <input autocomplete="off" type="search" @keyup="filtrarMatriculas()" v-model="buscar" placeholder="Busca por nombre del alumno o ciclo..." class="form-control border-start-0 ps-2 bg-white fs-6" style="outline: none; box-shadow: none;">
                        </div>
                    </div>
                    
                    <div class="table-responsive rounded-3 border border-light shadow-sm">
                        <table class="table table-hover align-middle mb-0 bg-white">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Estudiante</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Ciclo</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Fecha de Registro</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Estado Financiero</th>
                                    <th class="py-3 px-4 text-end text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="matricula in matriculas" :key="matricula.idMatricula" @click="modificarMatricula(matricula)" class="cursor-pointer transition-all">
                                    <td class="py-3 px-4">
                                        <div class="d-flex align-items-center">
                                            <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 36px; height: 36px;">
                                                <i class="bi bi-person-fill"></i>
                                            </div>
                                            <span class="fw-semibold text-dark">{{ matricula.nombreAlumno }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-1 rounded font-monospace">{{ matricula.ciclo }}</span>
                                    </td>
                                    <td class="py-3 px-4 text-muted small"><i class="bi bi-calendar-event me-2"></i>{{ matricula.fecha }}</td>
                                    <td class="py-3 px-4">
                                        <span v-if="matricula.pago === 'Si'" class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded d-inline-flex align-items-center gap-1">
                                            <i class="bi bi-check-circle-fill" style="font-size: 0.7rem;"></i> Solvente
                                        </span>
                                        <span v-else class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded d-inline-flex align-items-center gap-1">
                                            <i class="bi bi-exclamation-circle-fill" style="font-size: 0.7rem;"></i> Pendiente
                                        </span>
                                    </td>
                                    <td class="py-3 px-4 text-end">
                                        <div class="d-flex justify-content-end gap-2">
                                            <button @click.stop="modificarMatricula(matricula)" class="btn btn-light btn-sm text-primary p-2 border-0 shadow-none transition-all rounded-circle" title="Modificar">
                                                <i class="bi bi-pencil-square fs-5"></i>
                                            </button>
                                            <button @click.stop="eliminarMatricula(matricula, $event)" class="btn btn-light btn-sm text-danger p-2 border-0 shadow-none transition-all rounded-circle" title="Anular">
                                                <i class="bi bi-trash fs-5"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="matriculas.length == 0">
                                    <td colspan="5" class="text-center py-5">
                                        <div class="d-flex flex-column align-items-center text-muted">
                                            <i class="bi bi-inbox fs-1 mb-3 opacity-50"></i>
                                            <p class="mb-0 fw-medium">No hay registros de matrículas almacenadas.</p>
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
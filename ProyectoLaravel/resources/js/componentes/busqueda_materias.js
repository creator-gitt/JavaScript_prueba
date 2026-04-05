export default {
    data(){
        return{
            buscar:'',
            materias_cache: [],
            materias:[]
        }
    },
    methods:{
        modificarMateria(materia){
            this.$emit('modificar', materia);
        },
        async obtenerMaterias(){
            fetch(`/api/materias`)
                .then(response=>response.json())
                .then(data=>{
                    this.materias_cache = data;
                    this.filtrarMaterias();
                });
        },
        filtrarMaterias() {
            const normalizar = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const terminos = normalizar(this.buscar).split(' ').filter(t => t.length > 0);
            
            this.materias = this.materias_cache.filter(m => {
                const dataString = normalizar(`${m.codigo} ${m.nombre} ${m.uv}`);
                return terminos.every(t => dataString.includes(t));
            });
        },
        async eliminarMateria(materia, e){
            e.stopPropagation();
            alertify.confirm('Eliminar materias', `¿Está seguro de eliminar la materia ${materia.nombre}?`, async e=>{
                // Borrado Optimista (Inmediato)
                const index = this.materias_cache.findIndex(x => x.idMateria === materia.idMateria);
                if (index !== -1) {
                    this.materias_cache.splice(index, 1);
                    this.filtrarMaterias();
                }
                
                // Petición en segundo plano
                fetch(`/api/materias/${materia.idMateria}`, { method: 'DELETE' })
                    .then(response=>response.json())
                    .then(data=>{
                        if(data!=true) {
                            alertify.error(`Error al sincronizar con el servidor: ${data}`);
                            this.obtenerMaterias();
                        }
                    });
                alertify.success(`Materia ${materia.nombre} eliminada correctamente`);
            }, () => {
                //No hacer nada
            });
        },
        mostrarFormulario(ventana){
            this.$parent.abrirVentana(ventana);
        }
    },
    mounted(){
        this.obtenerMaterias();
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
                                <h4 class="mb-1 fw-bold text-dark">Catálogo de Materias</h4>
                                <p class="mb-0 text-muted small">Búsqueda rápida en el repositorio de asignaturas</p>
                            </div>
                        </div>
                        <button type="button" @click="mostrarFormulario('materias')" class="btn btn-light text-muted fw-semibold rounded-pill px-4 shadow-sm border transition-all">
                            <i class="bi bi-arrow-left me-2"></i> Ir al Registro
                        </button>
                    </div>

                    <div class="mb-4">
                        <div class="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
                            <span class="input-group-text bg-white border-end-0 pe-1 text-muted ps-4"><i class="bi bi-search"></i></span>
                            <input autocomplete="off" type="search" @keyup="filtrarMaterias()" v-model="buscar" placeholder="Ingresa código o nombre de la materia para buscar..." class="form-control border-start-0 ps-2 bg-white fs-6" style="outline: none; box-shadow: none;">
                        </div>
                    </div>
                    
                    <div class="table-responsive rounded-3 border border-light shadow-sm">
                        <table class="table table-hover align-middle mb-0 bg-white">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Código</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Nombre Asignatura</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Unidades (UV)</th>
                                    <th class="py-3 px-4 text-end text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="materia in materias" :key="materia.idMateria" @click="modificarMateria(materia)" class="cursor-pointer transition-all">
                                    <td class="py-3 px-4">
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded font-monospace">{{ materia.codigo }}</span>
                                    </td>
                                    <td class="py-3 px-4 fw-semibold text-dark">{{ materia.nombre }}</td>
                                    <td class="py-3 px-4">
                                        <div class="d-flex align-items-center">
                                            <i class="bi bi-123 text-muted me-2"></i>
                                            <span class="fw-medium text-dark">{{ materia.uv }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-end">
                                        <div class="d-flex justify-content-end gap-2">
                                            <button @click.stop="modificarMateria(materia)" class="btn btn-light btn-sm text-primary p-2 border-0 shadow-none transition-all rounded-circle" title="Editar Materia">
                                                <i class="bi bi-pencil-square fs-5"></i>
                                            </button>
                                            <button @click.stop="eliminarMateria(materia, $event)" class="btn btn-light btn-sm text-danger p-2 border-0 shadow-none transition-all rounded-circle" title="Eliminar Materia">
                                                <i class="bi bi-trash fs-5"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="materias.length == 0">
                                    <td colspan="4" class="text-center py-5">
                                        <div class="d-flex flex-column align-items-center text-muted">
                                            <i class="bi bi-inbox fs-1 mb-3 opacity-50"></i>
                                            <p class="mb-0 fw-medium">No se encontraron resultados para tu búsqueda.</p>
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
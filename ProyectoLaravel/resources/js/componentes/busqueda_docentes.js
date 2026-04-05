export default {
    data(){
        return{
            buscar:'',
            docentes_cache: [],
            docentes:[]
        }
    },
    methods:{
        modificarDocente(docente){
            this.$emit('modificar', docente);
        },
        async obtenerDocentes(){
            fetch(`/api/docentes`) // Carga total silenciosa
                .then(response=>response.json())
                .then(data=>{
                    this.docentes_cache = data;
                    this.filtrarDocentes();
                });
        },
        filtrarDocentes() {
            const normalizar = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const terminos = normalizar(this.buscar).split(' ').filter(t => t.length > 0);
            
            this.docentes = this.docentes_cache.filter(d => {
                const dataString = normalizar(`${d.codigo} ${d.nombre} ${d.email} ${d.direccion} ${d.telefono} ${d.escalafon}`);
                return terminos.every(t => dataString.includes(t));
            });
        },
        async eliminarDocente(docente, e){
            e.stopPropagation();
            alertify.confirm('Eliminar docentes', `¿Está seguro de eliminar el docente ${docente.nombre}?`, async e=>{
                // Borrado Optimista (Inmediato)
                const index = this.docentes_cache.findIndex(x => x.idDocente === docente.idDocente);
                if (index !== -1) {
                    this.docentes_cache.splice(index, 1);
                    this.filtrarDocentes();
                }
                
                // Petición en segundo plano
                fetch(`/api/docentes/${docente.idDocente}`, { method: 'DELETE' })
                    .then(response=>response.json())
                    .then(data=>{
                        if(data!=true) {
                            alertify.error(`Error al sincronizar con el servidor: ${data}`);
                            this.obtenerDocentes();
                        }
                    });
                alertify.success(`Docente ${docente.nombre} eliminado correctamente`);
            }, () => {
                //No hacer nada
            });
        },
        mostrarFormulario(ventana){
            this.$parent.abrirVentana(ventana);
        }
    },
    mounted(){
        this.obtenerDocentes();
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
                                <h4 class="mb-1 fw-bold text-dark">Directorio de Docentes</h4>
                                <p class="mb-0 text-muted small">Localización y gestión de perfiles de profesorado</p>
                            </div>
                        </div>
                        <button type="button" @click="mostrarFormulario('docentes')" class="btn btn-light text-muted fw-semibold rounded-pill px-4 shadow-sm border transition-all">
                            <i class="bi bi-arrow-left me-2"></i> Ir al Registro
                        </button>
                    </div>

                    <div class="mb-4">
                        <div class="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
                            <span class="input-group-text bg-white border-end-0 pe-1 text-muted ps-4"><i class="bi bi-search"></i></span>
                            <input autocomplete="off" type="search" @keyup="filtrarDocentes()" v-model="buscar" placeholder="Ingresa código, nombre o email para buscar en el directorio..." class="form-control border-start-0 ps-2 bg-white fs-6" style="outline: none; box-shadow: none;">
                        </div>
                    </div>
                    
                    <div class="table-responsive rounded-3 border border-light shadow-sm">
                        <table class="table table-hover align-middle mb-0 bg-white">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Código</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Profesor</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Dirección</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Contacto</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Escalafón</th>
                                    <th class="py-3 px-4 text-end text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="docente in docentes" :key="docente.idDocente" @click="modificarDocente(docente)" class="cursor-pointer transition-all">
                                    <td class="py-3 px-4">
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded font-monospace">{{ docente.codigo }}</span>
                                    </td>
                                    <td class="py-3 px-4 fw-semibold text-dark">{{ docente.nombre }}</td>
                                    <td class="py-3 px-4 text-muted small">{{ docente.direccion }}</td>
                                    <td class="py-3 px-4">
                                        <div class="d-flex flex-column gap-1">
                                            <span class="text-dark d-flex align-items-center" style="font-size: 0.85rem;"><i class="bi bi-envelope text-muted me-2"></i>{{ docente.email }}</span>
                                            <span class="text-muted d-flex align-items-center" style="font-size: 0.8rem;"><i class="bi bi-telephone text-muted me-2"></i>{{ docente.telefono }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-capitalize">
                                        <span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1 rounded">{{ docente.escalafon }}</span>
                                    </td>
                                    <td class="py-3 px-4 text-end">
                                        <div class="d-flex justify-content-end gap-2">
                                            <button @click.stop="modificarDocente(docente)" class="btn btn-light btn-sm text-primary p-2 border-0 shadow-none transition-all rounded-circle" title="Editar Perfil">
                                                <i class="bi bi-pencil-square fs-5"></i>
                                            </button>
                                            <button @click.stop="eliminarDocente(docente, $event)" class="btn btn-light btn-sm text-danger p-2 border-0 shadow-none transition-all rounded-circle" title="Eliminar Perfil">
                                                <i class="bi bi-trash fs-5"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="docentes.length == 0">
                                    <td colspan="6" class="text-center py-5">
                                        <div class="d-flex flex-column align-items-center text-muted">
                                            <i class="bi bi-inbox fs-1 mb-3 opacity-50"></i>
                                            <p class="mb-0 fw-medium">No se encontraron docentes para tu búsqueda.</p>
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
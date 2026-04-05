export default {
    data(){
        return{
            buscar:'',
            alumnos_cache: [],
            alumnos:[]
        }
    },
    methods:{
        modificarAlumno(alumno){
            this.$emit('modificar', alumno);
        },
        async obtenerAlumnos(){
            fetch(`/api/alumnos`) // Carga total silenciosa
                .then(response=>response.json())
                .then(data=>{
                    this.alumnos_cache = data;
                    this.filtrarAlumnos();
                });
        },
        filtrarAlumnos() {
            const normalizar = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const terminos = normalizar(this.buscar).split(' ').filter(t => t.length > 0);
            
            this.alumnos = this.alumnos_cache.filter(a => {
                const dataString = normalizar(`${a.codigo} ${a.nombre} ${a.email} ${a.direccion} ${a.telefono}`);
                return terminos.every(t => dataString.includes(t));
            });
        },
        async eliminarAlumno(alumno, e){
            e.stopPropagation();
            alertify.confirm('Eliminar alumnos', `¿Está seguro de eliminar el alumno ${alumno.nombre}?`, async e=>{
                // 1. Borrado Optimista (Inmediato)
                const index = this.alumnos_cache.findIndex(x => x.idAlumno === alumno.idAlumno);
                if (index !== -1) {
                    this.alumnos_cache.splice(index, 1);
                    this.filtrarAlumnos();
                }
                
                // 2. Transacción de fondo
                fetch(`/api/alumnos/${alumno.idAlumno}`, { method: 'DELETE' })
                    .then(response=>response.json())
                    .then(data=>{
                        if(data!=true) {
                            alertify.error(`Error al sincronizar con el servidor: ${data}`);
                            this.obtenerAlumnos(); // Revertir visualmente si falló
                        }
                    });
                alertify.success(`Alumno ${alumno.nombre} eliminado correctamente`);
            }, () => {
                //No hacer nada
            });
        },
        mostrarFormulario(ventana){
            this.$parent.abrirVentana(ventana);
        }
    },
    mounted(){
        this.obtenerAlumnos();
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
                                <h4 class="mb-1 fw-bold text-dark">Búsqueda de Alumnos</h4>
                                <p class="mb-0 text-muted small">Localización y gestión de expedientes existentes</p>
                            </div>
                        </div>
                        <button type="button" @click="mostrarFormulario('alumnos')" class="btn btn-light text-muted fw-semibold rounded-pill px-4 shadow-sm border transition-all">
                            <i class="bi bi-arrow-left me-2"></i> Ir al Registro
                        </button>
                    </div>

                    <div class="mb-4">
                        <div class="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
                            <span class="input-group-text bg-white border-end-0 pe-1 text-muted ps-4"><i class="bi bi-search"></i></span>
                            <input autocomplete="off" type="search" @keyup="filtrarAlumnos()" v-model="buscar" placeholder="Ingresa código, nombre o email para buscar en la base de datos..." class="form-control border-start-0 ps-2 bg-white fs-6" style="outline: none; box-shadow: none;">
                        </div>
                    </div>
                    
                    <div class="table-responsive rounded-3 border border-light shadow-sm">
                        <table class="table table-hover align-middle mb-0 bg-white">
                            <thead class="bg-light">
                                <tr>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Código</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Estudiante</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Dirección</th>
                                    <th class="py-3 px-4 text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Contacto</th>
                                    <th class="py-3 px-4 text-end text-muted fw-semibold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.05em;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="alumno in alumnos" :key="alumno.idAlumno" @click="modificarAlumno(alumno)" class="cursor-pointer transition-all">
                                    <td class="py-3 px-4">
                                        <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded font-monospace">{{ alumno.codigo }}</span>
                                    </td>
                                    <td class="py-3 px-4 fw-semibold text-dark">{{ alumno.nombre }}</td>
                                    <td class="py-3 px-4 text-muted small">{{ alumno.direccion }}</td>
                                    <td class="py-3 px-4">
                                        <div class="d-flex flex-column gap-1">
                                            <span class="text-dark d-flex align-items-center" style="font-size: 0.85rem;"><i class="bi bi-envelope text-muted me-2"></i>{{ alumno.email }}</span>
                                            <span class="text-muted d-flex align-items-center" style="font-size: 0.8rem;"><i class="bi bi-telephone text-muted me-2"></i>{{ alumno.telefono }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4 text-end">
                                        <div class="d-flex justify-content-end gap-2">
                                            <button @click.stop="modificarAlumno(alumno)" class="btn btn-light btn-sm text-primary p-2 border-0 shadow-none transition-all rounded-circle" title="Editar Expediente">
                                                <i class="bi bi-pencil-square fs-5"></i>
                                            </button>
                                            <button @click.stop="eliminarAlumno(alumno, $event)" class="btn btn-light btn-sm text-danger p-2 border-0 shadow-none transition-all rounded-circle" title="Eliminar Expediente">
                                                <i class="bi bi-trash fs-5"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="alumnos.length == 0">
                                    <td colspan="5" class="p-0 border-0">
                                        <div class="m-4 text-center p-5 bg-light rounded-4 border border-info border-opacity-25 text-muted d-flex flex-column align-items-center justify-content-center" style="min-height: 300px; border-style: dashed !important; border-width: 2px !important;">
                                            <div class="bg-white p-4 rounded-circle shadow-sm mb-4 d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                                <i class="bi bi-inbox fw-bold text-primary opacity-75" style="font-size: 2.5rem; line-height: 1;"></i>
                                            </div>
                                            <h5 class="fw-bold text-dark mb-2">Ningún alumno encontrado</h5>
                                            <p class="text-muted mb-4 small" style="max-width: 350px;">No se encontraron registros que coincidan con la búsqueda. Puedes registrar un nuevo expediente.</p>
                                            <button type="button" @click="mostrarFormulario('alumnos')" class="btn btn-primary rounded-pill px-4 shadow-sm border-0 d-inline-flex align-items-center transition-all" style="background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);">
                                                <i class="bi bi-plus-lg me-2"></i> Añadir Nuevo Alumno
                                            </button>
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
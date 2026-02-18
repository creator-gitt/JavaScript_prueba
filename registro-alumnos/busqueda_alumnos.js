const busqueda_alumnos = {
    data(){
        return{
            buscar:'',
            alumnos:[]
        }
    },
    methods:{
        modificarAlumno(alumno){
            this.$emit('modificar', alumno);
        },
        async obtenerAlumnos(){
            this.alumnos = await db.alumnos.filter(
                alumno => alumno.codigo.toLowerCase().includes(this.buscar.toLowerCase())
                    || alumno.nombre.toLowerCase().includes(this.buscar.toLowerCase())
            ).toArray();
        },
        async eliminarAlumno(alumno, e){
            e.stopPropagation();
            alertify.confirm('Eliminar alumno', `¿Está seguro de eliminar a ${alumno.nombre}?`, async e=>{
                await db.alumnos.delete(alumno.idAlumno);
                this.obtenerAlumnos();
                alertify.success(`Alumno ${alumno.nombre} eliminado`);
            }, () => {});
        },
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-search me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Búsqueda de Alumnos</h5>
            </div>
            <div class="mb-3" style="max-width: 340px;">
                <input autocomplete="off" type="search" @keyup="obtenerAlumnos()" v-model="buscar"
                    placeholder="Buscar por código o nombre..." class="form-control form-control-sm">
            </div>
            <div class="table-responsive">
                <table class="table table-sm table-hover align-middle" id="tblAlumnos">
                    <thead class="table-light">
                        <tr>
                            <th class="text-muted small text-uppercase fw-semibold">Código</th>
                            <th class="text-muted small text-uppercase fw-semibold">Nombre</th>
                            <th class="text-muted small text-uppercase fw-semibold">Dirección</th>
                            <th class="text-muted small text-uppercase fw-semibold">Email</th>
                            <th class="text-muted small text-uppercase fw-semibold">Teléfono</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="alumnos.length === 0">
                            <td colspan="6" class="text-center text-muted py-3 small">Sin resultados</td>
                        </tr>
                        <tr v-for="alumno in alumnos" :key="alumno.idAlumno" @click="modificarAlumno(alumno)" style="cursor:pointer;">
                            <td class="small">{{ alumno.codigo }}</td>
                            <td class="small fw-semibold">{{ alumno.nombre }}</td>
                            <td class="small text-muted">{{ alumno.direccion }}</td>
                            <td class="small text-muted">{{ alumno.email }}</td>
                            <td class="small text-muted">{{ alumno.telefono }}</td>
                            <td>
                                <button class="btn btn-outline-danger btn-sm py-0 px-2" @click="eliminarAlumno(alumno, $event)">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
};
const busqueda_materias = {
    data(){
        return{
            buscar:'',
            materias:[]
        }
    },
    methods:{
        modificarMateria(materia){
            this.$emit('modificar', materia);
        },
        async obtenerMaterias(){
            try {
                let busqueda = `%${this.buscar}%`;
                this.materias = await Database.query(
                    `SELECT * FROM materias WHERE LOWER(codigo) LIKE LOWER(?) OR LOWER(nombre) LIKE LOWER(?) ORDER BY codigo`, 
                    [busqueda, busqueda]
                );
                
                if(this.materias.length < 1 && this.buscar.length <= 0) {
                    fetch(`private/modulos/materias/materia.php?accion=consultar`)
                        .then(response => response.json())
                        .then(async data => {
                            this.materias = data;
                            for (let reg of data) {
                                await Database.query(`INSERT OR IGNORE INTO materias (idMateria, codigo, nombre, uv) VALUES (?, ?, ?, ?)`,
                                    [reg.idMateria, reg.codigo, reg.nombre, reg.uv]);
                            }
                        });
                }
            } catch (error) {
                console.error("Error obteniendo materias:", error);
            }
        },
        async eliminarMateria(materia, e){
            e.stopPropagation();
            alertify.confirm('Eliminar materias', `¿Está seguro de eliminar el materia ${materia.nombre}?`, async () => {
                try {
                    await Database.query(`DELETE FROM materias WHERE idMateria=?`, [materia.idMateria]);
                    this.obtenerMaterias();
                    alertify.success(`Materia ${materia.nombre} eliminada correctamente`);
                } catch (error) {
                    alertify.error(`Error BD: ${error.message}`);
                }
            }, () => {
                //No hacer nada
            });
        },
        mostrarFormulario(ventana){
            this.$emit('regresar', ventana);
        }
    },
    mounted() {
        this.obtenerMaterias();
    },
    template: `
        <div class="row mt-4">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
                <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                    <div class="card-header bg-success text-white text-center py-2 rounded-top-4 border-0">
                        <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-search me-2"></i> BÚSQUEDA DE MATERIAS</h5>
                    </div>
                    <div class="card-body p-3">
                        <div class="input-group input-group-sm mb-3 shadow-sm rounded-pill overflow-hidden">
                            <span class="input-group-text bg-body-tertiary border-0 text-secondary px-3"><i class="bi bi-search"></i></span>
                            <input autocomplete="off" type="search" @keyup="obtenerMaterias()" v-model="buscar" placeholder="Buscar materia..." class="form-control bg-body-tertiary border-0 px-3 text-body shadow-none py-1">
                        </div>
                        <div class="table-responsive">
                            <table class="table table-sm fs-6 table-hover align-middle mb-0" id="tblMaterias">
                                <thead>
                                    <tr>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">CÓDIGO</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">NOMBRE</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">UV</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody class="border-top-0">
                                    <tr v-for="materia in materias" :key="materia.idMateria" @click="modificarMateria(materia)" class="cursor-pointer transition-all">
                                        <td><span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 fs-6 rounded-pill px-3">{{ materia.codigo }}</span></td>
                                        <td class="fw-semibold">{{ materia.nombre }}</td>
                                        <td>{{ materia.uv }}</td>
                                        <td class="text-center">
                                            <div class="btn-group">
                                                <button @click.stop="modificarMateria(materia)" class="btn btn-outline-info btn-sm rounded-pill shadow-sm px-2 me-1">
                                                    <i class="bi bi-pencil-fill"></i>
                                                </button>
                                                <button @click.stop="eliminarMateria(materia)" class="btn btn-outline-danger btn-sm rounded-pill shadow-sm px-2">
                                                    <i class="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="materias.length == 0">
                                        <td colspan="4" class="text-center text-muted py-3">No se encontraron materias...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 text-center pb-4">
                        <button type="button" @click="mostrarFormulario('materias')" class="btn btn-outline-secondary rounded-pill px-4 shadow-sm">
                            <i class="bi bi-arrow-left-circle me-1"></i> Volver a Registro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};
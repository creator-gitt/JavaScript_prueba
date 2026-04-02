const busqueda_docentes = {
    data(){
        return{
            buscar:'',
            docentes:[]
        }
    },
    methods:{
        modificarDocente(docente){
            this.$emit('modificar', docente);
        },
        async obtenerDocentes(){
            try {
                let busqueda = `%${this.buscar}%`;
                this.docentes = await Database.query(
                    `SELECT * FROM docentes WHERE LOWER(codigo) LIKE LOWER(?) OR LOWER(nombre) LIKE LOWER(?) ORDER BY codigo`, 
                    [busqueda, busqueda]
                );
                
                if(this.docentes.length < 1 && this.buscar.length <= 0) {
                    fetch(`private/modulos/docentes/docente.php?accion=consultar`)
                        .then(response => response.json())
                        .then(async data => {
                            this.docentes = data;
                            for (let reg of data) {
                                await Database.query(`INSERT OR IGNORE INTO docentes (idDocente, codigo, nombre, direccion, email, telefono, escalafon) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                    [reg.idDocente, reg.codigo, reg.nombre, reg.direccion, reg.email, reg.telefono, reg.escalafon]);
                            }
                        });
                }
            } catch (error) {
                console.error("Error obteniendo docentes:", error);
            }
        },
        async eliminarDocente(docente, e){
            e.stopPropagation();
            alertify.confirm('Eliminar docentes', `¿Está seguro de eliminar el docente ${docente.nombre}?`, async () => {
                try {
                    await Database.query(`DELETE FROM docentes WHERE idDocente=?`, [docente.idDocente]);
                    this.obtenerDocentes();
                    alertify.success(`Docente ${docente.nombre} eliminado correctamente`);
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
        this.obtenerDocentes();
    },
    template: `
        <div class="row mt-4">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
                <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                    <div class="card-header bg-success text-white text-center py-2 rounded-top-4 border-0">
                        <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-search me-2"></i> BÚSQUEDA DE DOCENTES</h5>
                    </div>
                    <div class="card-body p-3">
                        <div class="input-group input-group-sm mb-3 shadow-sm rounded-pill overflow-hidden">
                            <span class="input-group-text bg-body-tertiary border-0 text-secondary px-3"><i class="bi bi-search"></i></span>
                            <input autocomplete="off" type="search" @keyup="obtenerDocentes()" v-model="buscar" placeholder="Buscar docente..." class="form-control bg-body-tertiary border-0 px-3 text-body shadow-none py-1">
                        </div>
                        <div class="table-responsive">
                            <table class="table table-sm fs-6 table-hover align-middle mb-0" id="tblDocentes">
                                <thead>
                                    <tr>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">CÓDIGO</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">NOMBRE</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">DIRECCIÓN</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">EMAIL</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">TELÉFONO</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody class="border-top-0">
                                    <tr v-for="docente in docentes" :key="docente.idDocente" @click="modificarDocente(docente)" class="cursor-pointer transition-all">
                                        <td><span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 fs-6 rounded-pill px-3">{{ docente.codigo }}</span></td>
                                        <td class="fw-semibold">{{ docente.nombre }}</td>
                                        <td>{{ docente.direccion }}</td>
                                        <td>{{ docente.email }}</td>
                                        <td>{{ docente.telefono }}</td>
                                        <td class="text-center">
                                            <div class="btn-group">
                                                <button @click.stop="modificarDocente(docente)" class="btn btn-outline-info btn-sm rounded-pill shadow-sm px-2 me-1">
                                                    <i class="bi bi-pencil-fill"></i>
                                                </button>
                                                <button @click.stop="eliminarDocente(docente)" class="btn btn-outline-danger btn-sm rounded-pill shadow-sm px-2">
                                                    <i class="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="docentes.length == 0">
                                        <td colspan="6" class="text-center text-muted py-3">No se encontraron docentes...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 text-center pb-4">
                        <button type="button" @click="mostrarFormulario('docentes')" class="btn btn-outline-secondary rounded-pill px-4 shadow-sm">
                            <i class="bi bi-arrow-left-circle me-1"></i> Volver a Registro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};
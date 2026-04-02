const busqueda_inscripciones = {
    data() {
        return {
            buscar: '',
            inscripciones: []
        }
    },
    methods: {
        modificarInscripcion(inscripcion) {
            this.$emit('modificar', inscripcion);
        },
        async obtenerInscripciones() {
            try {
                let busqueda = `%${this.buscar}%`;
                const sql = `
                    SELECT i.*, 
                           a.nombre as nombreAlumno,
                           m.nombre as nombreMateria
                    FROM inscripciones i
                    LEFT JOIN alumnos a ON i.idAlumno = a.idAlumno
                    LEFT JOIN materias m ON i.idMateria = m.idMateria
                    WHERE LOWER(a.nombre) LIKE LOWER(?) 
                       OR LOWER(m.nombre) LIKE LOWER(?) 
                       OR LOWER(i.ciclo) LIKE LOWER(?)
                    ORDER BY i.fecha DESC
                `;
                this.inscripciones = await Database.query(sql, [busqueda, busqueda, busqueda]);

                if(this.inscripciones.length < 1 && this.buscar.length <= 0) {
                    fetch(`private/modulos/inscripciones/inscripcion.php?accion=consultar`)
                        .then(response => response.json())
                        .then(async data => {
                            for (let reg of data) {
                                await Database.query(`INSERT OR IGNORE INTO inscripciones (idInscripcion, idAlumno, idMateria, ciclo, fecha) VALUES (?, ?, ?, ?, ?)`,
                                    [reg.idInscripcion, reg.idAlumno, reg.idMateria, reg.ciclo, reg.fecha]);
                            }
                            this.obtenerInscripciones();
                        });
                }
            } catch (error) {
                console.error("Error obteniendo inscripciones:", error);
            }
        },
        async eliminarInscripcion(inscripcion, e) {
            e.stopPropagation();
            alertify.confirm('Eliminar Inscripcion', `¿Está seguro de eliminar esta inscripción?`, async () => {
                try {
                    await Database.query(`DELETE FROM inscripciones WHERE idInscripcion=?`, [inscripcion.idInscripcion]);
                    this.obtenerInscripciones();
                    alertify.success(`Inscripción eliminada correctamente`);
                } catch (error) {
                    alertify.error(`Error BD: ${error.message}`);
                }
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
        <div class="row mt-4">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
                <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                    <div class="card-header bg-success text-white text-center py-2 rounded-top-4 border-0">
                        <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-search me-2"></i> BÚSQUEDA DE INSCRIPCIONES</h5>
                    </div>
                    <div class="card-body p-3">
                        <div class="input-group input-group-sm mb-3 shadow-sm rounded-pill overflow-hidden">
                            <span class="input-group-text bg-body-tertiary border-0 text-secondary px-3"><i class="bi bi-search"></i></span>
                            <input autocomplete="off" type="search" @keyup="obtenerInscripciones()" v-model="buscar" placeholder="Buscar por alumno, materia o ciclo..." class="form-control bg-body-tertiary border-0 px-3 text-body shadow-none py-1">
                        </div>
                        <div class="table-responsive">
                            <table class="table table-sm fs-6 table-hover align-middle mb-0" id="tblInscripciones">
                                <thead>
                                    <tr>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">ALUMNO</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">MATERIA</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">CICLO</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold">FECHA</th>
                                        <th class="py-2 border-bottom-0 text-secondary fw-semibold text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody class="border-top-0">
                                    <tr v-for="inscripcion in inscripciones" :key="inscripcion.idInscripcion" @click="modificarInscripcion(inscripcion)" class="cursor-pointer transition-all">
                                        <td class="fw-semibold">{{ inscripcion.nombreAlumno }}</td>
                                        <td>{{ inscripcion.nombreMateria }}</td>
                                        <td><span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 fs-6 rounded-pill px-3">{{ inscripcion.ciclo }}</span></td>
                                        <td>{{ inscripcion.fecha }}</td>
                                        <td class="text-center">
                                            <div class="btn-group">
                                                <button @click.stop="modificarInscripcion(inscripcion)" class="btn btn-outline-info btn-sm rounded-pill shadow-sm px-2 me-1">
                                                    <i class="bi bi-pencil-fill"></i>
                                                </button>
                                                <button @click.stop="eliminarInscripcion(inscripcion, $event)" class="btn btn-outline-danger btn-sm rounded-pill shadow-sm px-2">
                                                    <i class="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="inscripciones.length == 0">
                                        <td colspan="5" class="text-center text-muted py-3">No se encontraron inscripciones...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 text-center pb-4">
                        <button type="button" @click="mostrarFormulario('inscripciones')" class="btn btn-outline-secondary rounded-pill px-4 shadow-sm">
                            <i class="bi bi-arrow-left-circle me-1"></i> Volver a Registro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};
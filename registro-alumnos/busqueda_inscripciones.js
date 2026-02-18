const busqueda_inscripciones = {
    data(){
        return{
            buscar:'',
            inscripciones:[],
            // idMatricula del alumno cuyo detalle está expandido
            expandido: null,
        }
    },
    computed:{
        // Agrupa las inscripciones por alumno (idMatricula)
        alumnosAgrupados(){
            const mapa = {};
            for(const ins of this.inscripciones){
                const key = ins.idMatricula;
                if(!mapa[key]){
                    mapa[key] = {
                        idMatricula: ins.idMatricula,
                        alumno:      ins.alumno,
                        ciclo:       ins.ciclo,
                        materias:    []
                    };
                }
                mapa[key].materias.push(ins);
            }
            // Filtrar por búsqueda
            const q = this.buscar.toLowerCase();
            return Object.values(mapa).filter(
                g => !q || g.alumno.toLowerCase().includes(q)
            );
        }
    },
    methods:{
        getRomano(n) {
            const romanos = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
            return romanos[n - 1] || n;
        },
        toggleExpandido(idMatricula){
            this.expandido = this.expandido === idMatricula ? null : idMatricula;
        },
        // Emite el primer registro del alumno para pre-llenar el formulario
        seleccionarAlumno(grupo){
            this.$emit('modificar', grupo.materias[0]);
        },
        async obtenerInscripciones(){
            this.inscripciones = await db.inscripciones.toArray();
        },
        async eliminarInscripcion(ins, e){
            e.stopPropagation();
            alertify.confirm('Eliminar inscripción',
                `¿Eliminar la inscripción de <b>${ins.alumno}</b> en <b>${ins.materia}</b>?`,
                async () => {
                    await db.inscripciones.delete(ins.idInscripcion);
                    await this.obtenerInscripciones();
                    alertify.success(`Inscripción eliminada`);
                }, () => {}
            );
        },
        async eliminarAlumno(grupo, e){
            e.stopPropagation();
            alertify.confirm('Eliminar todas las inscripciones',
                `¿Eliminar TODAS las inscripciones de <b>${grupo.alumno}</b> (${grupo.materias.length} materia/s)?`,
                async () => {
                    for(const ins of grupo.materias){
                        await db.inscripciones.delete(ins.idInscripcion);
                    }
                    if(this.expandido === grupo.idMatricula) this.expandido = null;
                    await this.obtenerInscripciones();
                    alertify.success(`Inscripciones de ${grupo.alumno} eliminadas`);
                }, () => {}
            );
        },
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-search me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Búsqueda de Inscripciones</h5>
            </div>

            <div class="mb-3" style="max-width: 340px;">
                <input type="search" @keyup="obtenerInscripciones()" @search="obtenerInscripciones()" v-model="buscar"
                    placeholder="Buscar por nombre de alumno..." class="form-control form-control-sm">
            </div>

            <!-- Sin resultados -->
            <div v-if="alumnosAgrupados.length === 0" class="text-center text-muted py-4 small">
                <i class="bi bi-inbox fs-4 d-block mb-1 opacity-50"></i>Sin resultados
            </div>

            <!-- Tarjeta por alumno -->
            <div v-for="grupo in alumnosAgrupados" :key="grupo.idMatricula" class="mb-2">
                <!-- Fila principal: nombre + cantidad de materias -->
                <div class="d-flex align-items-center px-3 py-2 rounded border bg-white"
                    style="cursor:pointer; transition: box-shadow .15s;"
                    @mouseenter="$event.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.08)'"
                    @mouseleave="$event.currentTarget.style.boxShadow='none'"
                    @click="toggleExpandido(grupo.idMatricula)">

                    <!-- Ícono chevron -->
                    <i class="bi me-2 text-secondary"
                        :class="expandido === grupo.idMatricula ? 'bi-chevron-down' : 'bi-chevron-right'"></i>

                    <!-- Nombre del alumno -->
                    <div class="flex-grow-1">
                        <span class="fw-semibold small">{{ grupo.alumno }}</span>
                        <span class="text-muted small ms-2">· Ciclo {{ grupo.ciclo }}</span>
                    </div>

                    <!-- Badge de cantidad de materias -->
                    <span class="badge rounded-pill me-2"
                        style="background-color:#1a3a5c; font-size:.75rem;">
                        <i class="bi bi-book me-1"></i>{{ grupo.materias.length }} materia{{ grupo.materias.length !== 1 ? 's' : '' }}
                    </span>

                    <!-- Botón eliminar todo -->
                    <button class="btn btn-outline-danger btn-sm py-0 px-2"
                        title="Eliminar todas las inscripciones de este alumno"
                        @click.stop="eliminarAlumno(grupo, $event)">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>

                <!-- Detalle expandido: tabla de materias -->
                <div v-if="expandido === grupo.idMatricula"
                    class="border border-top-0 rounded-bottom px-3 pt-2 pb-1 bg-white">
                    <table class="table table-sm table-hover align-middle mb-1">
                        <thead>
                            <tr>
                                <th class="text-muted small text-uppercase fw-semibold">#</th>
                                <th class="text-muted small text-uppercase fw-semibold">Materia</th>
                                <th class="text-muted small text-uppercase fw-semibold">Fecha</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(ins, idx) in grupo.materias" :key="ins.idInscripcion">
                                <td class="small text-muted">{{ idx + 1 }}</td>
                                <td class="small fw-semibold">{{ ins.materia }}</td>
                                <td class="small text-muted">{{ ins.fecha }}</td>
                                <td>
                                    <button class="btn btn-outline-danger btn-sm py-0 px-2"
                                        @click.stop="eliminarInscripcion(ins, $event)">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
};
// =============================================
// ADMIN — Gestión de Alumnos
// =============================================

const alumnosAdmin = {
    data() {
        return {
            alumnos: [],
            carreras: [],
            filtro: '',
            cargando: false,
            editando: null,
            guardandoEdit: false,
            alumnoDetalle: null,
            histMatriculas: [],
            histInscripciones: []
        };
    },
    async mounted() { await this.cargar(); },
    computed: {
        alumnosFiltrados() {
            const f = this.filtro.toLowerCase().trim();
            if (!f) return this.alumnos;
            return this.alumnos.filter(a =>
                (a.nombre   || '').toLowerCase().includes(f) ||
                (a.codigo   || '').toLowerCase().includes(f) ||
                (a.carrera  || '').toLowerCase().includes(f)
            );
        }
    },
    methods: {
        async cargar() {
            this.cargando = true;
            [this.alumnos, this.carreras] = await Promise.all([
                db.alumnos.orderBy('nombre').toArray(),
                db.carreras.filter(c => (c.estado||'activa')==='activa').sortBy('nombre')
            ]);
            this.cargando = false;
        },
        estado(a) { return a.estado || 'activo'; },
        async eliminar(alumno) {
            alertify.confirm(
                'Eliminar Alumno Definitivamente',
                `¿Estás seguro de ELIMINAR a <b>${alumno.nombre}</b>?<br>Se borrarán su usuario, matrícula, inscripciones y notas de forma permanente.`,
                async () => {
                    try {
                        // 1. Eliminar Matrícula
                        const matriculas = await db.matricula.where('idAlumno').equals(alumno.idAlumno).toArray();
                        const idsMatricula = matriculas.map(m => m.idMatricula);
                        await db.matricula.where('idAlumno').equals(alumno.idAlumno).delete();

                        // 2. Eliminar Inscripciones y Evaluaciones (Notas)
                        if (idsMatricula.length > 0) {
                            const inscripciones = await db.inscripciones.where('idMatricula').anyOf(idsMatricula).toArray();
                            const idsInscripciones = inscripciones.map(i => i.idInscripcion);
                            
                            await db.inscripciones.where('idMatricula').anyOf(idsMatricula).delete();
                            
                            if (idsInscripciones.length > 0) {
                                await db.evaluaciones.where('idInscripcion').anyOf(idsInscripciones).delete();
                            }
                        }

                        // 3. Eliminar usuario asociado (si existe)
                        // A. Buscar por código
                        let user = null;
                        if (alumno.codigo) {
                            user = await db.usuarios.where('codigo').equalsIgnoreCase(alumno.codigo).first();
                        }
                        // B. Si no, buscar por username
                        if (!user && alumno.nombre) {
                             user = await db.usuarios.where('username').equalsIgnoreCase(alumno.nombre).first();
                        }
                        
                        // C. Si encontramos usuario, verificar que sea Alumno
                        if (user && user.rol === 'Alumno') {
                            await db.usuarios.delete(user.id);
                        }

                        // 4. Eliminar Alumno
                        await db.alumnos.delete(alumno.idAlumno);
                        
                        alertify.success('Alumno y todos sus registros eliminados.');
                        await this.cargar();
                    } catch(e) {
                        alertify.error('Error al eliminar: ' + e.message);
                    }
                },
                () => {}
            ).set('labels', { ok: 'Sí, ELIMINAR', cancel: 'Cancelar' });
        },
        async toggleEstado(alumno) {
            const nuevo = this.estado(alumno) === 'activo' ? 'inactivo' : 'activo';
            await db.alumnos.update(alumno.idAlumno, { estado: nuevo });
            alumno.estado = nuevo;
            alertify.success(`Alumno ${nuevo === 'activo' ? 'activado' : 'desactivado'}.`);
        },
        async generarToken(alumno) {
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            const token = `ALU-${randomPart}`;
            await db.alumnos.update(alumno.idAlumno, { tokenAcceso: token });
            alumno.tokenAcceso = token;
            alertify.alert('Token Generado', `El token para <b>${alumno.nombre}</b> es:<br><h3 class="text-center text-primary mt-2">${token}</h3><p class="small text-muted text-center">Comparte este código con el alumno para que pueda registrarse.</p>`);
        },
        abrirEditar(alumno) {
            this.editando = { ...alumno, foto: alumno.foto || '' };
            this.abrirModal('modalEditarAlumno');
        },
        seleccionarFoto(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 500 * 1024) {
                alertify.error('La imagen es muy pesada (máx 500KB).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.editando.foto = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        async guardarEdicion() {
            if (!this.editando.nombre || !this.editando.codigo) {
                alertify.error('Nombre y código son obligatorios.');
                return;
            }
            this.guardandoEdit = true;
            const car = this.carreras.find(c => c.nombre === (this.editando.carrera||''));
            await db.alumnos.update(this.editando.idAlumno, {
                codigo:    this.editando.codigo,
                nombre:    this.editando.nombre,
                carrera:   this.editando.carrera || '',
                carreraId: car ? String(car.idCarrera) : (this.editando.carreraId || ''),
                direccion: this.editando.direccion || '',
                email:     this.editando.email || '',
                telefono:  this.editando.telefono || '',
                foto:      this.editando.foto
            });
            await this.cargar();
            this.cerrarModal('modalEditarAlumno');
            this.guardandoEdit = false;
            alertify.success('Alumno actualizado.');
        },
        async verHistorial(alumno) {
            this.alumnoDetalle = alumno;
            this.histMatriculas = await db.matricula
                .filter(m => String(m.codigo) === String(alumno.codigo) || String(m.nombreAlumno) === String(alumno.nombre))
                .toArray();
            const idMatriculas = this.histMatriculas.map(m => m.idMatricula);
            this.histInscripciones = idMatriculas.length
                ? await db.inscripciones.filter(i => idMatriculas.includes(i.idMatricula)).toArray()
                : [];
            this.abrirModal('modalHistorialAlumno');
        },
        abrirModal(id) { new bootstrap.Modal(document.getElementById(id)).show(); },
        cerrarModal(id) { bootstrap.Modal.getInstance(document.getElementById(id))?.hide(); }
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-person-badge me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Gestión de Alumnos</h5>
                <button class="btn btn-sm btn-outline-secondary ms-auto" @click="cargar">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
            </div>

            <!-- Búsqueda -->
            <div class="mb-3" style="max-width:400px;">
                <div class="input-group shadow-sm">
                    <span class="input-group-text bg-body-secondary border-end-0"><i class="bi bi-search text-body-secondary"></i></span>
                    <input v-model="filtro" type="text" class="form-control border-start-0 bg-transparent"
                           placeholder="Buscar por nombre, carnet o carrera...">
                    <button v-if="filtro" class="btn btn-outline-secondary" @click="filtro=''">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>

            <!-- Tabla -->
            <div v-if="cargando" class="text-center py-4"><div class="spinner-border text-secondary"></div></div>
            <div v-else-if="alumnos.length===0" class="text-center py-5 text-muted">
                <i class="bi bi-person-badge fs-1 opacity-25"></i>
                <p class="mt-2">No hay alumnos registrados.</p>
            </div>
            <div v-else class="card border-0 shadow-sm bg-body-tertiary">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 small">
                        <thead class="bg-body-secondary">
                            <tr>
                                <th style="width:50px;" class="text-body-secondary">Foto</th>
                                <th class="text-body-secondary">Código</th>
                                <th class="text-body-secondary">Nombre</th>
                                <th class="text-body-secondary">Carrera</th>
                                <th class="text-body-secondary">Correo</th>
                                <th class="text-body-secondary">Estado</th>
                                <th class="text-body-secondary">Token</th>
                                <th class="text-end text-body-secondary">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="a in alumnosFiltrados" :key="a.idAlumno"
                                :class="estado(a)==='inactivo' ? 'table-light text-muted' : ''">
                                <td>
                                    <img :src="a.foto || 'https://via.placeholder.com/40?text=S'"
                                         class="rounded-circle border"
                                         style="width:36px; height:36px; object-fit: cover;">
                                </td>
                                <td class="fw-semibold">{{ a.codigo }}</td>
                                <td>{{ a.nombre }}</td>
                                <td>{{ a.carrera || '—' }}</td>
                                <td>{{ a.email || '—' }}</td>
                                <td>
                                    <span class="badge" :class="estado(a)==='activo' ? 'bg-success' : 'bg-secondary'">
                                        {{ estado(a) === 'activo' ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td>
                                    <span v-if="a.tokenAcceso" class="badge bg-info text-dark font-monospace user-select-all" title="Click para seleccionar">{{ a.tokenAcceso }}</span>
                                    <span v-else class="text-muted small">—</span>
                                </td>
                                <td class="text-end">
                                    <div class="d-flex gap-1 justify-content-end">
                                        <button class="btn btn-sm btn-outline-primary" @click="abrirEditar(a)" title="Editar">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm" @click="toggleEstado(a)" title="Cambiar estado"
                                                :class="estado(a)==='activo' ? 'btn-outline-warning' : 'btn-outline-success'">
                                            <i :class="estado(a)==='activo' ? 'bi bi-person-slash' : 'bi bi-person-check'"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="eliminar(a)" title="Eliminar definitivamente">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-info" @click="verHistorial(a)" title="Ver historial">
                                            <i class="bi bi-clock-history"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-dark" @click="generarToken(a)" title="Generar Token de Acceso">
                                            <i class="bi bi-key"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="card-footer bg-transparent border-top-0 text-body-secondary small">
                    {{ alumnosFiltrados.length }} de {{ alumnos.length }} alumnos
                </div>
            </div>

            <!-- Modal Editar -->
            <div class="modal fade" id="modalEditarAlumno" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow bg-body-tertiary" v-if="editando">
                        <div class="modal-header bg-primary bg-opacity-75">
                            <h5 class="modal-title text-white"><i class="bi bi-pencil me-2"></i>Editar Alumno</h5>
                            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <!-- Foto en Modal -->
                                <div class="col-12 text-center mb-2">
                                    <div class="position-relative d-inline-block">
                                        <img :src="editando.foto || 'https://via.placeholder.com/100?text=Foto'"
                                             class="rounded-circle border"
                                             style="width:100px; height:100px; object-fit: cover;">
                                        <label class="position-absolute bottom-0 end-0 bg-body border rounded-circle p-1 shadow-sm"
                                               style="cursor:pointer;" title="Cambiar foto">
                                            <i class="bi bi-camera-fill text-body small"></i>
                                            <input type="file" class="d-none" accept="image/*" @change="seleccionarFoto">
                                        </label>
                                    </div>
                                </div>

                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Código *</label>
                                    <input v-model="editando.codigo" class="form-control form-control-sm bg-transparent" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Carrera</label>
                                    <select v-model="editando.carrera" class="form-select form-select-sm bg-transparent">
                                        <option value="">— Sin carrera asignada —</option>
                                        <option v-for="c in carreras" :key="c.idCarrera" :value="c.nombre">{{ c.nombre }}</option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Nombre completo *</label>
                                    <input v-model="editando.nombre" class="form-control form-control-sm bg-transparent" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Dirección</label>
                                    <input v-model="editando.direccion" class="form-control form-control-sm bg-transparent">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Email</label>
                                    <input v-model="editando.email" type="email" class="form-control form-control-sm bg-transparent">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Teléfono</label>
                                    <input v-model="editando.telefono" class="form-control form-control-sm bg-transparent">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer border-top-0">
                            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                            <button class="btn btn-sm text-white fw-semibold" style="background-color:#1a3a5c;"
                                    @click="guardarEdicion" :disabled="guardandoEdit">
                                <span v-if="guardandoEdit" class="spinner-border spinner-border-sm me-1"></span>
                                <i v-else class="bi bi-save me-1"></i>Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal Historial -->
            <div class="modal fade" id="modalHistorialAlumno" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content border-0 shadow bg-body-tertiary" v-if="alumnoDetalle">
                        <div class="modal-header bg-primary bg-opacity-75">
                            <h5 class="modal-title text-white">
                                <i class="bi bi-clock-history me-2"></i>Historial — {{ alumnoDetalle.nombre }}
                            </h5>
                            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <h6 class="fw-semibold text-body-secondary text-uppercase small mb-2">Matrículas</h6>
                            <div v-if="histMatriculas.length===0" class="text-body-secondary small mb-3">Sin matrículas registradas.</div>
                            <table v-else class="table table-sm small mb-3">
                                <thead class="bg-body-secondary text-body-secondary"><tr><th>Código</th><th>Ciclo</th><th>Estado</th></tr></thead>
                                <tbody>
                                    <tr v-for="m in histMatriculas" :key="m.idMatricula">
                                        <td>{{ m.codigo }}</td>
                                        <td>{{ m.ciclo || m.año || '—' }}</td>
                                        <td>
                                            <span class="badge" :class="m.estado==='Activo'?'bg-success':'bg-secondary'">
                                                {{ m.estado || 'Activo' }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <h6 class="fw-semibold text-body-secondary text-uppercase small mb-2">Materias inscritas</h6>
                            <div v-if="histInscripciones.length===0" class="text-body-secondary small">Sin inscripciones registradas.</div>
                            <div v-else class="d-flex flex-wrap gap-2">
                                <span v-for="i in histInscripciones" :key="i.idInscripcion"
                                      class="badge bg-primary fw-normal px-3 py-2 shadow-sm">
                                    <i class="bi bi-book me-1"></i>{{ i.materia }}
                                </span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

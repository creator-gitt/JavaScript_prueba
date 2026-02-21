// =============================================
// ADMIN — Gestión de Docentes
// =============================================

const docentesAdmin = {
    data() {
        return {
            docentes: [],
            filtro: '',
            cargando: false,
            editando: null,
            guardandoEdit: false,
            docenteDetalle: null,
            materiasDocente: []
        };
    },
    async mounted() { await this.cargar(); },
    computed: {
        docentesFiltrados() {
            const f = this.filtro.toLowerCase().trim();
            if (!f) return this.docentes;
            return this.docentes.filter(d =>
                (d.nombre || '').toLowerCase().includes(f) ||
                (d.codigo || '').toLowerCase().includes(f) ||
                (d.especialidad || '').toLowerCase().includes(f)
            );
        }
    },
    methods: {
        async cargar() {
            this.cargando = true;
            this.docentes = await db.docentes.orderBy('nombre').toArray();
            this.cargando = false;
        },
        estado(d) { return d.estado || 'activo'; },
        async generarToken(docente) {
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
            const token = `DOC-${randomPart}`;
            await db.docentes.update(docente.idDocente, { tokenAcceso: token });
            docente.tokenAcceso = token;
            alertify.alert('Token Generado', `El token para <b>${docente.nombre}</b> es:<br><h3 class="text-center text-primary mt-2">${token}</h3><p class="small text-muted text-center">Comparte este código con el docente para que pueda registrarse.</p>`);
        },
        async eliminar(docente) {
            alertify.confirm(
                'Eliminar Docente Definitivamente',
                `¿Estás seguro de ELIMINAR a <b>${docente.nombre}</b>?<br>Se borrarán su usuario y datos. Las materias asignadas quedarán sin docente.`,
                async () => {
                    try {
                        // 1. ELIMINAR CUENTA DE USUARIO (si tiene)
                        if (docente.usuarioId) {
                            await db.usuarios.delete(Number(docente.usuarioId));
                        } else {
                            // Fallback: buscar por código
                            const user = await db.usuarios.where('codigo').equalsIgnoreCase(docente.codigo).first();
                            if (user && user.rol === 'Docente') await db.usuarios.delete(user.id);
                        }

                        // 2. Desasignar materias (el campo en materias es docenteId)
                        const materiasAsignadas = await db.materias.where('docenteId').equals(String(docente.idDocente)).toArray();
                        for (const m of materiasAsignadas) {
                            await db.materias.update(m.idMateria, { docenteId: '' });
                        }

                        // 3. Eliminar docente
                        await db.docentes.delete(Number(docente.idDocente));

                        alertify.success('Docente y su cuenta oficial eliminados. Materias liberadas.');
                        await this.cargar();
                    } catch (e) {
                        console.error(e);
                        alertify.error('Error al eliminar: ' + e.message);
                    }
                },
                () => { }
            ).set('labels', { ok: 'Sí, ELIMINAR', cancel: 'Cancelar' });
        },
        async toggleEstado(docente) {
            const nuevo = this.estado(docente) === 'activo' ? 'inactivo' : 'activo';
            await db.docentes.update(docente.idDocente, { estado: nuevo });
            docente.estado = nuevo;
            alertify.success(`Docente ${nuevo === 'activo' ? 'activado' : 'desactivado'}.`);
        },
        abrirEditar(docente) {
            this.editando = { ...docente, foto: docente.foto || '' };
            this.abrirModal('modalEditarDocente');
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
            await db.docentes.update(this.editando.idDocente, {
                codigo: this.editando.codigo,
                nombre: this.editando.nombre,
                especialidad: this.editando.especialidad || '',
                email: this.editando.email || '',
                telefono: this.editando.telefono || '',
                escalafon: this.editando.escalafon || '',
                foto: this.editando.foto
            });
            await this.cargar();
            this.cerrarModal('modalEditarDocente');
            this.guardandoEdit = false;
            alertify.success('Docente actualizado.');
        },
        async verMaterias(docente) {
            this.docenteDetalle = docente;
            const todas = await db.materias.toArray();
            this.materiasDocente = todas.filter(m =>
                String(m.docenteId) === String(docente.idDocente) ||
                (m.docente || '').toLowerCase() === docente.nombre.toLowerCase()
            );
            this.abrirModal('modalMateriasDocente');
        },
        abrirModal(id) { new bootstrap.Modal(document.getElementById(id)).show(); },
        cerrarModal(id) { bootstrap.Modal.getInstance(document.getElementById(id))?.hide(); }
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-person-workspace me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Gestión de Docentes</h5>
                <button class="btn btn-sm btn-outline-secondary ms-auto" @click="cargar">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
            </div>

            <div class="mb-3" style="max-width:400px;">
                <div class="input-group shadow-sm">
                    <span class="input-group-text bg-body-secondary border-end-0"><i class="bi bi-search text-body-secondary"></i></span>
                    <input v-model="filtro" type="text" class="form-control border-start-0 bg-transparent"
                           placeholder="Buscar por nombre, código o especialidad...">
                    <button v-if="filtro" class="btn btn-outline-secondary" @click="filtro=''">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            </div>

            <div v-if="cargando" class="text-center py-4"><div class="spinner-border text-secondary"></div></div>
            <div v-else-if="docentes.length===0" class="text-center py-5 text-muted">
                <i class="bi bi-person-workspace fs-1 opacity-25"></i>
                <p class="mt-2">No hay docentes registrados.</p>
            </div>
            <div v-else class="card border-0 shadow-sm bg-body-tertiary">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 small">
                        <thead class="bg-body-secondary">
                            <tr>
                                <th style="width:50px;" class="text-body-secondary">Foto</th>
                                <th class="text-body-secondary">Código</th>
                                <th class="text-body-secondary">Nombre</th>
                                <th class="text-body-secondary">Especialidad</th>
                                <th class="text-body-secondary">Escalafón</th>
                                <th class="text-body-secondary">Email</th>
                                <th class="text-body-secondary">Estado</th>
                                <th class="text-body-secondary">Token</th>
                                <th class="text-end text-body-secondary">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="d in docentesFiltrados" :key="d.idDocente"
                                :class="estado(d)==='inactivo' ? 'table-light text-muted' : ''">
                                <td>
                                    <img :src="d.foto || 'https://via.placeholder.com/40?text=D'"
                                         class="rounded-circle border"
                                         style="width:36px; height:36px; object-fit: cover;">
                                </td>
                                <td class="fw-semibold">{{ d.codigo }}</td>
                                <td>{{ d.nombre }}</td>
                                <td>{{ d.especialidad || '—' }}</td>
                                <td><span class="badge bg-body-secondary text-body-secondary border border-secondary-subtle">{{ d.escalafon || '—' }}</span></td>
                                <td>{{ d.email || '—' }}</td>
                                <td>
                                    <span class="badge" :class="estado(d)==='activo' ? 'bg-success' : 'bg-secondary'">
                                        {{ estado(d)==='activo' ? 'Activo' : 'Inactivo' }}
                                    </span>
                                </td>
                                <td>
                                    <span v-if="d.tokenAcceso" class="badge bg-info text-dark font-monospace user-select-all" title="Click para seleccionar">{{ d.tokenAcceso }}</span>
                                    <span v-else class="text-muted small">—</span>
                                </td>
                                <td class="text-end">
                                    <div class="d-flex gap-1 justify-content-end">
                                        <button class="btn btn-sm btn-outline-primary" @click="abrirEditar(d)" title="Editar">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-sm" @click="toggleEstado(d)" title="Cambiar estado"
                                                :class="estado(d)==='activo' ? 'btn-outline-warning' : 'btn-outline-success'">
                                            <i :class="estado(d)==='activo' ? 'bi bi-person-slash' : 'bi bi-person-check'"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" @click="eliminar(d)" title="Eliminar definitivamente">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-info" @click="verMaterias(d)" title="Ver materias">
                                            <i class="bi bi-book"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-dark" @click="generarToken(d)" title="Generar Token de Acceso">
                                            <i class="bi bi-key"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="card-footer bg-transparent border-top-0 text-body-secondary small">
                    {{ docentesFiltrados.length }} de {{ docentes.length }} docentes
                </div>
            </div>

            <!-- Modal Editar -->
            <div class="modal fade" id="modalEditarDocente" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow bg-body-tertiary" v-if="editando">
                        <div class="modal-header bg-primary bg-opacity-75">
                            <h5 class="modal-title text-white"><i class="bi bi-pencil me-2"></i>Editar Docente</h5>
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
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Especialidad</label>
                                    <input v-model="editando.especialidad" class="form-control form-control-sm bg-transparent" placeholder="Ej. Matemáticas">
                                </div>
                                <div class="col-12">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Nombre completo *</label>
                                    <input v-model="editando.nombre" class="form-control form-control-sm bg-transparent" required>
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Email</label>
                                    <input v-model="editando.email" type="email" class="form-control form-control-sm bg-transparent">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Teléfono</label>
                                    <input v-model="editando.telefono" class="form-control form-control-sm bg-transparent">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-semibold text-body-secondary text-uppercase">Escalafón</label>
                                    <select v-model="editando.escalafon" class="form-select form-select-sm bg-transparent">
                                        <option value="">— Seleccionar —</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="profesor">Profesor</option>
                                        <option value="ingeniero">Licenciado / Ingeniero</option>
                                        <option value="maestria">Maestría</option>
                                        <option value="doctor">Doctor</option>
                                    </select>
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

            <!-- Modal Materias del Docente -->
            <div class="modal fade" id="modalMateriasDocente" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content border-0 shadow bg-body-tertiary" v-if="docenteDetalle">
                        <div class="modal-header bg-primary bg-opacity-75">
                            <h5 class="modal-title text-white">
                                <i class="bi bi-book me-2"></i>Materias — {{ docenteDetalle.nombre }}
                            </h5>
                            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div v-if="materiasDocente.length===0" class="text-body-secondary text-center py-3">
                                <i class="bi bi-book fs-2 opacity-25"></i>
                                <p class="mt-2 small">Este docente no tiene materias asignadas.</p>
                            </div>
                            <ul v-else class="list-group list-group-flush">
                                <li v-for="m in materiasDocente" :key="m.idMateria"
                                    class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="fw-semibold text-body">{{ m.nombre }}</div>
                                        <div class="text-body-secondary small">{{ m.codigo }}</div>
                                    </div>
                                    <span class="badge" :class="(m.estado||'habilitada')==='habilitada'?'bg-success':'bg-secondary'">
                                        {{ (m.estado||'habilitada')==='habilitada' ? 'Habilitada' : 'Deshabilitada' }}
                                    </span>
                                </li>
                            </ul>
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

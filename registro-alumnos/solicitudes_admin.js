// =============================================
// COMPONENTE: SOLICITUDES DE CUENTA (solo Admin)
// Muestra las solicitudes pendientes de
// registro enviadas por alumnos y docentes.
// El admin puede Aprobar o Rechazar cada una.
// =============================================
const solicitudes_admin = {
    data() {
        return {
            solicitudes: [],
            filtro: 'pendiente',   // 'pendiente' | 'aprobada' | 'rechazada' | 'todas'
            cargando: true,
            procesando: null,      // id de la solicitud que se está procesando
        };
    },
    async mounted() {
        await this.cargarSolicitudes();
    },
    computed: {
        solicitudesFiltradas() {
            if (this.filtro === 'todas') return this.solicitudes;
            return this.solicitudes.filter(s => s.estado === this.filtro);
        },
        totalPendientes() {
            return this.solicitudes.filter(s => s.estado === 'pendiente').length;
        }
    },
    methods: {
        async cargarSolicitudes() {
            this.cargando = true;
            // Ordenar por fecha descendente (las más recientes primero)
            const todas = await db.solicitudes.toArray();
            this.solicitudes = todas.sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
            this.cargando = false;
        },

        async aprobar(sol) {
            this.procesando = sol.id;
            try {
                // Verificar que el email no tenga ya una cuenta activa
                const yaExiste = await db.usuarios
                    .where('email').equals(sol.email)
                    .and(u => u.tipo === sol.tipo)
                    .first();

                if (yaExiste) {
                    alertify.warning('Este usuario ya tiene una cuenta activa.');
                    await db.solicitudes.update(sol.id, { estado: 'aprobada' });
                } else {
                    // Crear la cuenta en usuarios con la clave ya hasheada
                    await db.usuarios.add({
                        email: sol.email,
                        tipo: sol.tipo,
                        clave: sol.clave,
                        creadoEn: new Date().toISOString()
                    });
                    await db.solicitudes.update(sol.id, {
                        estado: 'aprobada',
                        revisadoEn: new Date().toISOString()
                    });
                    alertify.success(`✅ Cuenta aprobada para ${sol.email}`);
                }
                await this.cargarSolicitudes();
            } catch (e) {
                alertify.error('Error al aprobar la solicitud.');
                console.error(e);
            }
            this.procesando = null;
        },

        async rechazar(sol) {
            alertify.confirm(
                'Rechazar solicitud',
                `¿Seguro que deseas rechazar la solicitud de <strong>${sol.email}</strong>?`,
                async () => {
                    this.procesando = sol.id;
                    await db.solicitudes.update(sol.id, {
                        estado: 'rechazada',
                        revisadoEn: new Date().toISOString()
                    });
                    alertify.error(`❌ Solicitud de ${sol.email} rechazada.`);
                    await this.cargarSolicitudes();
                    this.procesando = null;
                },
                () => { }
            ).set('labels', { ok: 'Rechazar', cancel: 'Cancelar' });
        },

        fmtFecha(iso) {
            if (!iso) return '—';
            return new Date(iso).toLocaleString('es', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        },

        badgeEstado(estado) {
            return {
                pendiente: { clase: 'bg-warning text-dark', icono: 'bi-hourglass-split', label: 'Pendiente' },
                aprobada: { clase: 'bg-success', icono: 'bi-check-circle', label: 'Aprobada' },
                rechazada: { clase: 'bg-danger', icono: 'bi-x-circle', label: 'Rechazada' },
            }[estado] ?? { clase: 'bg-secondary', icono: 'bi-question', label: estado };
        },

        badgeTipo(tipo) {
            return tipo === 'alumno'
                ? { clase: 'bg-success', icono: 'bi-person-badge', label: 'Alumno' }
                : { clase: 'bg-primary', icono: 'bi-person-workspace', label: 'Docente' };
        }
    },

    template: `
    <div>
        <div class="d-flex align-items-center mb-3 border-bottom pb-2 gap-2">
            <i class="bi bi-person-check fs-5 text-secondary"></i>
            <h5 class="mb-0 fw-semibold">Solicitudes de Cuenta</h5>
            <span v-if="totalPendientes > 0"
                class="badge bg-warning text-dark ms-1 rounded-pill">
                {{ totalPendientes }} pendiente{{ totalPendientes > 1 ? 's' : '' }}
            </span>
        </div>

        <!-- Filtros -->
        <div class="d-flex gap-2 mb-3 flex-wrap">
            <button v-for="f in ['pendiente','aprobada','rechazada','todas']" :key="f"
                @click="filtro = f"
                class="btn btn-sm"
                :class="filtro === f ? 'text-white' : 'btn-outline-secondary'"
                :style="filtro === f ? 'background-color:#1a3a5c;border-color:#1a3a5c;' : ''">
                <i class="bi me-1"
                   :class="f==='pendiente' ? 'bi-hourglass-split'
                         : f==='aprobada'  ? 'bi-check-circle'
                         : f==='rechazada' ? 'bi-x-circle'
                         :                  'bi-list-ul'"></i>
                {{ f.charAt(0).toUpperCase() + f.slice(1) }}
                <span v-if="f==='pendiente' && totalPendientes > 0"
                    class="badge bg-warning text-dark ms-1">{{ totalPendientes }}</span>
            </button>
            <button @click="cargarSolicitudes" class="btn btn-sm btn-outline-success ms-auto" title="Actualizar">
                <i class="bi bi-arrow-clockwise"></i>
            </button>
        </div>

        <!-- Spinner -->
        <div v-if="cargando" class="text-center py-4 text-muted">
            <div class="spinner-border spinner-border-sm me-2"></div>Cargando solicitudes...
        </div>

        <!-- Sin resultados -->
        <div v-else-if="solicitudesFiltradas.length === 0"
            class="alert alert-light border text-muted text-center py-4" style="max-width:700px;">
            <i class="bi bi-inbox fs-2 d-block mb-2 opacity-50"></i>
            No hay solicitudes {{ filtro !== 'todas' ? '"' + filtro + '"' : '' }} por mostrar.
        </div>

        <!-- Lista de solicitudes -->
        <div v-else class="d-flex flex-column gap-3" style="max-width:700px;">
            <div v-for="s in solicitudesFiltradas" :key="s.id"
                class="card border-0 shadow-sm">
                <div class="card-body px-4 py-3">
                    <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">

                        <!-- Info de la solicitud -->
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="badge" :class="badgeTipo(s.tipo).clase">
                                    <i class="bi me-1" :class="badgeTipo(s.tipo).icono"></i>
                                    {{ badgeTipo(s.tipo).label }}
                                </span>
                                <span class="badge" :class="badgeEstado(s.estado).clase">
                                    <i class="bi me-1" :class="badgeEstado(s.estado).icono"></i>
                                    {{ badgeEstado(s.estado).label }}
                                </span>
                            </div>
                            <p class="mb-0 fw-semibold">{{ s.email }}</p>
                            <small class="text-muted">
                                <i class="bi bi-clock me-1"></i>Solicitado: {{ fmtFecha(s.creadoEn) }}
                                <span v-if="s.revisadoEn" class="ms-3">
                                    <i class="bi bi-check2 me-1"></i>Revisado: {{ fmtFecha(s.revisadoEn) }}
                                </span>
                            </small>
                        </div>

                        <!-- Botones (solo si pendiente) -->
                        <div v-if="s.estado === 'pendiente'" class="d-flex gap-2 align-items-center">
                            <button @click="aprobar(s)"
                                :disabled="procesando === s.id"
                                class="btn btn-sm btn-success px-3">
                                <span v-if="procesando === s.id">
                                    <span class="spinner-border spinner-border-sm"></span>
                                </span>
                                <span v-else>
                                    <i class="bi bi-check-lg me-1"></i>Aprobar
                                </span>
                            </button>
                            <button @click="rechazar(s)"
                                :disabled="procesando === s.id"
                                class="btn btn-sm btn-outline-danger px-3">
                                <i class="bi bi-x-lg me-1"></i>Rechazar
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};

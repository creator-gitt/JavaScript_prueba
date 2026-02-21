// =============================================
// ADMIN — Dashboard
// =============================================

const adminDashboard = {
    data() {
        return {
            stats: {
                alumnosActivos: 0, alumnosTotal: 0,
                docentesActivos: 0,
                materiasHabilitadas: 0, materiasTotal: 0,
                inscripcionesTotal: 0
            },
            cargando: true,
            mostrarSolicitudes: false,
            solicitudesPendientes: [],
            // Modal de token
            tokenModal: {
                fase: 'confirmar',  // 'confirmar' | 'resultado'
                solicitud: null,
                tokenGenerado: '',
                procesando: false
            }
        };
    },
    async mounted() { await this.cargar(); },
    methods: {
        async cargar() {
            this.cargando = true;
            try {
                const [alumnos, docentes, materias, inscripciones, periodos, solicitudes] = await Promise.all([
                    db.alumnos.toArray(),
                    db.docentes.toArray(),
                    db.materias.toArray(),
                    db.inscripciones.toArray(),
                    db.periodos.toArray(),
                    db.solicitudes.where('estado').equals('pendiente').toArray()
                ]);

                this.stats.alumnosTotal = alumnos.length;
                this.stats.alumnosActivos = alumnos.filter(a => (a.estado || 'activo') === 'activo').length;
                this.stats.docentesActivos = docentes.filter(d => (d.estado || 'activo') === 'activo').length;
                this.stats.materiasTotal = materias.length;
                this.stats.materiasHabilitadas = materias.filter(m => (m.estado || 'habilitada') === 'habilitada').length;
                this.stats.inscripcionesTotal = inscripciones.length;
                this.periodoActual = periodos.find(p => p.estado === 'abierto') || null;

                this.solicitudesPendientes = solicitudes;
            } finally {
                this.cargando = false;
            }
        },
        async depurarUsuarios() {
            // ... (código existente) ...
            alertify.confirm('Depurar Usuarios Fantasmas', 'Esta acción buscará y eliminará usuarios que quedaron huérfanos (sin perfil de Alumno o Docente asociado) debido a pruebas anteriores. ¿Deseas continuar?', async () => {
                let eliminados = 0;
                const usuarios = await db.usuarios.toArray();

                for (const u of usuarios) {
                    if (u.rol === 'Admin') continue;

                    let existe = false;
                    if (u.rol === 'Alumno') {
                        const porCodigo = u.codigo ? await db.alumnos.where('codigo').equalsIgnoreCase(u.codigo).count() : 0;
                        const porNombre = await db.alumnos.where('nombre').equalsIgnoreCase(u.username).count();
                        existe = (porCodigo > 0 || porNombre > 0);
                    } else if (u.rol === 'Docente') {
                        const porCodigo = u.codigo ? await db.docentes.where('codigo').equalsIgnoreCase(u.codigo).count() : 0;
                        const porNombre = await db.docentes.where('nombre').equalsIgnoreCase(u.username).count();
                        existe = (porCodigo > 0 || porNombre > 0);
                    }

                    if (!existe) {
                        await db.usuarios.delete(u.id);
                        eliminados++;
                    }
                }

                if (eliminados > 0) {
                    alertify.success(`Se eliminaron ${eliminados} usuarios fantasmas.`);
                } else {
                    alertify.message('No se encontraron usuarios fantasmas. Todo limpio.');
                }
            }, () => { }).set('labels', { ok: 'Sí, Depurar', cancel: 'Cancelar' });
        },

        // ── RESTAURAR DATOS ESENCIALES (Schema v9 relacional) ─────────
        async restaurarDatosEsenciales() {
            alertify.confirm(
                '🔄 Restaurar Datos Esenciales',
                `Esto creará (sin duplicar si ya existe):<br>
                <ul class="text-start mt-2 mb-0 small">
                    <li><b>Cuenta Admin</b> (usuario: <code>Admin</code>, pwd: <code>Admin2026!</code>)</li>
                    <li>Carrera <b>Ing. en Sistemas</b></li>
                    <li>Pîríodo activo <b>01-2026</b></li>
                    <li>Docente <b>D-001</b> + cuenta vinculada</li>
                    <li>Alumno <b>A-001</b> + cuenta vinculada</li>
                    <li>Materia <b>MAT-001</b> asignada al docente</li>
                    <li>Mátricúla de ejemplo del alumno A-001</li>
                </ul><br>
                Los códigos existentes <b>no se duplican</b>. ¿Continuar?`,
                async () => {
                    try {
                        const log = [];
                        const hash = async pwd => {
                            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pwd));
                            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
                        };

                        // 1. Cuenta Admin
                        let adminUser = await db.usuarios.where('username').equalsIgnoreCase('Admin').first();
                        if (!adminUser) {
                            const id = await db.usuarios.add({ username: 'Admin', codigo: '', email: 'admin@universidad.edu', hashPwd: await hash('Admin2026!'), rol: 'Admin', estado: 'activo' });
                            adminUser = await db.usuarios.get(id);
                            log.push('✅ Cuenta Admin creada');
                        } else { log.push('⏭ Cuenta Admin ya existe'); }

                        // 2. Carrera (FK base para alumnos y materias)
                        let carrera = await db.carreras.where('codigo').equalsIgnoreCase('ISI').first();
                        if (!carrera) {
                            const id = await db.carreras.add({ codigo: 'ISI', nombre: 'Ingeniería en Sistemas Informáticos', facultad: 'Ing. y Arquitectura', estado: 'activo' });
                            carrera = await db.carreras.get(id);
                            log.push('✅ Carrera ISI creada');
                        } else { log.push('⏭ Carrera ISI ya existe'); }

                        // 3. Período activo (FK para matrículas)
                        let periodo = await db.periodos.filter(p => p.ciclo === '01' && String(p.año) === '2026').first();
                        if (!periodo) {
                            const id = await db.periodos.add({ año: '2026', ciclo: '01', estado: 'abierto' });
                            periodo = await db.periodos.get(id);
                            log.push('✅ Período 01-2026 creado');
                        } else { log.push('⏭ Período ya existe'); }

                        // 4. Docente D-001 + cuenta (usuarioId FK)
                        let docente = await db.docentes.where('codigo').equalsIgnoreCase('D-001').first();
                        if (!docente) {
                            let userDoc = await db.usuarios.where('codigo').equalsIgnoreCase('D-001').first();
                            if (!userDoc) {
                                const uid = await db.usuarios.add({ username: 'Docente Ejemplo', codigo: 'D-001', email: 'docente@universidad.edu', hashPwd: await hash('Docente2026!'), rol: 'Docente', estado: 'activo' });
                                userDoc = await db.usuarios.get(uid);
                            }
                            const did = await db.docentes.add({ codigo: 'D-001', nombre: 'Docente Ejemplo', especialidad: 'Sistemas Informáticos', email: 'docente@universidad.edu', foto: '', telefono: '', usuarioId: userDoc.id, estado: 'activo', tokenAcceso: '' });
                            docente = await db.docentes.get(did);
                            log.push('✅ Docente D-001 + cuenta creados');
                        } else { log.push('⏭ Docente D-001 ya existe'); }

                        // 5. Alumno A-001 + cuenta (usuarioId FK + carreraId FK)
                        let alumno = await db.alumnos.where('codigo').equalsIgnoreCase('A-001').first();
                        if (!alumno) {
                            let userAlum = await db.usuarios.where('codigo').equalsIgnoreCase('A-001').first();
                            if (!userAlum) {
                                const uid = await db.usuarios.add({ username: 'Alumno Ejemplo', codigo: 'A-001', email: 'alumno@universidad.edu', hashPwd: await hash('Alumno2026!'), rol: 'Alumno', estado: 'activo' });
                                userAlum = await db.usuarios.get(uid);
                            }
                            const aid = await db.alumnos.add({ codigo: 'A-001', nombre: 'Alumno Ejemplo', email: 'alumno@universidad.edu', foto: '', telefono: '', direccion: '', usuarioId: userAlum.id, carreraId: carrera.idCarrera, _carreraNombre: carrera.nombre, estado: 'activo', tokenAcceso: '' });
                            alumno = await db.alumnos.get(aid);
                            log.push('✅ Alumno A-001 + cuenta creados');
                        } else { log.push('⏭ Alumno A-001 ya existe'); }

                        // 6. Materia (docenteId + carreraId FKs)
                        let materia = await db.materias.where('codigo').equalsIgnoreCase('MAT-001').first();
                        if (!materia) {
                            await db.materias.add({ codigo: 'MAT-001', nombre: 'Matemática I', docenteId: docente.idDocente, _docenteNombre: docente.nombre, carreraId: carrera.idCarrera, _carreraNombre: carrera.nombre, estado: 'activo' });
                            log.push('✅ Materia MAT-001 creada');
                        } else { log.push('⏭ Materia MAT-001 ya existe'); }

                        // 7. Matrícula (alumnoId + periodoId + carreraId FKs)
                        const existeMatricula = await db.matricula.where('alumnoId').equals(alumno.idAlumno).filter(m => m.periodoId === periodo.idPeriodo).first();
                        if (!existeMatricula) {
                            await db.matricula.add({
                                codigo: 'MATR001',
                                alumnoId: alumno.idAlumno,
                                _alumnoNombre: alumno.nombre,
                                carreraId: carrera.idCarrera,
                                _carreraNombre: carrera.nombre,
                                periodoId: periodo.idPeriodo,
                                _periodoCiclo: periodo.ciclo + ' - ' + periodo.año,
                                estado: 'Activo',
                                fechaCreacion: new Date().toISOString()
                            });
                            log.push('✅ Matrícula de A-001 creada');
                        } else { log.push('⏭ Matrícula ya existe'); }

                        await this.cargar();
                        alertify.alert('✅ Restauración Completada',
                            '<ul class="text-start small">' + log.map(i => `<li>${i}</li>`).join('') + '</ul>' +
                            '<hr class="my-2"><small class="text-muted">Credenciales seed:<br>Admin: <code>Admin / Admin2026!</code><br>Docente: <code>Docente Ejemplo / Docente2026!</code><br>Alumno: <code>Alumno Ejemplo / Alumno2026!</code></small>'
                        );
                    } catch (e) {
                        alertify.error('Error al restaurar: ' + e.message);
                        console.error(e);
                    }
                },
                () => { }
            ).set('labels', { ok: 'Sí, Restaurar', cancel: 'Cancelar' });
        },
        verSolicitudes() {
            this.mostrarSolicitudes = !this.mostrarSolicitudes;
            if (this.mostrarSolicitudes) {
                // Recargar solicitudes para asegurar datos frescos
                db.solicitudes.where('estado').equals('pendiente').toArray().then(s => this.solicitudesPendientes = s);
            }
        },
        // Abre el modal de confirmación para generar token
        abrirModalToken(solicitud) {
            this.tokenModal.solicitud = solicitud;
            this.tokenModal.fase = 'confirmar';
            this.tokenModal.tokenGenerado = '';
            this.tokenModal.procesando = false;
            new bootstrap.Modal(document.getElementById('modalGenerarToken')).show();
        },
        // Ejecuta la generación del token (llamado desde el modal)
        async confirmarGenerarToken() {
            const solicitud = this.tokenModal.solicitud;
            this.tokenModal.procesando = true;

            try {
                // 1. Determinar tabla por prefijo del código (A- = Alumno, D- = Docente)
                const codigoUpper = (solicitud.codigo || '').toUpperCase();
                const esAlumno = codigoUpper.startsWith('A-');
                const esDocente = codigoUpper.startsWith('D-');

                if (!esAlumno && !esDocente) {
                    alertify.error(`El código "${solicitud.codigo}" no tiene un prefijo válido (debe empezar con A- o D-).`);
                    this.tokenModal.procesando = false;
                    return;
                }

                // 2. Buscar perfil en la tabla correcta según prefijo
                let perfil = null;
                if (esAlumno) {
                    perfil = await db.alumnos.where('codigo').equalsIgnoreCase(solicitud.codigo).first();
                } else {
                    perfil = await db.docentes.where('codigo').equalsIgnoreCase(solicitud.codigo).first();
                }

                // 3. Si el perfil NO existe, mostrar aviso en el modal y detener
                if (!perfil) {
                    this.tokenModal.fase = 'sin-perfil';
                    this.tokenModal.procesando = false;
                    return;
                }

                // 4. Generar token con prefijo correcto
                const prefix = esAlumno ? 'ALU-' : 'DOC-';
                const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
                const token = `${prefix}${randomPart}`;

                // 5. Guardar token en el perfil usando update()
                if (esAlumno) {
                    await db.alumnos.update(perfil.idAlumno, { tokenAcceso: token });
                } else {
                    await db.docentes.update(perfil.idDocente, { tokenAcceso: token });
                }

                // 6. Eliminar la solicitud de la BD
                await db.solicitudes.delete(solicitud.id);
                this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== solicitud.id);

                // 7. Mostrar el token en el mismo modal
                this.tokenModal.tokenGenerado = token;
                this.tokenModal.fase = 'resultado';
            } catch (e) {
                alertify.error('Error al generar token: ' + e.message);
                console.error('confirmarGenerarToken error:', e);
            } finally {
                this.tokenModal.procesando = false;
            }
        },
        cerrarModalToken() {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalGenerarToken'));
            if (modal) modal.hide();
        },
        copiarToken() {
            navigator.clipboard.writeText(this.tokenModal.tokenGenerado)
                .then(() => alertify.success('Token copiado al portapapeles.'))
                .catch(() => alertify.error('No se pudo copiar.'));
        },
        // Crea el perfil (docente/alumno) y genera el token en un solo paso
        async crearPerfilYGenerarToken() {
            const solicitud = this.tokenModal.solicitud;
            this.tokenModal.procesando = true;

            try {
                const codigoUpper = (solicitud.codigo || '').toUpperCase();
                const esAlumno = codigoUpper.startsWith('A-');

                // Generar token
                const prefix = esAlumno ? 'ALU-' : 'DOC-';
                const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
                const token = `${prefix}${randomPart}`;

                if (esAlumno) {
                    await db.alumnos.add({
                        codigo: solicitud.codigo,
                        nombre: solicitud.nombre,
                        email: '',
                        carrera: '',
                        carreraId: '',
                        foto: '',
                        telefono: '',
                        direccion: '',
                        estado: 'activo',
                        tokenAcceso: token
                    });
                } else {
                    await db.docentes.add({
                        codigo: solicitud.codigo,
                        nombre: solicitud.nombre,
                        email: '',
                        especialidad: '',
                        foto: '',
                        telefono: '',
                        estado: 'activo',
                        tokenAcceso: token
                    });
                }

                // Eliminar la solicitud
                await db.solicitudes.delete(solicitud.id);
                this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== solicitud.id);

                // Mostrar token en el modal
                this.tokenModal.tokenGenerado = token;
                this.tokenModal.fase = 'resultado';

            } catch (e) {
                alertify.error('Error al crear perfil: ' + e.message);
                console.error('crearPerfilYGenerarToken error:', e);
            } finally {
                this.tokenModal.procesando = false;
            }
        },
        async declinarSolicitud(solicitud) {
            alertify.confirm(
                '🚫 Declinar Solicitud',
                `¿Deseas <b>rechazar</b> la solicitud de <b>${solicitud.nombre}</b> (${solicitud.codigo})?<br>Esta acción la eliminará permanentemente.`,
                async () => {
                    await db.solicitudes.delete(solicitud.id);
                    this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== solicitud.id);
                    alertify.error(`Solicitud de ${solicitud.nombre} rechazada.`);
                },
                () => { }
            ).set('labels', { ok: 'Sí, Rechazar', cancel: 'Cancelar' });
        }
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-4 border-bottom pb-2">
                <i class="bi bi-speedometer2 me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Dashboard</h5>
                <button class="btn btn-sm btn-outline-secondary ms-auto" @click="cargar">
                    <i class="bi bi-arrow-clockwise"></i>
                </button>
            </div>

            <div v-if="cargando" class="text-center py-5">
                <div class="spinner-border text-secondary"></div>
            </div>

            <div v-else>
                <!-- Período activo -->
                <div class="alert d-flex align-items-center gap-3 mb-4"
                     :class="periodoActual ? 'alert-success' : 'alert-warning'">
                    <i :class="periodoActual ? 'bi bi-calendar-check-fill' : 'bi bi-calendar-x-fill'" class="fs-4"></i>
                    <div>
                        <div class="fw-semibold">
                            {{ periodoActual ? 'Período de matrícula ABIERTO' : 'Sin período de matrícula activo' }}
                        </div>
                        <small v-if="periodoActual">
                            Ciclo {{ periodoActual.ciclo }} — {{ periodoActual.año }}
                        </small>
                        <small v-else>Ve a <strong>Períodos</strong> para abrir uno.</small>
                    </div>
                </div>

                <!-- Cards de estadísticas -->
                <div class="row g-3 mb-4">
                    <div class="col-sm-6 col-xl-3">
                        <div class="card border-0 shadow-sm h-100 bg-body-tertiary">
                            <div class="card-body">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10"
                                         style="width:48px;height:48px;">
                                        <i class="bi bi-person-badge text-primary fs-5"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold fs-4 lh-1 text-body">{{ stats.alumnosActivos }}</div>
                                        <div class="text-body-secondary small">Alumnos activos</div>
                                    </div>
                                </div>
                                <div class="mt-2 text-body-secondary" style="font-size:.75rem;">
                                    {{ stats.alumnosTotal - stats.alumnosActivos }} inactivos · {{ stats.alumnosTotal }} total
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card border-0 shadow-sm h-100 bg-body-tertiary">
                            <div class="card-body">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-10"
                                         style="width:48px;height:48px;">
                                        <i class="bi bi-person-workspace text-success fs-5"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold fs-4 lh-1 text-body">{{ stats.docentesActivos }}</div>
                                        <div class="text-body-secondary small">Docentes activos</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card border-0 shadow-sm h-100 bg-body-tertiary">
                            <div class="card-body">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="rounded-circle d-flex align-items-center justify-content-center bg-warning bg-opacity-10"
                                         style="width:48px;height:48px;">
                                        <i class="bi bi-book text-warning fs-5"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold fs-4 lh-1 text-body">{{ stats.materiasHabilitadas }}</div>
                                        <div class="text-body-secondary small">Materias habilitadas</div>
                                    </div>
                                </div>
                                <div class="mt-2 text-body-secondary" style="font-size:.75rem;">
                                    {{ stats.materiasTotal }} registradas en total
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-xl-3">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-body">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="rounded-circle d-flex align-items-center justify-content-center"
                                         style="width:48px;height:48px;background:#fce8f3;">
                                        <i class="bi bi-pencil-square text-danger fs-5"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold fs-4 lh-1">{{ stats.inscripcionesTotal }}</div>
                                        <div class="text-muted small">Inscripciones totales</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Accesos Rápidos y Mantenimiento -->
                <div class="row mb-4">
                    <div class="col-md-12">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                                <div>
                                    <h5 class="card-title fw-bold text-secondary mb-1">Mantenimiento Global</h5>
                                    <p class="text-muted small mb-0">Herramientas & Solicitudes pendientes.</p>
                                </div>
                                <div class="d-flex gap-2 flex-wrap">
                                    <button class="btn btn-success" @click="restaurarDatosEsenciales">
                                        <i class="bi bi-arrow-counterclockwise me-2"></i>Restaurar Datos
                                    </button>
                                    <button class="btn btn-primary" @click="verSolicitudes">
                                        <i class="bi bi-envelope-paper me-2"></i>Ver Solicitudes
                                    </button>
                                    <button class="btn btn-outline-danger" @click="depurarUsuarios">
                                        <i class="bi bi-tools me-2"></i>Depurar Usuarios
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sección de Solicitudes Pendientes (Toggle) -->
                <div v-if="mostrarSolicitudes" class="row mb-4 animate__animated animate__fadeIn">
                    <div class="col-12">
                        <div class="card border-primary shadow-sm bg-primary bg-opacity-10">
                            <div class="card-header bg-transparent border-primary border-opacity-25 fw-bold text-primary d-flex justify-content-between align-items-center">
                                <span><i class="bi bi-envelope-paper me-2"></i>Solicitudes de Token Pendientes</span>
                                <button class="btn btn-sm btn-close" @click="mostrarSolicitudes = false"></button>
                            </div>
                            <div class="card-body p-0">
                                <div v-if="solicitudesPendientes.length === 0" class="p-4 text-center text-muted">
                                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                                    No hay solicitudes pendientes en este momento.
                                </div>
                                <div v-else class="list-group list-group-flush">
                                    <div v-for="s in solicitudesPendientes" :key="s.id" class="list-group-item bg-transparent d-flex justify-content-between align-items-center p-3">
                                        <div>
                                            <div class="fw-bold fs-5 text-dark">
                                                {{ s.nombre }}
                                                <span class="badge rounded-pill ms-2" :class="s.tipo === 'Docente' ? 'bg-success' : 'bg-primary'">{{ s.tipo }}</span>
                                            </div>
                                            <div class="small text-muted mt-1">
                                                <i class="bi bi-card-text me-1"></i>Código: <strong>{{ s.codigo }}</strong>
                                                <span class="mx-2">|</span>
                                                <i class="bi bi-clock me-1"></i>{{ s.fecha }}
                                            </div>
                                        </div>
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-success shadow-sm" @click="abrirModalToken(s)" title="Aprobar y generar token">
                                                <i class="bi bi-key me-1"></i>Generar Token
                                            </button>
                                            <button class="btn btn-outline-danger shadow-sm" @click="declinarSolicitud(s)" title="Rechazar solicitud">
                                                <i class="bi bi-x-lg me-1"></i>Declinar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ===== MODAL GENERAR TOKEN ===== -->
                <div class="modal fade" id="modalGenerarToken" tabindex="-1" aria-labelledby="modalGenerarTokenLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 shadow-lg" v-if="tokenModal.solicitud">

                            <!-- FASE 1: Confirmación -->
                            <template v-if="tokenModal.fase === 'confirmar'">
                                <div class="modal-header bg-primary bg-opacity-75">
                                    <h5 class="modal-title text-white" id="modalGenerarTokenLabel">
                                        <i class="bi bi-key me-2"></i>Generar Token de Acceso
                                    </h5>
                                    <button type="button" class="btn-close btn-close-white" @click="cerrarModalToken"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="d-flex align-items-center gap-3 mb-3 p-3 rounded bg-body-secondary">
                                        <span class="badge fs-6 px-3 py-2 shadow-sm" :class="tokenModal.solicitud.tipo==='Docente' ? 'bg-success' : 'bg-primary'">
                                            {{ tokenModal.solicitud.tipo }}
                                        </span>
                                        <div>
                                            <div class="fw-bold text-body">{{ tokenModal.solicitud.nombre }}</div>
                                            <div class="text-body-secondary small">Código: {{ tokenModal.solicitud.codigo }}</div>
                                        </div>
                                    </div>
                                    <p class="mb-0 text-body-secondary small">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Se generará un token único para este usuario. Si ya existe un perfil con este código, se actualizará su token. Si no existe, se creará un nuevo perfil.
                                    </p>
                                </div>
                                <div class="modal-footer">
                                    <button class="btn btn-secondary" @click="cerrarModalToken" :disabled="tokenModal.procesando">Cancelar</button>
                                    <button class="btn btn-success fw-semibold" @click="confirmarGenerarToken" :disabled="tokenModal.procesando">
                                        <span v-if="tokenModal.procesando" class="spinner-border spinner-border-sm me-1"></span>
                                        <i v-else class="bi bi-key me-1"></i>
                                        {{ tokenModal.procesando ? 'Generando...' : 'Sí, Generar Token' }}
                                    </button>
                                </div>
                            </template>

                            <!-- FASE 2: Resultado con el token -->
                            <template v-if="tokenModal.fase === 'resultado'">
                                <div class="modal-header border-0" style="background:#198754;">
                                    <h5 class="modal-title text-white">
                                        <i class="bi bi-check-circle me-2"></i>Token Generado Exitosamente
                                    </h5>
                                    <button type="button" class="btn-close btn-close-white" @click="cerrarModalToken"></button>
                                </div>
                                <div class="modal-body text-center py-4">
                                    <p class="mb-1 text-muted">Token para <strong>{{ tokenModal.solicitud.nombre }}</strong>:</p>
                                    <div class="p-4 my-3 rounded-3 position-relative" style="background:#f0f9ff; border: 2.5px dashed #0d6efd;">
                                        <span class="fw-bold font-monospace user-select-all" style="font-size:1.8rem; letter-spacing:3px; color:#0d6efd;">
                                            {{ tokenModal.tokenGenerado }}
                                        </span>
                                    </div>
                                    <p class="text-muted small mb-0">
                                        <i class="bi bi-clipboard me-1"></i>
                                        Copia este código y entrégalo al usuario para que pueda registrarse.
                                    </p>
                                </div>
                                <div class="modal-footer border-0 justify-content-center gap-2">
                                    <button class="btn btn-outline-primary" @click="copiarToken">
                                        <i class="bi bi-clipboard me-1"></i>Copiar Token
                                    </button>
                                    <button class="btn btn-success" @click="cerrarModalToken">
                                        <i class="bi bi-check me-1"></i>Listo
                                    </button>
                                </div>
                            </template>

                            <!-- FASE 3: Perfil no encontrado -->
                            <template v-if="tokenModal.fase === 'sin-perfil'">
                                <div class="modal-header border-0" style="background:#fd7e14;">
                                    <h5 class="modal-title text-white">
                                        <i class="bi bi-person-plus me-2"></i>Perfil No Existe — ¿Crear ahora?
                                    </h5>
                                    <button type="button" class="btn-close btn-close-white" @click="cerrarModalToken"></button>
                                </div>
                                <div class="modal-body text-center py-4">
                                    <i class="bi bi-person-plus-fill text-warning" style="font-size:3rem;"></i>
                                    <p class="mt-3 fw-semibold">
                                        No existe perfil con el código <code>{{ tokenModal.solicitud.codigo }}</code>.
                                    </p>
                                    <div class="alert alert-warning text-start py-2 px-3 small mb-3">
                                        <i class="bi bi-info-circle me-1"></i>
                                        Puedes <strong>crear el perfil automáticamente</strong> desde aquí usando los datos de la solicitud, 
                                        y se generará el token al mismo tiempo. El perfil podrá completarse después desde el panel de 
                                        <strong>{{ tokenModal.solicitud.codigo.toUpperCase().startsWith('D-') ? 'Docentes' : 'Alumnos' }}</strong>.
                                    </div>
                                    <div class="border rounded p-3 text-start small bg-light mb-0">
                                        <div><strong>Nombre:</strong> {{ tokenModal.solicitud.nombre }}</div>
                                        <div><strong>Código:</strong> {{ tokenModal.solicitud.codigo }}</div>
                                        <div><strong>Tipo:</strong> {{ tokenModal.solicitud.tipo }}</div>
                                    </div>
                                </div>
                                <div class="modal-footer border-0 justify-content-center gap-2">
                                    <button class="btn btn-secondary" @click="cerrarModalToken" :disabled="tokenModal.procesando">
                                        Cancelar
                                    </button>
                                    <button class="btn btn-warning fw-semibold" @click="crearPerfilYGenerarToken" :disabled="tokenModal.procesando">
                                        <span v-if="tokenModal.procesando" class="spinner-border spinner-border-sm me-1"></span>
                                        <i v-else class="bi bi-person-check me-1"></i>
                                        {{ tokenModal.procesando ? 'Creando...' : 'Crear Perfil y Generar Token' }}
                                    </button>
                                </div>
                            </template>

                        </div>
                    </div>
                </div>
                <!-- ============================= -->

                <!-- Jerarquía institucional -->
                <div class="card border-0 shadow-sm bg-body-tertiary">
                    <div class="card-header bg-transparent border-bottom fw-semibold small text-uppercase text-body-secondary">
                        <i class="bi bi-diagram-3 me-1"></i>Flujo institucional
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-wrap align-items-center gap-2 justify-content-center">
                            <span class="badge bg-danger fs-6 px-3 py-2 shadow-sm">Admin</span>
                            <i class="bi bi-arrow-right text-body-secondary"></i>
                            <span class="badge bg-success px-3 py-2 shadow-sm">Gestiona Docentes</span>
                            <i class="bi bi-arrow-right text-body-secondary"></i>
                            <span class="badge bg-warning text-dark px-3 py-2 shadow-sm">Crea Materias</span>
                            <i class="bi bi-arrow-right text-body-secondary"></i>
                            <span class="badge bg-info text-dark px-3 py-2 shadow-sm">Abre Período</span>
                            <i class="bi bi-arrow-right text-body-secondary"></i>
                            <span class="badge bg-primary px-3 py-2 shadow-sm">Alumno se matricula</span>
                            <i class="bi bi-arrow-right text-body-secondary"></i>
                            <span class="badge bg-secondary px-3 py-2 shadow-sm">Se inscribe en materias</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

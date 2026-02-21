// =============================================
// Mi Perfil — Portal Alumno
// =============================================
const miPerfil = {
    data() {
        return {
            cargando: true,
            guardando: false,
            // Datos del perfil
            perfil: { nombre: '', email: '', telefono: '', direccion: '', codigo: '', carrera: '', foto: '' },
            imagenRecortar: '',
            cropper: null,
            // Cambio de contraseña
            pwd: { actual: '', nueva: '', confirmar: '', mostrarActual: false, mostrarNueva: false },
            cambiandoPwd: false,
            // Usuarios record id
            _userId: null,
            _alumnoId: null,
        };
    },
    async mounted() {
        await this.cargar();
    },
    methods: {
        async hashPassword(pwd) {
            const data = new TextEncoder().encode(pwd);
            const buf = await crypto.subtle.digest('SHA-256', data);
            return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        },
        async cargar() {
            this.cargando = true;
            try {
                const s = JSON.parse(sessionStorage.getItem('sesionUniversidad') || '{}');
                const username = s.username || '';
                const codigo = s.codigo || '';

                // Cargar usuario
                const usuario = await db.usuarios.where('username').equals(username).first();
                if (usuario) {
                    this._userId = usuario.id;
                    this.perfil.email = usuario.email || '';
                }
                // Cargar perfil alumno
                let alumno = null;
                if (codigo) alumno = await db.alumnos.where('codigo').equals(codigo).first();
                if (!alumno && username) {
                    const todos = await db.alumnos.toArray();
                    alumno = todos.find(a =>
                        (a.nombre || '').toLowerCase().includes(username.toLowerCase()) ||
                        username.toLowerCase().includes((a.nombre || '').split(' ')[0].toLowerCase())
                    ) || null;
                }
                if (alumno) {
                    this._alumnoId = alumno.idAlumno;
                    this.perfil.nombre = alumno.nombre || '';
                    this.perfil.telefono = alumno.telefono || '';
                    this.perfil.direccion = alumno.direccion || '';
                    this.perfil.codigo = alumno.codigo || '';
                    this.perfil.carrera = alumno.carrera || '';
                    this.perfil.foto = alumno.foto || '';
                    if (!this.perfil.email) this.perfil.email = alumno.email || '';
                }
            } finally {
                this.cargando = false;
            }
        },
        seleccionarFoto(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) { // 2MB limit for upload (before crop)
                alertify.error('La imagen es muy pesada (máx 2MB).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagenRecortar = e.target.result;
                this.abrirModalRecorte();
            };
            reader.readAsDataURL(file);
            event.target.value = ''; // Reset input
        },
        abrirModalRecorte() {
            const modalEl = document.getElementById('modalRecorteFoto');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();

            // Init Cropper
            const image = document.getElementById('img-recortar');
            if (this.cropper) { this.cropper.destroy(); }

            modalEl.addEventListener('shown.bs.modal', () => {
                this.cropper = new Cropper(image, {
                    aspectRatio: 1,
                    viewMode: 1,
                    autoCropArea: 1,
                });
            }, { once: true });
        },
        async guardarFotoRecortada() {
            if (!this.cropper) return;

            // Get cropped canvas
            const canvas = this.cropper.getCroppedCanvas({
                width: 300,
                height: 300,
                fillColor: '#fff'
            });

            const fotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
            this.perfil.foto = fotoBase64;

            // Guardar inmediatamente en BD
            try {
                if (this._alumnoId) {
                    await db.alumnos.update(this._alumnoId, { foto: fotoBase64 });

                    // Actualizar SessionStorage (sin la foto)
                    const stored = sessionStorage.getItem('sesionUniversidad');
                    if (stored) {
                        const s = JSON.parse(stored);
                        sessionStorage.setItem('sesionUniversidad', JSON.stringify(s));
                    }

                    this.$emit('foto-cambiada', fotoBase64);

                    alertify.success('Foto actualizada correctamente.');
                    bootstrap.Modal.getInstance(document.getElementById('modalRecorteFoto')).hide();
                } else {
                    console.error('No se encontró ID de alumno para actualizar foto.');
                    alertify.error('Error: No se encuentra el registro del alumno. Recarga la página.');
                }
            } catch (e) {
                console.error(e);
                alertify.error('Error al guardar la foto en BD: ' + e.message);
            }
        },
        async guardar() {
            if (!this.perfil.nombre.trim()) { alertify.error('El nombre es obligatorio.'); return; }
            this.guardando = true;
            try {
                if (this._alumnoId) {
                    await db.alumnos.update(this._alumnoId, {
                        nombre: this.perfil.nombre.trim(),
                        email: this.perfil.email.trim(),
                        telefono: this.perfil.telefono.trim(),
                        direccion: this.perfil.direccion.trim(),
                        foto: this.perfil.foto
                    });
                }
                if (this._userId) {
                    await db.usuarios.update(this._userId, { email: this.perfil.email.trim() });
                }
                // Actualizar sesión
                const s = JSON.parse(sessionStorage.getItem('sesionUniversidad') || '{}');
                sessionStorage.setItem('sesionUniversidad', JSON.stringify({ ...s }));
                alertify.success('✅ Perfil actualizado correctamente.');
            } catch (e) {
                alertify.error('Error al guardar: ' + e.message);
            } finally {
                this.guardando = false;
            }
        },
        async cambiarPassword() {
            if (!this.pwd.actual) { alertify.error('Ingresa tu contraseña actual.'); return; }
            if (this.pwd.nueva.length < 6) { alertify.error('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
            if (this.pwd.nueva !== this.pwd.confirmar) { alertify.error('Las contraseñas no coinciden.'); return; }
            this.cambiandoPwd = true;
            try {
                const usuario = await db.usuarios.get(this._userId);
                const hashActual = await this.hashPassword(this.pwd.actual);
                if (!usuario || usuario.hashPwd !== hashActual) {
                    alertify.error('La contraseña actual es incorrecta.'); return;
                }
                const hashNueva = await this.hashPassword(this.pwd.nueva);
                await db.usuarios.update(this._userId, { hashPwd: hashNueva });
                this.pwd = { actual: '', nueva: '', confirmar: '', mostrarActual: false, mostrarNueva: false };
                alertify.success('🔑 Contraseña actualizada correctamente.');
            } catch (e) {
                alertify.error('Error: ' + e.message);
            } finally {
                this.cambiandoPwd = false;
            }
        }
    },
    template: `
    <div>
        <div class="d-flex align-items-center mb-3 border-bottom pb-2">
            <i class="bi bi-person-circle me-2 fs-5 text-body-secondary"></i>
            <h5 class="mb-0 fw-semibold text-body">Mi Perfil</h5>
        </div>

        <div v-if="cargando" class="text-center py-5"><div class="spinner-border text-secondary"></div></div>
        <div v-else class="row g-4">

            <!-- Datos personales -->
            <div class="col-lg-7">
                <div class="card border-0 shadow-sm bg-body-tertiary">
                    <div class="card-header bg-transparent fw-bold border-bottom py-3">
                        <i class="bi bi-person me-2 text-primary"></i>Datos Personales
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <!-- FOTO DE PERFIL -->
                            <div class="col-12 text-center mb-3">
                                <div class="position-relative d-inline-block">
                                    <img :src="perfil.foto || 'https://via.placeholder.com/150?text=Foto'"
                                         class="rounded-circle border border-2 border-primary-subtle"
                                         style="width:120px; height:120px; object-fit: cover;">
                                    <label class="position-absolute bottom-0 end-0 bg-body shadow-sm border rounded-circle p-2"
                                           style="cursor:pointer; width:38px; height:38px; display:flex; align-items:center; justify-content:center;" title="Cambiar foto">
                                        <i class="bi bi-camera-fill text-primary"></i>
                                        <input type="file" class="d-none" accept="image/*" @change="seleccionarFoto">
                                    </label>
                                </div>
                            </div>

                            <div class="col-sm-6">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Código de Alumno</label>
                                <input :value="perfil.codigo" class="form-control form-control-sm bg-body-secondary border-secondary-subtle" readonly>
                                <div class="form-text text-body-secondary">Asignado por el administrador.</div>
                            </div>
                            <div class="col-sm-6">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Carrera</label>
                                <input :value="perfil.carrera || '—'" class="form-control form-control-sm bg-body-secondary border-secondary-subtle" readonly>
                                <div class="form-text text-body-secondary">Asignada por el administrador.</div>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Nombre completo *</label>
                                <input v-model="perfil.nombre" 
                                       class="form-control form-control-sm"
                                       :class="_userId ? 'bg-body-secondary' : 'bg-transparent'"
                                       :readonly="_userId"
                                       placeholder="Tu nombre completo">
                                <div v-if="_userId" class="text-muted mt-1" style="font-size: 0.65rem;">
                                    <i class="bi bi-info-circle me-1"></i>Para cambiar tu nombre oficial, contacta al administrador.
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Correo electrónico</label>
                                <input v-model="perfil.email" type="email" class="form-control form-control-sm bg-transparent" placeholder="correo@ejemplo.com">
                            </div>
                            <div class="col-sm-6">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Teléfono</label>
                                <input v-model="perfil.telefono" class="form-control form-control-sm bg-transparent" placeholder="7777-1234">
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Dirección</label>
                                <input v-model="perfil.direccion" class="form-control form-control-sm bg-transparent" placeholder="Calle, ciudad, departamento">
                            </div>
                            <div class="col-12 text-end">
                                <button class="btn btn-sm text-white fw-semibold px-4" style="background-color:#1a3a5c;"
                                        @click="guardar" :disabled="guardando">
                                    <span v-if="guardando" class="spinner-border spinner-border-sm me-1"></span>
                                    <i v-else class="bi bi-save me-1"></i>Guardar cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cambiar contraseña -->
            <div class="col-lg-5">
                <div class="card border-0 shadow-sm bg-body-tertiary">
                    <div class="card-header bg-transparent fw-bold border-bottom py-3">
                        <i class="bi bi-lock me-2 text-warning"></i>Cambiar Contraseña
                    </div>
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Contraseña actual</label>
                                <div class="input-group input-group-sm">
                                    <input v-model="pwd.actual" :type="pwd.mostrarActual?'text':'password'" class="form-control bg-transparent" placeholder="••••••">
                                    <button class="btn btn-outline-secondary" @click="pwd.mostrarActual=!pwd.mostrarActual">
                                        <i :class="pwd.mostrarActual?'bi bi-eye-slash':'bi bi-eye'"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Nueva contraseña</label>
                                <div class="input-group input-group-sm">
                                    <input v-model="pwd.nueva" :type="pwd.mostrarNueva?'text':'password'" class="form-control bg-transparent" placeholder="Mín. 6 caracteres">
                                    <button class="btn btn-outline-secondary" @click="pwd.mostrarNueva=!pwd.mostrarNueva">
                                        <i :class="pwd.mostrarNueva?'bi bi-eye-slash':'bi bi-eye'"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label small fw-bold text-body-secondary text-uppercase">Confirmar nueva contraseña</label>
                                <input v-model="pwd.confirmar" type="password" class="form-control form-control-sm bg-transparent" placeholder="Repite la nueva contraseña">
                                <div v-if="pwd.confirmar && pwd.nueva !== pwd.confirmar" class="form-text text-danger">
                                    Las contraseñas no coinciden.
                                </div>
                            </div>
                            <div class="col-12 text-end">
                                <button class="btn btn-sm btn-outline-warning fw-semibold px-4"
                                        @click="cambiarPassword" :disabled="cambiandoPwd">
                                    <span v-if="cambiandoPwd" class="spinner-border spinner-border-sm me-1"></span>
                                    <i v-else class="bi bi-key me-1"></i>Cambiar contraseña
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        </div>
            
            <!-- Modal Recorte -->
            <div class="modal fade" id="modalRecorteFoto" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-body-tertiary border-0 shadow-lg">
                        <div class="modal-header border-bottom py-3">
                            <h5 class="modal-title fw-bold text-primary"><i class="bi bi-crop me-2"></i>Ajustar Foto</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-0 bg-dark text-center" style="max-height:500px; overflow:hidden;">
                            <img id="img-recortar" :src="imagenRecortar" style="max-width:100%; max-height: 500px; display:block;">
                        </div>
                        <div class="modal-footer border-top-0">
                            <button type="button" class="btn btn-sm btn-outline-secondary px-4" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-sm btn-primary px-4 fw-bold" @click="guardarFotoRecortada">Aplicar y Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
    </div>
    `
};

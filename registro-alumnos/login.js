// =============================================
// UTILIDAD: SHA-256 con Web Crypto API
// =============================================
async function sha256(mensaje) {
    const encoder = new TextEncoder();
    const data = encoder.encode(mensaje);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// =============================================
// COMPONENTE: LOGIN / REGISTRO
// =============================================
const login = {
    data() {
        return {
            modo: 'login',          // 'login' | 'registro'
            loginEmail: '',
            loginClave: '',
            loginTipo: 'alumno',    // 'alumno' | 'docente' | 'admin'
            regEmail: '',
            regClave: '',
            regClave2: '',
            regTipo: 'alumno',      // 'alumno' | 'docente'  (admin NO se auto-registra)
            cargando: false,
            errorMsg: '',
            exitoMsg: ''
        };
    },
    methods: {
        cambiarModo(m) {
            this.modo = m;
            this.errorMsg = '';
            this.exitoMsg = '';
        },

        // ---- INICIAR SESIÓN ----
        async iniciarSesion() {
            this.errorMsg = '';
            this.exitoMsg = '';
            this.cargando = true;
            try {
                const email = this.loginEmail.trim().toLowerCase();
                const tipo = this.loginTipo;
                const hash = await sha256(this.loginClave);

                // Buscar el usuario en la tabla usuarios
                const usuario = await db.usuarios
                    .where('email').equals(email)
                    .and(u => u.tipo === tipo)
                    .first();

                if (!usuario) {
                    if (tipo === 'admin') {
                        this.errorMsg = 'Credenciales de administrador incorrectas.';
                    } else {
                        // Verificar si tiene solicitud pendiente o rechazada
                        const solicitud = await db.solicitudes
                            .where('email').equals(email)
                            .and(s => s.tipo === tipo)
                            .last();

                        if (solicitud && solicitud.estado === 'pendiente') {
                            this.errorMsg = '⏳ Tu solicitud de cuenta está pendiente de aprobación por el administrador.';
                        } else if (solicitud && solicitud.estado === 'rechazada') {
                            this.errorMsg = '❌ Tu solicitud de cuenta fue rechazada. Contacta al administrador.';
                        } else {
                            this.errorMsg = `No existe cuenta de ${tipo} con ese correo. ¿Deseas crear una?`;
                        }
                    }
                    this.cargando = false;
                    return;
                }

                if (usuario.clave !== hash) {
                    this.errorMsg = 'Contraseña incorrecta.';
                    this.cargando = false;
                    return;
                }

                // Para admin, nombre fijo. Para alumno/docente, buscar en su tabla
                let nombre = 'Administrador';
                let id = null;

                if (tipo !== 'admin') {
                    const tabla = tipo === 'alumno' ? db.alumnos : db.docentes;
                    const registros = await tabla.toArray();
                    const persona = registros.find(r => r.email && r.email.trim().toLowerCase() === email);
                    if (persona) {
                        nombre = persona.nombre;
                        id = tipo === 'alumno' ? persona.idAlumno : persona.idDocente;
                    }
                }

                this.$emit('sesion-iniciada', { tipo, id, nombre, email });

            } catch (e) {
                this.errorMsg = 'Ocurrió un error inesperado. Intente de nuevo.';
                console.error(e);
            }
            this.cargando = false;
        },

        // ---- SOLICITAR CUENTA (alumno / docente) → va a aprobación del admin ----
        async crearCuenta() {
            this.errorMsg = '';
            this.exitoMsg = '';
            this.cargando = true;
            try {
                const email = this.regEmail.trim().toLowerCase();
                const tipo = this.regTipo;

                if (this.regClave.length < 6) {
                    this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
                    this.cargando = false;
                    return;
                }
                if (this.regClave !== this.regClave2) {
                    this.errorMsg = 'Las contraseñas no coinciden.';
                    this.cargando = false;
                    return;
                }

                // Verificar que el correo exista en alumnos o docentes
                const tabla = tipo === 'alumno' ? db.alumnos : db.docentes;
                const registros = await tabla.toArray();
                const persona = registros.find(r => r.email && r.email.trim().toLowerCase() === email);

                if (!persona) {
                    this.errorMsg = `No existe ningún ${tipo} registrado con ese correo.\nEl administrador debe registrarte primero en el sistema.`;
                    this.cargando = false;
                    return;
                }

                // Verificar que no tenga ya una cuenta aprobada
                const yaExiste = await db.usuarios
                    .where('email').equals(email)
                    .and(u => u.tipo === tipo)
                    .first();

                if (yaExiste) {
                    this.errorMsg = `Ya existe una cuenta activa para este correo (${tipo}). Inicia sesión.`;
                    this.cargando = false;
                    return;
                }

                // Verificar si ya hay solicitud pendiente
                const solExiste = await db.solicitudes
                    .where('email').equals(email)
                    .and(s => s.tipo === tipo && s.estado === 'pendiente')
                    .first();

                if (solExiste) {
                    this.errorMsg = '⏳ Ya tienes una solicitud pendiente. Espera la aprobación del administrador.';
                    this.cargando = false;
                    return;
                }

                // Guardar solicitud en lugar de crear cuenta directamente
                const hash = await sha256(this.regClave);
                await db.solicitudes.add({
                    email,
                    tipo,
                    clave: hash,          // se usará cuando el admin apruebe
                    estado: 'pendiente',
                    creadoEn: new Date().toISOString()
                });

                this.exitoMsg = '✅ Solicitud enviada. El administrador revisará tu cuenta y te notificará.';
                this.regEmail = '';
                this.regClave = '';
                this.regClave2 = '';

            } catch (e) {
                this.errorMsg = 'Ocurrió un error al enviar la solicitud. Intente de nuevo.';
                console.error(e);
            }
            this.cargando = false;
        }
    },

    template: `
    <div class="d-flex align-items-center justify-content-center bg-light min-vh-100">
        <div style="width:100%;max-width:460px;" class="px-3 py-5">

            <!-- CABECERA -->
            <div class="text-center mb-4">
                <i class="bi bi-mortarboard-fill text-secondary" style="font-size:3rem;"></i>
                <h4 class="fw-bold mt-2 mb-0">SISTEMA ACADÉMICO</h4>
                <small class="text-muted text-uppercase" style="letter-spacing:2px;font-size:0.7rem;">Gestión Universitaria</small>
            </div>

            <!-- TABS -->
            <ul class="nav nav-tabs mb-0" style="border-bottom:none;">
                <li class="nav-item flex-fill text-center">
                    <a class="nav-link" :class="modo==='login' ? 'active fw-semibold' : 'text-muted'"
                        href="#" @click.prevent="cambiarModo('login')">
                        <i class="bi bi-box-arrow-in-right me-1"></i>Iniciar Sesión
                    </a>
                </li>
                <li class="nav-item flex-fill text-center">
                    <a class="nav-link" :class="modo==='registro' ? 'active fw-semibold' : 'text-muted'"
                        href="#" @click.prevent="cambiarModo('registro')">
                        <i class="bi bi-person-plus me-1"></i>Crear Cuenta
                    </a>
                </li>
            </ul>

            <!-- TARJETA PRINCIPAL -->
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">

                    <!-- ALERTAS -->
                    <div v-if="errorMsg" class="alert alert-danger d-flex align-items-start gap-2 py-2 small mb-3">
                        <i class="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0"></i>
                        <span style="white-space:pre-line">{{ errorMsg }}</span>
                    </div>
                    <div v-if="exitoMsg" class="alert alert-success d-flex align-items-center gap-2 py-2 small mb-3">
                        <i class="bi bi-check-circle-fill flex-shrink-0"></i>
                        {{ exitoMsg }}
                    </div>

                    <!-- ===== PANEL LOGIN ===== -->
                    <div v-if="modo==='login'">

                        <!-- Tipo de usuario: incluye Admin -->
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Tipo</label>
                            <div class="col-sm-9">
                                <div class="btn-group w-100" role="group">
                                    <input type="radio" class="btn-check" id="l-alumno" value="alumno" v-model="loginTipo">
                                    <label class="btn btn-outline-secondary btn-sm" for="l-alumno">
                                        <i class="bi bi-person-badge me-1"></i>Alumno
                                    </label>
                                    <input type="radio" class="btn-check" id="l-docente" value="docente" v-model="loginTipo">
                                    <label class="btn btn-outline-secondary btn-sm" for="l-docente">
                                        <i class="bi bi-person-workspace me-1"></i>Docente
                                    </label>
                                    <input type="radio" class="btn-check" id="l-admin" value="admin" v-model="loginTipo">
                                    <label class="btn btn-outline-secondary btn-sm" for="l-admin">
                                        <i class="bi bi-shield-lock me-1"></i>Admin
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Correo</label>
                            <div class="col-sm-9">
                                <input v-model="loginEmail" type="email" class="form-control form-control-sm"
                                    placeholder="correo@universidad.edu" @keyup.enter="iniciarSesion">
                            </div>
                        </div>

                        <div class="mb-1 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Clave</label>
                            <div class="col-sm-9">
                                <input v-model="loginClave" type="password" class="form-control form-control-sm"
                                    placeholder="••••••••" @keyup.enter="iniciarSesion">
                            </div>
                        </div>

                    </div>

                    <!-- ===== PANEL REGISTRO (alumno / docente únicamente) ===== -->
                    <div v-if="modo==='registro'">

                        <div class="alert alert-info d-flex align-items-center gap-2 py-2 small mb-3">
                            <i class="bi bi-send-check flex-shrink-0"></i>
                            Envía una solicitud de cuenta. El admin la revisará y te avisará cuando esté aprobada.
                        </div>

                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Soy</label>
                            <div class="col-sm-9">
                                <div class="btn-group w-100" role="group">
                                    <input type="radio" class="btn-check" id="r-alumno" value="alumno" v-model="regTipo">
                                    <label class="btn btn-outline-secondary btn-sm" for="r-alumno">
                                        <i class="bi bi-person-badge me-1"></i>Alumno
                                    </label>
                                    <input type="radio" class="btn-check" id="r-docente" value="docente" v-model="regTipo">
                                    <label class="btn btn-outline-secondary btn-sm" for="r-docente">
                                        <i class="bi bi-person-workspace me-1"></i>Docente
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Correo</label>
                            <div class="col-sm-9">
                                <input v-model="regEmail" type="email" class="form-control form-control-sm"
                                    placeholder="correo@universidad.edu">
                            </div>
                        </div>

                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Clave</label>
                            <div class="col-sm-9">
                                <input v-model="regClave" type="password" class="form-control form-control-sm"
                                    placeholder="Mínimo 6 caracteres">
                            </div>
                        </div>

                        <div class="mb-1 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Confirmar</label>
                            <div class="col-sm-9">
                                <input v-model="regClave2" type="password"
                                    :class="['form-control form-control-sm', regClave2 && regClave !== regClave2 ? 'is-invalid' : '']"
                                    placeholder="Repite la contraseña">
                                <div v-if="regClave2 && regClave !== regClave2" class="invalid-feedback">
                                    Las contraseñas no coinciden.
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                <!-- FOOTER -->
                <div class="card-footer bg-white border-top d-flex align-items-center justify-content-between px-4 py-3">
                    <small class="text-muted">
                        <i class="bi bi-shield-lock me-1"></i>Clave cifrada SHA-256
                    </small>
                    <button v-if="modo==='login'" @click="iniciarSesion" :disabled="cargando"
                        class="btn btn-sm px-3" style="background-color:#1a3a5c;color:white;">
                        <span v-if="cargando"><span class="spinner-border spinner-border-sm me-1"></span>Verificando...</span>
                        <span v-else><i class="bi bi-box-arrow-in-right me-1"></i>Entrar</span>
                    </button>
                    <button v-if="modo==='registro'" @click="crearCuenta" :disabled="cargando"
                        class="btn btn-sm px-3" style="background-color:#1a3a5c;color:white;">
                        <span v-if="cargando"><span class="spinner-border spinner-border-sm me-1"></span>Enviando...</span>
                        <span v-else><i class="bi bi-send me-1"></i>Enviar Solicitud</span>
                    </button>
                </div>
            </div>

        </div>
    </div>
    `
};

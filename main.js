// =============================================
// APP VUE  (la DB está en registro-alumnos/db.js)
// =============================================
const app = Vue.createApp({
    data() {
        return {
            // Sesión activa
            sesionActiva: false,
            usuarioActual: null,   // { tipo, id, nombre, email }

            forms: {
                alumnos: { mostrar: false },
                busqueda_alumnos: { mostrar: false },
                materias: { mostrar: false },
                busqueda_materias: { mostrar: false },
                docentes: { mostrar: false },
                busqueda_docentes: { mostrar: false },
                matricula: { mostrar: false },
                busqueda_matricula: { mostrar: false },
                inscripciones: { mostrar: false },
                busqueda_inscripciones: { mostrar: false },
                notas: { mostrar: false },
                solicitudes: { mostrar: false },
            }
        };
    },

    // ── Crea la cuenta admin por defecto si no existe ──────────────────────
    async mounted() {
        const adminExiste = await db.usuarios.where('tipo').equals('admin').first();
        if (!adminExiste) {
            const hash = await sha256('Admin1234');
            await db.usuarios.add({
                email: 'admin@universidad.edu',
                tipo: 'admin',
                clave: hash,
                creadoEn: new Date().toISOString()
            });
            console.info('[Sistema] Cuenta admin creada → admin@universidad.edu / Admin1234');
        }
    },

    computed: {
        // ── Qué módulos puede ver el usuario según su rol ──────────────────
        puedeVerAlumnos() {
            return this.usuarioActual?.tipo === 'admin';
        },
        puedeVerDocentes() {
            return this.usuarioActual?.tipo === 'admin';
        },
        puedeVerMaterias() {
            return ['admin', 'docente'].includes(this.usuarioActual?.tipo);
        },
        puedeVerMatricula() {
            return ['admin', 'alumno'].includes(this.usuarioActual?.tipo);
        },
        puedeVerInscripciones() {
            return ['admin', 'docente', 'alumno'].includes(this.usuarioActual?.tipo);
        },
        puedeVerNotas() {
            return ['admin', 'docente', 'alumno'].includes(this.usuarioActual?.tipo);
        },
        puedeVerSolicitudes() {
            return this.usuarioActual?.tipo === 'admin';
        },
        // Ícono y badge de rol para el navbar
        rolLabel() {
            const labels = { admin: 'Administrador', docente: 'Docente', alumno: 'Alumno' };
            return labels[this.usuarioActual?.tipo] ?? '';
        },
        rolBadgeClass() {
            const clases = { admin: 'bg-danger', docente: 'bg-primary', alumno: 'bg-success' };
            return clases[this.usuarioActual?.tipo] ?? 'bg-secondary';
        }
    },

    methods: {
        // Recibe el evento del componente login al autenticarse
        onSesionIniciada(usuario) {
            this.usuarioActual = usuario;
            this.sesionActiva = true;
        },
        // Cierra la sesión y regresa al login
        cerrarSesion() {
            this.sesionActiva = false;
            this.usuarioActual = null;
            for (const key in this.forms) this.forms[key].mostrar = false;
        },
        abrirVentana(nombre) {
            for (const key in this.forms) this.forms[key].mostrar = false;
            this.forms[nombre].mostrar = true;
        },
        buscar(refBusqueda, metodo) {
            this.$refs[refBusqueda][metodo]();
        },
        modificar(refForm, metodo, datos) {
            this.forms[refForm].mostrar = true;
            const busquedaKey = 'busqueda_' + refForm;
            if (this.forms[busquedaKey]) this.forms[busquedaKey].mostrar = false;
            this.$refs[refForm][metodo](datos);
        }
    }
});

// Registro de componentes
app.component('login', login);
app.component('alumnos', alumnos);
app.component('busqueda_alumnos', busqueda_alumnos);
app.component('materias', materias);
app.component('busqueda_materias', busqueda_materias);
app.component('docentes', docentes);
app.component('busqueda_docentes', busqueda_docentes);
app.component('matricula', matricula);
app.component('busqueda_matricula', busqueda_matricula);
app.component('inscripciones', inscripciones);
app.component('busqueda_inscripciones', busqueda_inscripciones);
app.component('notas_docente', notas_docente);
app.component('notas_alumno', notas_alumno);
app.component('solicitudes_admin', solicitudes_admin);

app.mount('#app');
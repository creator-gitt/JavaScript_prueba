// =============================================
// DOCENTE — Vue App Principal
// Verificación de sesión + DB compartida
// =============================================

const db = new Dexie('universidad');
db.version(1).stores({ alumnos:'idAlumno,codigo,nombre', materias:'idMateria,codigo,nombre', docentes:'idDocente,codigo,nombre', matricula:'idMatricula,codigo,nombreAlumno', inscripciones:'idInscripcion,idMatricula,idMateria' });
db.version(2).stores({ alumnos:'idAlumno,codigo,nombre', materias:'idMateria,codigo,nombre', docentes:'idDocente,codigo,nombre', matricula:'idMatricula,codigo,nombreAlumno', inscripciones:'idInscripcion,idMatricula,idMateria', usuarios:'++id,username,rol' });
db.version(3).stores({ alumnos:'idAlumno,codigo,nombre', materias:'idMateria,codigo,nombre', docentes:'idDocente,codigo,nombre', matricula:'idMatricula,codigo,nombreAlumno', inscripciones:'idInscripcion,idMatricula,idMateria', usuarios:'++id,username,codigo,email,rol' });
db.version(4).stores({ alumnos:'idAlumno,codigo,nombre,carrera,estado', materias:'idMateria,codigo,nombre,docenteId,estado', docentes:'idDocente,codigo,nombre,especialidad,estado', matricula:'idMatricula,codigo,nombreAlumno,idAlumno,periodoId,estado', inscripciones:'idInscripcion,idMatricula,idMateria,idAlumno', periodos:'++idPeriodo,año,ciclo,estado', usuarios:'++id,username,codigo,email,rol,estado' });
db.version(5).stores({ alumnos:'idAlumno,codigo,nombre,carrera,carreraId,estado', materias:'idMateria,codigo,nombre,docenteId,carreraId,carrera,estado', docentes:'idDocente,codigo,nombre,especialidad,estado', matricula:'idMatricula,codigo,nombreAlumno,idAlumno,periodoId,estado', inscripciones:'idInscripcion,idMatricula,idMateria,idAlumno', periodos:'++idPeriodo,año,ciclo,estado', carreras:'++idCarrera,codigo,nombre,estado', evaluaciones:'++id,idInscripcion,idMateria,computo,estado', usuarios:'++id,username,codigo,email,rol,estado' });
db.version(6).stores({ alumnos:'idAlumno,codigo,nombre,carrera,carreraId,foto,estado', materias:'idMateria,codigo,nombre,docenteId,carreraId,carrera,estado', docentes:'idDocente,codigo,nombre,especialidad,foto,estado', matricula:'idMatricula,codigo,nombreAlumno,idAlumno,periodoId,estado', inscripciones:'idInscripcion,idMatricula,idMateria,idAlumno', periodos:'++idPeriodo,año,ciclo,estado', carreras:'++idCarrera,codigo,nombre,estado', evaluaciones:'++id,idInscripcion,idMateria,computo,estado', usuarios:'++id,username,codigo,email,rol,estado' });
db.version(7).stores({ alumnos:'idAlumno,codigo,nombre,carrera,carreraId,foto,estado', materias:'idMateria,codigo,nombre,docenteId,carreraId,carrera,estado', docentes:'idDocente,codigo,nombre,especialidad,foto,estado', matricula:'idMatricula,codigo,nombreAlumno,idAlumno,periodoId,estado', inscripciones:'idInscripcion,idMatricula,idMateria,idAlumno', periodos:'++idPeriodo,año,ciclo,estado', carreras:'++idCarrera,codigo,nombre,estado', evaluaciones:'++id,idInscripcion,idMateria,computo,estado', usuarios:'++id,username,codigo,email,rol,estado', solicitudes:'++id,tipo,nombre,codigo,fecha,estado' });
// v8: Corrige idAlumno/idDocente/etc. a auto-increment (++), necesario para add() sin clave manual
db.version(8).stores({ alumnos:'++idAlumno,codigo,nombre,carrera,carreraId,foto,estado,tokenAcceso', materias:'++idMateria,codigo,nombre,docenteId,carreraId,carrera,estado', docentes:'++idDocente,codigo,nombre,especialidad,foto,estado,tokenAcceso', matricula:'++idMatricula,codigo,nombreAlumno,idAlumno,periodoId,estado', inscripciones:'++idInscripcion,idMatricula,idMateria,idAlumno', periodos:'++idPeriodo,año,ciclo,estado', carreras:'++idCarrera,codigo,nombre,estado', evaluaciones:'++id,idInscripcion,idMateria,computo,estado', usuarios:'++id,username,codigo,email,rol,estado', solicitudes:'++id,tipo,nombre,codigo,fecha,estado' });
// v9: Schema relacional — todos los registros vinculados por FK numérico
db.version(9).stores({ usuarios:'++id,username,codigo,email,rol,estado', alumnos:'++idAlumno,codigo,nombre,usuarioId,carreraId,foto,estado,tokenAcceso', docentes:'++idDocente,codigo,nombre,usuarioId,especialidad,foto,estado,tokenAcceso', carreras:'++idCarrera,codigo,nombre,facultad,estado', materias:'++idMateria,codigo,nombre,docenteId,carreraId,estado', periodos:'++idPeriodo,año,ciclo,estado', matricula:'++idMatricula,codigo,alumnoId,periodoId,carreraId,estado', inscripciones:'++idInscripcion,matriculaId,materiaId,estado', evaluaciones:'++id,inscripcionId,estado', solicitudes:'++id,tipo,nombre,codigo,fecha,estado' });

// Auto-recovery: si la BD no puede migrar (cambio de PK), borrar y recargar
db.open().catch(err => {
    if ((err.message || '').includes('primary key') || err.name === 'VersionError') {
        if (confirm('⚠️ La base de datos necesita actualizarse.\n¿Borrar datos antiguos y continuar?')) {
            indexedDB.deleteDatabase('universidad');
            location.reload();
        }
    } else { console.error('[DB Docente] Error:', err); }
});

// Perfil del docente actual (disponible globalmente para todos los componentes)
window.docenteData = null;

const docenteApp = Vue.createApp({
    data() {
        return {
            modulo: 'dashboard',
            docenteSesion: { username: '', codigo: '' },
            docentePerfil: null,
            perfilBuscado: false,
            darkMode: false,
            windowWidth: window.innerWidth,
            menuItems: [
                { id: 'dashboard',    label: 'Dashboard',       icon: 'bi bi-speedometer2' },
                { id: 'docentes',     label: 'Docentes',        icon: 'bi bi-person-workspace' },
                { id: 'materias',     label: 'Mis Materias',    icon: 'bi bi-book' },
                { id: 'notas',        label: 'Notas',           icon: 'bi bi-journal-text' },
                { id: 'estadisticas', label: 'Estadísticas',    icon: 'bi bi-bar-chart-line' },
                { id: 'perfil',       label: 'Mi Perfil',       icon: 'bi bi-person-circle' }
            ]
        };
    },
    async created() {
        // Cargar preferencia de Dark Mode
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.darkMode = true;
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }

        // Verificar sesión Docente
        try {
            const stored = sessionStorage.getItem('sesionUniversidad');
            if (!stored) { window.location.href = '../index.html'; return; }
            const s = JSON.parse(stored);
            if (!s || s.rol !== 'Docente') { window.location.href = '../index.html'; return; }
            this.docenteSesion.username = s.username;
            this.docenteSesion.codigo   = s.codigo || '';
        } catch(e) {
            window.location.href = '../index.html';
            return;
        }

        // Buscar perfil de docente por código (SIEMPRE DESDE DB)
        await this.buscarPerfil();
        window.addEventListener('resize', () => { this.windowWidth = window.innerWidth; });
    },
    methods: {
        async buscarPerfil() {
            const codigo   = this.docenteSesion.codigo;
            const username = this.docenteSesion.username;
            let docente = null;

            if (codigo) {
                docente = await db.docentes.filter(d =>
                    (d.codigo || '').toLowerCase() === codigo.toLowerCase()
                ).first();
            }
            // Fallback: buscar por nombre similar al username
            if (!docente && username) {
                const todos = await db.docentes.toArray();
                docente = todos.find(d =>
                    (d.nombre || '').toLowerCase().includes(username.toLowerCase()) ||
                    username.toLowerCase().includes((d.nombre || '').split(' ')[0].toLowerCase())
                ) || null;
            }

            this.docentePerfil = docente;
            window.docenteData  = docente;
            this.perfilBuscado  = true;

            if (docente && docente.estado === 'inactivo') {
                alert('Tu cuenta de docente ha sido desactivada.');
                this.cerrarSesion();
            }
        },
        cerrarSesion() {
            sessionStorage.removeItem('sesionUniversidad');
            window.location.href = '../index.html';
        },
        actualizarFotoSesion(foto) {
            if (this.docentePerfil) {
                this.docentePerfil.foto = foto;
            }
        },
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            const theme = this.darkMode ? 'dark' : 'light';
            document.documentElement.setAttribute('data-bs-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }
});

docenteApp.component('docente-dashboard',        docenteDashboard);
docenteApp.component('mis-materias-doc',         misMaterias);
docenteApp.component('notas-docente',            notasDocente);
docenteApp.component('estadisticas-docente',     estadisticasDocente);
docenteApp.component('perfil-docente',           perfilDocente);
docenteApp.component('docentes-form',            docentes);
docenteApp.component('busqueda-docentes-view',   busqueda_docentes);

docenteApp.mount('#docenteApp');

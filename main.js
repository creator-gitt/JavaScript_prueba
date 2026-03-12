const { createApp } = Vue,
    Dexie = window.Dexie,
    db = new Dexie("db_academica"),
    sha256 = CryptoJS.SHA256;

try {
    db.version(2).stores({
        "alumnos": "idAlumno, codigo, nombre, direccion, email, telefono",
        "materias": "idMateria, codigo, nombre, uv",
        "docentes": "idDocente, codigo, nombre, direccion, email, telefono, escalafon",
        "matriculas": "idMatricula, idAlumno, ciclo, fecha, pago",
        "inscripciones": "idInscripcion, idAlumno, idMateria, ciclo, fecha"
    });
} catch (e) {
    console.error("Dexie error:", e);
}

createApp({
    components: {
        alumnos,
        busqueda_alumnos,
        materias,
        busqueda_materias,
        docentes,
        busqueda_docentes,
        matriculas,
        busqueda_matriculas,
        inscripciones,
        busqueda_inscripciones
    },
    data() {
        return {
            forms: {
                alumnos: { mostrar: true },
                busqueda_alumnos: { mostrar: false },
                materias: { mostrar: false },
                busqueda_materias: { mostrar: false },
                docentes: { mostrar: false },
                busqueda_docentes: { mostrar: false },
                matriculas: { mostrar: false },
                busqueda_matriculas: { mostrar: false },
                inscripciones: { mostrar: false },
                busqueda_inscripciones: { mostrar: false }
            }
        }
    },
    methods: {
        buscar(ventana, metodo) {
            this.$refs[ventana][metodo]();
        },
        abrirVentana(ventana) {
            this.forms[ventana].mostrar = !this.forms[ventana].mostrar;
        },
        modificar(ventana, metodo, data) {
            this.$refs[ventana][metodo](data);
        }
    }
}).mount("#app");

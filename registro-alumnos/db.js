// =============================================
// BASE DE DATOS COMPARTIDA (Dexie / IndexedDB)
// Este archivo debe cargarse PRIMERO, antes que
// cualquier componente o script de la aplicación.
// =============================================
const db = new Dexie('universidad');

// v1: tablas originales
db.version(1).stores({
    alumnos: 'idAlumno, codigo, nombre',
    materias: 'idMateria, codigo, nombre',
    docentes: 'idDocente, codigo, nombre',
    matricula: 'idMatricula, codigo, nombreAlumno',
    inscripciones: 'idInscripcion, idMatricula, idMateria'
});

// v2: se agrega tabla usuarios para el sistema de login
db.version(2).stores({
    alumnos: 'idAlumno, codigo, nombre',
    materias: 'idMateria, codigo, nombre',
    docentes: 'idDocente, codigo, nombre',
    matricula: 'idMatricula, codigo, nombreAlumno',
    inscripciones: 'idInscripcion, idMatricula, idMateria',
    usuarios: '++id, email, tipo'
});

// v3: se agrega tabla notas (una por inscripcion, con 3 computos)
db.version(3).stores({
    alumnos: 'idAlumno, codigo, nombre',
    materias: 'idMateria, codigo, nombre',
    docentes: 'idDocente, codigo, nombre',
    matricula: 'idMatricula, codigo, nombreAlumno',
    inscripciones: 'idInscripcion, idMatricula, idMateria',
    usuarios: '++id, email, tipo',
    notas: '++id, idInscripcion'
});

// v4: tabla de solicitudes de cuenta (aprobación por admin)
db.version(4).stores({
    alumnos: 'idAlumno, codigo, nombre',
    materias: 'idMateria, codigo, nombre',
    docentes: 'idDocente, codigo, nombre',
    matricula: 'idMatricula, codigo, nombreAlumno',
    inscripciones: 'idInscripcion, idMatricula, idMateria',
    usuarios: '++id, email, tipo',
    notas: '++id, idInscripcion',
    solicitudes: '++id, email, tipo, estado'
});

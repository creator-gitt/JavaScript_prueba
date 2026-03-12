const busqueda_inscripciones = {
    data() {
        return {
            buscar: '',
            inscripciones: []
        }
    },
    methods: {
        modificarInscripcion(inscripcion) {
            this.$emit('modificar', inscripcion);
        },
        async obtenerInscripciones() {
            const allInscripciones = await db.inscripciones.toArray();
            const allAlumnos = await db.alumnos.toArray();
            const allMaterias = await db.materias.toArray();

            this.inscripciones = allInscripciones.filter(i => {
                const alumno = allAlumnos.find(a => a.idAlumno == i.idAlumno);
                const materia = allMaterias.find(m => m.idMateria == i.idMateria);
                const nombreAlumno = alumno ? alumno.nombre.toLowerCase() : "";
                const nombreMateria = materia ? materia.nombre.toLowerCase() : "";
                return nombreAlumno.includes(this.buscar.toLowerCase()) || nombreMateria.includes(this.buscar.toLowerCase()) || i.ciclo.toLowerCase().includes(this.buscar.toLowerCase());
            }).map(i => {
                const alumno = allAlumnos.find(a => a.idAlumno == i.idAlumno);
                const materia = allMaterias.find(m => m.idMateria == i.idMateria);
                return {
                    ...i,
                    nombreAlumno: alumno ? alumno.nombre : "Desconocido",
                    nombreMateria: materia ? materia.nombre : "Desconocida"
                };
            });
        },
        async eliminarInscripcion(inscripcion, e) {
            e.stopPropagation();
            alertify.confirm('Eliminar Inscripcion', `¿Está seguro de eliminar esta inscripción?`, async e => {
                await db.inscripciones.delete(inscripcion.idInscripcion);
                this.obtenerInscripciones();
                alertify.success(`Inscripción eliminada correctamente`);
            }, () => { });
        }
    },
    template: `
        <div class="row">
            <div class="col-8">
                <table class="table table-striped table-hover" id="tblInscripciones">
                    <thead>
                        <tr>
                            <th colspan="6">
                                <input autocomplete="off" type="search" @keyup="obtenerInscripciones()" v-model="buscar" placeholder="Buscar por alumno, materia o ciclo" class="form-control">
                            </th>
                        </tr>
                        <tr>
                            <th>ALUMNO</th>
                            <th>MATERIA</th>
                            <th>CICLO</th>
                            <th>FECHA</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="inscripcion in inscripciones" :key="inscripcion.idInscripcion" @click="modificarInscripcion(inscripcion)">
                            <td>{{ inscripcion.nombreAlumno }}</td>
                            <td>{{ inscripcion.nombreMateria }}</td>
                            <td>{{ inscripcion.ciclo }}</td>
                            <td>{{ inscripcion.fecha }}</td>
                            <td>
                                <button class="btn btn-danger" @click="eliminarInscripcion(inscripcion, $event)">DEL</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
};

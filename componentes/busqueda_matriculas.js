const busqueda_matriculas = {
    data() {
        return {
            buscar: '',
            matriculas: [],
            alumnos: []
        }
    },
    methods: {
        modificarMatricula(matricula) {
            this.$emit('modificar', matricula);
        },
        async obtenerMatriculas() {
            const allMatriculas = await db.matriculas.toArray();
            const allAlumnos = await db.alumnos.toArray();

            this.matriculas = allMatriculas.filter(m => {
                const alumno = allAlumnos.find(a => a.idAlumno == m.idAlumno);
                const nombreAlumno = alumno ? alumno.nombre.toLowerCase() : "";
                return nombreAlumno.includes(this.buscar.toLowerCase()) || m.ciclo.toLowerCase().includes(this.buscar.toLowerCase());
            }).map(m => {
                const alumno = allAlumnos.find(a => a.idAlumno == m.idAlumno);
                return {
                    ...m,
                    nombreAlumno: alumno ? alumno.nombre : "Desconocido"
                };
            });
        },
        async eliminarMatricula(matricula, e) {
            e.stopPropagation();
            alertify.confirm('Eliminar Matricula', `¿Está seguro de eliminar esta matrícula?`, async e => {
                await db.matriculas.delete(matricula.idMatricula);
                this.obtenerMatriculas();
                alertify.success(`Matrícula eliminada correctamente`);
            }, () => { });
        },
    },
    template: `
        <div class="row">
            <div class="col-8">
                <table class="table table-striped table-hover" id="tblMatriculas">
                    <thead>
                        <tr>
                            <th colspan="6">
                                <input autocomplete="off" type="search" @keyup="obtenerMatriculas()" v-model="buscar" placeholder="Buscar por alumno o ciclo" class="form-control">
                            </th>
                        </tr>
                        <tr>
                            <th>ALUMNO</th>
                            <th>CICLO</th>
                            <th>FECHA</th>
                            <th>PAGADO</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="matricula in matriculas" :key="matricula.idMatricula" @click="modificarMatricula(matricula)">
                            <td>{{ matricula.nombreAlumno }}</td>
                            <td>{{ matricula.ciclo }}</td>
                            <td>{{ matricula.fecha }}</td>
                            <td>{{ matricula.pago }}</td>
                            <td>
                                <button class="btn btn-danger" @click="eliminarMatricula(matricula, $event)">DEL</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `
};

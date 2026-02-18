const alumnos = {
    props:['forms'],
    data(){
        return{
            alumno:{
                idAlumno:0,
                codigo:"",
                nombre:"",
                direccion:"",
                email:"",
                telefono:""
            },
            accion:'nuevo',
            idAlumno:0,
            data_alumnos:[]
        }
    },
    methods:{
        buscarAlumno(){
            this.forms.busqueda_alumnos.mostrar = !this.forms.busqueda_alumnos.mostrar;
            this.$emit('buscar');
        },
        modificarAlumno(alumno){
            this.accion = 'modificar';
            this.idAlumno = alumno.idAlumno;
            this.alumno.codigo = alumno.codigo;
            this.alumno.nombre = alumno.nombre;
            this.alumno.direccion = alumno.direccion;
            this.alumno.email = alumno.email;
            this.alumno.telefono = alumno.telefono;
        },
        async guardarAlumno() {
            let datos = {
                idAlumno: this.accion=='modificar' ? this.idAlumno : this.getId(),
                codigo: this.alumno.codigo,
                nombre: this.alumno.nombre,
                direccion: this.alumno.direccion,
                email: this.alumno.email,
                telefono: this.alumno.telefono
            };
            this.buscar = datos.codigo;

            if(this.data_alumnos.length > 0 && this.accion=='nuevo'){
                alertify.error(`El codigo del alumno ya existe, ${this.data_alumnos[0].nombre}`);
                return;
            }
            db.alumnos.put(datos);
            this.limpiarFormulario();
            alertify.success(`${datos.nombre} guardado correctamente`);
        },
        getId(){
            return new Date().getTime();
        },
        limpiarFormulario(){
            this.accion = 'nuevo';
            this.idAlumno = 0;
            this.alumno.codigo = '';
            this.alumno.nombre = '';
            this.alumno.direccion = '';
            this.alumno.email = '';
            this.alumno.telefono = '';
        },
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-person-badge me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Registro de Alumnos</h5>
                <span v-if="accion=='modificar'" class="badge bg-warning text-dark ms-2">Editando</span>
            </div>
            <form id="frmAlumnos" @submit.prevent="guardarAlumno" @reset.prevent="limpiarFormulario">
                <div class="card border-0 shadow-sm" style="max-width: 480px;">
                    <div class="card-body p-4">
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Código</label>
                            <div class="col-sm-4">
                                <input placeholder="Ej. A-001" required v-model="alumno.codigo" type="text" class="form-control form-control-sm">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Nombre</label>
                            <div class="col-sm-8">
                                <input placeholder="Nombre completo" required v-model="alumno.nombre" type="text" class="form-control form-control-sm">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Dirección</label>
                            <div class="col-sm-9">
                                <input placeholder="Dirección" required v-model="alumno.direccion" type="text" class="form-control form-control-sm">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Email</label>
                            <div class="col-sm-8">
                                <input placeholder="correo@universidad.edu" required v-model="alumno.email" type="text" class="form-control form-control-sm">
                            </div>
                        </div>
                        <div class="mb-1 row align-items-center">
                            <label class="col-sm-3 col-form-label text-muted small fw-semibold text-uppercase">Teléfono</label>
                            <div class="col-sm-5">
                                <input placeholder="0000-0000" required v-model="alumno.telefono" type="text" class="form-control form-control-sm">
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top d-flex gap-2 px-4 py-3">
                        <button type="submit" class="btn btn-sm px-3" style="background-color:#1a3a5c; color:white;">
                            <i class="bi bi-save me-1"></i>Guardar
                        </button>
                        <button type="reset" class="btn btn-sm btn-outline-secondary px-3">
                            <i class="bi bi-arrow-counterclockwise me-1"></i>Nuevo
                        </button>
                        <button type="button" @click="buscarAlumno" class="btn btn-sm btn-outline-success px-3 ms-auto">
                            <i class="bi bi-search me-1"></i>Buscar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `
};
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
            datos.hash = sha256(JSON.stringify(datos));
            this.buscar = datos.codigo;

            try {
                if (this.accion === 'nuevo') {
                    let existe = await Database.query(`SELECT nombre FROM alumnos WHERE codigo=?`, [datos.codigo]);
                    if (existe.length > 0) {
                        alertify.error(`El codigo del alumno ya existe, ${existe[0].nombre}`);
                        return;
                    }
                    await Database.query(`INSERT INTO alumnos (idAlumno, codigo, nombre, direccion, email, telefono) VALUES (?, ?, ?, ?, ?, ?)`, 
                        [datos.idAlumno, datos.codigo, datos.nombre, datos.direccion, datos.email, datos.telefono]);
                } else {
                    await Database.query(`UPDATE alumnos SET codigo=?, nombre=?, direccion=?, email=?, telefono=? WHERE idAlumno=?`, 
                        [datos.codigo, datos.nombre, datos.direccion, datos.email, datos.telefono, datos.idAlumno]);
                }
            } catch (error) {
                alertify.error(`Error BD: ${error.message}`);
                return;
            }

            fetch(`private/modulos/alumnos/alumno.php?accion=${this.accion}&alumnos=${JSON.stringify(datos)}`)
                .then(response=>response.json())
                .then(data=>{
                    if(data!=true) alertify.error(`Error al sincronizar con el servidor: ${data}`);
                });
            this.limpiarFormulario();
            alertify.success(`${datos.nombre} guardado correctamente`);
            this.$emit('buscar');
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
        <div class="row mt-4">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
                <form id="frmAlumnos" @submit.prevent="guardarAlumno" @reset.prevent="limpiarFormulario">
                    <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                        <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                            <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-person-badge me-2"></i> REGISTRO DE ALUMNOS</h5>
                        </div>
                        <div class="card-body p-3 p-md-4">
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">CÓDIGO:</label>
                                <div class="col-sm-9 col-md-4">
                                    <input placeholder="Ej. A001" required v-model="alumno.codigo" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">NOMBRE:</label>
                                <div class="col-sm-9">
                                    <input placeholder="Nombre completo" required v-model="alumno.nombre" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">DIRECCIÓN:</label>
                                <div class="col-sm-9">
                                    <input placeholder="Dirección de residencia" required v-model="alumno.direccion" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">EMAIL:</label>
                                <div class="col-sm-9 col-md-8">
                                    <input placeholder="correo@ejemplo.com" required v-model="alumno.email" type="email" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-4 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">TELÉFONO:</label>
                                <div class="col-sm-9 col-md-5">
                                    <input placeholder="Ej. 7777-7777" required v-model="alumno.telefono" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 pb-3 text-center">
                            <button type="submit" id="btnGuardarAlumno" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                                <i class="bi bi-floppy me-1"></i> GUARDAR
                            </button>
                            <button type="reset" id="btnCancelarAlumno" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                                <i class="bi bi-x-circle me-1"></i> NUEVO
                            </button>
                            <button type="button" @click="buscarAlumno" id="btnBuscarAlumno" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                                <i class="bi bi-search me-1"></i> BUSCAR
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};
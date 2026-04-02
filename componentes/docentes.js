const docentes = {
    props:['forms'],
    data(){
        return{
            docente:{
                idDocente:0,
                codigo:"",
                nombre:"",
                direccion:"",
                email:"",
                telefono:"",
                escalafon:""
            },
            accion:'nuevo',
            idDocente:0,
            data_docentes:[]
        }
    },
    methods:{
        buscarDocente(){
            this.forms.busqueda_docentes.mostrar = !this.forms.busqueda_docentes.mostrar;
            this.$emit('buscar');
        },
        modificarDocente(docente){
            this.accion = 'modificar';
            this.idDocente = docente.idDocente;
            this.docente.codigo = docente.codigo;
            this.docente.nombre = docente.nombre;
            this.docente.direccion = docente.direccion;
            this.docente.email = docente.email;
            this.docente.telefono = docente.telefono;
            this.docente.escalafon = docente.escalafon;
        },
        async guardarDocente() {
            let datos = {
                idDocente: this.accion=='modificar' ? this.idDocente : this.getId(),
                codigo: this.docente.codigo,
                nombre: this.docente.nombre,
                direccion: this.docente.direccion,
                email: this.docente.email,
                telefono: this.docente.telefono,
                escalafon: this.docente.escalafon
            };
            this.buscar = datos.codigo;
            this.buscar = datos.codigo;

            try {
                if (this.accion === 'nuevo') {
                    let existe = await Database.query(`SELECT nombre FROM docentes WHERE codigo=?`, [datos.codigo]);
                    if (existe.length > 0) {
                        alertify.error(`El codigo del docente ya existe, ${existe[0].nombre}`);
                        return;
                    }
                    await Database.query(`INSERT INTO docentes (idDocente, codigo, nombre, direccion, email, telefono, escalafon) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                        [datos.idDocente, datos.codigo, datos.nombre, datos.direccion, datos.email, datos.telefono, datos.escalafon]);
                } else {
                    await Database.query(`UPDATE docentes SET codigo=?, nombre=?, direccion=?, email=?, telefono=?, escalafon=? WHERE idDocente=?`, 
                        [datos.codigo, datos.nombre, datos.direccion, datos.email, datos.telefono, datos.escalafon, datos.idDocente]);
                }
            } catch (error) {
                alertify.error(`Error BD: ${error.message}`);
                return;
            }

            fetch(`private/modulos/docentes/docente.php?accion=${this.accion}&docentes=${JSON.stringify(datos)}`)
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
            this.idDocente = 0;
            this.docente.codigo = '';
            this.docente.nombre = '';
            this.docente.direccion = '';
            this.docente.email = '';
            this.docente.telefono = '';
            this.docente.escalafon = '';
        },
    },
    template: `
        <div class="row mt-4">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
                <form id="frmDocentes" @submit.prevent="guardarDocente" @reset.prevent="limpiarFormulario">
                    <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                        <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                            <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-briefcase-fill me-2"></i> REGISTRO DE DOCENTES</h5>
                        </div>
                        <div class="card-body p-3 p-md-4">
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">CÓDIGO:</label>
                                <div class="col-sm-9 col-md-4">
                                    <input placeholder="Ej. D001" required v-model="docente.codigo" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">NOMBRE:</label>
                                <div class="col-sm-9">
                                    <input placeholder="Nombre completo" required v-model="docente.nombre" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">DIRECCIÓN:</label>
                                <div class="col-sm-9">
                                    <input placeholder="Dirección de residencia" required v-model="docente.direccion" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">EMAIL:</label>
                                <div class="col-sm-9 col-md-8">
                                    <input placeholder="docente@universidad.edu" required v-model="docente.email" type="email" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">TELÉFONO:</label>
                                <div class="col-sm-9 col-md-5">
                                    <input placeholder="Ej. 7777-7777" required v-model="docente.telefono" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-4 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">ESCALAFÓN:</label>
                                <div class="col-sm-9 col-md-6">
                                    <select title="Seleccione un escalafón" required v-model="docente.escalafon" class="form-select bg-body-tertiary border-0 shadow-sm text-body">
                                        <option value="" disabled selected>Seleccione...</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="profesor">Profesor</option>
                                        <option value="ingeniero">Licenciado/Ingeniero</option>
                                        <option value="maestria">Maestría</option>
                                        <option value="doctor">Doctorado</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 pb-3 text-center">
                            <button type="submit" id="btnGuardarDocente" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                                <i class="bi bi-floppy me-1"></i> GUARDAR
                            </button>
                            <button type="reset" id="btnCancelarDocente" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                                <i class="bi bi-x-circle me-1"></i> NUEVO
                            </button>
                            <button type="button" @click="buscarDocente" id="btnBuscarDocente" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                                <i class="bi bi-search me-1"></i> BUSCAR
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};
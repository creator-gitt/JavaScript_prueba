const materias = {
    props:['forms'],
    data(){
        return{
            materia:{
                idMateria:0,
                codigo:"",
                nombre:"",
                uv:'',
            },
            accion:'nuevo',
            idMateria:0,
            data_materias:[]
        }
    },
    methods:{
        buscarMateria(){
            this.forms.busqueda_materias.mostrar = !this.forms.busqueda_materias.mostrar;
            this.$emit('buscar');
        },
        modificarMateria(materia){
            this.accion = 'modificar';
            this.idMateria = materia.idMateria;
            this.materia.codigo = materia.codigo;
            this.materia.nombre = materia.nombre;
            this.materia.uv = materia.uv;
        },
        async guardarMateria() {
            let datos = {
                idMateria: this.accion=='modificar' ? this.idMateria : this.getId(),
                codigo: this.materia.codigo,
                nombre: this.materia.nombre,
                uv: this.materia.uv,
            };
            this.buscar = datos.codigo;
            this.buscar = datos.codigo;

            try {
                if (this.accion === 'nuevo') {
                    let existe = await Database.query(`SELECT nombre FROM materias WHERE codigo=?`, [datos.codigo]);
                    if (existe.length > 0) {
                        alertify.error(`El codigo de la materia ya existe, ${existe[0].nombre}`);
                        return;
                    }
                    await Database.query(`INSERT INTO materias (idMateria, codigo, nombre, uv) VALUES (?, ?, ?, ?)`, 
                        [datos.idMateria, datos.codigo, datos.nombre, datos.uv]);
                } else {
                    await Database.query(`UPDATE materias SET codigo=?, nombre=?, uv=? WHERE idMateria=?`, 
                        [datos.codigo, datos.nombre, datos.uv, datos.idMateria]);
                }
            } catch (error) {
                alertify.error(`Error BD: ${error.message}`);
                return;
            }

            fetch(`private/modulos/materias/materia.php?accion=${this.accion}&materias=${JSON.stringify(datos)}`)
                .then(response=>response.json())
                .then(data=>{
                    if(data!=true) alertify.error(`Error al sincronizar con el servidor: ${data}`);
                });
            this.limpiarFormulario();
            alertify.success(`Materia ${datos.nombre} guardada correctamente`);
            this.$emit('buscar');
        },
        getId(){
            return new Date().getTime();
        },
        limpiarFormulario(){
            this.accion = 'nuevo';
            this.idMateria = 0;
            this.materia.codigo = '';
            this.materia.nombre = '';
            this.materia.uv = '';
        },
    },
    template: `
        <div class="row mt-4">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 mx-auto">
                <form id="frmMaterias" @submit.prevent="guardarMateria" @reset.prevent="limpiarFormulario">
                    <div class="card shadow-sm border-0 rounded-4 mb-4 bg-body">
                        <div class="card-header bg-primary text-white text-center py-2 rounded-top-4 border-0">
                            <h5 class="mb-0 fw-bold fs-6"><i class="bi bi-book-half me-2"></i> REGISTRO DE MATERIAS</h5>
                        </div>
                        <div class="card-body p-3 p-md-4">
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">CÓDIGO:</label>
                                <div class="col-sm-9 col-md-4">
                                    <input placeholder="Ej. MAT1" required v-model="materia.codigo" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-3 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">NOMBRE:</label>
                                <div class="col-sm-9">
                                    <input placeholder="Nombre de la materia" required v-model="materia.nombre" type="text" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                            <div class="row mb-4 align-items-center">
                                <label class="col-sm-3 col-form-label fw-semibold text-secondary">UV (Unidades):</label>
                                <div class="col-sm-9 col-md-4">
                                    <input placeholder="Ej. 4" required v-model="materia.uv" type="number" class="form-control bg-body-tertiary border-0 shadow-sm text-body">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 pb-3 text-center">
                            <button type="submit" id="btnGuardarMateria" class="btn btn-primary rounded-pill px-3 shadow-sm mx-1">
                                <i class="bi bi-floppy me-1"></i> GUARDAR
                            </button>
                            <button type="reset" id="btnCancelarMateria" class="btn btn-warning rounded-pill px-3 shadow-sm mx-1 text-dark fw-bold">
                                <i class="bi bi-x-circle me-1"></i> NUEVO
                            </button>
                            <button type="button" @click="buscarMateria" id="btnBuscarMateria" class="btn btn-success rounded-pill px-3 shadow-sm mx-1 text-white fw-bold">
                                <i class="bi bi-search me-1"></i> BUSCAR
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};
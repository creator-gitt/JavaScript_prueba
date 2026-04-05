export default {
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
            //await this.obtenerMaterias();

            if(this.data_materias.length > 0 && this.accion=='nuevo'){
                alertify.error(`El codigo del materia ya existe, ${this.data_materias[0].nombre}`);
                return; //Termina la ejecucion de la funcion
            }
            const method = this.accion === 'nuevo' ? 'POST' : 'PUT';
            const url = this.accion === 'nuevo' ? '/api/materias' : '/api/materias/' + this.idMateria;
            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            })
                .then(response=>response.json())
                .then(data=>{
                    if(data!=true) alertify.error(`Error al sincronizar con el servidor: ${data}`);
                });
            
            // Actualización Instantánea Optimista
            const refBusqueda = this.$parent.$refs.busqueda_materias;
            if (refBusqueda) {
                if (this.accion === 'nuevo') {
                    refBusqueda.materias_cache.unshift({...datos}); 
                } else {
                    const index = refBusqueda.materias_cache.findIndex(x => x.idMateria === this.idMateria);
                    if (index !== -1) {
                        refBusqueda.materias_cache[index] = {...datos};
                    }
                }
                refBusqueda.filtrarMaterias();
            }
            
            this.limpiarFormulario();
            alertify.success(`Materia ${datos.nombre} guardada correctamente`);
            // Cambiar automáticamente a la vista de búsqueda
            this.buscarMateria();
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
        <div class="row w-100 m-0 mb-4">
            <div class="col-12 col-xl-11 mx-auto">
                <form id="frmMaterias" @submit.prevent="guardarMateria" @reset.prevent="limpiarFormulario" class="bg-white rounded-4 shadow-sm border border-light p-4 p-md-5">
                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                            <i class="bi bi-journal-bookmark-fill fs-4"></i>
                        </div>
                        <div>
                            <h4 class="mb-1 fw-bold text-dark">Registro de Materias</h4>
                            <p class="mb-0 text-muted small">Catálogo de asignaturas de la institución</p>
                        </div>
                    </div>

                    <div class="row g-4 mt-1">
                        <div class="col-md-4">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Código de Materia</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-upc-scan"></i></span>
                                <input placeholder="Ej. MAT-101" required v-model="materia.codigo" type="text" class="form-control border-start-0 ps-0 text-dark fs-6 font-monospace" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Nombre de la Asignatura</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-book"></i></span>
                                <input placeholder="Nombre completo de la materia" required v-model="materia.nombre" type="text" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Unidades Valorativas (UV)</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-123"></i></span>
                                <input placeholder="Número de unidades" required v-model="materia.uv" type="number" min="1" max="10" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                        <button type="button" @click="buscarMateria" class="btn btn-light text-muted fw-semibold px-4 py-2 border shadow-sm rounded-pill transition-all hover-translate">
                            <i class="bi bi-search me-2"></i> Explorar Registros
                        </button>
                        <button type="reset" class="btn btn-light text-muted fw-semibold px-4 py-2 border shadow-sm rounded-pill transition-all hover-translate">
                            <i class="bi bi-eraser me-2"></i> Descartar
                        </button>
                        <button type="submit" class="btn btn-primary fw-semibold px-5 py-2 shadow rounded-pill transition-all hover-translate">
                            <i class="bi bi-check2-circle me-2"></i> Confirmar & Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `
};
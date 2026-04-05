export default {
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
            //await this.obtenerDocentes();

            if(this.data_docentes.length > 0 && this.accion=='nuevo'){
                alertify.error(`El codigo del docente ya existe, ${this.data_docentes[0].nombre}`);
                return; //Termina la ejecucion de la funcion
            }
            const method = this.accion === 'nuevo' ? 'POST' : 'PUT';
            const url = this.accion === 'nuevo' ? '/api/docentes' : '/api/docentes/' + this.idDocente;
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
            const refBusqueda = this.$parent.$refs.busqueda_docentes;
            if (refBusqueda) {
                if (this.accion === 'nuevo') {
                    refBusqueda.docentes_cache.unshift({...datos}); 
                } else {
                    const index = refBusqueda.docentes_cache.findIndex(x => x.idDocente === this.idDocente);
                    if (index !== -1) {
                        refBusqueda.docentes_cache[index] = {...datos};
                    }
                }
                refBusqueda.filtrarDocentes();
            }
            
            this.limpiarFormulario();
            alertify.success(`${datos.nombre} guardado correctamente`);
            // Cambiar automáticamente a la vista de búsqueda
            this.buscarDocente();
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
        <div class="row w-100 m-0 mb-4">
            <div class="col-12 col-xl-11 mx-auto">
                <form id="frmDocentes" @submit.prevent="guardarDocente" @reset.prevent="limpiarFormulario" class="bg-white rounded-4 shadow-sm border border-light p-4 p-md-5">
                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                            <i class="bi bi-person-workspace fs-4"></i>
                        </div>
                        <div>
                            <h4 class="mb-1 fw-bold text-dark">Registro de Docentes</h4>
                            <p class="mb-0 text-muted small">Crea o actualiza perfiles del profesorado</p>
                        </div>
                    </div>

                    <div class="row g-4 mt-1">
                        <div class="col-md-4">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Código de Docente</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-upc-scan"></i></span>
                                <input placeholder="Ej. D001" required v-model="docente.codigo" type="text" class="form-control border-start-0 ps-0 text-dark fs-6 font-monospace" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Nombre Completo</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-person"></i></span>
                                <input placeholder="Apellidos, Nombres" required v-model="docente.nombre" type="text" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-12">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Dirección Residencial</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-geo-alt"></i></span>
                                <input placeholder="Calle, Avenida, Casa..." required v-model="docente.direccion" type="text" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-5">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Correo Electrónico Oficial</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-envelope"></i></span>
                                <input placeholder="profesor@institucion.edu" required v-model="docente.email" type="email" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Teléfono</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-telephone"></i></span>
                                <input placeholder="+00 (000)" required v-model="docente.telefono" type="text" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Escalafón</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-award"></i></span>
                                <select required title="Seleccione un escalafón" v-model="docente.escalafon" class="form-select border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                                    <option value="tecnico">Técnico</option>
                                    <option value="profesor">Profesor</option>
                                    <option value="ingeniero">Lic./Ingeniero</option>
                                    <option value="maestria">Maestría</option>
                                    <option value="doctor">Doctor</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                        <button type="button" @click="buscarDocente" class="btn btn-light text-muted fw-semibold px-4 py-2 border shadow-sm rounded-pill transition-all hover-translate">
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
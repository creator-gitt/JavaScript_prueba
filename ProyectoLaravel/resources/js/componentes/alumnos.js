export default {
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
            //await this.obtenerAlumnos();

            if(this.data_alumnos.length > 0 && this.accion=='nuevo'){
                alertify.error(`El codigo del alumno ya existe, ${this.data_alumnos[0].nombre}`);
                return; //Termina la ejecucion de la funcion
            }
            const method = this.accion === 'nuevo' ? 'POST' : 'PUT';
            const url = this.accion === 'nuevo' ? '/api/alumnos' : '/api/alumnos/' + this.idAlumno;
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
            const refBusqueda = this.$parent.$refs.busqueda_alumnos;
            if (refBusqueda) {
                if (this.accion === 'nuevo') {
                    refBusqueda.alumnos_cache.unshift({...datos}); 
                } else {
                    const index = refBusqueda.alumnos_cache.findIndex(x => x.idAlumno === this.idAlumno);
                    if (index !== -1) {
                        refBusqueda.alumnos_cache[index] = {...datos};
                    }
                }
                refBusqueda.filtrarAlumnos();
            }
            
            this.limpiarFormulario();
            alertify.success(`${datos.nombre} guardado correctamente`);
            // Cambiar automáticamente a la vista de búsqueda
            this.buscarAlumno();
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
        <div class="row w-100 m-0 mb-4">
            <div class="col-12 col-xl-11 mx-auto">
                <form id="frmAlumnos" @submit.prevent="guardarAlumno" @reset.prevent="limpiarFormulario" class="bg-white rounded-4 shadow-sm border border-light p-4 p-md-5">
                    <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                        <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3 d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                            <i class="bi bi-people-fill fs-4"></i>
                        </div>
                        <div>
                            <h4 class="mb-1 fw-bold text-dark">Registro de Alumnos</h4>
                            <p class="mb-0 text-muted small">Crea o actualiza expedientes de estudiantes en la plataforma</p>
                        </div>
                    </div>

                    <div class="row g-4 mt-1">
                        <div class="col-md-4">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Código del Alumno</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-upc-scan"></i></span>
                                <input placeholder="Ej. A001" required v-model="alumno.codigo" type="text" class="form-control border-start-0 ps-0 text-dark fs-6 font-monospace" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Nombre Completo</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-person"></i></span>
                                <input placeholder="Apellidos, Nombres" required v-model="alumno.nombre" type="text" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-12">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Dirección Residencial</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-geo-alt"></i></span>
                                <input placeholder="Calle, Avenida, Casa..." required v-model="alumno.direccion" type="text" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-7">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Correo Electrónico Oficial</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-envelope"></i></span>
                                <input placeholder="usuario@institucion.edu" required v-model="alumno.email" type="email" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                        <div class="col-md-5">
                            <label class="form-label text-muted fw-semibold text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.05em;">Teléfono de Contacto</label>
                            <div class="input-group input-group-lg shadow-sm">
                                <span class="input-group-text bg-white text-muted border-end-0 px-3"><i class="bi bi-telephone"></i></span>
                                <input placeholder="+00 (000) 0000-0000" required v-model="alumno.telefono" type="text" class="form-control border-start-0 ps-0 text-dark fs-6" style="outline: none; box-shadow: none;">
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
                        <button type="button" @click="buscarAlumno" class="btn btn-light text-muted fw-semibold px-4 py-2 border shadow-sm rounded-pill transition-all hover-translate">
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
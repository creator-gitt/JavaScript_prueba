const docentes = {
    data() {
        return {
            docente: {
                idDocente: 0,
                codigo: "",
                nombre: "",
                direccion: "",
                email: "",
                telefono: "",
                escalafon: "",
                fechaNacimiento: "",
                genero: "",
                dui: "",
                foto: ""
            },
            accion: 'nuevo',
            idDocente: 0,
            data_docentes: []
        }
    },
    emits: ['ir-busqueda'],
    methods: {
        buscarDocente() {
            this.$emit('ir-busqueda');
        },
        modificarDocente(docente) {
            this.accion = 'modificar';
            this.idDocente = docente.idDocente;
            this.docente.codigo = docente.codigo;
            this.docente.nombre = docente.nombre;
            this.docente.direccion = docente.direccion;
            this.docente.email = docente.email;
            this.docente.telefono = docente.telefono;
            this.docente.escalafon = docente.escalafon;
            this.docente.fechaNacimiento = docente.fechaNacimiento;
            this.docente.genero = docente.genero;
            this.docente.dui = docente.dui;
            this.docente.foto = docente.foto || "";
        },
        seleccionarFoto(event) {
            const file = event.target.files[0];
            if (!file) return;
            if (file.size > 500 * 1024) { // 500KB limit
                alertify.error('La imagen es muy pesada (máx 500KB).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                this.docente.foto = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        async guardarDocente() {
            let datos = {
                idDocente: this.accion == 'modificar' ? this.idDocente : this.getId(),
                codigo: this.docente.codigo,
                nombre: this.docente.nombre,
                direccion: this.docente.direccion,
                email: this.docente.email,
                telefono: this.docente.telefono,
                escalafon: this.docente.escalafon,
                fechaNacimiento: this.docente.fechaNacimiento,
                genero: this.docente.genero,
                dui: this.docente.dui,
                foto: this.docente.foto
            };
            this.buscar = datos.codigo;

            if (this.data_docentes.length > 0 && this.accion == 'nuevo') {
                alertify.error(`El codigo del docente ya existe, ${this.data_docentes[0].nombre}`);
                return;
            }
            db.docentes.put(datos);
            this.limpiarFormulario();
            alertify.success(`${datos.nombre} guardado correctamente`);
        },
        getId() {
            return new Date().getTime();
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idDocente = 0;
            this.docente.codigo = '';
            this.docente.nombre = '';
            this.docente.direccion = '';
            this.docente.email = '';
            this.docente.telefono = '';
            this.docente.escalafon = '';
            this.docente.fechaNacimiento = '';
            this.docente.genero = '';
            this.docente.dui = '';
            this.docente.foto = '';
        },
    },
    template: `
        <div>
            <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                <i class="bi bi-person-workspace me-2 fs-5 text-secondary"></i>
                <h5 class="mb-0 fw-semibold">Registro de Docentes</h5>
                <span v-if="accion=='modificar'" class="badge bg-warning text-dark ms-2">Editando</span>
            </div>
            <form id="frmDocentes" @submit.prevent="guardarDocente" @reset.prevent="limpiarFormulario">
                <div class="card border-0 shadow-sm bg-body-tertiary" style="max-width: 480px;">
                    <div class="card-body p-4">

                        <!-- FOTO -->
                        <div class="mb-4 text-center">
                            <div class="position-relative d-inline-block">
                                <img :src="docente.foto || 'https://via.placeholder.com/150?text=Foto'"
                                     class="rounded-circle border"
                                     style="width:100px; height:100px; object-fit: cover;">
                                <label class="position-absolute bottom-0 end-0 bg-white border rounded-circle p-1 shadow-sm"
                                       style="cursor:pointer;" title="Subir foto">
                                    <i class="bi bi-camera-fill text-dark small"></i>
                                    <input type="file" class="d-none" accept="image/*" @change="seleccionarFoto">
                                </label>
                            </div>
                        </div>

                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">Código</label>
                            <div class="col-sm-5">
                                <input placeholder="Ej. D-001" required v-model="docente.codigo" type="text" class="form-control form-control-sm bg-transparent">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">Nombre</label>
                            <div class="col-sm-8">
                                <input placeholder="Nombre completo" required v-model="docente.nombre" type="text" class="form-control form-control-sm bg-transparent">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">Dirección</label>
                            <div class="col-sm-8">
                                <input placeholder="Dirección" required v-model="docente.direccion" type="text" class="form-control form-control-sm bg-transparent">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">Email</label>
                            <div class="col-sm-8">
                                <input placeholder="correo@universidad.edu" required v-model="docente.email" type="text" class="form-control form-control-sm bg-transparent">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">Teléfono</label>
                            <div class="col-sm-6">
                                <input placeholder="0000-0000" required v-model="docente.telefono" type="text" class="form-control form-control-sm bg-transparent">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">Fecha Nacimiento</label>
                            <div class="col-sm-6">
                                <input required v-model="docente.fechaNacimiento" type="date" class="form-control form-control-sm bg-transparent">
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">Género</label>
                            <div class="col-sm-6">
                                <select required v-model="docente.genero" class="form-select form-select-sm bg-transparent">
                                    <option value="" disabled>Seleccione...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">DUI (con guion)</label>
                            <div class="col-sm-6">
                                <input placeholder="00000000-0" maxlength="10" required v-model="docente.dui" type="text" class="form-control form-control-sm bg-transparent">
                            </div>
                        </div>
                        <div class="mb-1 row align-items-center">
                            <label class="col-sm-4 col-form-label text-body-secondary small fw-bold text-uppercase text-nowrap">Escalafón</label>
                            <div class="col-sm-6">
                                <select required v-model="docente.escalafon" class="form-select form-select-sm bg-transparent">
                                    <option value="" disabled>Seleccione...</option>
                                    <option value="tecnico">Técnico</option>
                                    <option value="profesor">Profesor</option>
                                    <option value="ingeniero">Licenciado / Ingeniero</option>
                                    <option value="maestria">Maestría</option>
                                    <option value="doctor">Doctor</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top d-flex gap-2 px-4 py-3">
                        <button type="submit" class="btn btn-sm px-3" style="background-color:#1b4f36; color:white;">
                            <i class="bi bi-save me-1"></i>Guardar
                        </button>
                        <button type="reset" class="btn btn-sm btn-outline-secondary px-3">
                            <i class="bi bi-arrow-counterclockwise me-1"></i>Nuevo
                        </button>
                        <button type="button" @click="buscarDocente" class="btn btn-sm btn-outline-success px-3 ms-auto">
                            <i class="bi bi-search me-1"></i>Buscar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `
};

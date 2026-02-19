// =============================================
// COMPONENTE: NOTAS — Vista del Docente / Admin
// Permite ingresar y editar las notas de cada
// inscripcion. 3 computos, cada uno:
//   Lab1 (30%) + Lab2 (30%) + Examen (40%)
// Promedio final = (C1 + C2 + C3) / 3
// Aprobado si promedio >= 6
// =============================================
const notas_docente = {
    props: ['usuarioActual'],
    data() {
        return {
            inscripciones: [],   // todas las inscripciones
            notasMap: {},        // { idInscripcion: { ...campos } }
            guardando: null,     // idInscripcion que se está guardando
            cargando: true,
        };
    },
    async mounted() {
        await this.cargarDatos();
    },
    methods: {
        async cargarDatos() {
            this.cargando = true;
            // Cargar todas las inscripciones
            const ins = await db.inscripciones.toArray();
            this.inscripciones = ins;

            // Cargar notas existentes y crear el mapa
            const todasNotas = await db.notas.toArray();
            const mapa = {};
            ins.forEach(i => {
                const notaExist = todasNotas.find(n => n.idInscripcion == i.idInscripcion);
                mapa[i.idInscripcion] = notaExist ? { ...notaExist } : this.notaVacia(i.idInscripcion);
            });
            this.notasMap = mapa;
            this.cargando = false;
        },

        notaVacia(idInscripcion) {
            return {
                idInscripcion,
                c1_lab1: '', c1_lab2: '', c1_examen: '',
                c2_lab1: '', c2_lab2: '', c2_examen: '',
                c3_lab1: '', c3_lab2: '', c3_examen: '',
            };
        },

        // Calcula la nota de un computo: Lab1*30% + Lab2*30% + Examen*40%
        calcComputo(lab1, lab2, examen) {
            const l1 = parseFloat(lab1);
            const l2 = parseFloat(lab2);
            const ex = parseFloat(examen);
            if (isNaN(l1) || isNaN(l2) || isNaN(ex)) return null;
            return (l1 * 0.30) + (l2 * 0.30) + (ex * 0.40);
        },

        // Promedio final de los 3 computos
        calcPromedio(n) {
            const c1 = this.calcComputo(n.c1_lab1, n.c1_lab2, n.c1_examen);
            const c2 = this.calcComputo(n.c2_lab1, n.c2_lab2, n.c2_examen);
            const c3 = this.calcComputo(n.c3_lab1, n.c3_lab2, n.c3_examen);
            if (c1 === null || c2 === null || c3 === null) return null;
            return (c1 + c2 + c3) / 3;
        },

        fmt(val) {
            if (val === null || val === undefined) return '—';
            return val.toFixed(2);
        },

        estadoClase(promedio) {
            if (promedio === null) return 'bg-secondary';
            return promedio >= 6 ? 'bg-success' : 'bg-danger';
        },

        estadoLabel(promedio) {
            if (promedio === null) return 'Sin notas';
            return promedio >= 6 ? 'Aprobado' : 'Reprobado';
        },

        async guardarNota(idInscripcion) {
            this.guardando = idInscripcion;
            const n = this.notasMap[idInscripcion];
            const promedio = this.calcPromedio(n);
            const datos = {
                ...n,
                promedio: promedio !== null ? parseFloat(promedio.toFixed(2)) : null,
                estado: promedio !== null ? (promedio >= 6 ? 'Aprobado' : 'Reprobado') : null,
                actualizadoEn: new Date().toISOString()
            };

            // Si ya existe, actualizar; si no, agregar
            const existe = await db.notas.where('idInscripcion').equals(idInscripcion).first();
            if (existe) {
                await db.notas.update(existe.id, datos);
            } else {
                await db.notas.add(datos);
            }
            alertify.success('Notas guardadas correctamente.');
            this.guardando = null;
        },

        validarNota(val) {
            const n = parseFloat(val);
            if (isNaN(n)) return '';
            if (n < 0) return '0';
            if (n > 10) return '10';
            return val;
        }
    },

    template: `
    <div>
        <div class="d-flex align-items-center mb-3 border-bottom pb-2">
            <i class="bi bi-journal-check me-2 fs-5 text-secondary"></i>
            <h5 class="mb-0 fw-semibold">Registro de Notas</h5>
            <span class="badge bg-primary ms-2">Docente / Admin</span>
        </div>

        <div v-if="cargando" class="text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm me-2"></div>Cargando inscripciones...
        </div>

        <div v-else-if="inscripciones.length === 0" class="alert alert-warning d-flex align-items-center gap-2 py-2" style="max-width:600px;">
            <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div class="small"><strong>No hay inscripciones registradas.</strong> Ve al módulo Inscripciones y crea una primero.</div>
        </div>

        <div v-else>
            <!-- Leyenda de pesos -->
            <div class="alert alert-info d-flex align-items-center gap-2 py-2 small mb-3" style="max-width:700px;">
                <i class="bi bi-info-circle-fill flex-shrink-0"></i>
                Cada cómputo: <strong class="ms-1">Lab 1 (30%) + Lab 2 (30%) + Examen (40%)</strong>.
                Promedio final = promedio simple de los 3 cómputos. Aprobado ≥ 6.0
            </div>

            <!-- Tabla de notas -->
            <div v-for="ins in inscripciones" :key="ins.idInscripcion" class="card border-0 shadow-sm mb-4" style="max-width:860px;">
                <!-- Cabecera de la inscripción -->
                <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-2 px-4">
                    <div>
                        <span class="fw-semibold">{{ ins.alumno }}</span>
                        <span class="text-muted mx-2">|</span>
                        <i class="bi bi-book me-1 text-secondary"></i>
                        <span class="text-secondary">{{ ins.materia }}</span>
                        <span class="badge bg-light text-secondary ms-2 border">{{ ins.ciclo }}</span>
                    </div>
                    <div v-if="notasMap[ins.idInscripcion]" class="d-flex align-items-center gap-2">
                        <span class="fw-bold">
                            Promedio: {{ fmt(calcPromedio(notasMap[ins.idInscripcion])) }}
                        </span>
                        <span class="badge"
                            :class="estadoClase(calcPromedio(notasMap[ins.idInscripcion]))">
                            {{ estadoLabel(calcPromedio(notasMap[ins.idInscripcion])) }}
                        </span>
                    </div>
                </div>

                <div class="card-body p-4" v-if="notasMap[ins.idInscripcion]">
                    <div class="row g-3">

                        <!-- CÓMPUTO 1 -->
                        <div class="col-12 col-md-4">
                            <p class="text-muted small fw-semibold text-uppercase mb-2">
                                <i class="bi bi-1-square me-1"></i>Cómputo 1
                                <span class="ms-1 badge bg-light text-dark border fw-normal">
                                    {{ fmt(calcComputo(notasMap[ins.idInscripcion].c1_lab1, notasMap[ins.idInscripcion].c1_lab2, notasMap[ins.idInscripcion].c1_examen)) }}
                                </span>
                            </p>
                            <div class="mb-2 row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Lab 1 <span class="text-secondary">(30%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c1_lab1" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                            <div class="mb-2 row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Lab 2 <span class="text-secondary">(30%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c1_lab2" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                            <div class="row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Examen <span class="text-secondary">(40%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c1_examen" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                        </div>

                        <!-- CÓMPUTO 2 -->
                        <div class="col-12 col-md-4">
                            <p class="text-muted small fw-semibold text-uppercase mb-2">
                                <i class="bi bi-2-square me-1"></i>Cómputo 2
                                <span class="ms-1 badge bg-light text-dark border fw-normal">
                                    {{ fmt(calcComputo(notasMap[ins.idInscripcion].c2_lab1, notasMap[ins.idInscripcion].c2_lab2, notasMap[ins.idInscripcion].c2_examen)) }}
                                </span>
                            </p>
                            <div class="mb-2 row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Lab 1 <span class="text-secondary">(30%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c2_lab1" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                            <div class="mb-2 row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Lab 2 <span class="text-secondary">(30%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c2_lab2" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                            <div class="row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Examen <span class="text-secondary">(40%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c2_examen" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                        </div>

                        <!-- CÓMPUTO 3 -->
                        <div class="col-12 col-md-4">
                            <p class="text-muted small fw-semibold text-uppercase mb-2">
                                <i class="bi bi-3-square me-1"></i>Cómputo 3
                                <span class="ms-1 badge bg-light text-dark border fw-normal">
                                    {{ fmt(calcComputo(notasMap[ins.idInscripcion].c3_lab1, notasMap[ins.idInscripcion].c3_lab2, notasMap[ins.idInscripcion].c3_examen)) }}
                                </span>
                            </p>
                            <div class="mb-2 row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Lab 1 <span class="text-secondary">(30%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c3_lab1" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                            <div class="mb-2 row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Lab 2 <span class="text-secondary">(30%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c3_lab2" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                            <div class="row align-items-center">
                                <label class="col-5 col-form-label text-muted small">Examen <span class="text-secondary">(40%)</span></label>
                                <div class="col-7">
                                    <input v-model="notasMap[ins.idInscripcion].c3_examen" type="number"
                                        min="0" max="10" step="0.1" class="form-control form-control-sm" placeholder="0–10">
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Footer con botón guardar -->
                <div class="card-footer bg-white border-top d-flex align-items-center justify-content-between px-4 py-2">
                    <small class="text-muted">
                        <i class="bi bi-calculator me-1"></i>
                        C1: {{ fmt(calcComputo(notasMap[ins.idInscripcion].c1_lab1, notasMap[ins.idInscripcion].c1_lab2, notasMap[ins.idInscripcion].c1_examen)) }} |
                        C2: {{ fmt(calcComputo(notasMap[ins.idInscripcion].c2_lab1, notasMap[ins.idInscripcion].c2_lab2, notasMap[ins.idInscripcion].c2_examen)) }} |
                        C3: {{ fmt(calcComputo(notasMap[ins.idInscripcion].c3_lab1, notasMap[ins.idInscripcion].c3_lab2, notasMap[ins.idInscripcion].c3_examen)) }}
                    </small>
                    <button @click="guardarNota(ins.idInscripcion)"
                        :disabled="guardando === ins.idInscripcion"
                        class="btn btn-sm px-3" style="background-color:#1a3a5c;color:white;">
                        <span v-if="guardando === ins.idInscripcion">
                            <span class="spinner-border spinner-border-sm me-1"></span>Guardando...
                        </span>
                        <span v-else>
                            <i class="bi bi-save me-1"></i>Guardar Notas
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `
};
